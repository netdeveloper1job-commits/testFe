import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LocationComplianceTracker } from './location-compliance-tracker';

describe('LocationComplianceTracker', () => {
  let component: LocationComplianceTracker;
  let fixture: ComponentFixture<LocationComplianceTracker>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LocationComplianceTracker],
    }).compileComponents();

    fixture = TestBed.createComponent(LocationComplianceTracker);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
