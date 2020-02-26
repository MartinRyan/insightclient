import { TestBed } from '@angular/core/testing';

import { RunnersService } from './runners.service';

describe('RunnersService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: RunnersService = TestBed.get(RunnersService);
    expect(service).toBeTruthy();
  });
});
