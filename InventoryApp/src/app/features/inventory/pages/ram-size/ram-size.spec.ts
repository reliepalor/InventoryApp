// src/app/features/inventory/pages/ram-size/ram-size.spec.ts
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RamSizePageComponent } from './ram-size';

describe('RamSize', () => {
  let component: RamSizePageComponent;
  let fixture: ComponentFixture<RamSizePageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RamSizePageComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RamSizePageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
