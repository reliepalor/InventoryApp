import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { Navbar } from '../../components/navbar/navbar';
import { Sidebar } from '../../components/sidebar/sidebar';
import { InventoryTableComponent } from '../../components/inventory-table/inventory-table';

import { SidebarService } from '../../../services/sidebar.service';
import { InventoryService, InventoryItem } from '../../../services/inventory.service';

@Component({
  selector: 'app-inventory',
  standalone: true,
  imports: [CommonModule, FormsModule, Navbar, Sidebar, InventoryTableComponent],
  templateUrl: './inventory.html',
  styleUrls: ['./inventory.css']
})
export class InventoryPageComponent implements OnInit {

  inventory: InventoryItem[] = [];
  filteredInventory: InventoryItem[] = [];

  searchTerm: string = '';
  isSidebarOpen = true;
  isLoading = false;
  errorMessage = '';

  currentItem: InventoryItem = this.getEmptyItem();

  isEditMode = false;
  showForm = false;
  showDeleteModal = false;
  inventoryToDelete: InventoryItem | null = null;

  private sidebarService = inject(SidebarService);
  private inventoryService = inject(InventoryService);

  constructor() {
    this.sidebarService.sidebarOpen$.subscribe(isOpen => {
      this.isSidebarOpen = isOpen as boolean;
    });
  }

  ngOnInit() {
    this.loadInventory();
  }

  getEmptyItem(): InventoryItem {
    return {
      id: 0,
      brand: '',
      model: '',
      motherboard: '',
      processor: '',
      ramModel: '',
      ramSize: '',
      storageModel: '',
      storageSize: '',
      videoMemory: '',
      videoModel: '',
      officeInstalled: false,
      osInstalled: ''
    };
  }

  loadInventory() {
    this.isLoading = true;
    this.errorMessage = '';

    this.inventoryService.getAllInventory().subscribe({
      next: (data) => {
        this.inventory = data;
        this.filteredInventory = [...this.inventory];
        this.isLoading = false;
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
    const term = this.searchTerm.trim().toLowerCase();
    if (!term) {
      this.filteredInventory = [...this.inventory];
      return;
    }

    this.filteredInventory = this.inventory.filter(item =>
      (item.brand || '').toLowerCase().includes(term) ||
      (item.model || '').toLowerCase().includes(term) ||
      (item.processor || '').toLowerCase().includes(term)
    );
  }

  openAddForm() {
    this.isEditMode = false;
    this.showForm = true;
    this.currentItem = this.getEmptyItem();
  }

  openEditForm(item: InventoryItem) {
    this.isEditMode = true;
    this.showForm = true;
    this.currentItem = { ...item };
  }

  closeForm() {
    this.showForm = false;
    this.currentItem = this.getEmptyItem();
    this.errorMessage = '';
  }

  onSubmit() {
    if (!this.currentItem.brand?.trim() || !this.currentItem.model?.trim()) {
      this.errorMessage = 'Brand and Model are required.';
      return;
    }

    this.isLoading = true;

    const payload = {
      ...this.currentItem,
      brand: this.currentItem.brand.trim(),
      model: this.currentItem.model.trim(),
    };

    if (this.isEditMode) {
      this.inventoryService.updateInventory(this.currentItem.id as any, payload).subscribe({
        next: (updated) => {
          const idx = this.inventory.findIndex(i => i.id === updated.id);
          if (idx !== -1) this.inventory[idx] = updated;
          this.onSearch();
          this.closeForm();
          this.isLoading = false;
        },
        error: () => this.isLoading = false
      });
    } else {
      this.inventoryService.createInventory(payload).subscribe({
        next: (created) => {
          this.inventory.push(created);
          this.onSearch();
          this.closeForm();
          this.isLoading = false;
        },
        error: () => this.isLoading = false
      });
    }
  }

  deleteInventory(item: InventoryItem) {
    this.inventoryToDelete = item;
    this.showDeleteModal = true;
  }

  confirmDelete() {
    if (!this.inventoryToDelete) return;

    this.isLoading = true;

    this.inventoryService.deleteInventory(this.inventoryToDelete.id as any).subscribe({
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
}
