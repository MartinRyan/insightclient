import { LayoutModule } from '@angular/cdk/layout';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
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
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { MatToolbarModule } from '@angular/material/toolbar';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { DateFnsModule } from 'ngx-date-fns';
import { NgxSpinnerModule } from 'ngx-spinner';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { DashComponent } from './components/dash/dash.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { ExpansionComponent } from './components/expansion/expansion.component';
import { MergeRequestsComponent } from './components/merge-requests/merge-requests.component';
import { NavComponent } from './components/nav/nav.component';
import { NotificationComponent } from './components/notification/notification.component';
import { PipelinesComponent } from './components/pipelines/pipelines.component';
import { SettingsComponent } from './components/settings/settings.component';
import { TableComponent } from './components/table/table.component';
import { GraphQLModule } from './graphql.module';
import { DateAgoPipe } from './pipes/date-ago.pipe';
import { GitLabApiInterceptor } from './services/gitlab-api/gitlab-api.interceptor';
import { GitlabApiService } from './services/gitlab-api/gitlab-api.service';
import { NotificationService } from './services/notification/notification.service';
import { SettingsService } from './services/settings/settings.service';


@NgModule({
  declarations: [
    AppComponent,
    DashComponent,
    NavComponent,
    ExpansionComponent,
    TableComponent,
    SettingsComponent,
    NotificationComponent,
    PipelinesComponent,
    MergeRequestsComponent,
    DashboardComponent,
    DateAgoPipe,

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
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    GraphQLModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    NgxSpinnerModule,
    AngularSvgIconModule
  ],
  providers: [
    NotificationService,
    SettingsService,
    GitlabApiService,
    { provide: HTTP_INTERCEPTORS, useClass: GitLabApiInterceptor, multi: true }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
