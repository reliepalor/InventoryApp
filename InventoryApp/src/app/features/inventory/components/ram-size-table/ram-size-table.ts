import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RamSizeItem } from '../../../models/ram-size';

@Component({
  selector: 'app-ram-size-table',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './ram-size-table.html'
})
export class RamSizeTableComponent {
  @Input() ramSizes: RamSizeItem[] = [];
  @Input() isLoading: boolean = false;

  @Output() edit = new EventEmitter<RamSizeItem>();
  @Output() delete = new EventEmitter<RamSizeItem>();

  onEdit(item: RamSizeItem) {
    this.edit.emit(item);
  }

  onDelete(item: RamSizeItem) {
    this.delete.emit(item);
  }
}
