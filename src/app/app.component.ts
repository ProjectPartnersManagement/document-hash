import {Component} from '@angular/core';

@Component({
    selector    : 'app-root',
    templateUrl : './app.component.html',
    styleUrls   : ['./app.component.scss']
})
export class AppComponent {
    title                    = 'Document Hash Blockchain | Project Partners';
    metamaskMissing: boolean = false;

    ngOnInit() {
        if (!(window as any).ethereum && !(window as any).web3) {
            this.metamaskMissing = true;
        }
    }

}
