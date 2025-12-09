import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ModelItem } from '../../../services/model.service';

@Component({
  selector: 'app-model-table',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './model-table.html'
})
export class ModelTableComponent {
  @Input() models: ModelItem[] = [];
  @Input() isLoading: boolean = false;

  @Output() edit = new EventEmitter<ModelItem>();
  @Output() delete = new EventEmitter<ModelItem>();

  onEdit(model: ModelItem) {
    this.edit.emit(model);
  }

  onDelete(model: ModelItem) {
    this.delete.emit(model);
  }
}
