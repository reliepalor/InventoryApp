// videocard-memory.ts
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Navbar } from '../../components/navbar/navbar';
import { Sidebar } from '../../components/sidebar/sidebar';
import { VideocardMemoryTableComponent } from '../../components/videocard-memory/videocard-memory-table';
import { SidebarService } from '../../../services/sidebar.service';
import { VideocardMemoryService } from '../../../services/videocard-memory.service';
import { VideocardMemoryItem } from '../../../models/videocard-memory';

@Component({
  selector: 'app-videocard-memory',
  standalone: true,
  imports: [CommonModule, FormsModule, Navbar, Sidebar, VideocardMemoryTableComponent],
  templateUrl: './videocard-memory.html',
  styleUrls: ['./videocard-memory.css']
})
export class VideocardMemoryPageComponent implements OnInit {

  videoCardMemories: VideocardMemoryItem[] = [];
  filteredVideoCardMemories: VideocardMemoryItem[] = [];
  searchTerm: string = '';
  isSidebarOpen = true;
  isLoading = false;
  errorMessage = '';

  // Form model
  currentVideoCardMemory: VideocardMemoryItem = {
    id: 0,
    referenceId: '',
    videoCardMemory: '',
    memoryType: ''
  };

  isEditMode: boolean = false;
  showForm: boolean = false;
  showDeleteModal: boolean = false;
  videoCardMemoryToDelete: VideocardMemoryItem | null = null;

  private sidebarService = inject(SidebarService);
  private videocardMemoryService = inject(VideocardMemoryService);

  constructor() {
    this.sidebarService.sidebarOpen$.subscribe(isOpen => {
      this.isSidebarOpen = isOpen as boolean;
    });
  }

  ngOnInit() {
    this.loadVideoCardMemories();
  }

  loadVideoCardMemories() {
    this.isLoading = true;
    this.errorMessage = '';

    this.videocardMemoryService.getAll().subscribe({
      next: (data) => {
        this.videoCardMemories = data;
        this.filteredVideoCardMemories = [...this.videoCardMemories];
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading video card memories:', error);
        this.errorMessage = 'Failed to load video card memories. Please check if the API is running.';
        this.isLoading = false;
        this.videoCardMemories = [];
        this.filteredVideoCardMemories = [];
      }
    });
  }

  onSearch() {
    if (!this.searchTerm) {
      this.filteredVideoCardMemories = [...this.videoCardMemories];
      return;
    }
    const term = this.searchTerm.toLowerCase();

    this.filteredVideoCardMemories = this.videoCardMemories.filter(v =>
      (v.videoCardMemory || '').toLowerCase().includes(term) ||
      (v.memoryType || '').toLowerCase().includes(term)
    );
  }

  openAddForm() {
    this.isEditMode = false;
    this.showForm = true;
    this.resetForm();
  }

  openEditForm(model: VideocardMemoryItem) {
    this.isEditMode = true;
    this.showForm = true;
    this.currentVideoCardMemory = { ...model };
  }

  closeForm() {
    this.showForm = false;
    this.resetForm();
  }

  resetForm() {
    this.currentVideoCardMemory = {
      id: 0,
      referenceId: '',
      videoCardMemory: '',
      memoryType: ''
    };
    this.errorMessage = '';
  }

  onSubmit() {
    if (!this.currentVideoCardMemory.videoCardMemory || !this.currentVideoCardMemory.memoryType) {
      this.errorMessage = 'Please fill in all required fields.';
      return;
    }

    const trimmedMemory = this.currentVideoCardMemory.videoCardMemory.trim();
    const trimmedType = this.currentVideoCardMemory.memoryType.trim();

    const isDuplicate = this.videoCardMemories.some(m => {
      const same = ((m.videoCardMemory || '').toLowerCase() === trimmedMemory.toLowerCase()) &&
                   ((m.memoryType || '').toLowerCase() === trimmedType.toLowerCase());
      const isDifferent = this.isEditMode ? m.id !== this.currentVideoCardMemory.id : true;
      return same && isDifferent;
    });

    if (isDuplicate) {
      this.errorMessage = `Video card memory entry already exists. Please use a different value.`;
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    if (this.isEditMode) {
      const updatePayload: VideocardMemoryItem = {
        id: this.currentVideoCardMemory.id,
        referenceId: this.currentVideoCardMemory.referenceId || `VCM-${this.currentVideoCardMemory.id}`,
        videoCardMemory: trimmedMemory,
        memoryType: trimmedType
      };

      this.videocardMemoryService.update(this.currentVideoCardMemory.id, updatePayload).subscribe({
        next: (updated) => {
          const index = this.videoCardMemories.findIndex(r => r.id === this.currentVideoCardMemory.id);
          if (index !== -1) {
            this.videoCardMemories[index] = updated;
          }
          this.onSearch();
          this.closeForm();
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Update error:', error);
          // fallback: refresh list
          this.videocardMemoryService.getAll().subscribe({
            next: (list) => {
              this.videoCardMemories = list;
              this.onSearch();
              this.closeForm();
              this.isLoading = false;
            },
            error: () => this.isLoading = false
          });
        }
      });

    } else {
      const newItem: VideocardMemoryItem = {
        id: 0,
        referenceId: `VCM-${Date.now()}`,
        videoCardMemory: trimmedMemory,
        memoryType: trimmedType
      };

      this.videocardMemoryService.create(newItem).subscribe({
        next: (created) => {
          this.videoCardMemories.push(created);
          this.onSearch();
          this.closeForm();
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Create error:', error);
          this.videocardMemoryService.getAll().subscribe({
            next: (list) => {
              const createdMatch = list.find(p => p.videoCardMemory === newItem.videoCardMemory && p.memoryType === newItem.memoryType);
              if (createdMatch) {
                this.videoCardMemories = list;
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

  deleteVideoCardMemory(model: VideocardMemoryItem) {
    this.videoCardMemoryToDelete = model;
    this.showDeleteModal = true;
  }

  confirmDelete() {
    if (!this.videoCardMemoryToDelete) return;

    this.isLoading = true;
    this.errorMessage = '';

    this.videocardMemoryService.delete(this.videoCardMemoryToDelete.id).subscribe({
      next: () => {
        this.loadVideoCardMemories();
        this.closeDeleteModal();
      },
      error: (error) => {
        console.error('Delete error:', error);
        this.errorMessage = 'Failed to delete video card memory.';
        this.isLoading = false;
        this.loadVideoCardMemories();
        this.closeDeleteModal();
      }
    });
  }

  closeDeleteModal() {
    this.showDeleteModal = false;
    this.videoCardMemoryToDelete = null;
  }
}
