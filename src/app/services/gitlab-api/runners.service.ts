import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { concat, throwError, Observable } from 'rxjs';
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

  RUNNER_DATA: RunnerItem[] = [
    {
      id: '1',
      name: 'shared-runner-1',
      minus7: {
        active: 'true',
        description: 'test03-447589',
        id: 1,
        ip_address: '127.0.0.1',
        is_shared: 'true',
        name: 'shared-runner-1',
        online: 'true',
        status: 'online'
      },
      minus6: {
        active: 'true',
        description: 'test-16781-67',
        id: 6,
        ip_address: '127.0.0.1',
        is_shared: 'true',
        name: 'shared-runner-1',
        online: 'true',
        status: 'online'
      },
      minus5: {
        active: 'true',
        description: 'test-11-142463576',
        id: 85,
        ip_address: '127.0.0.1',
        is_shared: 'false',
        name: 'shared-runner-1',
        online: 'false',
        status: 'offline'
      },
      minus4: {
        active: 'false',
        description: 'test-1-3453453',
        id: 4,
        ip_address: '127.0.0.1',
        is_shared: 'true',
        name: 'shared-runner-1',
        online: 'true',
        status: 'paused'
      },
      minus3: {
        active: 'true',
        description: 'test-3-874857',
        id: 3,
        ip_address: '127.0.0.1',
        is_shared: 'true',
        name: 'shared-runner-1',
        online: 'true',
        status: 'online'
      },
      minus2: {
        active: 'true',
        description: 'test-4-20154',
        id: 2,
        is_shared: 'true',
        name: 'shared-runner-1',
        online: 'false',
        status: 'offline'
      },
      minus1: {
        active: 'true',
        description: 'test-5-20150125',
        id: 1,
        ip_address: '127.0.0.1',
        is_shared: 'false',
        name: 'shared-runner-1',
        online: 'false',
        status: 'offline'
      },
      now: {
        active: 'true',
        description: 'test-6-383487',
        id: 0,
        ip_address: '127.0.0.1',
        is_shared: 'true',
        name: 'shared-runner-1',
        online: 'true',
        status: 'online'
      }
    },
    {
      id: '2',
      name: 'shared-runner-2',
      minus7: {
        active: 'true',
        description: 'test71-34347',
        id: 1,
        ip_address: '127.0.0.1',
        is_shared: 'true',
        name: 'shared-runner-2',
        online: 'true',
        status: 'online'
      },
      minus6: {
        active: 'true',
        description: 'test-218-878',
        id: 2,
        ip_address: '127.0.0.1',
        is_shared: 'true',
        name: 'shared-runner-2',
        online: 'true',
        status: 'online'
      },
      minus5: {
        active: 'true',
        description: 'test-43-5457',
        id: 3,
        ip_address: '127.0.0.1',
        is_shared: 'false',
        name: 'shared-runner-2',
        online: 'true',
        status: 'active'
      },
      minus4: {
        active: 'false',
        description: 'test-1-3453453',
        id: 4,
        ip_address: '127.0.0.1',
        is_shared: 'true',
        name: 'shared-runner-2',
        online: 'true',
        status: 'paused'
      },
      minus3: {
        active: 'true',
        description: 'test-2-44567',
        id: 5,
        ip_address: '127.0.0.1',
        is_shared: 'true',
        name: 'shared-runner-2',
        online: 'true',
        status: 'online'
      },
      minus2: {
        active: 'true',
        description: 'test-4-20154',
        id: 2,
        ip_address: '127.0.0.1',
        is_shared: 'true',
        name: 'shared-runner-2',
        online: 'true',
        status: 'online'
      },
      minus1: {
        active: 'true',
        description: 'test-5-20150125',
        id: 1,
        ip_address: '127.0.0.1',
        is_shared: 'true',
        name: 'shared-runner-2',
        online: 'true',
        status: 'online'
      },
      now: {
        active: 'true',
        description: 'test-6-383487',
        id: 0,
        ip_address: '127.0.0.1',
        is_shared: 'true',
        name: 'shared-runner-2',
        online: 'true',
        status: 'online'
      }
    },
    {
      id: '3',
      name: 'runner-1',
      minus7: {
        active: 'true',
        description: 'run-8484-36',
        id: 1,
        ip_address: '127.0.0.1',
        is_shared: 'false',
        name: 'runner-1',
        online: 'true',
        status: 'paused'
      },
      minus6: {
        active: 'true',
        description: 'run-3254-745',
        id: 2,
        ip_address: '127.0.0.1',
        is_shared: 'false',
        name: 'runner-1',
        online: 'true',
        status: 'online'
      },
      minus5: {
        active: 'true',
        description: 'run-987123',
        id: 3,
        ip_address: '127.0.0.1',
        is_shared: 'false',
        name: 'runner-1',
        online: 'true',
        status: 'active'
      },
      minus4: {
        active: 'true',
        description: 'run-43-575',
        id: 4,
        ip_address: '127.0.0.1',
        is_shared: 'false',
        name: 'runner-1',
        online: 'true',
        status: 'online'
      },
      minus3: {
        active: 'true',
        description: 'run-435-987',
        id: 5,
        ip_address: '127.0.0.1',
        is_shared: 'false',
        name: 'runner-1',
        online: 'true',
        status: 'online'
      },
      minus2: {
        active: 'true',
        description: 'run-897-1',
        id: 2,
        ip_address: '127.0.0.1',
        is_shared: 'false',
        name: 'runner-1',
        online: 'true',
        status: 'online'
      },
      minus1: {
        active: 'true',
        description: 'run-567-098',
        id: 1,
        ip_address: '127.0.0.1',
        is_shared: 'false',
        name: 'runner-1',
        online: 'true',
        status: 'online'
      },
      now: {
        active: 'true',
        description: 'run-6-747',
        id: 0,
        ip_address: '127.0.0.1',
        is_shared: 'false',
        name: 'runner-1',
        online: 'true',
        status: 'online'
      }
    },
    {
      id: '4',
      name: 'runner-2a',
      minus7: {
        active: 'true',
        description: 'run-926629',
        id: 1,
        ip_address: '127.0.0.1',
        is_shared: 'false',
        name: 'runner-2a',
        online: 'true',
        status: 'online'
      },
      minus6: {
        active: 'true',
        description: 'run-04783-76',
        id: 2,
        ip_address: '127.0.0.1',
        is_shared: 'false',
        name: 'runner-2a',
        online: 'true',
        status: 'online'
      },
      minus5: {
        active: 'true',
        description: 'run-1274-09',
        id: 3,
        ip_address: '127.0.0.1',
        is_shared: 'false',
        name: 'runner-2a',
        online: 'true',
        status: 'active'
      },
      minus4: {
        active: 'true',
        description: 'run-1104573',
        id: 4,
        ip_address: '127.0.0.1',
        is_shared: 'false',
        name: 'runner-2a',
        online: 'true',
        status: 'online'
      },
      minus3: {
        active: 'true',
        description: 'run-99914',
        id: 5,
        ip_address: '127.0.0.1',
        is_shared: 'false',
        name: 'runner-2a',
        online: 'true',
        status: 'online'
      },
      minus2: {
        active: 'true',
        description: 'run-12a-3989',
        id: 2,
        ip_address: '127.0.0.1',
        is_shared: 'false',
        name: 'runner-2a',
        online: 'true',
        status: 'online'
      },
      minus1: {
        active: 'true',
        description: 'run-1237',
        id: 1,
        ip_address: '127.0.0.1',
        is_shared: 'false',
        name: 'runner-2a',
        online: 'true',
        status: 'online'
      },
      now: {
        active: 'true',
        description: 'run-88645',
        id: 0,
        ip_address: '127.0.0.1',
        is_shared: 'false',
        name: 'runner-2a',
        online: 'true',
        status: 'online'
      }
    }
  ];

  constructor(
    private http: HttpClient,
    private settingsService: SettingsService) {
    }

  fetchRunners() {
    const data = this.http.get<Observable<RunnerItem[]>>(`runners/all`, this.httpOptions).pipe(
      // when authtoken available
    // return this.http.get<Runner[]>(`runners/all`, this.httpOptions).pipe(
      retryWhen(err => {
        return err.pipe(delay(5000), take(1), o =>
          concat(o, throwError('Retries exceeded - fetch runners'))
        );
      })
    );
    return this.mutateData(data);
  }

  mutateData(data) {
    // return this.RUNNER_DATA;
    console.log('data: => ', data);
    return data;
  }
}
