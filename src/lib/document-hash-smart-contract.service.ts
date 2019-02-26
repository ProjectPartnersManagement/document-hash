import {config} from '../app/config';
import {ApplicationRef, Injectable} from '@angular/core';

// Live : Development
const contractAddress = location.href.includes("project-partners.de") ? "0x5336aC4ab4fEAd6675365FD6d9A96b9534105fba" : "0x2333c497e50ed7e9aebc397c6ad8982de70a4ebd";

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
    }

    async requestMetamaskAccess() {
        try {
            // Request account access if needed
            await ethereum.enable();
            // Acccounts now exposed
        } catch (error) {
            // User denied account access...
        }
    }

    /**
     * Return the current status as a string, e. g. "bare" or "paid"
     */
    async getTimestamp(hash) {
        this.requestMetamaskAccess();

        try {
            const response = await this.documentHashContract.methods.getTimestamp(hash).call();

            return response.status;
        } catch (error) {
            console.error('Error getting status', error);
            if (error.message === 'Couldn\'t decode address from ABI: 0x')
                throw new Error('PACKAGE_TRANSACTION_NOT_FOUND');
            else
                throw new Error('GENERAL_ERROR');
        }
    }

    /**
     * Set the status for a certain transaction. May only be executed by the postal service owner.
     */
    async writeHash(hash) {
        if (!hash) {
            throw new Error('MISSING_HASH');
        }
        this.requestMetamaskAccess();

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
                        receipt
                    });
                })
                .on('error', (error, receipt) => {
                    if (error.message.includes('User denied transaction signature.')) {
                        reject(new Error('METAMASK_USER_DENIED_TRANSACTION'));
                    }
                    console.log('The transaction failed.', error);
                    alert('The blockchain transaction failed.');

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
		"name": "getTimestamp",
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
