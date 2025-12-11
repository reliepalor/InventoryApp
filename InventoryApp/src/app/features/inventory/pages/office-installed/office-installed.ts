import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Navbar } from '../../components/navbar/navbar';
import { Sidebar } from '../../components/sidebar/sidebar';
import { OfficeInstalledTableComponent } from '../../components/office-installed-table/office-installed-table';
import { SidebarService } from '../../../services/sidebar.service';
import { OfficeInstalledService } from '../../../services/office-installed.service';
import { OfficeInstalledItem } from '../../../models/office-installed';

@Component({
    selector: 'app-office-installed',
    standalone: true,
    imports: [CommonModule, FormsModule, Navbar, Sidebar, OfficeInstalledTableComponent],
    templateUrl: './office-installed.html',
    styleUrls: ['./office-installed.css']
})
export class OfficeInstalled implements OnInit {
    officeInstalled: OfficeInstalledItem[] = [];
    filteredOfficeInstalled: OfficeInstalledItem[] = [];
    searchTerm: string = '';
    isSidebarOpen = true;
    isLoading = false;
    errorMessage = '';

    // Form model
    currentOfficeInstalled: OfficeInstalledItem = {
        id: 0,
        referenceId: '',
        officeName: '',
        officeVersion: ''
    };

    isEditMode: boolean = false;
    showForm: boolean = false;
    showDeleteModal: boolean = false;
    officeInstalledToDelete: OfficeInstalledItem | null = null;

    private sidebarService = inject(SidebarService);
    private officeInstalledService = inject(OfficeInstalledService);

    constructor() {
        this.sidebarService.sidebarOpen$.subscribe(isOpen => {
            this.isSidebarOpen = isOpen as boolean;
        });
    }

    ngOnInit() {
        this.loadModels();
    }

    loadModels() {
        this.isLoading = true;
        this.errorMessage = '';

        this.officeInstalledService.getAllOfficeInstalled().subscribe({
            next: (data) => {
                this.officeInstalled = data;
                this.filteredOfficeInstalled = [...this.officeInstalled];
                this.isLoading = false;
            },
            error: (error) => {
                console.error('Error loading office installed:', error);
                this.errorMessage = 'Failed to load office installed. Please check if the API is running.';
                this.isLoading = false;
                this.officeInstalled = [];
                this.filteredOfficeInstalled = [];
            }
        });
    }

    onSearch() {
        if (!this.searchTerm) {
            this.filteredOfficeInstalled = [...this.officeInstalled];
            return;
        }

        const term = this.searchTerm.toLowerCase();
        this.filteredOfficeInstalled = this.officeInstalled.filter(osInstalled =>
            osInstalled.officeName.toLowerCase().includes(term)
        );
    }

    openAddForm() {
        this.isEditMode = false;
        this.showForm = true;
        this.resetForm();
    }

    openEditForm(OfficeInstalled: OfficeInstalledItem) {
        this.isEditMode = true;
        this.showForm = true;
        this.currentOfficeInstalled = { ...OfficeInstalled };
    }

    closeForm() {
        this.showForm = false;
        this.resetForm();
    }

    resetForm() {
        this.currentOfficeInstalled = {
            id: 0,
            referenceId: '',
            officeName: '',
            officeVersion: ''
        };
        this.errorMessage = '';
    }

    onSubmit() {
        if (!this.currentOfficeInstalled.officeName || !this.currentOfficeInstalled.officeVersion) {
            this.errorMessage = 'Please fill in all required fields.';
            return;
        }

        // Trim the model name for comparison
        const trimmedOfficeName = this.currentOfficeInstalled.officeName.trim();
        
        // Check if model name already exists
        const isDuplicate = this.officeInstalled.some(osInstalled => {
            const isSameName = osInstalled.officeName.toLowerCase() === trimmedOfficeName.toLowerCase();
            // For edit mode, exclude the current model being edited
            const isDifferentOsInstalled = this.isEditMode ? osInstalled.id !== this.currentOfficeInstalled.id : true;
            return isSameName && isDifferentOsInstalled;
        });

        if (isDuplicate) {
            this.errorMessage = `Model already exists. Please use a different name.`;
            return;
        }

        this.isLoading = true;
        this.errorMessage = '';

        if (this.isEditMode) {
            const updateOfficeInstalled = {
                id: this.currentOfficeInstalled.id,
                referenceId: this.currentOfficeInstalled.referenceId || `OS-${this.currentOfficeInstalled.id}`,
                officeName: trimmedOfficeName,
                officeVersion: this.currentOfficeInstalled.officeVersion.trim()
            };

            this.officeInstalledService.updateOfficeInstalled(this.currentOfficeInstalled.id, updateOfficeInstalled).subscribe({
                next: (updatedOfficeInstalled) => {
                    const index = this.officeInstalled.findIndex(m => m.id === this.currentOfficeInstalled.id);
                    if (index !== -1) {
                        this.officeInstalled[index] = updatedOfficeInstalled;
                    }
                    this.onSearch();
                    this.closeForm();
                    this.isLoading = false;
                    this.errorMessage = ''; // Explicitly clear error on success
                },
                error: (error) => {
                    console.error('Error updating office installed:', error);
                    // Check if the update actually succeeded despite error
                    this.officeInstalledService.getAllOfficeInstalled().subscribe({
                        next: (officeInstalledList) => {
                            const updated = officeInstalledList.find(m => m.id === this.currentOfficeInstalled.id && m.officeName === trimmedOfficeName);
                            if (updated) {
                                // Update succeeded, refresh the list
                                this.officeInstalled = officeInstalledList;
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
            const newOfficeInstalled = {
                referenceId: `OS-${Date.now()}`,
                officeName: trimmedOfficeName,
                officeVersion: this.currentOfficeInstalled.officeVersion.trim()
            };

            this.officeInstalledService.createOfficeInstalled(newOfficeInstalled).subscribe({
                next: (createdOfficeInstalled) => {
                    this.officeInstalled.push(createdOfficeInstalled);
                    this.onSearch();
                    this.closeForm();
                    this.isLoading = false;
                    this.errorMessage = ''; // Explicitly clear error on success
                },
                error: (error) => {
                    console.error('Error creating office installed:', error);
                    // Check if the create actually succeeded despite error
                    this.officeInstalledService.getAllOfficeInstalled().subscribe({
                        next: (officeInstalledList) => {
                            const created = officeInstalledList.find(m => m.officeName === newOfficeInstalled.officeName);
                            if (created && !this.officeInstalled.find(m => m.id === created.id)) {
                                this.officeInstalled = officeInstalledList;
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

    deleteOfficeInstalled(officeInstalled: OfficeInstalledItem) {
        this.officeInstalledToDelete = officeInstalled;
        this.showDeleteModal = true;
    }

    confirmDelete() {
        if (!this.officeInstalledToDelete) return;

        this.isLoading = true;
        this.errorMessage = '';

        this.officeInstalledService.deleteOfficeInstalled(this.officeInstalledToDelete.id).subscribe({
            next: () => {
                this.loadModels();
                this.closeDeleteModal();
            },
            error: (error) => {
                console.error('Error deleting office installed:', error);
                this.errorMessage = 'Office installed successfully deleted.';
                this.isLoading = false;
                this.loadModels();
                this.closeDeleteModal();
            }
        });
    }

    closeDeleteModal() {
        this.showDeleteModal = false;
        this.officeInstalledToDelete = null;
    }
}