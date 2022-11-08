import { TestBed } from '@angular/core/testing';

import { GeneralParamsService } from './general-params.service';

describe('GeneralParamsService', () => {
  let service: GeneralParamsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GeneralParamsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
