import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Navbar } from '../../components/navbar/navbar';
import { Sidebar } from '../../components/sidebar/sidebar';
import { StorageSizeTableComponent } from '../../components/storage-size/storage-size-table';
import { SidebarService } from '../../../services/sidebar.service';
import { StorageSizeService } from '../../../services/storage-size.service';
import { StorageSizeItem } from '../../../models/storage-size';


@Component({
  selector: 'app-storage-size',
  standalone: true,
  imports: [CommonModule, FormsModule, Navbar, Sidebar, StorageSizeTableComponent],
  templateUrl: './storage-size.html',
  styleUrls: ['./storage-size.css']
})
export class StorageSizePageComponent implements OnInit {

  storageSizes: StorageSizeItem[] = [];
  filteredStorageSizes: StorageSizeItem[] = [];
  searchTerm: string = '';
  isSidebarOpen = true;
  isLoading = false;
  errorMessage = '';

  // Form model
  currentStorage: StorageSizeItem = {
    id: 0,
    referenceId: '',
    storageModel: '',
    storageSize: ''
  };

  isEditMode: boolean = false;
  showForm: boolean = false;
  showDeleteModal: boolean = false;
  storageToDelete: StorageSizeItem | null = null;

  private sidebarService = inject(SidebarService);
  private storageService = inject(StorageSizeService);

  constructor() {
    this.sidebarService.sidebarOpen$.subscribe(isOpen => {
      this.isSidebarOpen = isOpen as boolean;
    });
  }

  ngOnInit() {
    this.loadStorageSizes();
  }

  loadStorageSizes() {
    this.isLoading = true;
    this.errorMessage = '';

    this.storageService.getAllStorageSizes().subscribe({
      next: (data) => {
        this.storageSizes = data;
        this.filteredStorageSizes = [...this.storageSizes];
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading storage sizes:', error);
        this.errorMessage = 'Failed to load storage sizes. Please check if the API is running.';
        this.isLoading = false;
        this.storageSizes = [];
        this.filteredStorageSizes = [];
      }
    });
  }

  onSearch() {
    if (!this.searchTerm) {
      this.filteredStorageSizes = [...this.storageSizes];
      return;
    }
    const term = this.searchTerm.toLowerCase();

    this.filteredStorageSizes = this.storageSizes.filter(s =>
      (s.storageModel || '').toLowerCase().includes(term) ||
      (s.storageSize || '').toLowerCase().includes(term)
    );
  }

  openAddForm() {
    this.isEditMode = false;
    this.showForm = true;
    this.resetForm();
  }

  openEditForm(item: StorageSizeItem) {
    this.isEditMode = true;
    this.showForm = true;
    this.currentStorage = { ...item };
  }

  closeForm() {
    this.showForm = false;
    this.resetForm();
  }

  resetForm() {
    this.currentStorage = {
      id: 0,
      referenceId: '',
      storageModel: '',
      storageSize: ''
    };
    this.errorMessage = '';
  }

  onSubmit() {
    if (!this.currentStorage.storageModel || !this.currentStorage.storageSize) {
      this.errorMessage = 'Please fill in all required fields.';
      return;
    }

    const trimmedModel = this.currentStorage.storageModel.trim();
    const trimmedSize = this.currentStorage.storageSize.trim();

    const isDuplicate = this.storageSizes.some(m => {
      const sameModel = (m.storageModel || '').toLowerCase() === trimmedModel.toLowerCase();
      const sameSize = (m.storageSize || '').toLowerCase() === trimmedSize.toLowerCase();
      const isDifferent = this.isEditMode ? m.id !== this.currentStorage.id : true;
      return sameModel && sameSize && isDifferent;
    });

    if (isDuplicate) {
      this.errorMessage = `Storage entry already exists. Please use a different model or size.`;
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    if (this.isEditMode) {
      const updatePayload: StorageSizeItem = {
        id: this.currentStorage.id,
        referenceId: this.currentStorage.referenceId || `STG-${this.currentStorage.id}`,
        storageModel: trimmedModel,
        storageSize: trimmedSize
      };

      this.storageService.updateStorageSize(this.currentStorage.id, updatePayload).subscribe({
        next: (updated) => {
          const index = this.storageSizes.findIndex(r => r.id === this.currentStorage.id);
          if (index !== -1) {
            this.storageSizes[index] = updated;
          }
          this.onSearch();
          this.closeForm();
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Update error:', error);
          // fallback: refresh list
          this.storageService.getAllStorageSizes().subscribe({
            next: (list) => {
              this.storageSizes = list;
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
        storageSize: trimmedSize
      };

      this.storageService.createStorageSize(newStorage).subscribe({
        next: (created) => {
          this.storageSizes.push(created);
          this.onSearch();
          this.closeForm();
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Create error:', error);
          this.storageService.getAllStorageSizes().subscribe({
            next: (list) => {
              const createdMatch = list.find(p => p.storageModel === newStorage.storageModel && p.storageSize === newStorage.storageSize);
              if (createdMatch) {
                this.storageSizes = list;
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

  deleteStorageSize(item: StorageSizeItem) {
    this.storageToDelete = item;
    this.showDeleteModal = true;
  }

  confirmDelete() {
    if (!this.storageToDelete) return;

    this.isLoading = true;
    this.errorMessage = '';

    this.storageService.deleteStorageSize(this.storageToDelete.id).subscribe({
      next: () => {
        this.loadStorageSizes();
        this.closeDeleteModal();
      },
      error: (error) => {
        console.error('Delete error:', error);
        this.errorMessage = 'Failed to delete storage entry.';
        this.isLoading = false;
        this.loadStorageSizes();
        this.closeDeleteModal();
      }
    });
  }

  closeDeleteModal() {
    this.showDeleteModal = false;
    this.storageToDelete = null;
  }
}
