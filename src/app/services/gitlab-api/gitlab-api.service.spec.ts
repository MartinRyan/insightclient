import { TestBed } from '@angular/core/testing';

import { GitlabApiService } from './gitlab-api.service';

describe('GitlabApiService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: GitlabApiService = TestBed.get(GitlabApiService);
    expect(service).toBeTruthy();
  });
});
