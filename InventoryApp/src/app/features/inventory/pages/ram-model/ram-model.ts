import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Navbar } from '../../components/navbar/navbar';
import { Sidebar } from '../../components/sidebar/sidebar';
import { RamModelTableComponent } from '../../components/ram-model-table/ram-model-table';
import { SidebarService } from '../../../services/sidebar.service';
import { RamModelService } from '../../../services/ram-model.service';
import { RamModelItem } from '../../../models/ram-model';

@Component({
  selector: 'app-ram-model',
  standalone: true,
  imports: [CommonModule, FormsModule, Navbar, Sidebar, RamModelTableComponent],
  templateUrl: './ram-model.html',
  styleUrls: ['./ram-model.css']
})
export class RamModelPageComponent implements OnInit {

  ramModels: RamModelItem[] = [];
  filteredRamModels: RamModelItem[] = [];
  searchTerm: string = '';
  isSidebarOpen = true;
  isLoading = false;
  errorMessage = '';

  // Form model
  currentRamModel: RamModelItem = {
    id: 0,
    referenceId: '',
    ramModel: '',
    ramType: ''
  };

  isEditMode: boolean = false;
  showForm: boolean = false;
  showDeleteModal: boolean = false;
  ramModelToDelete: RamModelItem | null = null;

  private sidebarService = inject(SidebarService);
  private ramModelService = inject(RamModelService);

  constructor() {
    this.sidebarService.sidebarOpen$.subscribe(isOpen => {
      this.isSidebarOpen = isOpen as boolean;
    });
  }

  ngOnInit() {
    this.loadRamModels();
  }

  loadRamModels() {
    this.isLoading = true;
    this.errorMessage = '';

    this.ramModelService.getAllRamModels().subscribe({
      next: (data) => {
        this.ramModels = data;
        this.filteredRamModels = [...this.ramModels];
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading RAM models:', error);
        this.errorMessage = 'Failed to load RAM models. Please check if the API is running.';
        this.isLoading = false;
        this.ramModels = [];
        this.filteredRamModels = [];
      }
    });
  }

  onSearch() {
    if (!this.searchTerm) {
      this.filteredRamModels = [...this.ramModels];
      return;
    }
    const term = this.searchTerm.toLowerCase();

    this.filteredRamModels = this.ramModels.filter(r =>
      (r.ramModel || '').toLowerCase().includes(term) ||
      (r.ramType || '').toLowerCase().includes(term)
    );
  }

  openAddForm() {
    this.isEditMode = false;
    this.showForm = true;
    this.resetForm();
  }

  openEditForm(model: RamModelItem) {
    this.isEditMode = true;
    this.showForm = true;
    this.currentRamModel = { ...model };
  }

  closeForm() {
    this.showForm = false;
    this.resetForm();
  }

  resetForm() {
    this.currentRamModel = {
      id: 0,
      referenceId: '',
      ramModel: '',
      ramType: ''
    };
    this.errorMessage = '';
  }

  onSubmit() {
    if (!this.currentRamModel.ramModel || !this.currentRamModel.ramType) {
      this.errorMessage = 'Please fill in all required fields.';
      return;
    }

    const trimmedModel = this.currentRamModel.ramModel.trim();

    const isDuplicate = this.ramModels.some(m => {
      const sameModel = (m.ramModel || '').toLowerCase() === trimmedModel.toLowerCase();
      const isDifferent = this.isEditMode ? m.id !== this.currentRamModel.id : true;
      return sameModel && isDifferent;
    });

    if (isDuplicate) {
      this.errorMessage = `RAM model already exists. Please use a different name.`;
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    if (this.isEditMode) {
      const updatePayload: RamModelItem = {
        id: this.currentRamModel.id,
        referenceId: this.currentRamModel.referenceId || `RAM-${this.currentRamModel.id}`,
        ramModel: trimmedModel,
        ramType: this.currentRamModel.ramType.trim()
      };

      this.ramModelService.updateRamModel(this.currentRamModel.id, updatePayload).subscribe({
        next: (updated) => {
          const index = this.ramModels.findIndex(r => r.id === this.currentRamModel.id);
          if (index !== -1) {
            this.ramModels[index] = updated;
          }
          this.onSearch();
          this.closeForm();
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Update error:', error);
          // fallback: refresh list
          this.ramModelService.getAllRamModels().subscribe({
            next: (list) => {
              this.ramModels = list;
              this.onSearch();
              this.closeForm();
              this.isLoading = false;
            },
            error: () => this.isLoading = false
          });
        }
      });

    } else {
      const newRam = {
        referenceId: `RAM-${Date.now()}`,
        ramModel: trimmedModel,
        ramType: this.currentRamModel.ramType.trim()
      };

      this.ramModelService.createRamModel(newRam).subscribe({
        next: (created) => {
          this.ramModels.push(created);
          this.onSearch();
          this.closeForm();
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Create error:', error);
          this.ramModelService.getAllRamModels().subscribe({
            next: (list) => {
              const createdMatch = list.find(p => p.ramModel === newRam.ramModel);
              if (createdMatch) {
                this.ramModels = list;
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

  deleteRamModel(model: RamModelItem) {
    this.ramModelToDelete = model;
    this.showDeleteModal = true;
  }

  confirmDelete() {
    if (!this.ramModelToDelete) return;

    this.isLoading = true;
    this.errorMessage = '';

    this.ramModelService.deleteRamModel(this.ramModelToDelete.id).subscribe({
      next: () => {
        this.loadRamModels();
        this.closeDeleteModal();
      },
      error: (error) => {
        console.error('Delete error:', error);
        this.errorMessage = 'Failed to delete RAM model.';
        this.isLoading = false;
        this.loadRamModels();
        this.closeDeleteModal();
      }
    });
  }

  closeDeleteModal() {
    this.showDeleteModal = false;
    this.ramModelToDelete = null;
  }
}
