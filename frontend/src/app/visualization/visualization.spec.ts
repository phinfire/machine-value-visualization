import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Visualization } from './visualization';

describe('Visualization', () => {
  let component: Visualization;
  let fixture: ComponentFixture<Visualization>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Visualization]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Visualization);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
