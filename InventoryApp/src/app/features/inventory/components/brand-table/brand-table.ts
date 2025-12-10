// brand-table.ts
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
// Import the BrandItem model from your models folder (adjust path if your file is elsewhere)
import { BrandItem } from '../../../services/brand.service';

@Component({
  selector: 'app-brand-table',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './brand-table.html'
})
export class BrandTableComponent {
  @Input() brands: BrandItem[] = [];
  @Input() isLoading: boolean = false;

  @Output() edit = new EventEmitter<BrandItem>();
  @Output() delete = new EventEmitter<BrandItem>();

  onEdit(item: BrandItem) {
    this.edit.emit(item);
  }

  onDelete(item: BrandItem) {
    this.delete.emit(item);
  }
}
