import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StorageSizeItem } from '../../../models/storage-size';

/**
 * Define or import the StorageSizeItem model in your project.
 * Example model:
 * export interface StorageSizeItem {
 *   referenceId: string;
 *   storageModel: string;
 *   storageSize: string; // e.g. "512 GB", "1 TB"
 * }
 */

@Component({
  selector: 'app-storage-size-table',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './storage-size-table.html'
})
export class StorageSizeTableComponent {
  @Input() storageSizes: StorageSizeItem[] = [];
  @Input() isLoading: boolean = false;

  @Output() edit = new EventEmitter<StorageSizeItem>();
  @Output() delete = new EventEmitter<StorageSizeItem>();

  onEdit(item: StorageSizeItem) {
    this.edit.emit(item);
  }

  onDelete(item: StorageSizeItem) {
    this.delete.emit(item);
  }
}
