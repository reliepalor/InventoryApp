import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OfficeInstalledItem } from '../../../models/office-installed';

@Component({
  selector: 'app-office-installed-table',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './office-installed-table.html'
})
export class OfficeInstalledTableComponent {
  @Input() officeInstalled: OfficeInstalledItem[] = [];
  @Input() isLoading: boolean = false;

  @Output() edit = new EventEmitter<OfficeInstalledItem>();
  @Output() delete = new EventEmitter<OfficeInstalledItem>();

  onEdit(item: OfficeInstalledItem) {
    this.edit.emit(item);
  }

  onDelete(item: OfficeInstalledItem) {
    this.delete.emit(item);
  }
}
