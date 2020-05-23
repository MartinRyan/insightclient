import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SettingsComponent } from './components/settings/settings.component';
import { DetailComponent } from './components/detail/detail.component';
import { RunnerMatrixComponent } from './components/runners/runner-matrix/runner-matrix.component';
import { RunnerHeatmapComponent } from './components/runners/runner-heatmap/runner-heatmap.component';
import { RunnerGridComponent } from './components/runners/runner-grid/runner-grid.component';
import { MatrixGridComponent } from './components/runners/matrix-grid/matrix-grid.component';


const routes: Routes = [
  { path: 'settings', component: SettingsComponent, pathMatch: 'full' },
  { path: 'dashboard', component: DashboardComponent, pathMatch: 'full' },
  { path: 'detail', component: DetailComponent, pathMatch: 'full' },
  { path: 'heatmap', component: RunnerHeatmapComponent, pathMatch: 'full' },
  { path: 'matrix', component: RunnerMatrixComponent, pathMatch: 'full' },
  { path: 'grid', component: RunnerGridComponent, pathMatch: 'full' },
  { path: 'runners', component: MatrixGridComponent, pathMatch: 'full' },
  { path: '**', redirectTo: '', pathMatch: 'full' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes),
    FormsModule, ReactiveFormsModule
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
