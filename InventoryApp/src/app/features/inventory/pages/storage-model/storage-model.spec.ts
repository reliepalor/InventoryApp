// storage-model.spec.ts
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';

import { StorageModelPageComponent } from './storage-model';
import { SidebarService } from '../../../services/sidebar.service';
import { StorageModelService } from '../../../services/storage-model.service';
import { StorageModelItem } from '../../../models/storage-model';

describe('StorageModelPageComponent', () => {
  let component: StorageModelPageComponent;
  let fixture: ComponentFixture<StorageModelPageComponent>;

  // minimal mock SidebarService: exposes sidebarOpen$ observable
  const sidebarMock = {
    sidebarOpen$: of(true)
  };

  // minimal mock StorageModelService: returns empty list by default
  const storageServiceMock = {
    getAllStorageModels: jasmine.createSpy('getAllStorageModels').and.returnValue(of([])),
    getStorageModelById: jasmine.createSpy('getStorageModelById').and.returnValue(of(null)),
    createStorageModel: jasmine.createSpy('createStorageModel').and.returnValue(of(null)),
    updateStorageModel: jasmine.createSpy('updateStorageModel').and.returnValue(of(null)),
    deleteStorageModel: jasmine.createSpy('deleteStorageModel').and.returnValue(of(null))
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StorageModelPageComponent],
      providers: [
        { provide: SidebarService, useValue: sidebarMock },
        { provide: StorageModelService, useValue: storageServiceMock }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(StorageModelPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should load storage models on init (calls service)', () => {
    expect(storageServiceMock.getAllStorageModels).toHaveBeenCalled();
    expect(component.storageModels).toEqual([]);
    expect(component.filteredStorageModels).toEqual([]);
  });

  it('should open add form and reset form model', () => {
    component.openAddForm();
    expect(component.isEditMode).toBeFalse();
    expect(component.showForm).toBeTrue();
    expect(component.currentStorageModel.storageName).toBe('');
    expect(component.currentStorageModel.storageType).toBe('');
  });

  it('should open edit form and populate currentStorageModel', () => {
    const sample: StorageModelItem = {
      id: 123,
      referenceId: 'STG-123',
      storageName: 'Test Drive',
      storageType: 'SSD',
      storageInterface: 'NVMe'
    };
    component.openEditForm(sample);
    expect(component.isEditMode).toBeTrue();
    expect(component.showForm).toBeTrue();
    expect(component.currentStorageModel.storageName).toBe('Test Drive');
    expect(component.currentStorageModel.id).toBe(123);
  });
});
