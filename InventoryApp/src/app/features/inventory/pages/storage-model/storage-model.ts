import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Navbar } from '../../components/navbar/navbar';
import { Sidebar } from '../../components/sidebar/sidebar';
import { StorageModelTableComponent } from '../../components/storage-model/storage-model-table';
import { SidebarService } from '../../../services/sidebar.service';
import { StorageModelService, CreateStorageModelRequest, UpdateStorageModelRequest } from '../../../services/storage-model.service';
import { StorageModelItem } from '../../../models/storage-model';

@Component({
  selector: 'app-storage-model',
  standalone: true,
  imports: [CommonModule, FormsModule, Navbar, Sidebar, StorageModelTableComponent],
  templateUrl: './storage-model.html',
  styleUrls: ['./storage-model.css']
})
export class StorageModelPageComponent implements OnInit {

  storageModels: StorageModelItem[] = [];
  filteredStorageModels: StorageModelItem[] = [];
  searchTerm: string = '';
  isSidebarOpen = true;
  isLoading = false;
  errorMessage = '';

  // Form model
  currentStorageModel: StorageModelItem = {
    id: 0,
    referenceId: '',
    storageName: '',
    storageType: '',
    storageInterface: ''
  };

  // dropdown options (sample defaults)
  storageNameOptions: string[] = [
    'Samsung 970 EVO Plus',
    'WD Blue SN570',
    'Seagate Barracuda',
    'Kingston A400',
    'Crucial MX500'
  ];

  storageTypeOptions: string[] = [
    'SSD',
    'HDD',
    'NVMe',
    'External',
    'Hybrid'
  ];

  storageInterfaceOptions: string[] = [
    'SATA',
    'NVMe (PCIe)',
    'M.2',
    'USB 3.0',
    'USB-C',
    'SAS'
  ];

  // flags for showing custom inputs when "Other" is selected
  customName = false;
  customType = false;
  customInterface = false;

  isEditMode: boolean = false;
  showForm: boolean = false;
  showDeleteModal: boolean = false;
  storageModelToDelete: StorageModelItem | null = null;

  private sidebarService = inject(SidebarService);
  private storageModelService = inject(StorageModelService);

  constructor() {
    this.sidebarService.sidebarOpen$.subscribe(isOpen => {
      this.isSidebarOpen = isOpen as boolean;
    });
  }

  ngOnInit() {
    this.loadStorageModels();
  }

  loadStorageModels() {
    this.isLoading = true;
    this.errorMessage = '';

    this.storageModelService.getAllStorageModels().subscribe({
      next: (data) => {
        this.storageModels = data;
        this.filteredStorageModels = [...this.storageModels];
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading storage models:', error);
        this.errorMessage = 'Failed to load storage models. Please check if the API is running.';
        this.isLoading = false;
        this.storageModels = [];
        this.filteredStorageModels = [];
      }
    });
  }

  // dropdown change handlers
  onNameChange(value: string) {
    this.customName = value === 'Other';
    if (!this.customName) {
      // ensure the model holds the selected option
      this.currentStorageModel.storageName = value;
    } else {
      // clear so the custom input becomes required and the user types
      this.currentStorageModel.storageName = '';
    }
  }

  onTypeChange(value: string) {
    this.customType = value === 'Other';
    if (!this.customType) {
      this.currentStorageModel.storageType = value;
    } else {
      this.currentStorageModel.storageType = '';
    }
  }

  onInterfaceChange(value: string) {
    this.customInterface = value === 'Other';
    if (!this.customInterface) {
      this.currentStorageModel.storageInterface = value;
    } else {
      this.currentStorageModel.storageInterface = '';
    }
  }

  clearStorageName() {
    this.currentStorageModel.storageName = '';
    this.customName = false;
  }

  clearStorageType() {
    this.currentStorageModel.storageType = '';
    this.customType = false;
  }

  clearStorageInterface() {
    this.currentStorageModel.storageInterface = '';
    this.customInterface = false;
  }

  onSearch() {
    if (!this.searchTerm) {
      this.filteredStorageModels = [...this.storageModels];
      return;
    }
    const term = this.searchTerm.toLowerCase();

    this.filteredStorageModels = this.storageModels.filter(r =>
      (r.storageName || '').toLowerCase().includes(term) ||
      (r.storageType || '').toLowerCase().includes(term)
    );
  }

