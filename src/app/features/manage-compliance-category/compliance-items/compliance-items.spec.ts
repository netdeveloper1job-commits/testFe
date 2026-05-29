import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ComplianceItems } from './compliance-items';

describe('ComplianceItems', () => {
  let component: ComplianceItems;
  let fixture: ComponentFixture<ComplianceItems>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ComplianceItems],
    }).compileComponents();

    fixture = TestBed.createComponent(ComplianceItems);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
