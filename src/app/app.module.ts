import { LayoutModule } from '@angular/cdk/layout';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { NgModule, CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core';
import { FlexLayoutModule } from '@angular/flex-layout';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatRadioModule } from '@angular/material/radio';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { MatToolbarModule } from '@angular/material/toolbar';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { DateFnsModule } from 'ngx-date-fns';
import { NgxSpinnerModule } from 'ngx-spinner';

import {MessagesModule} from 'primeng/messages';
import {MessageModule} from 'primeng/message';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { MergeRequestsComponent } from './components/merge-requests/merge-requests.component';
import { NavComponent } from './components/nav/nav.component';
import { NotificationComponent } from './components/notification/notification.component';
import { PipelinesComponent } from './components/pipelines/pipelines.component';
import { SettingsComponent } from './components/settings/settings.component';
import { DateAgoPipe } from './pipes/date-ago.pipe';
import { GitLabApiInterceptor } from './services/gitlab-api/gitlab-api.interceptor';
import { GitlabApiService } from './services/gitlab-api/gitlab-api.service';
import { NotificationService } from './services/notification/notification.service';
import { SettingsService } from './services/settings/settings.service';
import { SecondsToTimePipe } from './pipes/seconds-to-time.pipe';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { DetailComponent } from './components/detail/detail.component';
import { HeatMapAllModule } from '@syncfusion/ej2-angular-heatmap';
import "hammerjs";
import { GridComponent } from './components/runners/grid/grid.component';
import { HeatmapComponent } from './components/runners/heatmap/heatmap.component';
import { MatrixComponent } from './components/runners/matrix/matrix.component';


@NgModule({
  declarations: [
    AppComponent,
    NavComponent,
    SettingsComponent,
    NotificationComponent,
    PipelinesComponent,
    MergeRequestsComponent,
    DashboardComponent,
    DateAgoPipe,
    SecondsToTimePipe,
    DetailComponent,
    GridComponent,
    HeatmapComponent,
    MatrixComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    DateFnsModule.forRoot(),
    FlexLayoutModule,
    MatFormFieldModule,
    MatGridListModule,
    MatCardModule,
    MatExpansionModule,
    MatMenuModule,
    MatIconModule,
    MatInputModule,
    MatButtonModule,
    LayoutModule,
    MatToolbarModule,
    MatSidenavModule,
    MatListModule,
    MatRadioModule,
    MatTableModule,
    MatPaginatorModule,
    MatSelectModule,
    MatSnackBarModule,
    MatSortModule,
    MatTooltipModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    NgxSpinnerModule,
    AngularSvgIconModule,
    MessagesModule,
    MessageModule,
    HeatMapAllModule
  ],
  exports: [
    MatTooltipModule
  ],
  providers: [
    NotificationService,
    MessagesModule,
    MessageModule,
    SettingsService,
    GitlabApiService,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule
    // { provide: HTTP_INTERCEPTORS, useClass: GitLabApiInterceptor, multi: true }
  ],
  bootstrap: [AppComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA]
})
export class AppModule { }
