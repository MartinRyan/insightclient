import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { concat, throwError, Observable } from 'rxjs';
import { delay, retryWhen, take } from 'rxjs/operators';

import { Runner } from './../../models/runner';
import { SettingsService } from './../settings/settings.service';

@Injectable({
  providedIn: 'root'
})
export class RunnersService {
  gitlabUrl = this.settingsService.settings.gitlabAddress;
  httpOptions = {
    headers: new HttpHeaders({
      'Private-Token': this.settingsService.settings.accessToken,
      'Access-Control-Allow-Origin': 'all'
    })
  };

  constructor(
    private http: HttpClient,
    private settingsService: SettingsService) {
    }

  fetchRunners(): Observable<Runner[]> {
    const data = this.http.get<Observable<Runner[]>>(`runners/all`, this.httpOptions).pipe(
      // when authtoken available
      retryWhen(err => {
        return err.pipe(delay(5000), take(1), o =>
          concat(o, throwError('Retries exceeded - fetch runners'))
        );
      })
    );
    return this.mutateData(data);
  }

  mutateData(data): Observable<Runner[]> {
    // return this.RUNNER_DATA as Observable<Runner[]>; // testing only
    // console.log('data: => ', data);
    return data;
  }
}
