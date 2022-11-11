import { TestBed } from '@angular/core/testing';

import { GithubHelperService } from './github-helper.service';

describe('GithubHelperService', () => {
  let service: GithubHelperService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GithubHelperService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
