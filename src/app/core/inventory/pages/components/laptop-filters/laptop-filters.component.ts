import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export interface LaptopFilterState {
  search: string;
  brand: string | null;
  model: string | null;
  department: string | null;
  location: string | null;
  status: string | null;
  osType: string | null;
}

@Component({
  selector: 'app-laptop-filters',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './laptop-filters.component.html',
  styleUrls: ['./laptop-filters.component.css']
})
export class LaptopFiltersComponent {
  @Input() brands: string[] = [];
  @Input() models: string[] = [];
  @Input() departments: string[] = [];
  @Input() locations: string[] = [];
  @Input() statuses: string[] = [];
  @Input() osTypes: string[] = [];

  @Output() filtersChange = new EventEmitter<LaptopFilterState>();

  filters: LaptopFilterState = {
    search: '',
    brand: null,
    model: null,
    department: null,
    location: null,
    status: null,
    osType: null,
  };

  onFiltersChanged() {
    this.filtersChange.emit({ ...this.filters });
  }
}
