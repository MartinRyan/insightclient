import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { concat, throwError, Observable } from 'rxjs';
import { delay, retryWhen, take } from 'rxjs/operators';

import { Runner } from './../../models/runner';
import { SettingsService } from './../settings/settings.service';
import { isEmpty } from 'lodash';
import { environment } from './../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class InsightService {
  insighturl = environment.insightApiHost;
  insightapi = '/api/v1/';
  httpOptions = {};


  constructor(
    private http: HttpClient,
    private settingsService: SettingsService) {
  }

  fetchInsightData(ndays: number, handler: string) {
    console.log('fetchInsightData ndays:', ndays, ' handler: ', handler);
    if (!isEmpty(this.settingsService.settings.accessToken)) {
      console.log('fetchInsightData token not empty');
      this.httpOptions = {
        headers: new HttpHeaders({
          'Private-Token': this.settingsService.settings.accessToken,
          'Access-Control-Allow-Origin': 'all'
        })
      };
      const data = this.http.get<Observable<Runner[]>>(`${this.insighturl}${this.insightapi}${handler}/${ndays}`).pipe(
        retryWhen(err => {
          return err.pipe(delay(5000), take(1), o =>
            concat(o, throwError('Retries exceeded - fetch runner matrix'))
          );
        })
      );
      return this.mutateData(data);
    }
  }

  mutateData(data): Observable<Runner[]> {
    console.log('fetchInsightData mutateData data \n ', data);
    // return data as Observable<Runner[]>;
    return data as Observable<any[]>;
  }
}