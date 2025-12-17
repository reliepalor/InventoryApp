import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UiColumn, UiTableRow } from '../../../models/add-table';

@Component({
  selector: 'app-add-table',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './add-table.html'
})
export class DynamicTableComponent {

  @Input() columns: UiColumn[] = [];
  @Input() rows: UiTableRow[] = [];
  @Input() isLoading = false;

  @Output() edit = new EventEmitter<UiTableRow>();
  @Output() delete = new EventEmitter<UiTableRow>();

  onEdit(row: UiTableRow) {
    this.edit.emit(row);
  }

  onDelete(row: UiTableRow) {
    this.delete.emit(row);
  }
}
