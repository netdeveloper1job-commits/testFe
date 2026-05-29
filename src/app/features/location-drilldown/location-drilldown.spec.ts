import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LocationDrilldown } from './location-drilldown';

describe('LocationDrilldown', () => {
  let component: LocationDrilldown;
  let fixture: ComponentFixture<LocationDrilldown>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LocationDrilldown],
    }).compileComponents();

    fixture = TestBed.createComponent(LocationDrilldown);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
