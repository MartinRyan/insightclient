import { TestBed, async, inject } from '@angular/core/testing';

import { GitlabApiService } from './gitlab-api.service';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

describe('GitlabApiService', () => {
  beforeEach(() => TestBed.configureTestingModule({
    imports: [
      RouterTestingModule.withRoutes([]),
      FormsModule,
      HttpClientTestingModule
    ],
    providers: [
      GitlabApiService
    ]
  })
  );

  afterEach(inject([HttpTestingController], (backend: HttpTestingController) => {
    backend.verify();
  }));

  it(`should be created`, async(inject([HttpTestingController, HttpClientTestingModule, GitlabApiService],
    (httpClient: HttpTestingController, apiService: GitlabApiService) => {
      expect(apiService).toBeTruthy();
  })));

  // it(`should issue a request`,
  //   // 1. declare as async test since the HttpClient works with Observables
  //   async(
  //     // 2. inject HttpClient and HttpTestingController into the test
  //     inject([HttpClient, HttpTestingController], (http: HttpClient, backend: HttpTestingController) => {
  //       // 3. send a simple request
  //       http.get('/foo/bar').subscribe();

  //       // 4. HttpTestingController supersedes `MockBackend` from the "old" Http package
  //       // here two, it's significantly less boilerplate code needed to verify an expected request
  //       backend.expectOne({
  //         url: '/foo/bar',
  //         method: 'GET'
  //       });
  //     })
  //   )
  // );

  // it(`should emit 'true' for 200 Ok`, async(inject([GitlabApiService, HttpTestingController],
  //   (service: GitlabApiService, backend: HttpTestingController) => {
  //     service.login('foo', 'bar').subscribe((next) => {
  //       expect(next).toBeTruthy();
  //     });

  //     backend.expectOne('auth/login').flush(null, { status: 200, statusText: 'Ok' });
  // })));
});
