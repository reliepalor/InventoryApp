export interface UiColumn {
  key: string;           // referenceId, name, isActive
  label: string;         // Reference ID, Name
  type: 'text' | 'number' | 'boolean';
}

export interface UiTableRow {
  [key: string]: any;
}

export interface TableDefinition {
  id: number;
  name: string;
  columns: TableColumn[];
}

export interface CreateTableRequest {
  name: string;
  columns: TableColumn[];
}

export interface TableColumn {
  id: number;
  name: string;
  type: string;
  // Add other properties as needed
}

export interface CreateColumnRequest {
  name: string;
  type: string;
}

export interface TableRow {
  id: number;
  [key: string]: any;
}

export interface CreateRowRequest {
  [key: string]: any;
}

export interface UpdateRowRequest {
  [key: string]: any;
}