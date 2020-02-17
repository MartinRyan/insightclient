import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { concat, throwError } from 'rxjs';
import { delay, retryWhen, take } from 'rxjs/operators';

import { Runner } from './../../models/runner';
import { SettingsService } from './../settings/settings.service';
import { RunnerItem } from 'src/app/models/runners-data-source.model';

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

  fetchRunners() {
    return this.http.get<Runner[]>(`runners/all`, this.httpOptions).pipe(
      retryWhen(err => {
        return err.pipe(delay(5000), take(1), o =>
          concat(o, throwError('Retries exceeded - fetch runners'))
        );
      })
    );
  }
}
