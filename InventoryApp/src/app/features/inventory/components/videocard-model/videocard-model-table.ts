import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { VideoCardItem } from '../../../services/videocard-model.service';

@Component({
  selector: 'app-videocard-model-table',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './videocard-model-table.html'
})
export class VideocardModelTableComponent {
  @Input() videocardModels: VideoCardItem[] = [];
  @Input() isLoading: boolean = false;

  @Output() edit = new EventEmitter<VideoCardItem>();
  @Output() delete = new EventEmitter<VideoCardItem>();

  onEdit(item: VideoCardItem) {
    this.edit.emit(item);
  }

  onDelete(item: VideoCardItem) {
    this.delete.emit(item);
  }
}
