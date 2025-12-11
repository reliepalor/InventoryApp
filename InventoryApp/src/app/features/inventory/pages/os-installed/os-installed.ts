import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Navbar } from '../../components/navbar/navbar';
import { Sidebar } from '../../components/sidebar/sidebar';
import { OsInstalledTableComponent } from '../../components/os-installed-table/os-installed-table';
import { SidebarService } from '../../../services/sidebar.service';
import { OsInstalledService } from '../../../services/os-installed.service';
import { OsInstalledItem } from '../../../models/os-installed';

@Component({
  selector: 'app-os-installed',
  standalone: true,
  imports: [CommonModule, FormsModule, Navbar, Sidebar, OsInstalledTableComponent],
  templateUrl: './os-installed.html',
  styleUrl: './os-installed.css',
})
export class OsInstalled implements OnInit {
  osInstalled: OsInstalledItem[] = [];
  filteredOsInstalled: OsInstalledItem[] = [];
  searchTerm: string = '';
  isSidebarOpen = true;
  isLoading = false;
  errorMessage = '';

  // Form model
  currentOsInstalled: OsInstalledItem = {
    id: 0,
    referenceId: '',
    osName: '',
    osVersion: ''
  };

  isEditMode: boolean = false;
  showForm: boolean = false;
  showDeleteModal: boolean = false;
  osInstalledToDelete: OsInstalledItem | null = null;

  private sidebarService = inject(SidebarService);
  private osInstalledService = inject(OsInstalledService);

  constructor() {
    this.sidebarService.sidebarOpen$.subscribe(isOpen => {
      this.isSidebarOpen = isOpen as boolean;
    });
  }

  ngOnInit() {
    this.loadOsInstalled();
  }

  loadOsInstalled() {
    this.isLoading = true;
    this.errorMessage = '';

    this.osInstalledService.getAllOsInstalled().subscribe({
      next: (data) => {
        this.osInstalled = data;
        this.filteredOsInstalled = [...this.osInstalled];
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading OS installed:', error);
        this.errorMessage = 'Failed to load OS installed. Please check if the API is running.';
        this.isLoading = false;
        this.osInstalled = [];
        this.filteredOsInstalled = [];
      }
    });
  }

  onSearch() {
    if (!this.searchTerm) {
      this.filteredOsInstalled = [...this.osInstalled];
      return;
    }

    const term = this.searchTerm.toLowerCase();
    this.filteredOsInstalled = this.osInstalled.filter(os =>
      os.osName.toLowerCase().includes(term)
    );
  }

  openAddForm() {
    this.isEditMode = false;
    this.showForm = true;
    this.resetForm();
  }

  openEditForm(osInstalled: OsInstalledItem) {
    this.isEditMode = true;
    this.showForm = true;
    this.currentOsInstalled = { ...osInstalled };
  }

  closeForm() {
    this.showForm = false;
    this.resetForm();
  }

  resetForm() {
    this.currentOsInstalled = {
      id: 0,
      referenceId: '',
      osName: '',
      osVersion: ''
    };
    this.errorMessage = '';
  }

  onSubmit() {
    if (!this.currentOsInstalled.osName || !this.currentOsInstalled.osVersion) {
      this.errorMessage = 'Please fill in all required fields.';
      return;
    }

    const trimmedOsName = this.currentOsInstalled.osName.trim();
    
    const isDuplicate = this.osInstalled.some(os => {
      const isSameName = os.osName.toLowerCase() === trimmedOsName.toLowerCase();
      const isDifferentOs = this.isEditMode ? os.id !== this.currentOsInstalled.id : true;
      return isSameName && isDifferentOs;
    });

    if (isDuplicate) {
      this.errorMessage = `OS already exists. Please use a different name.`;
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    if (this.isEditMode) {
      const updateOsInstalled = {
        id: this.currentOsInstalled.id,
        referenceId: this.currentOsInstalled.referenceId || `OS-${this.currentOsInstalled.id}`,
        osName: trimmedOsName,
        osVersion: this.currentOsInstalled.osVersion.trim()
      };

      this.osInstalledService.updateOsInstalled(this.currentOsInstalled.id, updateOsInstalled).subscribe({
        next: (updatedOsInstalled) => {
          const index = this.osInstalled.findIndex(m => m.id === this.currentOsInstalled.id);
          if (index !== -1) {
            this.osInstalled[index] = updatedOsInstalled;
          }
          this.onSearch();
          this.closeForm();
          this.isLoading = false;
          this.errorMessage = '';
        },
        error: (error) => {
          console.error('Error updating OS installed:', error);
          this.osInstalledService.getAllOsInstalled().subscribe({
            next: (osInstalledList) => {
              const updated = osInstalledList.find(m => m.id === this.currentOsInstalled.id && m.osName === trimmedOsName);
              if (updated) {
                this.osInstalled = osInstalledList;
                this.onSearch();
                this.closeForm();
                this.errorMessage = '';
              }
              this.isLoading = false;
            },
            error: () => {
              this.isLoading = false;
            }
          });
        }
      });
    } else {
      const newOsInstalled = {
        referenceId: `OS-${Date.now()}`,
        osName: trimmedOsName,
        osVersion: this.currentOsInstalled.osVersion.trim()
      };

      this.osInstalledService.createOsInstalled(newOsInstalled).subscribe({
        next: (createdOsInstalled) => {
          this.osInstalled.push(createdOsInstalled);
          this.onSearch();
          this.closeForm();
          this.isLoading = false;
          this.errorMessage = '';
        },
        error: (error) => {
          console.error('Error creating OS installed:', error);
          this.osInstalledService.getAllOsInstalled().subscribe({
            next: (osInstalledList) => {
              const created = osInstalledList.find(m => m.osName === newOsInstalled.osName);
              if (created && !this.osInstalled.find(m => m.id === created.id)) {
                this.osInstalled = osInstalledList;
                this.onSearch();
                this.closeForm();
                this.errorMessage = '';
              }
              this.isLoading = false;
            },
            error: () => {
              this.isLoading = false;
            }
          });
        }
      });
    }
  }

  deleteOsInstalled(osInstalled: OsInstalledItem) {
    this.osInstalledToDelete = osInstalled;
    this.showDeleteModal = true;
  }

  confirmDelete() {
    if (!this.osInstalledToDelete) return;

    this.isLoading = true;
    this.errorMessage = '';

    this.osInstalledService.deleteOsInstalled(this.osInstalledToDelete.id).subscribe({
      next: () => {
        this.loadOsInstalled();
        this.closeDeleteModal();
      },
      error: (error) => {
        console.error('Error deleting OS installed:', error);
        this.errorMessage = 'OS installed successfully deleted.';
        this.isLoading = false;
        this.loadOsInstalled();
        this.closeDeleteModal();
      }
    });
  }

  closeDeleteModal() {
    this.showDeleteModal = false;
    this.osInstalledToDelete = null;
  }
}

