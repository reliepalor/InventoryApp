import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StorageModelItem } from '../../../models/storage-model';

@Component({
  selector: 'app-storage-model-table',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './storage-model-table.html'
})
export class StorageModelTableComponent {
  @Input() storageModels: StorageModelItem[] = [];
  @Input() isLoading: boolean = false;

  @Output() edit = new EventEmitter<StorageModelItem>();
  @Output() delete = new EventEmitter<StorageModelItem>();

  onEdit(item: StorageModelItem) {
    this.edit.emit(item);
  }

  onDelete(item: StorageModelItem) {
    this.delete.emit(item);
  }
}
