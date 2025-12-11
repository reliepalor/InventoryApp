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
    vRamSize: '',
    vRamType: '',
    vRamBus: '',
    vRamSpeed: '',
  };

  // presets for dropdowns
  sizes: string[] = ['2 GB','4 GB','6 GB','8 GB','10 GB','12 GB','16 GB','24 GB','32 GB'];
  types: string[] = ['GDDR5','GDDR5X','GDDR6','GDDR6X','HBM2','HBM2e','HBM3'];
  buses: string[] = ['64-bit','128-bit','192-bit','256-bit','320-bit','384-bit','512-bit'];
  speeds: string[] = ['7 Gbps','8 Gbps','10 Gbps','12 Gbps','14 Gbps','16 Gbps','18 Gbps'];

  // selected / custom values
  selectedSize: string = '';
  customSize: string = '';

  selectedType: string = '';
  customType: string = '';

  selectedBus: string = '';
  customBus: string = '';

  selectedSpeed: string = '';
  customSpeed: string = '';

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
      (v.vRamSize || '').toLowerCase().includes(term) ||
      (v.vRamType || '').toLowerCase().includes(term) ||
      (v.vRamBus || '').toLowerCase().includes(term) ||
      (v.vRamSpeed || '').toLowerCase().includes(term)
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

    // pre-select or mark custom for each field
    const sizeMatch = this.sizes.find(s => s.toLowerCase() === (model.vRamSize || '').toLowerCase());
    if (sizeMatch) { this.selectedSize = sizeMatch; this.customSize = ''; } else { this.selectedSize = 'custom'; this.customSize = model.vRamSize || ''; }

    const typeMatch = this.types.find(t => t.toLowerCase() === (model.vRamType || '').toLowerCase());
    if (typeMatch) { this.selectedType = typeMatch; this.customType = ''; } else { this.selectedType = 'custom'; this.customType = model.vRamType || ''; }

    const busMatch = this.buses.find(b => b.toLowerCase() === (model.vRamBus || '').toLowerCase());
    if (busMatch) { this.selectedBus = busMatch; this.customBus = ''; } else { this.selectedBus = 'custom'; this.customBus = model.vRamBus || ''; }

    const speedMatch = this.speeds.find(sp => sp.toLowerCase() === (model.vRamSpeed || '').toLowerCase());
    if (speedMatch) { this.selectedSpeed = speedMatch; this.customSpeed = ''; } else { this.selectedSpeed = 'custom'; this.customSpeed = model.vRamSpeed || ''; }
  }

  closeForm() {
    this.showForm = false;
    this.resetForm();
  }

  resetForm() {
    this.currentVideoCardMemory = {
      id: 0,
      referenceId: '',
      vRamSize: '',
      vRamType: '',
      vRamBus: '',
      vRamSpeed: '',
    };

    this.selectedSize = '';
    this.customSize = '';

    this.selectedType = '';
    this.customType = '';

    this.selectedBus = '';
    this.customBus = '';

    this.selectedSpeed = '';
    this.customSpeed = '';

    this.errorMessage = '';
  }

  // change handlers
  onSizeChange() { if (this.selectedSize !== 'custom') this.customSize = ''; }
  onTypeChange() { if (this.selectedType !== 'custom') this.customType = ''; }
  onBusChange()  { if (this.selectedBus !== 'custom')  this.customBus = '';  }
  onSpeedChange(){ if (this.selectedSpeed !== 'custom') this.customSpeed = ''; }

  clearSizeSelection()  { this.selectedSize = ''; this.customSize = ''; }
  clearTypeSelection()  { this.selectedType = ''; this.customType = ''; }
  clearBusSelection()   { this.selectedBus = ''; this.customBus = ''; }
  clearSpeedSelection() { this.selectedSpeed = ''; this.customSpeed = ''; }

  // ensure required values are present depending on dropdown/custom usage
  isFormValid(form: any): boolean {
    const finalSize   = this.selectedSize === 'custom' ? (this.customSize || '').trim() : (this.selectedSize || '').trim();
    const finalType   = this.selectedType === 'custom' ? (this.customType || '').trim() : (this.selectedType || '').trim();
    const finalBus    = this.selectedBus === 'custom'  ? (this.customBus  || '').trim() : (this.selectedBus  || '').trim();
    const finalSpeed  = this.selectedSpeed === 'custom'? (this.customSpeed|| '').trim() : (this.selectedSpeed || '').trim();

    return !!(finalSize && finalType && finalBus && finalSpeed);
  }

  onSubmit() {
    const finalSize   = this.selectedSize === 'custom' ? (this.customSize || '').trim() : (this.selectedSize || '').trim();
    const finalType   = this.selectedType === 'custom' ? (this.customType || '').trim() : (this.selectedType || '').trim();
    const finalBus    = this.selectedBus === 'custom'  ? (this.customBus  || '').trim() : (this.selectedBus  || '').trim();
    const finalSpeed  = this.selectedSpeed === 'custom'? (this.customSpeed|| '').trim() : (this.selectedSpeed || '').trim();

    if (!finalSize || !finalType || !finalBus || !finalSpeed) {
      this.errorMessage = 'Please fill in all required fields.';
      return;
    }

    const isDuplicate = this.videoCardMemories.some(m => {
      const same = ((m.vRamSize || '').toLowerCase() === finalSize.toLowerCase()) &&
                   ((m.vRamType || '').toLowerCase() === finalType.toLowerCase()) &&
                   ((m.vRamBus || '').toLowerCase() === finalBus.toLowerCase()) &&
                   ((m.vRamSpeed || '').toLowerCase() === finalSpeed.toLowerCase());
      const isDifferent = this.isEditMode ? m.id !== this.currentVideoCardMemory.id : true;
      return same && isDifferent;
    });

    if (isDuplicate) {
      this.errorMessage = `Video card memory entry already exists. Please use different values.`;
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    if (this.isEditMode) {
      const updatePayload: VideocardMemoryItem = {
        id: this.currentVideoCardMemory.id,
        referenceId: this.currentVideoCardMemory.referenceId || `VCM-${this.currentVideoCardMemory.id}`,
        vRamSize: finalSize,
        vRamType: finalType,
        vRamBus: finalBus,
        vRamSpeed: finalSpeed
      };

      this.videocardMemoryService.update(this.currentVideoCardMemory.id, updatePayload).subscribe({
        next: (updated) => {
          const index = this.videoCardMemories.findIndex(r => r.id === this.currentVideoCardMemory.id);
          if (index !== -1) { this.videoCardMemories[index] = updated; }
          this.onSearch();
          this.closeForm();
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Update error:', error);
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
        vRamSize: finalSize,
        vRamType: finalType,
        vRamBus: finalBus,
        vRamSpeed: finalSpeed
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
              const createdMatch = list.find(p =>
                p.vRamSize === newItem.vRamSize &&
                p.vRamType === newItem.vRamType &&
                p.vRamBus === newItem.vRamBus &&
                p.vRamSpeed === newItem.vRamSpeed
              );
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
