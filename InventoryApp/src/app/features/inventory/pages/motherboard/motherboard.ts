import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Navbar } from '../../components/navbar/navbar';
import { Sidebar } from '../../components/sidebar/sidebar';
import { MotherboardTableComponent } from '../../components/motherboard-table/motherboard-table';
import { SidebarService } from '../../../services/sidebar.service';
import { MotherboardService, MotherboardItem } from '../../../services/motherboard.service';

// Local types for motherboard feature
import { MotherboardCreateRequest, MotherboardUpdateRequest } from '../../../models/maintenance';

// Use shared maintenance interfaces as the local motherboard item type
export type { MotherboardItem };

@Component({
  selector: 'app-motherboard',
  standalone: true,
  imports: [CommonModule, FormsModule, Navbar, Sidebar, MotherboardTableComponent],
  templateUrl: './motherboard.html',
  styleUrls: ['./motherboard.css']
})
export class MotherboardPageComponent implements OnInit {
  // full motherboard objects
  motherboards: MotherboardItem[] = [];
  filteredMotherboards: MotherboardItem[] = [];

  searchTerm: string = '';
  isSidebarOpen = true;
  isLoading = false;
  errorMessage = '';

  // Form model
  currentMotherboard: MotherboardItem = {
    id: 0,
    referenceId: '',
    mbName: '',
    mbSocket: '',
    mbChipset: '',
    mbDescription: ''
  };

  isEditMode: boolean = false;
  showForm: boolean = false;
  showDeleteModal: boolean = false;
  motherboardToDelete: MotherboardItem | null = null;

  private sidebarService = inject(SidebarService);
  private motherboardService = inject(MotherboardService);

  constructor() {
    this.sidebarService.sidebarOpen$.subscribe(isOpen => {
      this.isSidebarOpen = isOpen as boolean;
    });
  }

  ngOnInit() {
    this.loadMotherboards();
  }

  loadMotherboards() {
    this.isLoading = true;
    this.errorMessage = '';

    this.motherboardService.getAllMotherboards().subscribe({
      next: (data) => {
        console.log('Motherboards loaded:', data);
        this.motherboards = data;
        this.filteredMotherboards = [...this.motherboards];
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading motherboards:', error);
        this.errorMessage = 'Failed to load motherboards. Please check if the API is running.';
        this.isLoading = false;
        this.motherboards = [];
        this.filteredMotherboards = [];
      }
    });
  }

  onSearch() {
    if (!this.searchTerm) {
      this.filteredMotherboards = [...this.motherboards];
      return;
    }

    const term = this.searchTerm.toLowerCase();
    this.filteredMotherboards = this.motherboards.filter(m => m.mbName.toLowerCase().includes(term));
  }

  openAddForm() {
    this.isEditMode = false;
    this.showForm = true;
    this.resetForm();
  }

  openEditForm(motherboard: MotherboardItem) {
    this.isEditMode = true;
    this.showForm = true;
    this.currentMotherboard = { ...motherboard };
  }

  closeForm() {
    this.showForm = false;
    this.resetForm();
  }

  resetForm() {
    this.currentMotherboard = {
      id: 0,
      referenceId: '',
      mbName: '',
      mbSocket: '',
      mbChipset: '',
      mbDescription: ''
    };
    this.errorMessage = '';
  }

