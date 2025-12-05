import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LaptopInventoryItem } from '../../../../models/laptop-inventory.model';
@Component({
  selector: 'app-laptop-table',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './laptop-table.component.html',
  styleUrls: ['./laptop-table.component.css']
})
export class LaptopTableComponent {
  @Input() items: LaptopInventoryItem[] = [];
}
