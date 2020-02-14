import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { concat, throwError } from 'rxjs';
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
    private settingsService: SettingsService) {}

  // curl --header "PRIVATE-TOKEN: <your_access_token>" "https://gitlab.example.com/api/v4/runners/all"
  // return this.httpClient.delete<Product>(this.apiServer + '/products/' + id, this.httpOptions)

  // getRunners(): Observable<Runner[]> {
  //   return this.http.get<Runner[]>(this.gitlabUrl);
  // }

  fetchRunners() {
    return this.http.get<Runner[]>(`${this.gitlabUrl}/api/v4/runners/all`, this.httpOptions).pipe(
      retryWhen(err => {
        return err.pipe(delay(5000), take(1), o =>
          concat(o, throwError('Retries exceeded - fetch runners'))
        );
      })
    );
  }
}
