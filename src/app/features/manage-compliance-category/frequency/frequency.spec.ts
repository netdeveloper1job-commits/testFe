import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Frequency } from './frequency';

describe('Frequency', () => {
  let component: Frequency;
  let fixture: ComponentFixture<Frequency>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Frequency],
    }).compileComponents();

    fixture = TestBed.createComponent(Frequency);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
