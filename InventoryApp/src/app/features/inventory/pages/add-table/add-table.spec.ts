import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddTablePageComponent } from './add-table';

describe('AddTablePageComponent', () => {
  let component: AddTablePageComponent;
  let fixture: ComponentFixture<AddTablePageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddTablePageComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddTablePageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
