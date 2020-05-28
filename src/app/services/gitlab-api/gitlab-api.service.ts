import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { concat, throwError } from 'rxjs';
import { delay, map, retryWhen, take } from 'rxjs/operators';

import { NotificationService } from './../notification/notification.service';
import { SettingsService } from './../settings/settings.service';
import { isEmpty } from 'lodash';

@Injectable({
  providedIn: 'root'
})
export class GitlabApiService {

gitlabUrl = 'https://hpc-gitlab.bom.gov.au';
gitlabApi = '/api/v4/';

  constructor(
    private http: HttpClient,
    private notificationService: NotificationService,
    private settingsService: SettingsService
  ) {}

  get mergeRequests() {
    return this.http
      .get<any[]>(`${this.gitlabUrl}${this.gitlabApi}merge_requests?state=opened&scope=all&per_page=30`)
      .pipe(
        retryWhen(err => {
          return err.pipe(delay(5000), take(1), o =>
            concat(o, throwError('Retries exceeded - fetch merge requests'))
          );
        })
      );
  }

  get namespaces() {
    return this.http.get<any[]>(`${this.gitlabUrl}${this.gitlabApi}namespaces`).pipe(
      retryWhen(err => {
        return err.pipe(delay(5000), take(1), o =>
          concat(o, throwError('Retries exceeded - fetch name spaces'))
        );
      })
    );
  }

  subgroupsByGroupID(id: any) {
    return this.http.get<any[]>(`${this.gitlabUrl}${this.gitlabApi}groups/${id}/subgroups`).pipe(
      retryWhen(err => {
        return err.pipe(delay(5000), take(1), o =>
          concat(o, throwError('Retries exceeded - fetch subgroups'))
        );
      })
    );
  }

  projectByID(id: any) {
    return this.http.get<any>(`${this.gitlabUrl}${this.gitlabApi}projects/${id}`).pipe(
      retryWhen(err => {
        return err.pipe(delay(5000), take(1), o =>
          concat(o, throwError('Retries exceeded - fetch groups'))
        );
      })
    );
  }

  get projects() {
    return (
      this.http
        .get<any[]>(
          // tslint:disable-next-line: max-line-length
          `${this.gitlabUrl}${this.gitlabApi}projects?search=${this.settingsService.settings.namespace}&order_by=last_activity_at&per_page=${this.settingsService.settings.perPage}`
          // `projects?search=${this.settingsService.settings.namespace}&order_by=last_activity_at`
        )
        // .get<any[]>('projects?owned=true&order_by=last_activity_at&per_page=100')
        .pipe(
          map(projects => {
            return projects.filter(
              project =>
                project.namespace.name ===
                this.settingsService.settings.namespace
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
    return (
      this.http
        // .get<any[]>(`projects?search=${this.settingsService.settings.namespace}&order_by=last_activity_at&per_page=100`)
        .get<any[]>(
          `${this.gitlabUrl}${this.gitlabApi}projects?&order_by=last_activity_at&per_page=${this.settingsService.settings.perPage}`
        )
        // .get<any[]>('projects?owned=true&order_by=last_activity_at&per_page=100')
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
    return this.http
      .get<any[]>(
        `${this.gitlabUrl}${this.gitlabApi}projects?search=${name}&order_by=last_activity_at&per_page=${this.settingsService.settings.perPage}`
        // `projects?search=${name}&order_by=last_activity_at`
      )
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
    return this.http.get<any[]>(`${this.gitlabUrl}${this.gitlabApi}groups/${id}/projects`).pipe(
      retryWhen(err => {
        return err.pipe(delay(5000), take(1), o =>
          concat(o, throwError('Retries exceeded - fetch projects'))
        );
      })
    );
  }

  projectsByGroupName(name: any) {
    return this.http
      .get<any[]>(
        `${this.gitlabUrl}${this.gitlabApi}groups?search=${name}/projects&order_by=last_activity_at&per_page=${this.settingsService.settings.perPage}`
        // `groups?search=${name}/projects&order_by=last_activity_at`
      )
      .pipe(
        retryWhen(err => {
          return err.pipe(delay(5000), take(1), o =>
            concat(o, throwError('Retries exceeded - fetch projects'))
          );
        })
      );
  }

  fetchPipelines(projectId: string) {
    return this.http
      .get<any[]>(
        `${this.gitlabUrl}${this.gitlabApi}projects/${projectId}/pipelines?page=1&per_page=${this.settingsService.settings.perPage}`
        )
      .pipe(
        retryWhen(err => {
          return err.pipe(delay(5000), take(1), o =>
            concat(o, throwError('Retries exceeded -  fetch pipelines'))
          );
        })
      );
  }

  fetchPipelinesAll() {
    return this.http
      .get<any[]>(
        `${this.gitlabUrl}${this.gitlabApi}projects/pipelines?per_page=${this.settingsService.settings.perPage}`
      )
      .pipe(
        retryWhen(err => {
          return err.pipe(delay(5000), take(1), o =>
            concat(o, throwError('Retries exceeded -  fetch pipelines'))
          );
        })
      );
  }

  fetchLastPipelineByRef(projectId: string, ref: string) {
    return (
      this.http
        .get<any>(`${this.gitlabUrl}${this.gitlabApi}projects/${projectId}/pipelines?ref=${ref}&per_page=1`)
        // .pipe(map(resp => resp[0].status))
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
    return this.http
      .get<any>(`${this.gitlabUrl}${this.gitlabApi}projects/${projectId}/pipelines/${pipelineId}`)
      .pipe(
        retryWhen(err => {
          return err.pipe(delay(5000), take(1), o =>
            concat(o, throwError('Retries exceeded - fetch pipeline'))
          );
        })
      );
  }

  fetchPipelineB(pipelineId: string) {
    return this.http.get<any>(`${this.gitlabUrl}${this.gitlabApi}projects/pipelines/${pipelineId}`).pipe(
      retryWhen(err => {
        return err.pipe(delay(5000), take(1), o =>
          concat(o, throwError('Retries exceeded - fetch pipeline'))
        );
      })
    );
  }

  fetchProject(id: string) {
    return this.http.get<any>(`${this.gitlabUrl}${this.gitlabApi}projects/${id}`).pipe(
      retryWhen(err => {
        return err.pipe(delay(5000), take(1), o =>
          concat(o, throwError('Retries exceeded - fetch project'))
        );
      })
    );
  }

  fetchRunnersById(projectID: string) {
    return this.http
      .get<any[]>(
        `${this.gitlabUrl}${this.gitlabApi}runners/${projectID}`
      )
      .pipe(
        retryWhen(err => {
          return err.pipe(delay(5000), take(1), o =>
            concat(o, throwError('Retries exceeded -  fetch runners by id: '))
          );
        })
      );
  }
}
