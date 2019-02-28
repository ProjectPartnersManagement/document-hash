import {Component} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {DocumentHashSmartContractService} from '../../lib/document-hash-smart-contract.service';

@Component({
    selector    : 'perpetuate',
    templateUrl : 'perpetuate.component.html',
    styleUrls   : ['perpetuate.component.css'],
})
export class PerpetuateComponent {
    constructor(private router: Router,
                private route: ActivatedRoute,
                public documentHashContract: DocumentHashSmartContractService) {
    }

    hash: string;
    filename: string;

    ngOnInit() {
        this.hash     = this.route.snapshot.params['fileHash'];
        this.filename = this.route.snapshot.queryParams['filename'];
    }

    async writeHashToBlockchain() {
        await this.documentHashContract.writeHash(this.hash);

        this.router.navigate(['hashes', this.hash]);
    }

    removeUploadedFile(): void {
        this.router.navigate(['/']);
    }
}