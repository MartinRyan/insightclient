import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { DashComponent } from './dash/dash.component';
import { ExpansionComponent} from './expansion/expansion.component';
import { TableComponent } from './table/table.component';


const routes: Routes = [
  { path: 'dashboard', component: DashComponent, pathMatch: 'full' },
  { path: 'expansion', component: ExpansionComponent, pathMatch: 'full' },
  { path: 'table', component: TableComponent, pathMatch: 'full' },
  { path: '**', redirectTo: '', pathMatch: 'full' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
