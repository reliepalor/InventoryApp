import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Motherboard } from './motherboard';

describe('Motherboard', () => {
  let component: Motherboard;
  let fixture: ComponentFixture<Motherboard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Motherboard]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Motherboard);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
