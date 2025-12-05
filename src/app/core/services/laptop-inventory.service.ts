import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { LaptopInventoryItem } from '../models/laptop-inventory.model';
import { LAPTOP_INVENTORY_MOCK } from '../data/laptop-inventory.data';

@Injectable({ providedIn: 'root' })
export class LaptopInventoryService {

  constructor() {}

  getAll(): Observable<LaptopInventoryItem[]> {
    // Try to get from localStorage first, fallback to mock data
    const stored = localStorage.getItem('laptop-inventory');
    let items: LaptopInventoryItem[] = LAPTOP_INVENTORY_MOCK;

    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          items = parsed;
        }
      } catch (e) {
        console.error('Failed to parse inventory from localStorage', e);
      }
    }

    return of(items);
  }
}