  onSubmit() {
    // Validate motherboard name
    if (!this.currentMotherboard.mbName || !this.currentMotherboard.mbName.trim()) {
      this.errorMessage = 'Motherboard name is required.';
      return;
    }

    const trimmedName = this.currentMotherboard.mbName.trim();
    
    // Validate name length
    if (trimmedName.length < 2) {
      this.errorMessage = 'Motherboard name must be at least 2 characters long.';
      return;
    }

    if (trimmedName.length > 100) {
      this.errorMessage = 'Motherboard name must not exceed 100 characters.';
      return;
    }

    // Validate Socket
    const trimmedSocket = (this.currentMotherboard.mbSocket || '').trim();
    if (trimmedSocket.length > 50) {
      this.errorMessage = 'Socket must not exceed 50 characters.';
      return;
    }

    // Validate Chipset
    const trimmedChipset = (this.currentMotherboard.mbChipset || '').trim();
    if (trimmedChipset.length > 50) {
      this.errorMessage = 'Chipset must not exceed 50 characters.';
      return;
    }

    // Validate Description
    const trimmedDescription = (this.currentMotherboard.mbDescription || '').trim();
    if (trimmedDescription.length > 500) {
      this.errorMessage = 'Description must not exceed 500 characters.';
      return;
    }

    // Duplicate check
    const isDuplicate = this.motherboards.some(mb => {
      const sameName = mb.mbName.toLowerCase() === trimmedName.toLowerCase();
      const differentId = this.isEditMode ? mb.id !== this.currentMotherboard.id : true;
      return sameName && differentId;
    });

    if (isDuplicate) {
      this.errorMessage = `Motherboard "${trimmedName}" already exists. Please use a different name.`;
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    if (this.isEditMode) {
      // Update motherboard via API
      const updateRequest: MotherboardUpdateRequest = {
        id: this.currentMotherboard.id,
        referenceId: this.currentMotherboard.referenceId || `MB-${this.currentMotherboard.id}`,
        mbName: trimmedName,
        mbSocket: trimmedSocket,
        mbChipset: trimmedChipset,
        mbDescription: trimmedDescription
      };

      this.motherboardService.updateMotherboard(this.currentMotherboard.id, updateRequest).subscribe({
        next: (updatedMb) => {
          // Reload all motherboards from server to ensure sync
          this.loadMotherboards();
          this.closeForm();
          this.errorMessage = '';
        },
        error: (error) => {
          console.error('Error updating motherboard:', error);
          // Check if the update actually succeeded despite error
          this.motherboardService.getAllMotherboards().subscribe({
            next: (motherboards) => {
              const updated = motherboards.find(m => m.id === this.currentMotherboard.id && m.mbName === updateRequest.mbName);
              if (updated) {
                this.motherboards = motherboards;
                this.filteredMotherboards = [...this.motherboards];
                this.onSearch();
                this.closeForm();
                this.errorMessage = '';
              } else {
                this.errorMessage = error.message || 'Failed to update motherboard. Please try again.';
              }
              this.isLoading = false;
            },
            error: () => {
              this.errorMessage = error.message || 'Failed to update motherboard. Please try again.';
              this.isLoading = false;
            }
          });
        }
      });
    } else {
      // Create new motherboard via API
      const createRequest: MotherboardCreateRequest = {
        referenceId: `MB-${Date.now()}`,
        mbName: trimmedName,
        mbSocket: trimmedSocket,
        mbChipset: trimmedChipset,
        mbDescription: trimmedDescription
      };

      this.motherboardService.createMotherboard(createRequest).subscribe({
        next: (newMb) => {
          // Reload all motherboards from server to ensure sync
          this.loadMotherboards();
          this.closeForm();
          this.errorMessage = '';
        },
        error: (error) => {
          console.error('Error creating motherboard:', error);
          // Check if the create actually succeeded despite error
          this.motherboardService.getAllMotherboards().subscribe({
            next: (motherboards) => {
              const created = motherboards.find(m => m.mbName === createRequest.mbName);
              if (created && !this.motherboards.find(m => m.id === created.id)) {
                this.motherboards = motherboards;
                this.filteredMotherboards = [...this.motherboards];
                this.onSearch();
                this.closeForm();
                this.errorMessage = '';
              } else {
                this.errorMessage = error.message || 'Failed to create motherboard. Please try again.';
              }
              this.isLoading = false;
            },
            error: () => {
              this.errorMessage = error.message || 'Failed to create motherboard. Please try again.';
              this.isLoading = false;
            }
          });
        }
      });
    }
  }

  deleteMotherboard(motherboard: MotherboardItem) {
    this.motherboardToDelete = motherboard;
    this.showDeleteModal = true;
  }

  confirmDelete() {
    if (!this.motherboardToDelete) return;
    this.isLoading = true;
    const id = this.motherboardToDelete.id;

    this.motherboardService.deleteMotherboard(id).subscribe({
      next: () => {
        // Reload all motherboards from server to ensure sync
        this.loadMotherboards();
        this.closeDeleteModal();
      },
      error: (error) => {
        console.error('Error deleting motherboard:', error);
        // Check if the delete actually succeeded despite error
        this.motherboardService.getAllMotherboards().subscribe({
          next: (motherboards) => {
            const stillExists = motherboards.find(m => m.id === id);
            if (!stillExists) {
              // Delete succeeded, refresh the list
              this.motherboards = motherboards;
              this.filteredMotherboards = [...this.motherboards];
              this.onSearch();
              this.closeDeleteModal();
            } else {
              this.errorMessage = error.message || 'Failed to delete motherboard. Please try again.';
            }
            this.isLoading = false;
          },
          error: () => {
            this.errorMessage = error.message || 'Failed to delete motherboard. Please try again.';
            this.isLoading = false;
            this.closeDeleteModal();
          }
        });
      }
    });
  }

  closeDeleteModal() {
    this.showDeleteModal = false;
    this.motherboardToDelete = null;
  }
}
