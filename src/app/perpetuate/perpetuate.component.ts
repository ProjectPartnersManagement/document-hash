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

    ngOnInit() {
        this.hash     = this.route.snapshot.params['fileHash'];
        this.filename = this.route.snapshot.queryParams['filename'] || 'Unknown filename';
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