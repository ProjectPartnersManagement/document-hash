import {Component, Input} from '@angular/core';

@Component({
    selector    : 'pp-hash',
    templateUrl : 'pp-hash.component.html',
    styleUrls   : ['pp-hash.component.scss']
})
export class PpHashComponent {
    @Input('hash')
    public hash;
    @Input('etherscanLinkType')
    public etherscanLinkType: 'address' | 'tx' | 'block';

    public hashCopiedToClipboardConfirmation = false;

    getAbbreviatedHash(): string {
        if (!this.hash) return '';

        return this.hash.substr(0, 15) + '...' + this.hash.substr(-15);
    }

    showClipboardConfirmation(): void {
        this.hashCopiedToClipboardConfirmation = true;
        setTimeout(() => {
            this.hashCopiedToClipboardConfirmation = false;
        }, 1000);
    }
}