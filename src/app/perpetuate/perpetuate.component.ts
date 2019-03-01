import {ChangeDetectorRef, Component, NgZone, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {DocumentHashSmartContractService} from '../../lib/document-hash-smart-contract.service';

@Component({
    selector    : 'perpetuate',
    templateUrl : 'perpetuate.component.html',
    styleUrls   : ['perpetuate.component.css'],
})
export class PerpetuateComponent implements OnInit {
    constructor(private router: Router,
                private route: ActivatedRoute,
                private changeDetectorRef: ChangeDetectorRef,
                private ngZone: NgZone,
                public documentHashContract: DocumentHashSmartContractService) {
    }

    hash: string;
    filename: string;

    async ngOnInit() {
        this.hash     = this.route.snapshot.params['fileHash'];
        this.filename = this.route.snapshot.queryParams['filename'] || 'Unknown filename';

        try {
            const hashMetadata = await this.documentHashContract.getHashMetadata(this.hash);
            // If the hash exists already, show the user the hash's details
            if (hashMetadata) {
                this.router.navigate(['hashes', this.hash]);
            }
        }
        catch (error) {
            if (error.message === 'METADATA_FOR_GIVEN_HASH_NOT_FOUND') {
                // Do nothing
            }
        }
    }

    async writeHashToBlockchain() {
        await this.documentHashContract.writeHash(this.hash);

        // Change detection needs to be triggered manually, since Angular does not patch the web3 event emitters.
        if (!this.changeDetectorRef['destroyed']) {
            this.changeDetectorRef.detectChanges();
        }

        this.documentHashContract.transactionEventEmitter
            .on('confirmation', (confirmationNumber) => {
                this.ngZone.run(() => {
                    // Change detection needs to be triggered manually, since Angular does not patch the web3 event emitters.
                    if (!this.changeDetectorRef['destroyed']) {
                        this.changeDetectorRef.detectChanges();
                    }
                });
            })
            .once('completeConfirmation', () => {
                this.ngZone.run(() => this.router.navigate(['hashes', this.hash]));
            });
    }

    skipWaitingForConfirmations(): void {
        this.documentHashContract.stopWaitingForConfirmations();
        this.router.navigate(['hashes', this.hash]);
    }

    removeUploadedFile(): void {
        this.documentHashContract.stopWaitingForConfirmations();
        this.router.navigate(['/']);
    }
}