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
  brandFilter = 'All';
  statusFilter = 'All';

  // per-column filters (for table header row)
  columnFilters: { [key: string]: string } = {
    systemModel: '',
    motherboard: '',
    socket: '',
    chipset: '',
    processorSpec: '',
    ramBrandModel: '',
    ramSize: '',
    storageModel: '',
    storageSize: '',
    videoCardModel: '',
    videoCardMemory: '',
    osType: '',
    officeType: ''
  };

  // options
  brands: string[] = [];
  statuses: string[] = [];

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

    this.brands = ['All', ...unique(items.map(i => i.systemBrand))];
    this.statuses = ['All', ...unique(items.map(i => i.status))];
  }

  applyFilters() {
    const searchLower = this.search.trim().toLowerCase();

    this.filteredItems = this.allItems.filter(item => {
      const anyItem = item as any;

      // global search across some fields
      const matchesSearch =
        !searchLower ||
        (item.systemModel ?? '').toLowerCase().includes(searchLower) ||
        (item.systemBrand ?? '').toLowerCase().includes(searchLower) ||
        (item.propertyTagNew ?? '').toLowerCase().includes(searchLower) ||
        (item.propertyTagOld ?? '').toLowerCase().includes(searchLower) ||
        JSON.stringify(item).toLowerCase().includes(searchLower);

      if (!matchesSearch) return false;

      // brand / status filters
      const matchesBrand =
        this.brandFilter === 'All' || item.systemBrand === this.brandFilter;

      const matchesStatus =
        this.statusFilter === 'All' || item.status === this.statusFilter;

      if (!matchesBrand || !matchesStatus) return false;

      // per-column filters
      for (const [key, filterValue] of Object.entries(this.columnFilters)) {
        const f = filterValue.trim().toLowerCase();
        if (!f) continue;

        const rawVal = (anyItem[key] ?? '').toString().toLowerCase();
        if (!rawVal.includes(f)) {
          return false;
        }
      }

      return true;
    });
  }
}
