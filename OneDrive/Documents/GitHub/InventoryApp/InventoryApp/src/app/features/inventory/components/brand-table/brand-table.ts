// brand-table.ts
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Brands } from '../../../model/Brands';

@Component({
	selector: 'app-brand-table',
	standalone: true,
	imports: [CommonModule],
	templateUrl: './brand-table.html'
})
export class BrandTableComponent {
	@Input() brands: Brands[] = [];
	@Input() isLoading: boolean = false;

	@Output() edit = new EventEmitter<Brands>();
	@Output() delete = new EventEmitter<Brands>();

	onEdit(item: Brands) {
		this.edit.emit(item);
	}

	onDelete(item: Brands) {
		this.delete.emit(item);
	}
}
