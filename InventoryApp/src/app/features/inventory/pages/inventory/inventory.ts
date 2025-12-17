// src/app/features/inventory/pages/inventory/inventory.ts
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { Navbar } from '../../components/navbar/navbar';
import { Sidebar } from '../../components/sidebar/sidebar';
import { SidebarService } from '../../../services/sidebar.service';
import { InventoryService, InventoryItem } from '../../../services/inventory.service';
import { BrandService, BrandItem } from '../../../services/brand.service';

type DepartmentItem = { id: number; name: string };

@Component({
  selector: 'app-inventory',
  standalone: true,
  imports: [CommonModule, FormsModule, Navbar, Sidebar],
  templateUrl: './inventory.html',
  styleUrls: ['./inventory.css']
})
export class InventoryPageComponent implements OnInit {
  inventory: InventoryItem[] = [];
  filteredInventory: InventoryItem[] = [];
  searchTerm = '';
  isSidebarOpen = true;
  isLoading = false;
  errorMessage = '';

  // Form model
  currentInventory: InventoryItem = {
    id: 0,
    tagNumber: '',
    datePurchased: new Date(),
    department: '',
    assignedTo: '',
    type: '',
    brand: ''
  };

  brands: BrandItem[] = [];
  departments: DepartmentItem[] = []; // DepartmentItem { id: number; name: string }

  isEditMode = false;
  showForm = false;
  showDeleteModal = false;
  inventoryToDelete: InventoryItem | null = null;

  selectedBrandId: number | null = null;
  selectedDepartmentId: number | null = null;

  datePurchasedString: string = '';

  private sidebarService = inject(SidebarService);
  private inventoryService = inject(InventoryService);
  private brandService = inject(BrandService);

  constructor() {
    this.sidebarService.sidebarOpen$.subscribe(isOpen => {
      this.isSidebarOpen = isOpen;
    });
  }

  ngOnInit() {
    this.loadLookups();
    this.loadInventory();
  }

  loadLookups() {
    this.brandService.getAllBrands().subscribe({
      next: (v) => this.brands = v,
      error: () => this.brands = []
    });

    const svcAny = this.inventoryService as any;
    if (typeof svcAny.getAllDepartments === 'function') {
      svcAny.getAllDepartments().subscribe({
        next: (deps: DepartmentItem[]) => {
          this.departments = deps ?? [];
        },
        error: () => {
          this.deriveDepartmentsFromInventory();
        }
      });
    } else {
      this.deriveDepartmentsFromInventory();
    }
  }


  private deriveDepartmentsFromInventory() {
    this.inventoryService.getAllInventory().subscribe({
      next: (items) => {
        const seen = new Map<string, number>();
        const list: DepartmentItem[] = [];
        items.forEach(item => {
          const name = (item.department ?? '').trim();
          if (!name) return;
          if (!seen.has(name)) {
            const id = list.length + 1; 
            seen.set(name, id);
            list.push({ id, name });
          }
        });

        if (list.length === 0) {
          this.departments = [
            { id: 1, name: 'IT' },
            { id: 2, name: 'Finance' },
            { id: 3, name: 'HR' },
            { id: 4, name: 'Operations' }
          ];
        } else {
          this.departments = list;
        }
      },
      error: () => {
        this.departments = [
          { id: 1, name: 'IT' },
          { id: 3, name: 'HR' }
        ];
      }
    });
  }

  loadInventory() {
    this.isLoading = true;
    this.errorMessage = '';

    this.inventoryService.getAllInventory().subscribe({
      next: (data) => {
        this.inventory = data;
        this.filteredInventory = [...this.inventory];
        this.isLoading = false;

        // Ensure departments are updated if deriveDepartmentsFromInventory already depended on inventory
        if (!this.departments || this.departments.length === 0) {
          // re-derive to pick up any departments from the loaded inventory
          this.deriveDepartmentsFromInventory();
        }
      },
      error: () => {
        this.errorMessage = 'Failed to load inventory. Please check if the API is running.';
        this.inventory = [];
        this.filteredInventory = [];
        this.isLoading = false;
      }
    });
  }

  onSearch() {
    if (!this.searchTerm) {
      this.filteredInventory = [...this.inventory];
      return;
    }

    const term = this.searchTerm.toLowerCase();
    this.filteredInventory = this.inventory.filter(item =>
      (item.tagNumber || '').toLowerCase().includes(term)
    );
  }

