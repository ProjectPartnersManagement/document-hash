import {config} from '../app/config';
import {Injectable} from '@angular/core';
import {AbiDecoder} from './pp-abi-decoder';
import {Block, Transaction} from '../types/block';

declare var Web3: any;
declare var web3: any;
declare var ethereum: any;

@Injectable()
export class DocumentHashSmartContractService {
    // Live : Development
    SMART_CONTRACT_ADDRESS: string = location.href.includes('project-partners.de') ? '0x42ba3977dEDb68d1aA284847B710B870cf8217B5' : '0xde05cf220dab7d2b5437394ae3dbd3d16d119d4c';

    smartContract;
    pendingTransactionHash: string;

    numberOfConfirmations: number          = null;
    TARGET_NUMBER_OF_CONFIRMATIONS: number = 10;

    transactionEventEmitter: any;

    //*****************************************************************************
    //  Smart Contract Integration
    //****************************************************************************/
    constructor() {
        if ((window as any).ethereum) {
            (window as any).web3 = new Web3(ethereum);
        }
        // Legacy dapp browsers...
        else if ((window as any).web3) {
            (window as any).web3 = new Web3(web3.currentProvider);
        }
        // Non-dapp browsers...
        else {
            console.log('Non-Ethereum browser detected. You should consider trying MetaMask!');
            return;
        }
        this.smartContract = new web3.eth.Contract(documentHashContractABI, this.SMART_CONTRACT_ADDRESS.toLowerCase());

        (window as any).AbiDecoder = AbiDecoder;
    }

    /**
     * Return the current status as a string, e. g. "bare" or "paid"
     */
    private async getBlock(fileHash): Promise<Block> {
        let blockNumber;

        try {
            const timeout = setTimeout(() => {
                alert('Timeout occurred trying to get the block number by file hash. Is Metamask on the right network?');
                throw new Error('GETTING_BLOCK_NUMBER_BY_FILE_HASH_TIMED_OUT');
            }, 5000);
            blockNumber   = await this.smartContract.methods.getBlockNumber(fileHash).call();
            clearTimeout(timeout);
        }
        catch (error) {
            console.error('Error getting block number by file hash.', error);
            // Returned if the smart contract cannot be found. Typically caused by a wrong network (mainnet vs. private network)
            if (error.message === 'Couldn\'t decode uint256 from ABI: 0x')
                throw new Error('RESPONSE_FROM_SMART_CONTRACT_INVALID');
            else
                throw new Error('GETTING_BLOCK_NUMBER_BY_FILE_HASH_FAILED');
        }

        try {
            return web3.eth.getBlock(blockNumber);
        }
        catch (error) {
            console.error('Error getting block by number.', error);
            throw new Error('GETTING_BLOCK_FAILED');
        }
    }

    async getHashMetadata(fileHash): Promise<HashMetadata> {
        const block = await this.getBlock(fileHash);

        AbiDecoder.addABI(documentHashContractABI);

        // Make these requests execute in parallel
        const transactions: Transaction[] = await Promise.all(block.transactions.map(transactionHash => web3.eth.getTransaction(transactionHash, block.number)));

        for (const transaction of transactions) {
            // Only inspect transactions targeting this smart contract
            if (transaction.to.toLowerCase() !== this.SMART_CONTRACT_ADDRESS.toLowerCase()) {
                console.log(`Skip searching through transaction "${transaction.hash}" because it does not concern the document hash smart contract.`);
                continue;
            }

            // Decode transaction data
            const transactionData             = AbiDecoder.decodeMethod(transaction.input);
            const fileHashFromTransactionData = transactionData.params.find(param => param.name === 'hash').value;
            console.log('Decoded fileHash from transaction data', fileHashFromTransactionData);

            if (fileHashFromTransactionData === fileHash) {
                return {
                    fileHash        : fileHash,
                    perpetuatedBy   : transaction.from,
                    // Javascript uses milliseconds for the timestamp, not seconds as in the Unix timestamp.
                    timestamp       : new Date(block.timestamp * 1000),
                    transactionHash : transaction.hash,
                };
            }
        }

        throw new Error('METADATA_FOR_GIVEN_HASH_NOT_FOUND');
    }

    /**
     * Set the status for a certain transaction. May only be executed by the postal service owner.
     */
    async writeHash(hash) {
        if (!hash) {
            throw new Error('MISSING_HASH');
        }

        const encodedABI = this.smartContract.methods.write(hash).encodeABI();

        const currentAccountAddress = (await web3.eth.getAccounts())[0];

        if (!currentAccountAddress) {
            alert('Your account address could not be read. Please allow access to your account address through Metamask.');
            return;
        }

        const transaction = {
            // Use the chain ID we defined in the genesis-block.json when creating
            chainId  : config.ethereum.chainId,
            from     : currentAccountAddress,
            to       : this.SMART_CONTRACT_ADDRESS,
            // Will be set by Metamask
            // gas      : 3000000,
            gasPrice : await web3.eth.getGasPrice() || '100000000',
            data     : encodedABI
        };

        this.transactionEventEmitter = web3.eth.sendTransaction(transaction);

        return this.attachTransactionEventHandlers();
    }

    private attachTransactionEventHandlers(): Promise<void> {
        return new Promise((resolve, reject) => {
            this.transactionEventEmitter
                .on('transactionHash', (transactionHash) => {
                    console.log('Transaction hash received.', transactionHash);

                    this.pendingTransactionHash = transactionHash;

                    resolve();
                })
                .on('receipt', (receipt) => {
                    console.log('Receipt received.', receipt);
                })
                .on('confirmation', (confirmationNumber, receipt) => {
                    console.log('Transaction confirmed.', confirmationNumber, receipt);

                    this.numberOfConfirmations = confirmationNumber;

                    if (this.isTransactionFullyConfirmed()) {
                        this.transactionEventEmitter.emit('completeConfirmation', this.numberOfConfirmations);
                        this.stopWaitingForConfirmations();
                    }
                })
                .on('error', (error, receipt) => {
                    console.log('The transaction failed.', error);
                    if (error.message.includes('User denied transaction signature.')) {
                        return reject(new Error('METAMASK_USER_DENIED_TRANSACTION'));
                    }
                    else {
                        alert('The blockchain transaction failed.');
                    }

                    this.pendingTransactionHash = null;
                    reject(error);
                });
        });
    }

    stopWaitingForConfirmations(): void {
        // The transaction was mined successfully.
        this.pendingTransactionHash = null;
        this.numberOfConfirmations  = null;
        if (this.transactionEventEmitter) {
            this.transactionEventEmitter.removeAllListeners();
        }
    }

    isTransactionPending(): boolean {
        return !!this.pendingTransactionHash;
    }

    isTransactionFullyConfirmed(): boolean {
        return this.numberOfConfirmations >= this.TARGET_NUMBER_OF_CONFIRMATIONS;
    }
}

export const documentHashContractABI = JSON.parse(`[
	{
		"constant": false,
		"inputs": [
			{
				"name": "hash",
				"type": "string"
			}
		],
		"name": "write",
		"outputs": [],
		"payable": false,
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"constant": true,
		"inputs": [
			{
				"name": "hash",
				"type": "string"
			}
		],
		"name": "getBlockNumber",
		"outputs": [
			{
				"name": "",
				"type": "uint256"
			}
		],
		"payable": false,
		"stateMutability": "view",
		"type": "function"
	}
]`);

export interface HashMetadata {
    fileHash: string;
    perpetuatedBy: string;
    timestamp: Date;
    transactionHash: string;
}