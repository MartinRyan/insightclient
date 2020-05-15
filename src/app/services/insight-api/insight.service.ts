import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { concat, throwError, Observable } from 'rxjs';
import { delay, retryWhen, take } from 'rxjs/operators';

import { Runner } from './../../models/runner';
import { SettingsService } from './../settings/settings.service';

@Injectable({
  providedIn: 'root'
})
export class InsightService {
  // insighturl = this.settingsService.settings.insighturl;
  insighturl = 'http://localhost:8888'
  insightapi = '/api/v1/';
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

  fetchInsightData(ndays: number, handler: string) {
    const data = this.http.get<Observable<Runner[]>>(`${this.insighturl}${this.insightapi}${handler}/${ndays}`).pipe(
      retryWhen(err => {
        return err.pipe(delay(5000), take(1), o =>
          concat(o, throwError('Retries exceeded - fetch runner matrix'))
        );
      })
    );
    return this.mutateData(data);
  }

  mutateData(data): Observable<Runner[]> {
    // return this.RUNNER_DATA as Observable<Runner[]>; // testing only
    console.log('data: => ', data);
    // return data as Observable<Runner[]>;
    return data as Observable<any[]>;
  }
}