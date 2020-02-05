import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { concat, throwError } from 'rxjs';
import { delay, map, retryWhen, take } from 'rxjs/operators';

import { NotificationService } from './../notification/notification.service';
import { SettingsService } from './../settings/settings.service';

@Injectable({
  providedIn: 'root'
})
export class GitlabApiService {
  constructor(
    private http: HttpClient,
    private notificationService: NotificationService,
    private settingsService: SettingsService
  ) {}

  get mergeRequests() {
    return this.http
      .get<any[]>(`merge_requests?state=opened&scope=all&per_page=30`)
      .pipe(
        retryWhen(err => {
          return err.pipe(delay(5000), take(1), o =>
            concat(o, throwError('Retries exceeded - fetch merge requests'))
          );
        })
      );
  }

  get namespaces() {
    return this.http.get<any[]>(`namespaces`).pipe(
      retryWhen(err => {
        return err.pipe(delay(5000), take(1), o =>
          concat(o, throwError('Retries exceeded - fetch name spaces'))
        );
      })
    );
  }

  subgroupsByGroupID(id: any) {
    return this.http.get<any[]>(`groups/${id}/subgroups`).pipe(
      retryWhen(err => {
        return err.pipe(delay(5000), take(1), o =>
          concat(o, throwError('Retries exceeded - fetch subgroups'))
        );
      })
    );
  }

  projectByID(id: any) {
    return this.http.get<any>(`projects/${id}`).pipe(
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
          `projects?search=${this.settingsService.settings.namespace}&order_by=last_activity_at&per_page=${this.settingsService.settings.perPage}`
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
          `projects?&order_by=last_activity_at&per_page=${this.settingsService.settings.perPage}`
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
        `projects?search=${name}&order_by=last_activity_at&per_page=${this.settingsService.settings.perPage}`
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
    return this.http.get<any[]>(`groups/${id}/projects`).pipe(
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
        `groups?search=${name}/projects&order_by=last_activity_at&per_page=${this.settingsService.settings.perPage}`
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
        `projects/${projectId}/pipelines?page=1&per_page=${this.settingsService.settings.perPage}`
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
        `projects/pipelines?per_page=${this.settingsService.settings.perPage}`
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
        .get<any>(`projects/${projectId}/pipelines?ref=${ref}&per_page=1`)
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
      .get<any>(`projects/${projectId}/pipelines/${pipelineId}`)
      .pipe(
        retryWhen(err => {
          return err.pipe(delay(5000), take(1), o =>
            concat(o, throwError('Retries exceeded - fetch pipeline'))
          );
        })
      );
  }

  fetchPipelineB(pipelineId: string) {
    return this.http.get<any>(`projects/pipelines/${pipelineId}`).pipe(
      retryWhen(err => {
        return err.pipe(delay(5000), take(1), o =>
          concat(o, throwError('Retries exceeded - fetch pipeline'))
        );
      })
    );
  }

  fetchProject(id: string) {
    return this.http.get<any>(`projects/${id}`).pipe(
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
        `runners/${projectID}`
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
