import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Inventy } from '../../../model';

@Component({
  selector: 'app-inventory-table',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './inventory-table.html'
})
export class InventoryTableComponent {
  @Input() items: Inventy[] = [];
  @Input() isLoading: boolean = false;
  @Output() edit = new EventEmitter<Inventy>();
  @Output() delete = new EventEmitter<Inventy>();

  onEdit(item: Inventy) {
    this.edit.emit(item);
  }

  onDelete(item: Inventy) {
    this.delete.emit(item);
  }

  // small trackBy to improve ngFor performance on mobile card list
  trackByTag(_index: number, item: Inventy) {
    return item.tagNumber ?? _index;
  }
}
