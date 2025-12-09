import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProcessorItem } from '../../../services/processor.service';

@Component({
  selector: 'app-processor-table',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './processor-table.html'
})
export class ProcessorTableComponent {
  @Input() processors: ProcessorItem[] = [];
  @Input() isLoading: boolean = false;

  @Output() edit = new EventEmitter<ProcessorItem>();
  @Output() delete = new EventEmitter<ProcessorItem>();

  onEdit(item: ProcessorItem) {
    this.edit.emit(item);
  }

  onDelete(item: ProcessorItem) {
    this.delete.emit(item);
  }
}
