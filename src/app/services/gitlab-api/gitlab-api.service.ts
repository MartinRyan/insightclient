import { HttpClient, HttpHeaders, HttpEvent, HttpRequest, HttpHandler } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { concat, throwError, Observable } from 'rxjs';
import { delay, map, retryWhen, take } from 'rxjs/operators';

import { NotificationService } from './../notification/notification.service';
import { SettingsService } from './../settings/settings.service';
import { isEmpty } from 'lodash';
import { environment } from './../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class GitlabApiService {
gitlabUrl = environment.gitlabUrl;
gitlabApi = '/api/v4/';
httpOptions;
perPage: number;
sservice: SettingsService;

  constructor(
    private http: HttpClient,
    private notificationService: NotificationService,
    private settingsService: SettingsService ) {
      this.sservice = settingsService;
    if (!isEmpty(this.sservice.settings) && !isEmpty(this.sservice.settings.gitlabAddress)) {
      this.gitlabUrl = this.sservice.settings.gitlabAddress;
      this.perPage = this.sservice.settings.perPage;
    }
    !isEmpty(this.sservice.settings.perPage) ? this.perPage = this.sservice.settings.perPage : this.perPage = 100;
  }

  
apiRequest(req: string): any {
    const gitlabUrl = this.sservice.settings.gitlabAddress;
    const apiReq =  `${gitlabUrl}/api/v4/${req}`
    return apiReq;
  }

