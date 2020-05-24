import { RunnersService } from './../services/gitlab-api/runners.service';
import { RunnersDataSource } from './runners-data-source.model';

describe('RunnersDataSource', () => {
  it('should create an instance', () => {
    expect(new RunnersDataSource()).toBeTruthy();
  });
});
