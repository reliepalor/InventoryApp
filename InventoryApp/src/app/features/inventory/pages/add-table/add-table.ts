import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';

import { Sidebar } from '../../components/sidebar/sidebar';
import { Navbar } from '../../components/navbar/navbar';
import { SidebarService } from '../../../services/sidebar.service';

import {
  AddTableService,
  TableDefinition
} from '../../../services/add-table.service';

/* =========================
   COLUMN BUILDER MODELS
   ========================= */

export type ColumnType = 'varchar' | 'int' | 'bool' | 'date';

export interface ColumnBuilder {
  name: string;
  type: ColumnType;
  isPrimaryKey: boolean;
}

@Component({
  selector: 'app-add-table',
  standalone: true,
  imports: [CommonModule, FormsModule, Sidebar, Navbar],
  templateUrl: './add-table.html'
})
export class AddTablePageComponent implements OnInit {

  tables: TableDefinition[] = [];

  newTableName = '';
  newColumns: ColumnBuilder[] = [
    { name: '', type: 'varchar', isPrimaryKey: false }
  ];

  isLoading = false;
  isSidebarOpen = true;

  private sidebarService = inject(SidebarService);
  private tableService = inject(AddTableService);
  private route = inject(ActivatedRoute);

  constructor() {
    this.sidebarService.sidebarOpen$
      .subscribe(v => this.isSidebarOpen = v);
  }

  ngOnInit() {
    this.loadTables();
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.loadTableById(+id);
      }
    });
  }

  /* ----------------------
        LOAD TABLES
  -----------------------*/

  loadTables() {
    this.isLoading = true;

    this.tableService.getAllTables().subscribe({
      next: data => {
        this.tables = data;
        this.isLoading = false;
      },
      error: () => this.isLoading = false
    });
  }

  loadTableById(id: number) {
    this.tableService.getTableById(id).subscribe({
      next: table => {
        // For now, just log the table; later can display it
        console.log('Loaded table:', table);
      },
      error: () => console.error('Failed to load table')
    });
  }

  /* ----------------------
        COLUMN BUILDER
  -----------------------*/

  addColumn() {
    this.newColumns.push({
      name: '',
      type: 'varchar',
      isPrimaryKey: false
    });
  }

  removeColumn(index: number) {
    this.newColumns.splice(index, 1);
  }

  trackByIndex(index: number): number {
    return index;
  }

  onPrimaryKeyChange(selectedIndex: number) {
    this.newColumns.forEach((col, i) => {
      if (i !== selectedIndex) {
        col.isPrimaryKey = false;
      }
    });
  }

  /* ----------------------
        CREATE TABLE
  -----------------------*/

  createTable() {
    if (!this.newTableName) return;

    const columns = this.newColumns
      .filter(c => c.name.trim().length > 0)
      .map(c => ({
        name: c.name.trim(),
        type: c.type,
        isPrimaryKey: c.isPrimaryKey
      }));

    if (columns.length === 0) return;

    if (!columns.some(c => c.isPrimaryKey)) {
      alert('Please select exactly one primary key.');
      return;
    }

    this.isLoading = true;

    this.tableService.createTable({
      name: this.newTableName,
      columns
    } as any).subscribe({
      next: table => {
        this.tables.push(table);
        this.newTableName = '';
        this.newColumns = [
          { name: '', type: 'varchar', isPrimaryKey: false }
        ];
        this.isLoading = false;
      },
      error: () => this.isLoading = false
    });
  }

  /* ----------------------
        ACTIONS
  -----------------------*/

  openTable(table: TableDefinition) {
    // Next step: route to /add-table/:id
    console.log('Open table:', table);
  }

  deleteTable(table: TableDefinition) {
    this.isLoading = true;

    this.tableService.deleteTable(table.id).subscribe({
      next: () => {
        this.tables = this.tables.filter(t => t.id !== table.id);
        this.isLoading = false;
      },
      error: () => this.isLoading = false
    });
  }
}
