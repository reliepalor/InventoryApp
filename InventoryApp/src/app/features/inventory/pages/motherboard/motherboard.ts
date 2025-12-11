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

// Re-export type so other files can import if they previously relied on this file exporting it
export type { MotherboardItem };

@Component({
  selector: 'app-motherboard',
  standalone: true,
  imports: [CommonModule, FormsModule, Navbar, Sidebar, MotherboardTableComponent],
  templateUrl: './motherboard.html',
  styleUrls: ['./motherboard.css']
})
export class MotherboardPageComponent implements OnInit {
  // Full motherboard objects
  motherboards: MotherboardItem[] = [];
  filteredMotherboards: MotherboardItem[] = [];

  // Search and layout
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

  // Edit / modal controls
  isEditMode: boolean = false;
  showForm: boolean = false;
  showDeleteModal: boolean = false;
  motherboardToDelete: MotherboardItem | null = null;

  // Dropdown lists (initial common values, will merge with loaded values)
  sockets: string[] = [
    'LGA1700','LGA1200','LGA1151','AM4','AM5','TRX4','sTRX4','BGA'
  ];
  chipsets: string[] = [
    'Z790','Z690','Z590','B660','B550','X570','X470','H670','H610','B450'
  ];

  // Dropdown bindings / custom fields
  selectedSocket: string = '';
  customSocket: string = '';
  isCustomSocket: boolean = false;

  selectedChipset: string = '';
  customChipset: string = '';
  isCustomChipset: boolean = false;

  // services
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

  // Load all motherboards from API and extract unique socket/chipset values
  loadMotherboards() {
    this.isLoading = true;
    this.errorMessage = '';

    this.motherboardService.getAllMotherboards().subscribe({
      next: (data) => {
        console.log('Motherboards loaded:', data);
        this.motherboards = data || [];
        this.filteredMotherboards = [...this.motherboards];
        this.isLoading = false;

        // Merge unique sockets / chipsets from loaded data into dropdown lists
        this.mergeUniqueDropdownValues();
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

  // Add unique socket/chipset values from loaded motherboards to the arrays
  private mergeUniqueDropdownValues() {
    const socketSet = new Set(this.sockets.map(s => s.trim()).filter(s => !!s));
    const chipsetSet = new Set(this.chipsets.map(c => c.trim()).filter(c => !!c));

    for (const mb of this.motherboards) {
      if (mb.mbSocket && mb.mbSocket.trim()) {
        socketSet.add(mb.mbSocket.trim());
      }
      if (mb.mbChipset && mb.mbChipset.trim()) {
        chipsetSet.add(mb.mbChipset.trim());
      }
    }

    // Convert back to arrays and sort (optional)
    this.sockets = Array.from(socketSet).sort((a, b) => a.localeCompare(b));
    this.chipsets = Array.from(chipsetSet).sort((a, b) => a.localeCompare(b));
  }

  // Search handling
  onSearch() {
    if (!this.searchTerm) {
      this.filteredMotherboards = [...this.motherboards];
      return;
    }

    const term = this.searchTerm.toLowerCase();
    this.filteredMotherboards = this.motherboards.filter(m => (m.mbName || '').toLowerCase().includes(term));
  }

  // Form openers
  openAddForm() {
    this.isEditMode = false;
    this.showForm = true;
    this.resetForm();
  }

  openEditForm(motherboard: MotherboardItem) {
    this.isEditMode = true;
    this.showForm = true;

    // copy to avoid two-way binding issues
    this.currentMotherboard = { ...motherboard };

    // pre-select dropdown values if they match
    if (this.currentMotherboard.mbSocket) {
      if (this.sockets.includes(this.currentMotherboard.mbSocket)) {
        this.selectedSocket = this.currentMotherboard.mbSocket;
        this.isCustomSocket = false;
        this.customSocket = '';
      } else {
        this.selectedSocket = '__custom__';
        this.isCustomSocket = true;
        this.customSocket = this.currentMotherboard.mbSocket;
      }
    } else {
      this.selectedSocket = '';
      this.isCustomSocket = false;
      this.customSocket = '';
    }

    if (this.currentMotherboard.mbChipset) {
      if (this.chipsets.includes(this.currentMotherboard.mbChipset)) {
        this.selectedChipset = this.currentMotherboard.mbChipset;
        this.isCustomChipset = false;
        this.customChipset = '';
      } else {
        this.selectedChipset = '__custom__';
        this.isCustomChipset = true;
        this.customChipset = this.currentMotherboard.mbChipset;
      }
    } else {
      this.selectedChipset = '';
      this.isCustomChipset = false;
      this.customChipset = '';
    }
  }

  closeForm() {
    this.showForm = false;
    this.resetForm();
  }

  // Keep form state consistent
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

    this.selectedSocket = '';
    this.customSocket = '';
    this.isCustomSocket = false;

    this.selectedChipset = '';
    this.customChipset = '';
    this.isCustomChipset = false;
  }

  // Dropdown change handlers
  onSocketChange() {
    this.isCustomSocket = this.selectedSocket === '__custom__';
    if (!this.isCustomSocket) {
      this.currentMotherboard.mbSocket = this.selectedSocket || '';
      this.customSocket = '';
    } else {
      this.currentMotherboard.mbSocket = '';
    }
  }

  onChipsetChange() {
    this.isCustomChipset = this.selectedChipset === '__custom__';
    if (!this.isCustomChipset) {
      this.currentMotherboard.mbChipset = this.selectedChipset || '';
      this.customChipset = '';
    } else {
      this.currentMotherboard.mbChipset = '';
    }
  }

  clearSocket() {
    this.selectedSocket = '';
    this.customSocket = '';
    this.currentMotherboard.mbSocket = '';
    this.isCustomSocket = false;
  }

  clearChipset() {
    this.selectedChipset = '';
    this.customChipset = '';
    this.currentMotherboard.mbChipset = '';
    this.isCustomChipset = false;
  }

  // Submit (create/update)
  onSubmit() {
    // Resolve chosen socket/chipset to the model (run before validations)
    const finalSocket = this.isCustomSocket ? (this.customSocket || '').trim() : (this.selectedSocket || this.currentMotherboard.mbSocket || '').trim();
    const finalChipset = this.isCustomChipset ? (this.customChipset || '').trim() : (this.selectedChipset || this.currentMotherboard.mbChipset || '').trim();

    this.currentMotherboard.mbSocket = finalSocket;
    this.currentMotherboard.mbChipset = finalChipset;

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
                this.errorMessage = error?.message || 'Failed to update motherboard. Please try again.';
              }
              this.isLoading = false;
            },
            error: () => {
              this.errorMessage = error?.message || 'Failed to update motherboard. Please try again.';
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
                this.errorMessage = error?.message || 'Failed to create motherboard. Please try again.';
              }
              this.isLoading = false;
            },
            error: () => {
              this.errorMessage = error?.message || 'Failed to create motherboard. Please try again.';
              this.isLoading = false;
            }
          });
        }
      });
    }
  }

  // Delete workflow
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
              this.errorMessage = error?.message || 'Failed to delete motherboard. Please try again.';
            }
            this.isLoading = false;
          },
          error: () => {
            this.errorMessage = error?.message || 'Failed to delete motherboard. Please try again.';
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
