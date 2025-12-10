import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { Navbar } from '../../components/navbar/navbar';
import { Sidebar } from '../../components/sidebar/sidebar';
import { BrandTableComponent } from '../../components/brand-table/brand-table';

import { SidebarService } from '../../../services/sidebar.service';
import { BrandService, BrandItem } from '../../../services/brand.service';

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
    brandName: '',
    country: '',
    foundedYear: undefined
  };

  isEditMode = false;
  showForm = false;
  showDeleteModal = false;

  brandToDelete: BrandItem | null = null;

  private sidebarService = inject(SidebarService);
  private brandService = inject(BrandService);

  constructor() {
    this.sidebarService.sidebarOpen$.subscribe(isOpen => {
      this.isSidebarOpen = isOpen;
    });
  }

  ngOnInit() {
    this.loadBrands();
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
      (brand.brandName || '').toLowerCase().includes(term)
    );
  }

  /* ----------------------
     ADD / EDIT FORM LOGIC
  -----------------------*/

  openAddForm() {
    this.isEditMode = false;
    this.showForm = true;
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
      brandName: '',
      country: '',
      foundedYear: undefined
    };
    this.errorMessage = '';
  }

  onSubmit() {
    if (!this.currentBrand.brandName?.trim()) {
      this.errorMessage = 'Please provide a brand name.';
      return;
    }

    const trimmed = this.currentBrand.brandName.trim();

    const duplicate = this.brands.some(b =>
      b.brandName?.toLowerCase() === trimmed.toLowerCase() &&
      (!this.isEditMode || b.id !== this.currentBrand.id)
    );

    if (duplicate) {
      this.errorMessage = `Brand already exists. Please use a different name.`;
      return;
    }

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
        referenceId: `BRAND-${Date.now()}`,
        brandName: trimmed,
        country: this.currentBrand.country,
        foundedYear: this.currentBrand.foundedYear
      };

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
