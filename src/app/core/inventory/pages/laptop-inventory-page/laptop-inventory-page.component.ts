import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { LaptopInventoryService } from 'app/core/services/laptop-inventory.service';
import { LaptopInventoryItem } from 'app/core/models/laptop-inventory.model';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-laptop-inventory-page',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './laptop-inventory-page.component.html',
  styleUrls: ['./laptop-inventory-page.component.css']
})
export class LaptopInventoryPageComponent implements OnInit {

  allItems: LaptopInventoryItem[] = [];
  filteredItems: LaptopInventoryItem[] = [];

  // top filters
  search = '';

  // new important filters
  modelFilter = 'All';
  processorFilter = 'All';
  osFilter = 'All';

  // options for new filters
  models: string[] = [];
  processors: string[] = [];
  osList: string[] = [];

  constructor(private service: LaptopInventoryService) {}

  ngOnInit(): void {
    this.service.getAll().subscribe((items: LaptopInventoryItem[]) => {
      this.allItems = items;
      this.generateFilterOptions(items);
      this.applyFilters();
    });
  }

  private generateFilterOptions(items: LaptopInventoryItem[]) {
    const unique = (arr: (string | undefined | null)[]) =>
      Array.from(new Set(arr.filter(v => !!v))) as string[];

    this.models = ['All', ...unique(items.map(i => i.systemModel))];
    this.processors = ['All', ...unique(items.map(i => i.processorSpec))];
    this.osList = ['All', ...unique(items.map(i => i.osType))];
  }

  applyFilters() {
    const searchLower = this.search.trim().toLowerCase();

    this.filteredItems = this.allItems.filter(item => {
      const anyItem = item as any;

      // 1) Global search across some fields
      const matchesSearch =
        !searchLower ||
        (item.systemModel ?? '').toLowerCase().includes(searchLower) ||
        (item.systemBrand ?? '').toLowerCase().includes(searchLower) ||
        (item.propertyTagNew ?? '').toLowerCase().includes(searchLower) ||
        (item.propertyTagOld ?? '').toLowerCase().includes(searchLower) ||
        JSON.stringify(item).toLowerCase().includes(searchLower);

      if (!matchesSearch) return false;

      // 2) Model filter
      const matchesModel =
        this.modelFilter === 'All' ||
        item.systemModel === this.modelFilter;

      if (!matchesModel) return false;

      // 3) Processor filter
      const matchesProcessor =
        this.processorFilter === 'All' ||
        item.processorSpec === this.processorFilter;

      if (!matchesProcessor) return false;

      // 4) OS filter
      const matchesOs =
        this.osFilter === 'All' ||
        item.osType === this.osFilter;

      if (!matchesOs) return false;

      return true;
    });
  }
}
