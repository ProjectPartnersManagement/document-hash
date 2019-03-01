import {Component, HostListener} from '@angular/core';
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
    // Sometimes, the detection of the onDragEnd event does not work correctly. Thus, we should remove the upload after a second
    // of no other onDragOver event on the body
    fileOverBodyTimeoutCache;
    // Becomes true when the user drags files over the drop zone
    fileIsOverDropZone: boolean = false;
    // Becomes true when the user drags files over the window. The drop zone can then be shown.
    fileIsOverBody: boolean     = false;

    hash: string;
    filename: string;

    showInstructions: boolean = false;

    constructor(private router: Router) {
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
            this.filename = item._file.name;
            this.hash     = '0x' + this.bufferToHex(await window.crypto.subtle.digest('SHA-256', await this.blobToArrayBuffer(item._file)));

            this.router.navigate(['perpetuate', this.hash], {
                queryParams : {filename : this.filename}
            });
        };
    }

    //*****************************************************************************
    //  Drag'n'Drop File Upload
    //****************************************************************************/
    // Event handler which listens to the mousein and mouseout event if the user drags a file
    public onFileOverDropZone(fileOver: boolean): void {
        if (fileOver === true) {
            this.fileIsOverDropZone = true;
        }
        else {
            this.fileIsOverDropZone = false;
            this.fileIsOverBody     = false;
        }
    }

    public onFileDrop(files: File[]): void {
        // Disable the drop zone as soon as content is dropped
        this.fileIsOverBody = false;
    }

    /**
     * Show drop zone
     */
    @HostListener('body:dragover', ['$event'])
    onFileOverBody() {
        clearTimeout(this.fileOverBodyTimeoutCache);

        this.fileIsOverBody = true;
    }

    /////////////////////////////////////////////////////////////////////////////*/
    //  END Drag'n'Drop File Upload
    /////////////////////////////////////////////////////////////////////////////*/

    openSearch(): void {
        this.router.navigate(['search']);
    }

    openInstrcutions(): void {
        this.showInstructions = true;
    }

    closeInstructions(): void {
        this.showInstructions = false;
    }
}