// // src/app/features/inventory/pages/inventory/inventory.ts
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { Navbar } from '../../components/navbar/navbar';
import { Sidebar } from '../../components/sidebar/sidebar';
import { SidebarService } from '../../../services/sidebar-service';
import { Inventy, Brands } from '../../../model';
import { BrandServices } from '../../../services/brand-services';
import { AuthService } from '../../../services/AuthService';
import { InventoryService } from '../../../services/inventory-service';
// import { BrandService } from '../../../services/brand.service';
// import { BrandItem } from '../../../models/brand';
// import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-inventory',
  standalone: true,
  imports: [CommonModule, FormsModule, Navbar, Sidebar],
  templateUrl: './inventory.html',
  styleUrls: ['./inventory.css']
})
export class InventoryPageComponent {
  // Inventory Model
  inventoryItems: Inventy[] = [];
  filteredInventoryItems: Inventy[] = [];
  searchTerm = '';
  isSidebarOpen = true;
  isLoading = false;
  errorMessage = '';

  currentInventory: Inventy = {
    id: 0,
    tagNumber: '',
    datePurchased: '',
    department: '',
    assignedTo: '',
    type: '',
    brandId: null,
    userId: ''
  };

  // helper UI state
  brands: Brands[] = [];
  departments: { id: number; name: string }[] = [];
  selectedBrandId: number | null = null;
  selectedDepartmentId: number | null = null;
  datePurchasedString = '';

  isEditMode = false;
  showForm = false;
  showDeleteModal = false;

  inventoryToDelete: Inventy | null = null;
  private sidebarService = inject(SidebarService);
  private brandService = inject(BrandServices);
  private inventoryService = inject(InventoryService);

  constructor() {
    this.sidebarService.sidebarOpen$.subscribe(isOpen => {
      this.isSidebarOpen = isOpen as boolean;
    });
  }

  ngOnInit(): void {
    this.loadInventoryItems();
    this.loadBrands();
    this.loadDepartments();
  }
  loadInventoryItems(): void {
    this.isLoading = true;
    this.inventoryService.getAllInventory().subscribe({
      next: (data: Inventy[]) => {
        this.inventoryItems = data;
        this.filteredInventoryItems = [...data];
        this.isLoading = false;
      },
      error: (error: any) => {
        this.errorMessage = 'Error loading Inventory. Please try again later.';
        this.isLoading = false;
      }
    });
  }
  onSearch(): void {
    if (!this.searchTerm) {
      this.filteredInventoryItems = [...this.inventoryItems];
      return;
    }

    const search = this.searchTerm.toLowerCase();
    this.filteredInventoryItems = this.inventoryItems.filter(item =>
      (item.tagNumber || '').toLowerCase().includes(search) ||
      (item.department || '').toLowerCase().includes(search) ||
      (item.assignedTo || '').toLowerCase().includes(search) ||
      (item.type || '').toLowerCase().includes(search)
    );
  }
  openAddForm(): void {
    this.isEditMode = false;
    this.showForm = true;
    this.resetForm();
  }

