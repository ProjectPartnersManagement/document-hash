import {Component} from '@angular/core';
import {Router} from '@angular/router';

@Component({
    selector    : 'app-root',
    templateUrl : './app.component.html',
    styleUrls   : ['./app.component.scss']
})
export class AppComponent {
    title                    = 'Document Hash Blockchain | Project Partners';
    metamaskMissing: boolean = false;

    constructor(private router: Router) {
    }

    ngOnInit() {
        if (!(window as any).ethereum && !(window as any).web3) {
            this.metamaskMissing = true;
        }
    }

    navigateToStartPage(): void {
        this.router.navigate(['/']);
    }

}
