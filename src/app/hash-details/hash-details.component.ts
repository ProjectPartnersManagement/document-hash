import {Component} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {DocumentHashSmartContractService} from '../../lib/document-hash-smart-contract.service';

@Component({
    selector    : 'hash-details',
    templateUrl : 'hash-details.component.html',
    styleUrls   : ['hash-details.component.css'],
})
export class HashDetailsComponent {
    constructor(private router: Router,
                private route: ActivatedRoute,
                public documentHashContract: DocumentHashSmartContractService) {
    }

    fileHash: string;
    date: string;
    perpetuatedBy: string;
    transactionHash: string;

    requestPending: boolean = false;

    fileHashNotFound: boolean = false;

    ngOnInit() {
        this.fileHash = this.route.snapshot.params['fileHash'];
        this.getDataFromBlockchain();
    }

    async getDataFromBlockchain() {
        this.requestPending = true;

        let hashMetadata;

        try {
            hashMetadata = await this.documentHashContract.getHashMetadata(this.fileHash);
        }
        catch (error) {
            if (error.message === 'METADATA_FOR_GIVEN_HASH_NOT_FOUND') {
                this.fileHashNotFound = true;
                return;
            }
            else {
                console.error('Unknown error getting the metadata for the file hash.', error);
                alert('An unknown error occurred when getting the metadata for the given file hash.');
            }
        }

        const hours   = hashMetadata.timestamp.getHours() >= 10 ? hashMetadata.timestamp.getHours() : '0' + hashMetadata.timestamp.getHours();
        const minutes = hashMetadata.timestamp.getMinutes() >= 10 ? hashMetadata.timestamp.getMinutes() : '0' + hashMetadata.timestamp.getMinutes();

        this.date            = `${hashMetadata.timestamp.toDateString()} ${hours}:${minutes}`;
        this.perpetuatedBy   = hashMetadata.perpetuatedBy;
        this.transactionHash = hashMetadata.transactionHash;

        this.requestPending = false;
    }

    reset(): void {
        this.router.navigate(['/']);
    }
}