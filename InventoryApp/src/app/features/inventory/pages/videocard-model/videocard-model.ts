// src/app/features/inventory/pages/videocard-model/videocard-model.ts
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Navbar } from '../../components/navbar/navbar';
import { Sidebar } from '../../components/sidebar/sidebar';
import { VideocardModelTableComponent } from '../../components/videocard-model/videocard-model-table';
import { SidebarService } from '../../../services/sidebar.service';
import { VideocardModelService, VideoCardItem } from '../../../services/videocard-model.service';

@Component({
  selector: 'app-videocard-model',
  standalone: true,
  imports: [CommonModule, FormsModule, Navbar, Sidebar, VideocardModelTableComponent],
  templateUrl: './videocard-model.html',
  styleUrls: ['./videocard-model.css']
})
export class VideocardModelPageComponent implements OnInit {
  videocardModels: VideoCardItem[] = [];
  filteredVideocardModels: VideoCardItem[] = [];
  searchTerm: string = '';
  isSidebarOpen = true;
  isLoading = false;
  errorMessage = '';

  // initialize with the service's shape (id is number)
  currentVideocard: VideoCardItem = {
    id: 0,
    referenceId: '',
    modelName: '',
    manufacturer: undefined,
    memoryGb: undefined,
    memoryType: undefined,
    memoryBus: undefined,
    coreClock: undefined,
    boostClock: undefined,
    tdp: undefined,
    pciExpress: undefined,
    outputs: undefined,
    lengthMm: undefined
  };

  isEditMode: boolean = false;
  showForm: boolean = false;
  showDeleteModal: boolean = false;
  videocardToDelete: VideoCardItem | null = null;

  private sidebarService = inject(SidebarService);
  private videocardService = inject(VideocardModelService);

  constructor() {
    this.sidebarService.sidebarOpen$.subscribe(isOpen => {
      this.isSidebarOpen = isOpen as boolean;
    });
  }

  ngOnInit() {
    this.loadVideocardModels();
  }

  loadVideocardModels() {
    this.isLoading = true;
    this.errorMessage = '';

    this.videocardService.getAllVideocards().subscribe({
      next: (data) => {
        // data already matches VideoCardItem[] (ids are numbers)
        this.videocardModels = data;
        this.filteredVideocardModels = [...this.videocardModels];
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading video card models:', error);
        this.errorMessage = 'Failed to load video card models. Please check if the API is running.';
        this.isLoading = false;
        this.videocardModels = [];
        this.filteredVideocardModels = [];
      }
    });
  }

  onSearch() {
    if (!this.searchTerm) {
      this.filteredVideocardModels = [...this.videocardModels];
      return;
    }

    const term = this.searchTerm.toLowerCase();
    this.filteredVideocardModels = this.videocardModels.filter(v =>
      (v.modelName || '').toLowerCase().includes(term) ||
      (v.manufacturer || '').toLowerCase().includes(term) ||
      (v.referenceId || '').toLowerCase().includes(term)
    );
  }

  openAddForm() {
    this.isEditMode = false;
    this.showForm = true;
    this.resetForm();
  }

  openEditForm(videocard: VideoCardItem) {
    this.isEditMode = true;
    this.showForm = true;
    // shallow copy to avoid mutating the array until saved
    this.currentVideocard = { ...videocard };
  }

  closeForm() {
    this.showForm = false;
    this.resetForm();
  }

  resetForm() {
    this.currentVideocard = {
      id: 0,
      referenceId: '',
      modelName: '',
      manufacturer: undefined,
      memoryGb: undefined,
      memoryType: undefined,
      memoryBus: undefined,
      coreClock: undefined,
      boostClock: undefined,
      tdp: undefined,
      pciExpress: undefined,
      outputs: undefined,
      lengthMm: undefined
    };
    this.errorMessage = '';
  }

  onSubmit() {
    if (!this.currentVideocard.modelName || this.currentVideocard.modelName.trim() === '') {
      this.errorMessage = 'Please provide a model name.';
      return;
    }

    const trimmedName = this.currentVideocard.modelName.trim();

    const isDuplicate = this.videocardModels.some(v => {
      const sameName = (v.modelName || '').toLowerCase() === trimmedName.toLowerCase();
      const isDifferent = this.isEditMode ? v.id !== this.currentVideocard.id : true;
      return sameName && isDifferent;
    });

    if (isDuplicate) {
      this.errorMessage = 'Video card model already exists. Please use a different name.';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    if (this.isEditMode) {
      const updatePayload: Partial<VideoCardItem> = {
        id: this.currentVideocard.id,
        referenceId: this.currentVideocard.referenceId || `VID-${this.currentVideocard.id}`,
        modelName: trimmedName,
        memoryGb: this.currentVideocard.memoryGb,
        manufacturer: this.currentVideocard.manufacturer
      };

      this.videocardService.updateVideocard(this.currentVideocard.id, updatePayload as any).subscribe({
        next: (updated) => {
          const idx = this.videocardModels.findIndex(v => v.id === this.currentVideocard.id);
          if (idx !== -1) {
            this.videocardModels[idx] = { ...this.videocardModels[idx], ...updated };
          }
          this.onSearch();
          this.closeForm();
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error updating video card model:', error);
          // fallback: refresh list
          this.videocardService.getAllVideocards().subscribe({
            next: (items) => {
              this.videocardModels = items;
              this.onSearch();
              this.closeForm();
              this.isLoading = false;
            },
            error: () => { this.isLoading = false; }
          });
        }
      });

    } else {
      const newVideocard: Partial<VideoCardItem> = {
        // backend likely assigns numeric id; referenceId is helpful client-side
        referenceId: `VID-${Date.now()}`,
        modelName: trimmedName,
        memoryGb: this.currentVideocard.memoryGb,
        manufacturer: this.currentVideocard.manufacturer
      };

      this.videocardService.createVideocard(newVideocard as any).subscribe({
        next: (created) => {
          this.videocardModels.push(created);
          this.onSearch();
          this.closeForm();
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error creating video card model:', error);
          // fallback: refresh list
          this.videocardService.getAllVideocards().subscribe({
            next: (items) => {
              this.videocardModels = items;
              this.onSearch();
              this.closeForm();
              this.isLoading = false;
            },
            error: () => { this.isLoading = false; }
          });
        }
      });
    }
  }

  deleteVideocardModel(videocard: VideoCardItem) {
    this.videocardToDelete = videocard;
    this.showDeleteModal = true;
  }

  confirmDelete() {
    if (!this.videocardToDelete) return;

    this.isLoading = true;
    this.errorMessage = '';

    this.videocardService.deleteVideocard(this.videocardToDelete.id).subscribe({
      next: () => {
        this.loadVideocardModels();
        this.closeDeleteModal();
      },
      error: (error) => {
        console.error('Error deleting video card model:', error);
        this.isLoading = false;
        this.loadVideocardModels();
        this.closeDeleteModal();
      }
    });
  }

  closeDeleteModal() {
    this.showDeleteModal = false;
    this.videocardToDelete = null;
  }
}
