import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManageComplianceCategory } from './manage-compliance-category';

describe('ManageComplianceCategory', () => {
  let component: ManageComplianceCategory;
  let fixture: ComponentFixture<ManageComplianceCategory>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ManageComplianceCategory],
    }).compileComponents();

    fixture = TestBed.createComponent(ManageComplianceCategory);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
