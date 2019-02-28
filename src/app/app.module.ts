import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';

import {AppRoutingModule} from './app-routing.module';
import {AppComponent} from './app.component';
import {AddComponent} from './add/add.component';
import {MAT_TOOLTIP_DEFAULT_OPTIONS, MatIconModule, MatTooltipModule} from '@angular/material';
import {FileUploadModule} from 'ng2-file-upload';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {DocumentHashSmartContractService} from '../lib/document-hash-smart-contract.service';
import {ClipboardModule} from 'ngx-clipboard';
import {PpHashComponent} from '../shared/components/pp-hash/pp-hash.component';
import {PerpetuateComponent} from './perpetuate/perpetuate.component';
import {HashDetailsComponent} from './hash-details/hash-details.component';

@NgModule({
    declarations : [
        AppComponent,
        AddComponent,
        PerpetuateComponent,
        HashDetailsComponent,
        PpHashComponent,
    ],
    imports      : [
        BrowserModule,
        MatIconModule,
        AppRoutingModule,
        FileUploadModule,
        BrowserAnimationsModule,
        MatTooltipModule,
        ClipboardModule,
    ],
    providers    : [
        {
            provide  : MAT_TOOLTIP_DEFAULT_OPTIONS,
            useValue : {
                showDelay : 600
            }
        },
        DocumentHashSmartContractService
    ],
    bootstrap    : [AppComponent]
})
export class AppModule {
}
