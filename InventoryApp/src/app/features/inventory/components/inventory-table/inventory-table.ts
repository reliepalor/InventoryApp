import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InventoryItem } from '../../../services/inventory.service';

@Component({
  selector: 'app-inventory-table',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './inventory-table.html'
})
export class InventoryTableComponent {
  @Input() items: InventoryItem[] = [];
  @Input() isLoading: boolean = false;

  @Output() edit = new EventEmitter<InventoryItem>();
  @Output() delete = new EventEmitter<InventoryItem>();

  onEdit(item: InventoryItem) {
    this.edit.emit(item);
  }

  onDelete(item: InventoryItem) {
    this.delete.emit(item);
  }
}
