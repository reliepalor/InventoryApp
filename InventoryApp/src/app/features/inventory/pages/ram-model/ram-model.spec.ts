import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RamModelPageComponent } from './ram-model';

describe('RamModel', () => {
  let component: RamModelPageComponent;
  let fixture: ComponentFixture<RamModelPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RamModelPageComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RamModelPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