apiHeaders(): HttpHeaders {
    const headers = new HttpHeaders()
      .set('Access-Control-Allow-Origin', 'all')
      .set('Private-Token', this.sservice.settings.accessToken);
    return headers;
  }

  get mergeRequests() {
    const apiReq = this.apiRequest('merge_requests?state=opened&scope=all&per_page=30');
    console.log('mergeRequests apiReq -> ', apiReq);
    console.log('mergeRequests headers -> ', this.apiHeaders());
    return this.http
      .get<any[]>(apiReq, {headers: this.apiHeaders()})
      .pipe(
        retryWhen(err => {
          return err.pipe(delay(5000), take(1), o =>
            concat(o, throwError('Retries exceeded - fetch merge requests'))
          );
        })
      );
  }

  get namespaces() {
    const apiReq = this.apiRequest('namespaces')
    console.log('namespaces apiReq -> ', apiReq);
    return this.http
    .get<any[]>(apiReq, {headers: this.apiHeaders()})
    .pipe(
      retryWhen(err => {
        return err.pipe(delay(5000), take(1), o =>
          concat(o, throwError('Retries exceeded - fetch name spaces'))
        );
      })
    );
  }

  subgroupsByGroupID(id: any) {
    const construct = `groups/${id}/subgroups`;
    const apiReq = this.apiRequest(construct);
    console.log('subgroupsByGroupID apiReq -> ', apiReq);
    return this.http
    .get<any[]>(apiReq, {headers: this.apiHeaders()})
    .pipe(
      retryWhen(err => {
        return err.pipe(delay(5000), take(1), o =>
          concat(o, throwError('Retries exceeded - fetch subgroups'))
        );
      })
    );
  }

  projectByID(id: any) {
    const construct = `projects/${id}`;
    const apiReq = this.apiRequest(construct);
    console.log('projectByID apiReq -> ', apiReq);
    return this.http
    .get<any[]>(apiReq, {headers: this.apiHeaders()})
    .pipe(
      retryWhen(err => {
        return err.pipe(delay(5000), take(1), o =>
          concat(o, throwError('Retries exceeded - fetch groups'))
        );
      })
    );
  }

  get projects() {
    !isEmpty(this.sservice.settings.perPage) ? this.perPage = this.sservice.settings.perPage : this.perPage = 100;
    const construct = `projects?search=${this.sservice.settings.namespace}&order_by=last_activity_at&per_page=${this.perPage}`;
    const apiReq = this.apiRequest(construct);
    console.log('projects apiReq -> ', apiReq);
    return ( 
      this.http
      .get<any[]>(apiReq, {headers: this.apiHeaders()})
      .pipe(
          map(projects => {
            return projects.filter(
              project =>
                project.namespace.name ===
                this.sservice.settings.namespace
            );
          })
        )
        .pipe(
          retryWhen(err => {
            return err.pipe(delay(5000), take(1), o =>
              concat(o, throwError('Retries exceeded - fetch projects'))
            );
          })
        )
    );
  }

  get projectsAll() {
    !isEmpty(this.sservice.settings.perPage) ? this.perPage = this.sservice.settings.perPage : this.perPage = 100;
    const construct = `projects?&order_by=last_activity_at&per_page=${this.perPage}`;
    const apiReq = this.apiRequest(construct);
    console.log('projectsAll apiReq -> ', apiReq);
    return ( 
      this.http
      .get<any[]>(apiReq, {headers: this.apiHeaders()})
      .pipe(
          map(projects => {
            return projects.filter(project => project.length > 0);
          })
        )
        .pipe(
          retryWhen(err => {
            return err.pipe(delay(5000), take(1), o =>
              concat(o, throwError('Retries exceeded - fetch projects'))
            );
          })
        )
    );
  }

  projectsByNamespace(name: string) {
    !isEmpty(this.sservice.settings.perPage) ? this.perPage = this.sservice.settings.perPage : this.perPage = 100;
    const construct = `projects?search=${name}&order_by=last_activity_at&per_page=${this.perPage}`;
    const apiReq = this.apiRequest(construct);
    console.log('projectsByNamespace apiReq -> ', apiReq);
    return this.http
    .get<any[]>(apiReq, {headers: this.apiHeaders()})
    .pipe(
        map(projects => {
          return projects.filter(project => project.namespace.name === name);
        })
      )
      .pipe(
        retryWhen(err => {
          return err.pipe(delay(5000), take(1), o =>
            concat(o, throwError('Retries exceeded - fetch projects'))
          );
        })
      );
  }

  projectsByGroupID(id: any) {
    const construct = `groups/${id}/projects`;
    const apiReq = this.apiRequest(construct);
    console.log('projectsByGroupID apiReq -> ', apiReq);
    return this.http
    .get<any[]>(apiReq, {headers: this.apiHeaders()})
    .pipe(
      retryWhen(err => {
        return err.pipe(delay(5000), take(1), o =>
          concat(o, throwError('Retries exceeded - fetch projects'))
        );
      })
    );
  }

  projectsByGroupName(name: any) {
    !isEmpty(this.sservice.settings.perPage) ? this.perPage = this.sservice.settings.perPage : this.perPage = 100;
    const construct = `groups?search=${name}/projects&order_by=last_activity_at&per_page=${this.perPage}`;
    const apiReq = this.apiRequest(construct);
    console.log('projectsByGroupName apiReq -> ', apiReq);
    return this.http
    .get<any[]>(apiReq, {headers: this.apiHeaders()})
    .pipe(
        retryWhen(err => {
          return err.pipe(delay(5000), take(1), o =>
            concat(o, throwError('Retries exceeded - fetch projects'))
          );
        })
      );
  }

  fetchPipelines(projectId: string) {
    !isEmpty(this.sservice.settings.perPage) ? this.perPage = this.sservice.settings.perPage : this.perPage = 100;
    const construct = `projects/${projectId}/pipelines?page=1&per_page=${this.perPage}`;
    const apiReq = this.apiRequest(construct);
    console.log('projectsByGroupName apiReq -> ', apiReq);
    return this.http
    .get<any[]>(apiReq, {headers: this.apiHeaders()})
    .pipe(
        retryWhen(err => {
          return err.pipe(delay(5000), take(1), o =>
            concat(o, throwError('Retries exceeded -  fetch pipelines'))
          );
        })
      );
  }

  fetchPipelinesAll() {
    !isEmpty(this.sservice.settings.perPage) ? this.perPage = this.sservice.settings.perPage : this.perPage = 100;
    const construct = `projects/pipelines?per_page=${this.perPage}`;
    const apiReq = this.apiRequest(construct);
    console.log('fetchPipelinesAll apiReq -> ', apiReq);
    return this.http
    .get<any[]>(apiReq, {headers: this.apiHeaders()})
    .pipe(
        retryWhen(err => {
          return err.pipe(delay(5000), take(1), o =>
            concat(o, throwError('Retries exceeded -  fetch pipelines'))
          );
        })
      );
  }

  fetchLastPipelineByRef(projectId: string, ref: string) {
    const construct = `projects/${projectId}/pipelines?ref=${ref}&per_page=1`;
    const apiReq = this.apiRequest(construct);
    console.log('fetchLastPipelineByRef apiReq -> ', apiReq);
    return (
      this.http
      .get<any[]>(apiReq, {headers: this.apiHeaders()})
      .pipe(
          retryWhen(err => {
            return err.pipe(delay(5000), take(1), o =>
              concat(
                o,
                throwError('Retries exceeded - fetch pipeline by reference')
              )
            );
          })
        )
    );
  }

  fetchPipeline(projectId: string, pipelineId: string) {
    const construct = `projects/${projectId}/pipelines/${pipelineId}`;
    const apiReq = this.apiRequest(construct);
    console.log('fetchPipeline apiReq -> ', apiReq);
    return this.http
    .get<any[]>(apiReq, {headers: this.apiHeaders()})
    .pipe(
        retryWhen(err => {
          return err.pipe(delay(5000), take(1), o =>
            concat(o, throwError('Retries exceeded - fetch pipeline'))
          );
        })
      );
  }

  fetchPipelineB(pipelineId: string) {
    const construct = `projects/pipelines/${pipelineId}`;
    const apiReq = this.apiRequest(construct);
    console.log('fetchPipeline apiReq -> ', apiReq);
    return this.http
    .get<any[]>(apiReq, {headers: this.apiHeaders()})
    .pipe(
      retryWhen(err => {
        return err.pipe(delay(5000), take(1), o =>
          concat(o, throwError('Retries exceeded - fetch pipeline'))
        );
      })
    );
  }

  fetchProject(id: string) {
    const construct = `projects/${id}`;
    const apiReq = this.apiRequest(construct);
    console.log('fetchPipeline apiReq -> ', apiReq);
    return this.http
    .get<any[]>(apiReq, {headers: this.apiHeaders()})
    .pipe(
      retryWhen(err => {
        return err.pipe(delay(5000), take(1), o =>
          concat(o, throwError('Retries exceeded - fetch project'))
        );
      })
    );
  }

  fetchRunnersById(projectID: string) {
    const construct = `runners/${projectID}`;
    const apiReq = this.apiRequest(construct);
    console.log('fetchPipeline apiReq -> ', apiReq);
    return this.http
    .get<any[]>(apiReq, {headers: this.apiHeaders()})
    .pipe(
        retryWhen(err => {
          return err.pipe(delay(5000), take(1), o =>
            concat(o, throwError('Retries exceeded -  fetch runners by id: '))
          );
        })
      );
  }
}
