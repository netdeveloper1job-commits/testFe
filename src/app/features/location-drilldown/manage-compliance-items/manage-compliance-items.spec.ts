import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManageComplianceItems } from './manage-compliance-items';

describe('ManageComplianceItems', () => {
  let component: ManageComplianceItems;
  let fixture: ComponentFixture<ManageComplianceItems>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ManageComplianceItems],
    }).compileComponents();

    fixture = TestBed.createComponent(ManageComplianceItems);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
