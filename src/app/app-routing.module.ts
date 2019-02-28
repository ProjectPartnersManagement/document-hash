import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {AddComponent} from './add/add.component';
import {PerpetuateComponent} from './perpetuate/perpetuate.component';
import {HashDetailsComponent} from './hash-details/hash-details.component';

const routes: Routes = [
    {
        path      : '',
        component : AddComponent,
        pathMatch : 'full',
    },
    {
        path      : 'perpetuate/:fileHash',
        component : PerpetuateComponent,
        pathMatch : 'full',
    },
    {
        path      : 'hashes/:fileHash',
        component : HashDetailsComponent,
    }
];

@NgModule({
    imports : [RouterModule.forRoot(routes)],
    exports : [RouterModule]
})
export class AppRoutingModule {
}
