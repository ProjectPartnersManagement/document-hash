import {Component} from '@angular/core';
import {FileUploader, FileItem} from 'ng2-file-upload';
import {Router} from '@angular/router';
import {config} from '../config';
import {DocumentHashSmartContractService} from '../../lib/document-hash-smart-contract.service';

@Component({
    selector    : 'add',
    templateUrl : 'add.component.html',
    styleUrls   : ['add.component.css'],
})
export class AddComponent {
    // Uploader instance for uploading photos to the server
    uploader: FileUploader;
    hash: string;
    hashAbbreviated: string;
    filename: string;

    constructor(private router: Router,
                private documentHashContract: DocumentHashSmartContractService) {
    }

    ngOnInit() {
        this.initializeUploader();
    }

    private blobToArrayBuffer(blob: Blob): Promise<ArrayBuffer> {
        return new Promise((resolve, reject) => {
            let arrayBuffer: ArrayBuffer;
            const fileReader   = new FileReader();
            fileReader.onload  = function (event) {
                arrayBuffer = (event.target as any).result;
                resolve(arrayBuffer);
            };
            fileReader.onerror = reject;
            fileReader.readAsArrayBuffer(blob);
        });
    }

    private bufferToHex(buffer: ArrayBuffer): string {
        return Array
            .from(new Uint8Array(buffer))
            .map(b => b.toString(16).padStart(2, '0'))
            .join('');
    }

    private initializeUploader(): void {
        this.uploader = new FileUploader({});

        // After selecting files
        this.uploader.onAfterAddingFile = async (item: FileItem) => {
            this.filename        = item._file.name;
            this.hash            = '0x' + this.bufferToHex(await window.crypto.subtle.digest('SHA-256', await this.blobToArrayBuffer(item._file)));
            this.hashAbbreviated = this.hash.substr(0, 15) + '...' + this.hash.substr(-15);
        };
    }

    removeUploadedFile(): void {
        this.filename        = null;
        this.hash            = null;
        this.hashAbbreviated = null;
    }

    async writeHashToBlockchain() {
        await this.documentHashContract.writeHash(this.hash);

        this.router.navigate(['hashes', this.hash]);
    }

/////////////////////////////////////////////////////////////////////////////*/
//  END Smart Contract Integration
/////////////////////////////////////////////////////////////////////////////*/
}