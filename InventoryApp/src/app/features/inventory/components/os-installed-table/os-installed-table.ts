import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OsInstalledItem } from '../../../models/os-installed';

@Component({
  selector: 'app-os-installed-table',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './os-installed-table.html'
})
export class OsInstalledTableComponent {
  @Input() osInstalled: OsInstalledItem[] = [];
  @Input() isLoading: boolean = false;

  @Output() edit = new EventEmitter<OsInstalledItem>();
  @Output() delete = new EventEmitter<OsInstalledItem>();

  onEdit(item: OsInstalledItem) {
    this.edit.emit(item);
  }

  onDelete(item: OsInstalledItem) {
    this.delete.emit(item);
  }
}
