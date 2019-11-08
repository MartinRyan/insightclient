import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { concat, delay, retryWhen, take, map } from 'rxjs/operators';
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
            // tslint:disable-next-line: deprecation
            concat(
              throwError(
                new Error(
                  'Something is going really wrong... Please review your settings!'
                )
              )
            )
          );
        })
      );
  }

  get projects() {
    return this.http
      .get<any[]>(
        `projects?search=${
        this.settingsService.settings.namespace
        }&order_by=last_activity_at&per_page=100`
      )
      .pipe(map(projects => {
        return projects.filter(
          project =>
            project.namespace.name === this.settingsService.settings.namespace
        );
      }))
      .pipe(
        retryWhen(err => {
          return err.pipe(
            delay(5000),
            take(3),
            // tslint:disable-next-line: deprecation
            concat(
              throwError(
                new Error(
                  'Something is going really wrong... Please review your settings!'
                )
              )
            )
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
            // tslint:disable-next-line: deprecation
            concat(
              throwError(
                new Error(
                  'Something is going really wrong... Please review your settings!'
                )
              )
            )
          );
        })
      );
  }

  fetchLastPipelineByRef(projectId: string, ref: string) {
    return this.http
      .get<any[]>(`projects/${projectId}/pipelines?ref=${ref}&per_page=1`)
      .pipe(
        retryWhen(err => {
          return err.pipe(
            delay(5000),
            take(3),
            // tslint:disable-next-line: deprecation
            concat(
              throwError(
                new Error(
                  'Something is going really wrong... Please review your settings!'
                )
              )
            )
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
            // tslint:disable-next-line: deprecation
            concat(
              throwError(
                new Error(
                  'Something is going really wrong... Please review your settings!'
                )
              )
            )
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
          // tslint:disable-next-line: deprecation
          concat(
            throwError(
              new Error(
                'Something is going really wrong... Please review your settings!'
              )
            )
          )
        );
      })
    );
  }
}