  openEditForm(item: Inventy): void {
    this.isEditMode = true;
    this.showForm = true;
    this.currentInventory = { ...item };
    this.selectedBrandId = this.currentInventory.brandId ?? null;
  }
  resetForm(): void {
    this.currentInventory = {
      id: 0,
      tagNumber: '',
      datePurchased: '',
      department: '',
      assignedTo: '',
      type: '',
      brandId: null,
      userId: ''
    };
    this.selectedBrandId = null;
    this.selectedDepartmentId = null;
    this.datePurchasedString = '';
  }
  closeForm(): void {
    this.showForm = false;
    this.resetForm();
  }
  onSubmit(): void {
    this.isLoading = true;
    this.errorMessage = '';
    if (this.isEditMode) {
      this.inventoryService.updateInventory(this.currentInventory.id, this.currentInventory).subscribe({
        next: (updatedInventory: Inventy) => {
          const index = this.inventoryItems.findIndex(i => i.id === updatedInventory.id);
          if (index !== -1) {
            this.inventoryItems[index] = updatedInventory;
          }
          const fIndex = this.filteredInventoryItems.findIndex(i => i.id === updatedInventory.id);
          if (fIndex !== -1) {
            this.filteredInventoryItems[fIndex] = updatedInventory;
          } else {
            this.onSearch();
          }
          this.closeForm();
          this.isLoading = false;
        },
        error: () => {
          // refresh list to reconcile state and close form as fallback
          this.inventoryService.getAllInventory().subscribe({
            next: (items) => {
              this.inventoryItems = items;
              this.onSearch();
              this.closeForm();
              this.isLoading = false;
            },
            error: () => { this.isLoading = false; }
          });
        }
      });
    }else {
      const payload = {
        referenceId: `Inv-${Date.now()}`,
        tagNumber: this.currentInventory.tagNumber,
        datePurchased: this.currentInventory.datePurchased,
        department: this.currentInventory.department,
        assignedTo: this.currentInventory.assignedTo,
        type: this.currentInventory.type,
        brandId: this.currentInventory.brandId,
        userId: this.currentInventory.userId
      } as any;
      this.inventoryService.createInventory(payload).subscribe({
        next: (newInventory: Inventy) => {
          // Reload from server to ensure we have canonical data (id, defaults)
          this.inventoryService.getAllInventory().subscribe({
            next: (items) => {
              this.inventoryItems = items;
              this.filteredInventoryItems = [...items];
              this.closeForm();
              this.isLoading = false;
            },
            error: () => {
              // fallback: close form and stop loading
              this.closeForm();
              this.isLoading = false;
            }
          });
        },
        error: () => {
          this.isLoading = false;
        }
      });
    }
  }
  deleteInventory(inventy: Inventy): void {
    this.inventoryToDelete = inventy;
    this.showDeleteModal = true;
  }
  confirmDelete(): void {
    if (!this.inventoryToDelete) return

    this.isLoading = true;
    this.inventoryService.deleteInventory(this.inventoryToDelete.id).subscribe({
      next: () => {
        this.loadInventoryItems();
        this.closeDeleteModal();
      },
      error: () => {
        this.loadInventoryItems();
        this.closeDeleteModal();
      }
    });
  }
  // UI helpers used by template
  getBrandDisplay(b: Brands): string {
    if (!b) return '';
    return b.model || b.referenceId || `Brand ${b.id}`;
  }

  onBrandChange(id: number | null) {
    this.currentInventory.brandId = id;
  }

  onDepartmentChange(id: number | null) {
    const dept = this.departments.find(d => d.id === id);
    this.currentInventory.department = dept ? dept.name : '';
  }

  onDateChange(value: string) {
    this.currentInventory.datePurchased = value;
  }

  // load brands and departments
  private loadBrands(): void {
    this.brandService.getAllBrands().subscribe({
      next: (items) => { this.brands = items; },
      error: () => { this.brands = []; }
    });
  }

  private loadDepartments(): void {
    // placeholder departments; replace with real API if available
    this.departments = [
      { id: 1, name: 'IT' },
      { id: 2, name: 'HR' },
      { id: 3, name: 'Finance' }
    ];
  }
  closeDeleteModal() {
    this.showDeleteModal = false;
    this.inventoryToDelete = null;
  }
  // Template helpers
  get filteredInventory(): Inventy[] {
    return this.filteredInventoryItems;
  }

  onEdit(item: Inventy) {
    this.openEditForm(item);
  }

  onDelete(item: Inventy) {
    this.deleteInventory(item);
  }

  getBrandModelName(brandId: number | null | undefined): string {
    if (brandId == null) return '-';
    const b = this.brands.find(x => x.id === brandId);
    return b ? b.model : '-';
  }

  trackByTag(_index: number, item: Inventy) {
    return item.tagNumber ?? _index;
  }
}
