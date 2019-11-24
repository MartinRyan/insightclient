import { HttpClient } from '@angular/common/http';
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
      .get<any[]>('merge_requests?state=opened&scope=all&per_page=100')
      .pipe(
        retryWhen(err => {
          return err.pipe(
            delay(5000),
            take(3),
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
            take(3),
            o => concat(o, throwError('Retries exceeded - fetch name spaces'))
          );
        })
      );
  }

  get projects() {
    return this.http
      .get<any[]>(`projects?search=${this.settingsService.settings.namespace}&order_by=last_activity_at&per_page=100`)
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
            take(3),
            o => concat(o, throwError('Retries exceeded - fetch projects'))
          );
        })
      );
  }

  get projectsAll() {
    return this.http
      // .get<any[]>(`projects?search=${this.settingsService.settings.namespace}&order_by=last_activity_at&per_page=100`)
      // .get<any[]>(`projects&order_by=last_activity_at&per_page=100`)
      .get<any[]>('projects?owned=true&order_by=last_activity_at&per_page=100')
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
            take(3),
            o => concat(o, throwError('Retries exceeded - fetch projects'))
          );
        })
      );
  }

  projectsByNamespace(namespace: any) {
    return this.http
    .get<any[]>(`projects?search=${namespace}&order_by=last_activity_at&per_page=100`)
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
            take(3),
            o => concat(o, throwError('Retries exceeded - fetch projects'))
          );
        })
      );
  }

  fetchPipelines(projectId: string) {
    // tslint:disable-next-line: no-console
    // console.debug('gitlab-ap.service fetchPipelines projectId => ' + projectId);
    return this.http
      .get<any[]>(`projects/${projectId}/pipelines?per_page=100`)
      .pipe(
        retryWhen(err => {
          return err.pipe(
            delay(5000),
            take(3),
            o => concat(o, throwError('Retries exceeded -  fetch pipelines'))
          );
        })
      );
  }

  fetchPipelinesAll() {
    // tslint:disable-next-line: no-console
    // console.debug('gitlab-ap.service fetchPipelines projectId => ' + projectId);
    return this.http
      .get<any[]>(`projects/pipelines?per_page=100`)
      .pipe(
        retryWhen(err => {
          return err.pipe(
            delay(5000),
            take(3),
            o => concat(o, throwError('Retries exceeded -  fetch pipelines'))
          );
        })
      );
  }

  fetchLastPipelineByRef(projectId: string, ref: string) {
    // tslint:disable-next-line: no-console
    // console.debug('gitlab-ap.service fetchLastPipelineByRef projectId => ' + projectId + ' ref: ' + ref);
    return this.http
      .get<any[]>(`projects/${projectId}/pipelines?ref=${ref}&per_page=1`)
      // .pipe(map(resp => resp[0].status))
      .pipe(
        retryWhen(err => {
          return err.pipe(
            delay(5000),
            take(3),
            o => concat(o, throwError('Retries exceeded - fetch pipeline by reference'))
          );
        })
      );
  }

  fetchPipeline(projectId: string, pipelineId: string) {
    // tslint:disable-next-line: no-console
    // console.debug('gitlab-ap.service fetchPipeline projectId => ' + projectId + ' pipelineId: ' + pipelineId);
    return this.http
      .get<any>(`projects/${projectId}/pipelines/${pipelineId}`)
      .pipe(
        retryWhen(err => {
          return err.pipe(
            delay(5000),
            take(3),
            o => concat(o, throwError('Retries exceeded - fetch pipeline'))
          );
        })
      );
  }

  fetchPipelineB(pipelineId: string) {
    // tslint:disable-next-line: no-console
    // console.debug('gitlab-ap.service fetchPipeline projectId => ' + projectId + ' pipelineId: ' + pipelineId);
    return this.http
      .get<any>(`projects/pipelines/${pipelineId}`)
      .pipe(
        retryWhen(err => {
          return err.pipe(
            delay(5000),
            take(3),
            o => concat(o, throwError('Retries exceeded - fetch pipeline'))
          );
        })
      );
  }

  fetchProject(id: string) {
    // tslint:disable-next-line: no-console
    // console.debug('gitlab-ap.service fetchProject id => ' + id );
    return this.http.get<any>(`projects/${id}`).pipe(
      retryWhen(err => {
        return err.pipe(
          delay(5000),
          take(3),
          o => concat(o, throwError('Retries exceeded - fetch project'))
        );
      })
    );
  }
}
