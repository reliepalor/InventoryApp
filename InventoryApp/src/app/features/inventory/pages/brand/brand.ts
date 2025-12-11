import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { Navbar } from '../../components/navbar/navbar';
import { Sidebar } from '../../components/sidebar/sidebar';
import { BrandTableComponent } from '../../components/brand-table/brand-table';

import { SidebarService } from '../../../services/sidebar.service';
import { BrandService, BrandItem } from '../../../services/brand.service';

// Lookup services
import { ModelService, ModelItem } from '../../../services/model.service';
import { MotherboardService, MotherboardItem } from '../../../services/motherboard.service';
import { OfficeInstalledService } from '../../../services/office-installed.service';
import { OfficeInstalledItem } from '../../../models/office-installed';
import { OsInstalledService } from '../../../services/os-installed.service';
import { OsInstalledItem } from '../../../models/os-installed';
import { ProcessorService, ProcessorItem } from '../../../services/processor.service';
import { RamModelService } from '../../../services/ram-model.service';
import { RamModelItem } from '../../../models/ram-model';
import { RamSizeService } from '../../../services/ram-size.service';
import { RamSizeItem } from '../../../models/ram-size';
import { StorageModelService } from '../../../services/storage-model.service';
import { StorageModelItem } from '../../../models/storage-model';
import { StorageSizeService } from '../../../services/storage-size.service';
import { StorageSizeItem } from '../../../models/storage-size';
import { VideocardMemoryService } from '../../../services/videocard-memory.service';
import { VideocardMemoryItem } from '../../../models/videocard-memory';
import { VideocardModelService, VideoCardItem } from '../../../services/videocard-model.service';

@Component({
  selector: 'app-brand',
  standalone: true,
  imports: [CommonModule, FormsModule, Navbar, Sidebar, BrandTableComponent],
  templateUrl: './brand.html',
  styleUrls: ['./brand.css']
})
export class BrandPageComponent implements OnInit {

  brands: BrandItem[] = [];
  filteredBrands: BrandItem[] = [];
  searchTerm = '';
  isSidebarOpen = true;
  isLoading = false;
  errorMessage = '';

  // Form model
  currentBrand: BrandItem = {
    id: 0,
    referenceId: '',
    modelId: undefined,
    motherboardId: undefined,
    officeInstalledId: undefined,
    osInstalledId: undefined,
    processorId: undefined,
    ramModelId: undefined,
    ramSizeId: undefined,
    storageModelId: undefined,
    storageSizeId: undefined,
    videocardMemoryId: undefined,
    videocardModelId: undefined
  };

  // Lookup lists for dropdowns
  models: ModelItem[] = [];
  motherboards: MotherboardItem[] = [];
  officeInstalledList: OfficeInstalledItem[] = [];
  osInstalledList: OsInstalledItem[] = [];
  processors: ProcessorItem[] = [];
  ramModels: RamModelItem[] = [];
  ramSizes: RamSizeItem[] = [];
  storageModels: StorageModelItem[] = [];
  storageSizes: StorageSizeItem[] = [];
  videocardMemories: VideocardMemoryItem[] = [];
  videocardModels: VideoCardItem[] = [];

  isEditMode = false;
  showForm = false;
  showDeleteModal = false;

  brandToDelete: BrandItem | null = null;

  private sidebarService = inject(SidebarService);
  private brandService = inject(BrandService);
  // inject lookup services
  private modelService = inject(ModelService);
  private motherboardService = inject(MotherboardService);
  private officeInstalledService = inject(OfficeInstalledService);
  private osInstalledService = inject(OsInstalledService);
  private processorService = inject(ProcessorService);
  private ramModelService = inject(RamModelService);
  private ramSizeService = inject(RamSizeService);
  private storageModelService = inject(StorageModelService);
  private storageSizeService = inject(StorageSizeService);
  private videocardMemoryService = inject(VideocardMemoryService);
  private videocardModelService = inject(VideocardModelService);

  constructor() {
    this.sidebarService.sidebarOpen$.subscribe(isOpen => {
      this.isSidebarOpen = isOpen;
    });
  }

  ngOnInit() {
    this.loadBrands();
    this.loadLookups();
  }

  loadLookups() {
    // load each lookup, ignore individual errors but ensure arrays at least empty
    this.modelService.getAllModels().subscribe({ next: v => this.models = v, error: () => this.models = [] });
    this.motherboardService.getAllMotherboards().subscribe({ next: v => this.motherboards = v, error: () => this.motherboards = [] });
    this.officeInstalledService.getAllOfficeInstalled().subscribe({ next: v => this.officeInstalledList = v, error: () => this.officeInstalledList = [] });
    this.osInstalledService.getAllOsInstalled().subscribe({ next: v => this.osInstalledList = v, error: () => this.osInstalledList = [] });
    this.processorService.getAllProcessors().subscribe({ next: v => this.processors = v, error: () => this.processors = [] });
    this.ramModelService.getAllRamModels().subscribe({ next: v => this.ramModels = v, error: () => this.ramModels = [] });
    this.ramSizeService.getAllRamSizes().subscribe({ next: v => this.ramSizes = v, error: () => this.ramSizes = [] });
    this.storageModelService.getAllStorageModels().subscribe({ next: v => this.storageModels = v, error: () => this.storageModels = [] });
    this.storageSizeService.getAllStorageSizes().subscribe({ next: v => this.storageSizes = v, error: () => this.storageSizes = [] });
    this.videocardMemoryService.getAll().subscribe({ next: v => this.videocardMemories = v, error: () => this.videocardMemories = [] });
    this.videocardModelService.getAllVideocards().subscribe({ next: v => this.videocardModels = v, error: () => this.videocardModels = [] });
  }

