// src/app/features/inventory/pages/laptop-reports-page/laptop-reports-page.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LaptopInventoryService } from 'app/core/services/laptop-inventory.service';
import { LaptopInventoryItem } from 'app/core/models/laptop-inventory.model';

interface CountItem {
  label: string;
  value: number;
}

@Component({
  selector: 'app-laptop-reports-page',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './laptop-reports-page.component.html',
  styleUrls: ['./laptop-reports-page.component.css']
})
export class LaptopReportsPageComponent implements OnInit {

  loading = true;
  items: LaptopInventoryItem[] = [];

  totalLaptops = 0;
  statusCounts: CountItem[] = [];
  brandCounts: CountItem[] = [];
  departmentCounts: CountItem[] = [];

  inUseCount = 0;
  availableCount = 0;
  repairCount = 0;

  constructor(private inv: LaptopInventoryService) {}

  ngOnInit(): void {
    this.inv.getAll().subscribe(items => {
      this.items = items || [];
      this.loading = false;

      this.computeStats();
    });
  }

  private computeStats() {
    this.totalLaptops = this.items.length;

    this.statusCounts = this.countBy(this.items, i => i.status || 'Unknown');
    this.brandCounts = this.countBy(this.items, i => i.systemBrand || 'Unknown');
    this.departmentCounts = this.countBy(this.items, i => i.department || 'Unassigned');

    this.inUseCount = this.statusCounts.find(s => s.label === 'In Use')?.value || 0;
    this.availableCount = this.statusCounts.find(s => s.label === 'Available')?.value || 0;
    this.repairCount = this.statusCounts.find(s => s.label === 'In Repair')?.value || 0;
  }

  private countBy<T>(arr: T[], keyFn: (item: T) => string): CountItem[] {
    const map = new Map<string, number>();

    for (const item of arr) {
      const key = keyFn(item);
      map.set(key, (map.get(key) || 0) + 1);
    }

    return Array.from(map.entries())
      .map(([label, value]) => ({ label, value }))
      .sort((a, b) => b.value - a.value); // highest first
  }

  getMaxValue(list: CountItem[]): number {
    return list.length ? Math.max(...list.map(i => i.value)) : 1;
  }
}
