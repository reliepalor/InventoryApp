import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MotherboardItem } from '../../../services/motherboard.service';

@Component({
  selector: 'app-motherboard-table',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './motherboard-table.html'
})
export class MotherboardTableComponent {
  @Input() motherboards: MotherboardItem[] = [];
  @Input() isLoading: boolean = false;

  @Output() edit = new EventEmitter<MotherboardItem>();
  @Output() delete = new EventEmitter<MotherboardItem>();

  onEdit(motherboard: MotherboardItem) {
    this.edit.emit(motherboard);
  }

  onDelete(motherboard: MotherboardItem) {
    this.delete.emit(motherboard);
  }
}
