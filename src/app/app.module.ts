import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';

import {AppRoutingModule} from './app-routing.module';
import {AppComponent} from './app.component';
import {AddComponent} from './add/add.component';
import {MAT_TOOLTIP_DEFAULT_OPTIONS, MatIconModule, MatInputModule, MatTooltipModule} from '@angular/material';
import {FileUploadModule} from 'ng2-file-upload';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {DocumentHashSmartContractService} from '../lib/document-hash-smart-contract.service';
import {ClipboardModule} from 'ngx-clipboard';
import {PpHashComponent} from '../shared/components/pp-hash/pp-hash.component';
import {PerpetuateComponent} from './perpetuate/perpetuate.component';
import {HashDetailsComponent} from './hash-details/hash-details.component';
import {SearchComponent} from './search/search.component';
import {FormsModule} from '@angular/forms';

@NgModule({
    declarations : [
        AppComponent,
        AddComponent,
        PerpetuateComponent,
        HashDetailsComponent,
        SearchComponent,
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
        FormsModule,
        MatInputModule,
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