  /* ---------- Form logic ---------- */

  openAddForm() {
    this.isEditMode = false;
    this.showForm = true;
    this.resetForm();
  }

  openEditForm(inv: InventoryItem) {
    this.isEditMode = true;
    this.showForm = true;
    this.currentInventory = { ...inv };

    // set selected brand and department if available
    const brand = this.brands.find(b => b.referenceId === inv.brand);
    this.selectedBrandId = brand ? brand.id : null;

    const dept = this.departments.find(d => d.name === inv.department);
    this.selectedDepartmentId = dept ? dept.id : null;

    // populate date string for input[type=date]
    if (inv.datePurchased) {
      const d = new Date(inv.datePurchased);
      this.datePurchasedString = this.toDateInputValue(d);
    } else {
      this.datePurchasedString = '';
    }
  }

  closeForm() {
    this.showForm = false;
    this.resetForm();
  }

  resetForm() {
    this.currentInventory = {
      id: 0,
      tagNumber: '',
      datePurchased: new Date(),
      department: '',
      assignedTo: '',
      type: '',
      brand: ''
    };
    this.selectedBrandId = null;
    this.selectedDepartmentId = null;
    this.datePurchasedString = '';
    this.errorMessage = '';
  }

  onDateChange(value: string) {
    this.datePurchasedString = value;
    this.currentInventory.datePurchased = value ? new Date(value) : null as any;
  }

  onBrandChange(id: number | null) {
    const b = this.brands.find(x => x.id === id!);
    this.currentInventory.brand = b ? b.referenceId : '';
  }

  onDepartmentChange(id: number | null) {
    const d = this.departments.find(x => x.id === id!);
    this.currentInventory.department = d ? d.name : '';
  }

  onSubmit() {
    this.isLoading = true;
    this.errorMessage = '';

    const payload = {
      tagNumber: this.currentInventory.tagNumber,
      datePurchased: this.currentInventory.datePurchased,
      department: this.currentInventory.department,
      assignedTo: this.currentInventory.assignedTo,
      type: this.currentInventory.type,
      brand: this.currentInventory.brand
    };

    if (this.isEditMode) {
      this.inventoryService.updateInventory(this.currentInventory.id, { ...payload, id: this.currentInventory.id } as any).subscribe({
        next: (updated) => {
          const idx = this.inventory.findIndex(i => i.id === updated.id);
          if (idx !== -1) this.inventory[idx] = updated;
          this.onSearch();
          this.closeForm();
          this.isLoading = false;
        },
        error: () => {
          this.errorMessage = 'Failed to update inventory.';
          this.isLoading = false;
        }
      });
    } else {
      // create
      this.inventoryService.createInventory(payload as any).subscribe({
        next: (created) => {
          this.inventory.push(created);
          this.onSearch();
          this.closeForm();
          this.isLoading = false;
        },
        error: () => {
          this.errorMessage = 'Failed to create inventory.';
          this.isLoading = false;
        }
      });
    }
  }

  /* ---------- Delete logic ---------- */

  deleteInventory(inv: InventoryItem) {
    this.inventoryToDelete = inv;
    this.showDeleteModal = true;
  }

  confirmDelete() {
    if (!this.inventoryToDelete) return;
    this.isLoading = true;

    this.inventoryService.deleteInventory(this.inventoryToDelete.id).subscribe({
      next: () => {
        this.loadInventory();
        this.closeDeleteModal();
      },
      error: () => {
        this.loadInventory();
        this.closeDeleteModal();
      }
    });
  }

  closeDeleteModal() {
    this.showDeleteModal = false;
    this.inventoryToDelete = null;
  }

  /* ---------- Event handlers ---------- */

  onEdit(inv: InventoryItem) {
    this.openEditForm(inv);
  }

  onDelete(inv: InventoryItem) {
    this.deleteInventory(inv);
  }

  trackByTag(index: number, item: InventoryItem): string {
    return item.tagNumber;
  }

  /* ---------- Helpers ---------- */

  // convert Date to YYYY-MM-DD for <input type="date">
  private toDateInputValue(date: Date) {
    const local = new Date(date);
    local.setMinutes(date.getMinutes() - date.getTimezoneOffset());
    return local.toISOString().slice(0, 10);
  }
}
