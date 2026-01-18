import { TestBed } from '@angular/core/testing';

import { PlotterService } from './plotter-service';

describe('PlotterService', () => {
  let service: PlotterService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PlotterService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
