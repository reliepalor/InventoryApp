// videocard-memory-table.ts
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { VideocardMemoryItem } from '../../../models/videocard-memory'; 


@Component({
  selector: 'app-videocard-memory-table',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './videocard-memory-table.html'
})
export class VideocardMemoryTableComponent {
  @Input() videoCardMemories: VideocardMemoryItem[] = [];
  @Input() isLoading: boolean = false;

  @Output() edit = new EventEmitter<VideocardMemoryItem>();
  @Output() delete = new EventEmitter<VideocardMemoryItem>();

  onEdit(item: VideocardMemoryItem) {
    this.edit.emit(item);
  }

  onDelete(item: VideocardMemoryItem) {
    this.delete.emit(item);
  }
}
