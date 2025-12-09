import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RamModelItem } from '../../../models/ram-model';

@Component({
  selector: 'app-ram-model-table',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './ram-model-table.html'
})
export class RamModelTableComponent {
  @Input() ramModels: RamModelItem[] = [];
  @Input() isLoading: boolean = false;

  @Output() edit = new EventEmitter<RamModelItem>();
  @Output() delete = new EventEmitter<RamModelItem>();

  onEdit(item: RamModelItem) {
    this.edit.emit(item);
  }

  onDelete(item: RamModelItem) {
    this.delete.emit(item);
  }
}
