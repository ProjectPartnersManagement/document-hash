import {Component} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {DocumentHashSmartContractService} from '../../lib/document-hash-smart-contract.service';

@Component({
    selector    : 'search',
    templateUrl : 'search.component.html',
    styleUrls   : ['search.component.css'],
})
export class SearchComponent {
    constructor(private router: Router) {
    }

    searchTerm: string;

    executeSearch() {
        this.router.navigate(['hashes', this.searchTerm]);
    }

    reset() {
        this.router.navigate(['/']);
    }
}