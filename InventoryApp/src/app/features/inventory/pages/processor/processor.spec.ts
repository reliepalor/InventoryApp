import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProcessorPageComponent } from './processor';

describe('ProcessorPageComponent', () => {
  let component: ProcessorPageComponent;
  let fixture: ComponentFixture<ProcessorPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProcessorPageComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProcessorPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
