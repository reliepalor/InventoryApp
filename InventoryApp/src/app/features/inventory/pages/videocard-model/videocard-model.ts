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

  chipsetOptions = ['NVIDIA', 'AMD', 'Intel', 'Custom OEM'];

  selectedChipset: string = '';

  currentVideocard: VideoCardItem = {
    id: undefined,
    referenceId: '',
    videoCardName: '',
    videoCardChipset: ''
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
        // Normalize data if backend uses different property names
        this.videocardModels = data.map(item => this.mapToFrontend(item));
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

  private mapToFrontend(item: any): VideoCardItem {
    return {
      id: item.id ?? item._id ?? undefined,
      referenceId: item.referenceId ?? item.referenceID ?? item._id ?? '',
      videoCardName: item.videoCardName ?? item.modelName ?? item.name ?? '',
      videoCardChipset: item.videoCardChipset ?? item.chipset ?? ''
    };
  }

  onSearch() {
    if (!this.searchTerm) {
      this.filteredVideocardModels = [...this.videocardModels];
      return;
    }

    const term = this.searchTerm.toLowerCase();
    this.filteredVideocardModels = this.videocardModels.filter(v =>
      (v.videoCardName || '').toLowerCase().includes(term) ||
      (v.videoCardChipset || '').toLowerCase().includes(term) ||
      (v.referenceId || '').toLowerCase().includes(term)
    );
  }

  openAddForm() {
    this.isEditMode = false;
    this.showForm = true;
    this.resetForm();
    this.selectedChipset = '';
  }

  openEditForm(videocard: VideoCardItem) {
    this.isEditMode = true;
    this.showForm = true;
    this.currentVideocard = { ...videocard };
    // set select to existing value if it matches options, otherwise select 'Other'
    this.selectedChipset = this.chipsetOptions.includes(this.currentVideocard.videoCardChipset || '') ?
      (this.currentVideocard.videoCardChipset || '') : (this.currentVideocard.videoCardChipset ? 'Other' : '');
  }

  closeForm() {
    this.showForm = false;
    this.resetForm();
  }

  resetForm() {
    this.currentVideocard = {
      id: undefined,
      referenceId: '',
      videoCardName: '',
      videoCardChipset: ''
    };
    this.errorMessage = '';
    this.selectedChipset = '';
  }

  onChipsetChange(event: Event) {
    const target = event.target as HTMLSelectElement;
    const value = target?.value || '';
    this.selectedChipset = value;
    if (value && value !== 'Other') {
      this.currentVideocard.videoCardChipset = value;
    } else if (value === '') {
      this.currentVideocard.videoCardChipset = '';
    } else {
      // Other selected — wait for custom input
      this.currentVideocard.videoCardChipset = '';
    }
  }

  onSubmit() {
    if (!this.currentVideocard.videoCardName || this.currentVideocard.videoCardName.trim() === '') {
      this.errorMessage = 'Please provide a video card name.';
      return;
    }

    if (!this.currentVideocard.videoCardChipset || this.currentVideocard.videoCardChipset.trim() === '') {
      this.errorMessage = 'Please choose or enter a chipset.';
      return;
    }

    const trimmedName = this.currentVideocard.videoCardName.trim();

    const isDuplicate = this.videocardModels.some(v => {
      const sameName = (v.videoCardName || '').toLowerCase() === trimmedName.toLowerCase();
      const isDifferent = this.isEditMode ? v.id !== this.currentVideocard.id : true;
      return sameName && isDifferent;
    });

    if (isDuplicate) {
      this.errorMessage = 'Video card model already exists. Please use a different name.';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    // Set referenceId for new items if missing
    if (!this.currentVideocard.referenceId || this.currentVideocard.referenceId.trim() === '') {
      this.currentVideocard.referenceId = `VID-${Date.now()}`;
    }

    if (this.isEditMode) {
      // Ensure id exists before calling update
      const idToUse = this.currentVideocard.id;
      if (idToUse === undefined || idToUse === null) {
        this.errorMessage = 'Cannot update: missing video card id.';
        this.isLoading = false;
        return;
      }

      const updatePayload: Partial<VideoCardItem> = {
        referenceId: this.currentVideocard.referenceId,
        videoCardName: trimmedName,
        videoCardChipset: this.currentVideocard.videoCardChipset
      };

      // idToUse is now narrowed (not undefined/null)
      this.videocardService.updateVideocard(idToUse as string | number, updatePayload as any).subscribe({
        next: (updated) => {
          const mapped = this.mapToFrontend(updated);
          const idx = this.videocardModels.findIndex(v => v.id === idToUse);
          if (idx !== -1) {
            this.videocardModels[idx] = { ...this.videocardModels[idx], ...mapped };
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
              this.videocardModels = items.map(i => this.mapToFrontend(i));
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
        referenceId: this.currentVideocard.referenceId,
        videoCardName: trimmedName,
        videoCardChipset: this.currentVideocard.videoCardChipset
      };

      this.videocardService.createVideocard(newVideocard as any).subscribe({
        next: (created) => {
          this.videocardModels.push(this.mapToFrontend(created));
          this.onSearch();
          this.closeForm();
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error creating video card model:', error);
          // fallback: refresh list
          this.videocardService.getAllVideocards().subscribe({
            next: (items) => {
              this.videocardModels = items.map(i => this.mapToFrontend(i));
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

    const idToDelete = this.videocardToDelete.id;
    if (idToDelete === undefined || idToDelete === null) {
      this.errorMessage = 'Cannot delete: missing video card id.';
      this.isLoading = false;
      this.closeDeleteModal();
      return;
    }

    this.videocardService.deleteVideocard(idToDelete as string | number).subscribe({
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
