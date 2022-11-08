import { TestBed } from '@angular/core/testing';

import { UserTemplatesService } from './user-templates.service';

describe('UserTemplatesService', () => {
  let service: UserTemplatesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(UserTemplatesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
