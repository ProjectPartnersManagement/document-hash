import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {AddComponent} from './add/add.component';
import {PerpetuateComponent} from './perpetuate/perpetuate.component';
import {HashDetailsComponent} from './hash-details/hash-details.component';
import {SearchComponent} from './search/search.component';

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
        pathMatch : 'full'
    },
    {
        path      : 'search',
        component : SearchComponent,
        pathMatch : 'full'
    },
];

@NgModule({
    imports : [RouterModule.forRoot(routes)],
    exports : [RouterModule]
})
export class AppRoutingModule {
}
