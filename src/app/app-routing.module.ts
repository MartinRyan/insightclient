import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SettingsComponent } from './components/settings/settings.component';
import { DetailComponent } from './components/detail/detail.component';
import { HeatmapComponent } from './components/runners/heatmap/heatmap.component';
import { MatrixComponent } from './components/runners/matrix/matrix.component';
import { GridComponent } from './components/runners/grid/grid.component';


const routes: Routes = [
  { path: 'settings', component: SettingsComponent, pathMatch: 'full' },
  { path: 'dashboard', component: DashboardComponent, pathMatch: 'full' },
  { path: 'detail', component: DetailComponent, pathMatch: 'full' },
  { path: 'heatmap', component: HeatmapComponent, pathMatch: 'full' },
  { path: 'matrix', component: MatrixComponent, pathMatch: 'full' },
  { path: 'grid', component: GridComponent, pathMatch: 'full' },
  { path: '**', redirectTo: '', pathMatch: 'full' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes),
    FormsModule, ReactiveFormsModule
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
