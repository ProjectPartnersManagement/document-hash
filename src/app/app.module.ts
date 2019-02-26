import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';

import {AppRoutingModule} from './app-routing.module';
import {AppComponent} from './app.component';
import {AddComponent} from './add/add.component';
import {MatIconModule, MatTooltipModule} from '@angular/material';
import {FileUploadModule} from 'ng2-file-upload';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {DocumentHashSmartContractService} from '../lib/document-hash-smart-contract.service';

@NgModule({
    declarations : [
        AppComponent,
        AddComponent
    ],
    imports      : [
        BrowserModule,
        MatIconModule,
        AppRoutingModule,
        FileUploadModule,
        BrowserAnimationsModule,
        MatTooltipModule,
    ],
    providers    : [
        DocumentHashSmartContractService
    ],
    bootstrap    : [AppComponent]
})
export class AppModule {
}
