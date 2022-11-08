import { TestBed } from '@angular/core/testing';

import { KafkaService } from './kafka.service';

describe('KafkaService', () => {
  let service: KafkaService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(KafkaService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
