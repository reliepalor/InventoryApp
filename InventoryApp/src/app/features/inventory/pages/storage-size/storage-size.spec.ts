import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StorageSizePageComponent } from './storage-size';

describe('StorageSize', () => {
  let component: StorageSizePageComponent;
  let fixture: ComponentFixture<StorageSizePageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StorageSizePageComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StorageSizePageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
