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

        this.SMART_CONTRACT_ADDRESS = this.documentHashSmartContractService.SMART_CONTRACT_ADDRESS[this.documentHashSmartContractService.networkId];
    }

    navigateToStartPage(): void {
        this.router.navigate(['/']);
    }

    getSmartContractEtherscanUrl(): string {
        switch (this.documentHashSmartContractService.networkId) {
            case 1:
                return `https://etherscan.io/address/${this.SMART_CONTRACT_ADDRESS}#code`;
            case 3:
                return `https://ropsten.etherscan.io/address/${this.SMART_CONTRACT_ADDRESS}#code`;
            case 8888:
            default:
                return null;
        }
    }

}
