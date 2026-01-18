import { TestBed } from '@angular/core/testing';

import { LiveMachineDataService } from './live-machine-data-service';

describe('LiveMachineDataService', () => {
  let service: LiveMachineDataService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LiveMachineDataService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
