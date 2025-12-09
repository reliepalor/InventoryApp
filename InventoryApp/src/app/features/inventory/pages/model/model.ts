import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Navbar } from '../../components/navbar/navbar';
import { Sidebar } from '../../components/sidebar/sidebar';
import { ModelTableComponent } from '../../components/model-table/model-table';
import { SidebarService } from '../../../services/sidebar.service';
import { ModelService, ModelItem } from '../../../services/model.service';

@Component({
    selector: 'app-model',
    standalone: true,
    imports: [CommonModule, FormsModule, Navbar, Sidebar, ModelTableComponent],
    templateUrl: './model.html',
    styleUrls: ['./model.css']
})
export class ModelPageComponent implements OnInit {
    models: ModelItem[] = [];
    filteredModels: ModelItem[] = [];
    searchTerm: string = '';
    isSidebarOpen = true;
    isLoading = false;
    errorMessage = '';

    // Form model
    currentModel: ModelItem = {
        id: 0,
        referenceId: '',
        modelName: ''
    };

    isEditMode: boolean = false;
    showForm: boolean = false;
    showDeleteModal: boolean = false;
    modelToDelete: ModelItem | null = null;

    private sidebarService = inject(SidebarService);
    private modelService = inject(ModelService);

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

        this.modelService.getAllModels().subscribe({
            next: (data) => {
                this.models = data;
                this.filteredModels = [...this.models];
                this.isLoading = false;
            },
            error: (error) => {
                console.error('Error loading models:', error);
                this.errorMessage = 'Failed to load models. Please check if the API is running.';
                this.isLoading = false;
                this.models = [];
                this.filteredModels = [];
            }
        });
    }

    onSearch() {
        if (!this.searchTerm) {
            this.filteredModels = [...this.models];
            return;
        }

        const term = this.searchTerm.toLowerCase();
        this.filteredModels = this.models.filter(model =>
            model.modelName.toLowerCase().includes(term)
        );
    }

    openAddForm() {
        this.isEditMode = false;
        this.showForm = true;
        this.resetForm();
    }

    openEditForm(model: ModelItem) {
        this.isEditMode = true;
        this.showForm = true;
        this.currentModel = { ...model };
    }

    closeForm() {
        this.showForm = false;
        this.resetForm();
    }

    resetForm() {
        this.currentModel = {
            id: 0,
            referenceId: '',
            modelName: ''
        };
        this.errorMessage = '';
    }

    onSubmit() {
        if (!this.currentModel.modelName) {
            this.errorMessage = 'Please fill in all required fields.';
            return;
        }

        // Trim the model name for comparison
        const trimmedModelName = this.currentModel.modelName.trim();
        
        // Check if model name already exists
        const isDuplicate = this.models.some(model => {
            const isSameName = model.modelName.toLowerCase() === trimmedModelName.toLowerCase();
            // For edit mode, exclude the current model being edited
            const isDifferentModel = this.isEditMode ? model.id !== this.currentModel.id : true;
            return isSameName && isDifferentModel;
        });

        if (isDuplicate) {
            this.errorMessage = `Model already exists. Please use a different name.`;
            return;
        }

        this.isLoading = true;
        this.errorMessage = '';

        if (this.isEditMode) {
            const updateModel = {
                id: this.currentModel.id,
                referenceId: this.currentModel.referenceId || `MODEL-${this.currentModel.id}`,
                modelName: trimmedModelName
            };

            this.modelService.updateModel(this.currentModel.id, updateModel).subscribe({
                next: (updatedModel) => {
                    const index = this.models.findIndex(m => m.id === this.currentModel.id);
                    if (index !== -1) {
                        this.models[index] = updatedModel;
                    }
                    this.onSearch();
                    this.closeForm();
                    this.isLoading = false;
                    this.errorMessage = ''; // Explicitly clear error on success
                },
                error: (error) => {
                    console.error('Error updating model:', error);
                    // Check if the update actually succeeded despite error
                    this.modelService.getAllModels().subscribe({
                        next: (models) => {
                            const updated = models.find(m => m.id === this.currentModel.id && m.modelName === trimmedModelName);
                            if (updated) {
                                // Update succeeded, refresh the list
                                this.models = models;
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
            const newModel = {
                referenceId: `MB-${Date.now()}`,
                modelName: trimmedModelName
            };

            this.modelService.createModel(newModel).subscribe({
                next: (createdModel) => {
                    this.models.push(createdModel);
                    this.onSearch();
                    this.closeForm();
                    this.isLoading = false;
                    this.errorMessage = ''; // Explicitly clear error on success
                },
                error: (error) => {
                    console.error('Error creating model:', error);
                    // Check if the create actually succeeded despite error
                    this.modelService.getAllModels().subscribe({
                        next: (models) => {
                            const created = models.find(m => m.modelName === newModel.modelName);
                            if (created && !this.models.find(m => m.id === created.id)) {
                                this.models = models;
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

    deleteModel(model: ModelItem) {
        this.modelToDelete = model;
        this.showDeleteModal = true;
    }

    confirmDelete() {
        if (!this.modelToDelete) return;

        this.isLoading = true;
        this.errorMessage = '';

        this.modelService.deleteModel(this.modelToDelete.id).subscribe({
            next: () => {
                this.loadModels();
                this.closeDeleteModal();
            },
            error: (error) => {
                console.error('Error deleting model:', error);
                this.errorMessage = 'Model successfully deleted.';
                this.isLoading = false;
                this.loadModels();
                this.closeDeleteModal();
            }
        });
    }

    closeDeleteModal() {
        this.showDeleteModal = false;
        this.modelToDelete = null;
    }
}