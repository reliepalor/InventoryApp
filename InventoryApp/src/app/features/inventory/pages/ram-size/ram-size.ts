import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Navbar } from '../../components/navbar/navbar';
import { Sidebar } from '../../components/sidebar/sidebar';
import { RamSizeTableComponent } from '../../components/ram-size-table/ram-size-table';
import { SidebarService } from '../../../services/sidebar.service';
import { RamSizeService } from '../../../services/ram-size.service';
import { RamSizeItem } from '../../../models/ram-size';

@Component({
  selector: 'app-ram-size',
  standalone: true,
  imports: [CommonModule, FormsModule, Navbar, Sidebar, RamSizeTableComponent],
  templateUrl: './ram-size.html'
})
export class RamSizePageComponent implements OnInit {
  ramSizes: RamSizeItem[] = [];
  filteredRamSizes: RamSizeItem[] = [];
  searchTerm: string = '';
  isSidebarOpen = true;
  isLoading = false;
  errorMessage = '';

  // Form model
  currentRamSize: RamSizeItem = {
    id: 0,
    referenceId: '',
    size: ''
  };

  isEditMode: boolean = false;
  showForm: boolean = false;
  showDeleteModal: boolean = false;
  ramSizeToDelete: RamSizeItem | null = null;

  private sidebarService = inject(SidebarService);
  private ramSizeService = inject(RamSizeService);

  constructor() {
    this.sidebarService.sidebarOpen$.subscribe(isOpen => {
      this.isSidebarOpen = isOpen as boolean;
    });
  }

  ngOnInit() {
    this.loadRamSizes();
  }

  loadRamSizes() {
    this.isLoading = true;
    this.errorMessage = '';

    this.ramSizeService.getAllRamSizes().subscribe({
      next: (data) => {
        // Normalize API data so that Size is always populated as a string
        this.ramSizes = (data || []).map((item: any) => ({
          ...item,
          // Support different possible backend property names just in case
          size: (item?.size ?? item?.size ?? item?.ramSize ?? item?.ram_size ?? '').toString()
        }));
        this.filteredRamSizes = [...this.ramSizes];
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading RAM sizes:', error);
        this.errorMessage = 'Failed to load RAM sizes. Please check if the API is running.';
        this.isLoading = false;
        this.ramSizes = [];
        this.filteredRamSizes = [];
      }
    });
  }

  onSearch() {
    if (!this.searchTerm) {
      this.filteredRamSizes = [...this.ramSizes];
      return;
    }

    const term = this.searchTerm.toLowerCase();
    this.filteredRamSizes = this.ramSizes.filter(r =>
      (r.size || '').toLowerCase().includes(term)
    );
  }

  openAddForm() {
    this.isEditMode = false;
    this.showForm = true;
    this.resetForm();
  }

  openEditForm(size: RamSizeItem) {
    this.isEditMode = true;
    this.showForm = true;
    this.currentRamSize = { ...size };
  }

  closeForm() {
    this.showForm = false;
    this.resetForm();
  }

  resetForm() {
    this.currentRamSize = {
      id: 0,
      referenceId: '',
      size: ''
    };
    this.errorMessage = '';
  }

  onSubmit() {
    // Required field check (similar to RAM model form)
    if (!this.currentRamSize.size) {
      this.errorMessage = 'Please select a RAM size.';
      return;
    }

    const trimmedSize = this.currentRamSize.size.toString().trim();

    const isDuplicate = this.ramSizes.some(r => {
      const same = (r.size || '').toLowerCase() === trimmedSize.toLowerCase();
      const isDifferent = this.isEditMode ? r.id !== this.currentRamSize.id : true;
      return same && isDifferent;
    });

    if (isDuplicate) {
      this.errorMessage = 'RAM size already exists.';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    if (this.isEditMode) {
      const updatePayload: RamSizeItem = {
        id: this.currentRamSize.id,
        referenceId: this.currentRamSize.referenceId || `RAMSIZE-${this.currentRamSize.id}`,
        size: trimmedSize
      };

      this.ramSizeService.updateRamSize(this.currentRamSize.id, updatePayload).subscribe({
        next: (updated) => {
          // Update local array like RAM model page
          const index = this.ramSizes.findIndex(r => r.id === this.currentRamSize.id);
          if (index !== -1 && updated) {
            this.ramSizes[index] = updated;
          }
          this.onSearch();
          this.closeForm();
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error updating RAM size:', error);
          // Fallback: refresh list from server
          this.ramSizeService.getAllRamSizes().subscribe({
            next: (list) => {
              this.ramSizes = (list || []).map((item: any) => ({
                ...item,
                size: (item?.size ?? item?.size ?? item?.ramSize ?? item?.ram_size ?? '').toString()
              }));
              this.onSearch();
              this.closeForm();
              this.isLoading = false;
            },
            error: () => this.isLoading = false
          });
        }
      });

    } else {
      const newRam: any = {
        referenceId: `RAMSIZE-${Date.now()}`,
        size: trimmedSize
      };

      this.ramSizeService.createRamSize(newRam).subscribe({
        next: (created) => {
          if (created) {
            this.ramSizes.push(created);
          }
          this.onSearch();
          this.closeForm();
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error creating RAM size:', error);
          this.ramSizeService.getAllRamSizes().subscribe({
            next: (list) => {
              const createdMatch = (list || []).find(r => r.size?.toString() === newRam.size.toString());
              if (createdMatch) {
                this.ramSizes = (list || []).map((item: any) => ({
                  ...item,
                  size: (item?.size ?? item?.size ?? item?.ramSize ?? item?.ram_size ?? '').toString()
                }));
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

  deleteRamSize(size: RamSizeItem) {
    this.ramSizeToDelete = size;
    this.showDeleteModal = true;
  }

  confirmDelete() {
    if (!this.ramSizeToDelete) return;

    this.isLoading = true;
    this.errorMessage = '';

    this.ramSizeService.deleteRamSize(this.ramSizeToDelete.id).subscribe({
      next: () => {
        this.loadRamSizes();
        this.closeDeleteModal();
      },
      error: (error) => {
        console.error('Error deleting RAM size:', error);
        this.errorMessage = 'Failed to delete RAM size.';
        this.isLoading = false;
        this.loadRamSizes();
        this.closeDeleteModal();
      }
    });
  }

  closeDeleteModal() {
    this.showDeleteModal = false;
    this.ramSizeToDelete = null;
  }
}
