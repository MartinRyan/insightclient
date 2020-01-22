import { HttpClient, HttpParams} from '@angular/common/http';
import { Injectable, ɵConsole } from '@angular/core';
import { Observable, throwError, concat} from 'rxjs';
import { delay, retryWhen, take, map } from 'rxjs/operators';
import { NotificationService } from './../notification/notification.service';
import { SettingsService } from './../settings/settings.service';

@Injectable({
  providedIn: 'root'
})
export class GitlabApiService {

  constructor(private http: HttpClient, private notificationService: NotificationService, private settingsService: SettingsService) { }

  get mergeRequests() {
    return this.http
      .get<any[]>('merge_requests?state=opened&scope=all&per_page=30')
      .pipe(
        retryWhen(err => {
          return err.pipe(
            delay(5000),
            take(1),
            o => concat(o, throwError('Retries exceeded - fetch merge requests'))
          );
        })
      );
  }

  get namespaces() {
    return this.http
      .get<any[]>(`namespaces`)
      .pipe(
        retryWhen(err => {
          return err.pipe(
            delay(5000),
            take(1),
            o => concat(o, throwError('Retries exceeded - fetch name spaces'))
          );
        })
      );
  }

  subgroupsByGroupID(id: any) {
    return this.http
    .get<any[]>(`groups/${id}/subgroups`)
      .pipe(
        retryWhen(err => {
          return err.pipe(
            delay(5000),
            take(1),
            o => concat(o, throwError('Retries exceeded - fetch subgroups'))
          );
        })
      );
  }

  projectByID(id: any) {
    return this.http
    .get<any>(`projects/${id}`)
      .pipe(
        retryWhen(err => {
          return err.pipe(
            delay(5000),
            take(1),
            o => concat(o, throwError('Retries exceeded - fetch groups'))
          );
        })
      );
  }

  get projects() {
    return this.http
      .get<any[]>(`projects?search=${this.settingsService.settings.namespace}&order_by=last_activity_at&per_page=30`)
      // .get<any[]>('projects?owned=true&order_by=last_activity_at&per_page=100')
      .pipe(map(projects => {
        return projects.filter(
          project =>
            project.namespace.name === this.settingsService.settings.namespace,
            // tslint:disable-next-line: no-console
            console.debug('gitlab-ap.service get projects namespace => ' + this.settingsService.settings.namespace)
        );
      }))
      .pipe(
        retryWhen(err => {
          return err.pipe(
            delay(5000),
            take(1),
            o => concat(o, throwError('Retries exceeded - fetch projects'))
          );
        })
      );
  }

  get projectsAll() {
    return this.http
      // .get<any[]>(`projects?search=${this.settingsService.settings.namespace}&order_by=last_activity_at&per_page=100`)
      .get<any[]>(`projects?e&order_by=last_activity_at&per_page=100`)
      // .get<any[]>('projects?owned=true&order_by=last_activity_at&per_page=100')
      .pipe(map(projects => {
        return projects.filter(
          project =>
            project.length > 0
        );
      }))
      .pipe(
        retryWhen(err => {
          return err.pipe(
            delay(5000),
            take(1),
            o => concat(o, throwError('Retries exceeded - fetch projects'))
          );
        })
      );
  }

  projectsByNamespace(name: string) {
    return this.http
    .get<any[]>(`projects?search=${name}&order_by=last_activity_at&per_page=30`)
      .pipe(map(projects => {
        return projects.filter(
          project =>
            project.namespace.name === name,
            // tslint:disable-next-line: no-console
            console.debug('gitlab-ap.service projectsByNamespace name => ' + name)
        );
      }))
      .pipe(
        retryWhen(err => {
          return err.pipe(
            delay(5000),
            take(1),
            o => concat(o, throwError('Retries exceeded - fetch projects'))
          );
        })
      );
  }

  projectsByGroupID(id: any) {
    return this.http
    .get<any[]>(`groups/${id}/projects`)
      .pipe(
        retryWhen(err => {
          return err.pipe(
            delay(5000),
            take(1),
            o => concat(o, throwError('Retries exceeded - fetch projects'))
          );
        })
      );
  }

  projectsByGroupName(name: any) {
    return this.http
    .get<any[]>(`groups?search=${name}/projects&order_by=last_activity_at&per_page=30`)
      .pipe(
        retryWhen(err => {
          return err.pipe(
            delay(5000),
            take(1),
            o => concat(o, throwError('Retries exceeded - fetch projects'))
          );
        })
      );
  }

  fetchPipelines(projectId: string) {
    // tslint:disable-next-line: no-console
    return this.http
      .get<any[]>(`projects/${projectId}/pipelines?per_page=30`)
      .pipe(
        retryWhen(err => {
          return err.pipe(
            delay(5000),
            take(1),
            o => concat(o, throwError('Retries exceeded -  fetch pipelines'))
          );
        })
      );
  }

  fetchPipelinesAll() {
    // tslint:disable-next-line: no-console
    return this.http
      .get<any[]>(`projects/pipelines?per_page=10`)
      .pipe(
        retryWhen(err => {
          return err.pipe(
            delay(5000),
            take(1),
            o => concat(o, throwError('Retries exceeded -  fetch pipelines'))
          );
        })
      );
  }

  fetchLastPipelineByRef(projectId: string, ref: string) {
    // tslint:disable-next-line: no-console
    return this.http
      .get<any>(`projects/${projectId}/pipelines?ref=${ref}&per_page=1`)
      // .pipe(map(resp => resp[0].status))
      .pipe(
        retryWhen(err => {
          return err.pipe(
            delay(5000),
            take(1),
            o => concat(o, throwError('Retries exceeded - fetch pipeline by reference'))
          );
        })
      );
  }

  fetchPipeline(projectId: string, pipelineId: string) {
    // tslint:disable-next-line: no-console
    return this.http
      .get<any>(`projects/${projectId}/pipelines/${pipelineId}`)
      .pipe(
        retryWhen(err => {
          return err.pipe(
            delay(5000),
            take(1),
            o => concat(o, throwError('Retries exceeded - fetch pipeline'))
          );
        })
      );
  }

  fetchPipelineB(pipelineId: string) {
    // tslint:disable-next-line: no-console
    return this.http
      .get<any>(`projects/pipelines/${pipelineId}`)
      .pipe(
        retryWhen(err => {
          return err.pipe(
            delay(5000),
            take(1),
            o => concat(o, throwError('Retries exceeded - fetch pipeline'))
          );
        })
      );
  }

  fetchProject(id: string) {
    // tslint:disable-next-line: no-console
    return this.http.get<any>(`projects/${id}`).pipe(
      retryWhen(err => {
        return err.pipe(
          delay(5000),
          take(1),
          o => concat(o, throwError('Retries exceeded - fetch project'))
        );
      })
    );
  }
}
