import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {AddComponent} from './add/add.component';

const routes: Routes = [
    {
        path      : '',
        component : AddComponent,
        pathMatch : 'full',
    },
    // {
    //     path      : 'entries/:hash',
    //     component : EntriesComponent,
    // }
];

@NgModule({
    imports : [RouterModule.forRoot(routes)],
    exports : [RouterModule]
})
export class AppRoutingModule {
}
