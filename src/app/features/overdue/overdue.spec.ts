import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Overdue } from './overdue';

describe('Overdue', () => {
  let component: Overdue;
  let fixture: ComponentFixture<Overdue>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Overdue],
    }).compileComponents();

    fixture = TestBed.createComponent(Overdue);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
