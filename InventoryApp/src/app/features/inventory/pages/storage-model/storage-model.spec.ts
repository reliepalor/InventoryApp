import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StorageModelPageComponent } from './storage-model';

describe('StorageModel', () => {
  let component: StorageModelPageComponent;
  let fixture: ComponentFixture<StorageModelPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StorageModelPageComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StorageModelPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
