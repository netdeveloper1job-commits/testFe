import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AutoEmailer } from './auto-emailer';

describe('AutoEmailer', () => {
  let component: AutoEmailer;
  let fixture: ComponentFixture<AutoEmailer>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AutoEmailer],
    }).compileComponents();

    fixture = TestBed.createComponent(AutoEmailer);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
