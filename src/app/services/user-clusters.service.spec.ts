import { TestBed } from '@angular/core/testing';

import { UserClustersService } from './user-clusters.service';

describe('UserClustersService', () => {
  let service: UserClustersService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(UserClustersService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
