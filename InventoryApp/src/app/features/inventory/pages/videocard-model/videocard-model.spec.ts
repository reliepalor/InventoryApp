// src/app/features/inventory/pages/videocard-model/videocard-model.spec.ts
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VideocardModelPageComponent } from './videocard-model';

describe('VideocardModelPageComponent', () => {
  let component: VideocardModelPageComponent;
  let fixture: ComponentFixture<VideocardModelPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VideocardModelPageComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VideocardModelPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
