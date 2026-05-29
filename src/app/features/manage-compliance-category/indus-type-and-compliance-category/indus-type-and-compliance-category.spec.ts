import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IndusTypeAndComplianceCategory } from './indus-type-and-compliance-category';

describe('IndusTypeAndComplianceCategory', () => {
  let component: IndusTypeAndComplianceCategory;
  let fixture: ComponentFixture<IndusTypeAndComplianceCategory>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IndusTypeAndComplianceCategory],
    }).compileComponents();

    fixture = TestBed.createComponent(IndusTypeAndComplianceCategory);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
