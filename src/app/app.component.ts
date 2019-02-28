import {Component} from '@angular/core';
import {Router} from '@angular/router';
import {DocumentHashSmartContractService} from '../lib/document-hash-smart-contract.service';

@Component({
    selector    : 'app-root',
    templateUrl : './app.component.html',
    styleUrls   : ['./app.component.scss']
})
export class AppComponent {
    title                    = 'Document Hash Blockchain | Project Partners';
    metamaskMissing: boolean = false;

    SMART_CONTRACT_ADDRESS: string;

    constructor(private router: Router,
                private documentHashSmartContractService: DocumentHashSmartContractService) {
    }

    ngOnInit() {
        if (!(window as any).ethereum && !(window as any).web3) {
            this.metamaskMissing = true;
        }

        this.SMART_CONTRACT_ADDRESS = this.documentHashSmartContractService.SMART_CONTRACT_ADDRESS;
    }

    navigateToStartPage(): void {
        this.router.navigate(['/']);
    }

}
