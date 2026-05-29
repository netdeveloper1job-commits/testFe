import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IndustryType } from './industry-type';

describe('IndustryType', () => {
  let component: IndustryType;
  let fixture: ComponentFixture<IndustryType>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IndustryType],
    }).compileComponents();

    fixture = TestBed.createComponent(IndustryType);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
