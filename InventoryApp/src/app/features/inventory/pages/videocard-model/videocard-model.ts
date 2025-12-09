// videocard-model.ts
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Navbar } from '../../components/navbar/navbar';
import { Sidebar } from '../../components/sidebar/sidebar';
import { VideocardModelTableComponent } from '../../components/videocard-model/videocard-model-table';
import { SidebarService } from '../../../services/sidebar.service';
import { VideocardModelService } from '../../../services/videocard-model.service';
import { VideoCardModel } from '../../../models/videocard-model';

@Component({
  selector: 'app-videocard-model',
  standalone: true,
  imports: [CommonModule, FormsModule, Navbar, Sidebar, VideocardModelTableComponent],
  templateUrl: './videocard-model.html',
  styleUrls: ['./videocard-model.css']
})
export class VideocardModelPageComponent implements OnInit {
  videocardModels: VideoCardModel[] = [];
  filteredVideocardModels: VideoCardModel[] = [];
  searchTerm: string = '';
  isSidebarOpen = true;
  isLoading = false;
  errorMessage = '';

  currentVideocard: VideoCardModel = {
    id: '',
    referenceId: '',
    modelName: '',
    memorySizeGb: 0,
    manufacturer: ''
  };

  isEditMode: boolean = false;
  showForm: boolean = false;
  showDeleteModal: boolean = false;
  videocardToDelete: VideoCardModel | null = null;

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
        // normalize ids to string if backend returns numbers
        this.videocardModels = data.map(item => ({
          ...item,
          id: (item.id as any)?.toString?.() ?? String(item.id ?? ''),
        }));
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

  openEditForm(videocard: VideoCardModel) {
    this.isEditMode = true;
    this.showForm = true;
    this.currentVideocard = { ...videocard };
  }

  closeForm() {
    this.showForm = false;
    this.resetForm();
  }

  resetForm() {
    this.currentVideocard = {
      id: '',
      referenceId: '',
      modelName: '',
      memorySizeGb: 0,
      manufacturer: ''
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
      const updatePayload: Partial<VideoCardModel> = {
        id: this.currentVideocard.id,
        referenceId: this.currentVideocard.referenceId || `VID-${this.currentVideocard.id}`,
        modelName: trimmedName,
        memorySizeGb: this.currentVideocard.memorySizeGb,
        manufacturer: this.currentVideocard.manufacturer
      };

      // service expects numeric id in some backends; try to send as-is
      this.videocardService.updateVideocard(this.currentVideocard.id as any, updatePayload as any).subscribe({
        next: (updated) => {
          const idx = this.videocardModels.findIndex(v => v.id === this.currentVideocard.id);
          if (idx !== -1) {
            this.videocardModels[idx] = { ...updated, id: (updated as any).id?.toString?.() ?? this.videocardModels[idx].id };
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
              this.videocardModels = items.map(item => ({ ...item, id: (item as any).id?.toString?.() ?? String((item as any).id ?? '') }));
              this.onSearch();
              this.closeForm();
              this.isLoading = false;
            },
            error: () => { this.isLoading = false; }
          });
        }
      });

    } else {
      const newVideocard: Partial<VideoCardModel> = {
        referenceId: `VID-${Date.now()}`,
        modelName: trimmedName,
        memorySizeGb: this.currentVideocard.memorySizeGb,
        manufacturer: this.currentVideocard.manufacturer
      };

      this.videocardService.createVideocard(newVideocard as any).subscribe({
        next: (created) => {
          // normalize id
          const createdItem = { ...created, id: (created as any).id?.toString?.() ?? String((created as any).id ?? '') };
          this.videocardModels.push(createdItem);
          this.onSearch();
          this.closeForm();
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error creating video card model:', error);
          // fallback: refresh list
          this.videocardService.getAllVideocards().subscribe({
            next: (items) => {
              this.videocardModels = items.map(item => ({ ...item, id: (item as any).id?.toString?.() ?? String((item as any).id ?? '') }));
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

  deleteVideocardModel(videocard: VideoCardModel) {
    this.videocardToDelete = videocard;
    this.showDeleteModal = true;
  }

  confirmDelete() {
    if (!this.videocardToDelete) return;

    this.isLoading = true;
    this.errorMessage = '';

    this.videocardService.deleteVideocard(this.videocardToDelete.id as any).subscribe({
      next: () => {
        this.loadVideocardModels();
        this.closeDeleteModal();
      },
      error: (error) => {
        console.error('Error deleting video card model:', error);
        // still attempt to refresh
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
