import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
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
            o => concat(o, throwError('Retries exceeded'))
          );
        })
      );
  }

  get projects() {
    return this.http
      // .get<any[]>(
      //   `projects?search=${
      //   this.settingsService.settings.namespace
      //   }&order_by=last_activity_at&per_page=100`
      // )
      .get<any[]>('projects?owned=true&order_by=last_activity_at&per_page=100')
      // .pipe(map(projects => {
      //   return projects.filter(
      //     project =>
      //       project.namespace.name === this.settingsService.settings.namespace
      //   );
      // }))
      .pipe(
        retryWhen(err => {
          return err.pipe(
            delay(5000),
            take(3),
            o => concat(o, throwError('Retries exceeded'))
          );
        })
      );
  }

  fetchPipelines(projectId: string) {
    return this.http
      .get<any[]>(`projects/${projectId}/pipelines?per_page=5`)
      .pipe(
        retryWhen(err => {
          return err.pipe(
            delay(5000),
            take(3),
            o => concat(o, throwError('Retries exceeded'))
          );
        })
      );
  }

  fetchLastPipelineByRef(projectId: string, ref: string) {
    return this.http
      .get<any[]>(`projects/${projectId}/pipelines?ref=${ref}&per_page=1`)
      // .pipe(map(resp => resp[0].status))
      .pipe(
        retryWhen(err => {
          return err.pipe(
            delay(5000),
            take(3),
            o => concat(o, throwError('Retries exceeded'))
          );
        })
      );
  }

  fetchPipeline(projectId: string, pipelineId: string) {
    return this.http
      .get<any>(`projects/${projectId}/pipelines/${pipelineId}`)
      .pipe(
        retryWhen(err => {
          return err.pipe(
            delay(5000),
            take(3),
            o => concat(o, throwError('Retries exceeded'))
          );
        })
      );
  }

  fetchProject(id: string) {
    return this.http.get<any>(`projects/${id}`).pipe(
      retryWhen(err => {
        return err.pipe(
          delay(5000),
          take(3),
          o => concat(o, throwError('Retries exceeded'))
        );
      })
    );
  }
}
