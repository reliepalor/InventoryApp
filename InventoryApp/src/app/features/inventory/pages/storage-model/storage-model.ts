import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Navbar } from '../../components/navbar/navbar';
import { Sidebar } from '../../components/sidebar/sidebar';
import { StorageModelTableComponent } from '../../components/storage-model/storage-model-table';
import { SidebarService } from '../../../services/sidebar.service';
import { StorageModelService } from '../../../services/storage-model.service';
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
    storageModel: '',
    storageType: ''
  };

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

  onSearch() {
    if (!this.searchTerm) {
      this.filteredStorageModels = [...this.storageModels];
      return;
    }
    const term = this.searchTerm.toLowerCase();

    this.filteredStorageModels = this.storageModels.filter(r =>
      (r.storageModel || '').toLowerCase().includes(term) ||
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
  }

  closeForm() {
    this.showForm = false;
    this.resetForm();
  }

  resetForm() {
    this.currentStorageModel = {
      id: 0,
      referenceId: '',
      storageModel: '',
      storageType: ''
    };
    this.errorMessage = '';
  }

  onSubmit() {
    if (!this.currentStorageModel.storageModel || !this.currentStorageModel.storageType) {
      this.errorMessage = 'Please fill in all required fields.';
      return;
    }

    const trimmedModel = this.currentStorageModel.storageModel.trim();

    const isDuplicate = this.storageModels.some(m => {
      const sameModel = (m.storageModel || '').toLowerCase() === trimmedModel.toLowerCase();
      const isDifferent = this.isEditMode ? m.id !== this.currentStorageModel.id : true;
      return sameModel && isDifferent;
    });

    if (isDuplicate) {
      this.errorMessage = `Storage model already exists. Please use a different name.`;
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    if (this.isEditMode) {
      const updatePayload: StorageModelItem = {
        id: this.currentStorageModel.id,
        referenceId: this.currentStorageModel.referenceId || `STG-${this.currentStorageModel.id}`,
        storageModel: trimmedModel,
        storageType: this.currentStorageModel.storageType.trim()
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
      const newStorage = {
        referenceId: `STG-${Date.now()}`,
        storageModel: trimmedModel,
        storageType: this.currentStorageModel.storageType.trim()
      };

      this.storageModelService.createStorageModel(newStorage).subscribe({
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
              const createdMatch = list.find(p => p.storageModel === newStorage.storageModel);
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