  loadBrands() {
    this.isLoading = true;
    this.errorMessage = '';

    this.brandService.getAllBrands().subscribe({
      next: (data) => {
        this.brands = data;
        this.filteredBrands = [...this.brands];
        this.isLoading = false;
      },
      error: () => {
        this.errorMessage = 'Failed to load brands. Please check if the API is running.';
        this.brands = [];
        this.filteredBrands = [];
        this.isLoading = false;
      }
    });
  }

  onSearch() {
    if (!this.searchTerm) {
      this.filteredBrands = [...this.brands];
      return;
    }

    const term = this.searchTerm.toLowerCase();

    this.filteredBrands = this.brands.filter(brand =>
      (brand.referenceId || '').toLowerCase().includes(term)
    );
  }

  /* ----------------------
     ADD / EDIT FORM LOGIC
  -----------------------*/

  openAddForm() {
    this.isEditMode = false;
    this.showForm = true;
    console.log(this.ramSizes)
    this.resetForm();
  }

  openEditForm(brand: BrandItem) {
    this.isEditMode = true;
    this.showForm = true;
    this.currentBrand = { ...brand };
  }

  closeForm() {
    this.showForm = false;
    this.resetForm();
  }

  resetForm() {
    this.currentBrand = {
      id: 0,
      referenceId: '',
      modelId: undefined,
      motherboardId: undefined,
      officeInstalledId: undefined,
      osInstalledId: undefined,
      processorId: undefined,
      ramModelId: undefined,
      ramSizeId: undefined,
      storageModelId: undefined,
      storageSizeId: undefined,
      videocardMemoryId: undefined,
      videocardModelId: undefined
    };
    this.errorMessage = '';
  }

  onSubmit() {
    // No brandName/country/foundedYear validation (fields removed).
    // Proceed to create/update using lookup ids and referenceId only.

    this.isLoading = true;

    if (this.isEditMode) {
      this.brandService.updateBrand(this.currentBrand.id, this.currentBrand).subscribe({
        next: (updatedBrand) => {
          const index = this.brands.findIndex(b => b.id === updatedBrand.id);
          if (index !== -1) this.brands[index] = updatedBrand;
          this.onSearch();
          this.closeForm();
          this.isLoading = false;
        },
        error: () => {
          this.isLoading = false;
        }
      });
    } else {
      const payload: Partial<BrandItem> = {
        referenceId: `BRAND-${Date.now()}`
      };

      // include optional lookup ids if provided
      if (this.currentBrand.modelId) payload.modelId = this.currentBrand.modelId;
      if (this.currentBrand.motherboardId) payload.motherboardId = this.currentBrand.motherboardId;
      if (this.currentBrand.officeInstalledId) payload.officeInstalledId = this.currentBrand.officeInstalledId;
      if (this.currentBrand.osInstalledId) payload.osInstalledId = this.currentBrand.osInstalledId;
      if (this.currentBrand.processorId) payload.processorId = this.currentBrand.processorId;
      if (this.currentBrand.ramModelId) payload.ramModelId = this.currentBrand.ramModelId;
      if (this.currentBrand.ramSizeId) payload.ramSizeId = this.currentBrand.ramSizeId;
      if (this.currentBrand.storageModelId) payload.storageModelId = this.currentBrand.storageModelId;
      if (this.currentBrand.storageSizeId) payload.storageSizeId = this.currentBrand.storageSizeId;
      if (this.currentBrand.videocardMemoryId) payload.videocardMemoryId = this.currentBrand.videocardMemoryId;
      if (this.currentBrand.videocardModelId) payload.videocardModelId = this.currentBrand.videocardModelId;

      this.brandService.createBrand(payload as BrandItem).subscribe({
        next: (createdBrand) => {
          this.brands.push(createdBrand);
          this.onSearch();
          this.closeForm();
          this.isLoading = false;
        },
        error: () => {
          this.isLoading = false;
        }
      });
    }
  }

  /* ----------------------
         DELETE LOGIC
  -----------------------*/

  deleteBrand(brand: BrandItem) {
    this.brandToDelete = brand;
    this.showDeleteModal = true;
  }

  confirmDelete() {
    if (!this.brandToDelete) return;

    this.isLoading = true;

    this.brandService.deleteBrand(this.brandToDelete.id).subscribe({
      next: () => {
        this.loadBrands();
        this.closeDeleteModal();
      },
      error: () => {
        this.loadBrands();
        this.closeDeleteModal();
      }
    });
  }

  closeDeleteModal() {
    this.showDeleteModal = false;
    this.brandToDelete = null;
  }

}