  openAddForm() {
    this.isEditMode = false;
    this.showForm = true;
    this.resetForm();
  }

  openEditForm(model: StorageModelItem) {
    this.isEditMode = true;
    this.showForm = true;
    this.currentStorageModel = { ...model };

    // If the current value isn't in our sample list, enable custom for that field
    this.customName = !!model.storageName && !this.storageNameOptions.includes(model.storageName);
    this.customType = !!model.storageType && !this.storageTypeOptions.includes(model.storageType);
    this.customInterface = !!model.storageInterface && !this.storageInterfaceOptions.includes(model.storageInterface);
  }

  closeForm() {
    this.showForm = false;
    this.resetForm();
  }

  resetForm() {
    this.currentStorageModel = {
      id: 0,
      referenceId: '',
      storageName: '',
      storageType: '',
      storageInterface: ''
    };
    this.customName = this.customType = this.customInterface = false;
    this.errorMessage = '';
  }

  onSubmit() {
    if (!this.currentStorageModel.storageName || !this.currentStorageModel.storageType) {
      this.errorMessage = 'Please fill in all required fields.';
      return;
    }

    const trimmedName = this.currentStorageModel.storageName.trim();

    const isDuplicate = this.storageModels.some(m => {
      const sameName = (m.storageName || '').toLowerCase() === trimmedName.toLowerCase();
      const isDifferent = this.isEditMode ? m.id !== this.currentStorageModel.id : true;
      return sameName && isDifferent;
    });

    if (isDuplicate) {
      this.errorMessage = `Storage name already exists. Please use a different name.`;
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    if (this.isEditMode) {
      const updatePayload: UpdateStorageModelRequest = {
        referenceId: this.currentStorageModel.referenceId || `STG-${this.currentStorageModel.id}`,
        storageName: trimmedName,
        storageType: this.currentStorageModel.storageType.trim(),
        storageInterface: this.currentStorageModel.storageInterface.trim()
      };

      this.storageModelService.updateStorageModel(this.currentStorageModel.id, updatePayload).subscribe({
        next: (updated) => {
          const index = this.storageModels.findIndex(r => r.id === this.currentStorageModel.id);
          if (index !== -1) {
            this.storageModels[index] = updated;
          }
          this.onSearch();
          this.closeForm();
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Update error:', error);
          // fallback: refresh list
          this.storageModelService.getAllStorageModels().subscribe({
            next: (list) => {
              this.storageModels = list;
              this.onSearch();
              this.closeForm();
              this.isLoading = false;
            },
            error: () => this.isLoading = false
          });
        }
      });

    } else {
      const createPayload: CreateStorageModelRequest = {
        referenceId: `STG-${Date.now()}`,
        storageName: trimmedName,
        storageType: this.currentStorageModel.storageType.trim(),
        storageInterface: this.currentStorageModel.storageInterface.trim()
      };

      this.storageModelService.createStorageModel(createPayload).subscribe({
        next: (created) => {
          this.storageModels.push(created);
          this.onSearch();
          this.closeForm();
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Create error:', error);
          // fallback: try to reload and detect created item
          this.storageModelService.getAllStorageModels().subscribe({
            next: (list) => {
              const createdMatch = list.find(p => p.storageName === createPayload.storageName);
              if (createdMatch) {
                this.storageModels = list;
                this.onSearch();
                this.closeForm();
              }
              this.isLoading = false;
            },
            error: () => this.isLoading = false
          });
        }
      });
    }
  }

  deleteStorageModel(model: StorageModelItem) {
    this.storageModelToDelete = model;
    this.showDeleteModal = true;
  }

  confirmDelete() {
    if (!this.storageModelToDelete) return;

    this.isLoading = true;
    this.errorMessage = '';

    this.storageModelService.deleteStorageModel(this.storageModelToDelete.id).subscribe({
      next: () => {
        this.loadStorageModels();
        this.closeDeleteModal();
      },
      error: (error) => {
        console.error('Delete error:', error);
        this.errorMessage = 'Failed to delete storage model.';
        this.isLoading = false;
        this.loadStorageModels();
        this.closeDeleteModal();
      }
    });
  }

  closeDeleteModal() {
    this.showDeleteModal = false;
    this.storageModelToDelete = null;
  }
}
