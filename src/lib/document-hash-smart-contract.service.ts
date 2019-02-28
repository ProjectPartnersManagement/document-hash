import {config} from '../app/config';
import {ApplicationRef, Injectable} from '@angular/core';
import {AbiDecoder} from './pp-abi-decoder';
import {Block, Transaction} from '../types/block';

// Live : Development
const contractAddress: string = location.href.includes('project-partners.de') ? '0x42ba3977dEDb68d1aA284847B710B870cf8217B5' : '0xde05cf220dab7d2b5437394ae3dbd3d16d119d4c';

declare var Web3: any;
declare var web3: any;
declare var ethereum: any;

@Injectable()
export class DocumentHashSmartContractService {
    documentHashContract;
    pendingTransactionHash: string;

    //*****************************************************************************
    //  Smart Contract Integration
    //****************************************************************************/
    constructor(private applicationRef: ApplicationRef) {
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
        }
        this.documentHashContract = new web3.eth.Contract(documentHashContractABI, contractAddress.toLowerCase());

        (window as any).AbiDecoder = AbiDecoder;
    }

    /**
     * Return the current status as a string, e. g. "bare" or "paid"
     */
    private async getBlock(fileHash): Promise<Block> {
        let blockNumber;

        try {
            blockNumber = await this.documentHashContract.methods.getBlockNumber(fileHash).call();
        }
        catch (error) {
            console.error('Error getting block number by file hash.', error);
            if (error.message === 'Couldn\'t decode address from ABI: 0x')
                throw new Error('HASH_NOT_FOUND');
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

        const transactions: Transaction[] = await Promise.all(block.transactions.map(transactionHash => web3.eth.getTransaction(transactionHash, block.number)));

        for (const transaction of transactions) {
            // Only inspect transactions targeting this smart contract
            if (transaction.to.toLowerCase() !== contractAddress.toLowerCase()) {
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

        const encodedABI = this.documentHashContract.methods.write(hash).encodeABI();

        const currentAccountAddress = (await web3.eth.getAccounts())[0];

        const transaction = {
            // Use the chain ID we defined in the genesis-block.json when creating
            chainId  : config.ethereum.chainId,
            from     : currentAccountAddress,
            to       : contractAddress,
            // Will be set by Metamask
            // gas      : 3000000,
            gasPrice : await web3.eth.getGasPrice() || '100000000',
            data     : encodedABI
        };

        const transactionEventEmitter = web3.eth.sendTransaction(transaction);

        transactionEventEmitter
            .on('receipt', () => {
                // The transaction was mined successfully.
                this.pendingTransactionHash = null;
            });

        return this.attachTransactionEventHandlers(transactionEventEmitter);
    }

    attachTransactionEventHandlers(transactionEventEmitter) {
        return new Promise((resolve, reject) => {
            transactionEventEmitter
                .on('transactionHash', (transactionHash) => {
                    console.log('Transaction hash received.', transactionHash);

                    this.pendingTransactionHash = transactionHash;
                    this.applicationRef.tick();
                })
                .on('receipt', (receipt) => {
                    console.log('Receipt received.', receipt);
                })
                .on('confirmation', (confirmationNumber, receipt) => {
                    console.log('Transaction confirmed.', confirmationNumber, receipt);

                    this.pendingTransactionHash = null;
                    this.applicationRef.tick();

                    resolve({
                        confirmationNumber,
                        receipt,
                        transactionEventEmitter
                    });
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
                    this.applicationRef.tick();
                    reject(error);
                });
        });
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