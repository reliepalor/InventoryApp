import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, catchError, throwError } from 'rxjs';
import { environment } from '../environments/environment';
import {
  TableDefinition,
  CreateTableRequest,
  TableColumn,
  CreateColumnRequest,
  TableRow,
  CreateRowRequest,
  UpdateRowRequest
} from '../models/add-table';

export type {
  TableDefinition,
  CreateTableRequest,
  TableColumn,
  CreateColumnRequest,
  TableRow,
  CreateRowRequest,
  UpdateRowRequest
};

@Injectable({
  providedIn: 'root',
})
export class AddTableService {
  private apiUrl = `${environment.apiUrl}/Tables`;
  private storageKey = 'customTables';

  constructor(private http: HttpClient) {}

  /* =========================
     TABLE DEFINITIONS
     ========================= */

  getAllTables(): Observable<TableDefinition[]> {
    const tables = JSON.parse(localStorage.getItem(this.storageKey) || '[]');
    return of(tables);
  }

  getTableById(id: number): Observable<TableDefinition> {
    const tables = JSON.parse(localStorage.getItem(this.storageKey) || '[]');
    const table = tables.find((t: TableDefinition) => t.id === id);
    return of(table);
  }

  createTable(request: CreateTableRequest): Observable<TableDefinition> {
    const tables = JSON.parse(localStorage.getItem(this.storageKey) || '[]');
    const newTable: TableDefinition = {
      id: Date.now(),
      name: request.name,
      columns: request.columns
    };
    tables.push(newTable);
    localStorage.setItem(this.storageKey, JSON.stringify(tables));
    return of(newTable);
  }

  deleteTable(id: number): Observable<any> {
    const tables = JSON.parse(localStorage.getItem(this.storageKey) || '[]');
    const updatedTables = tables.filter((table: TableDefinition) => table.id !== id);
    localStorage.setItem(this.storageKey, JSON.stringify(updatedTables));
    return of(null);
  }

  /* =========================
     COLUMN DEFINITIONS
     ========================= */

  getColumns(tableId: number): Observable<TableColumn[]> {
    return this.http.get<TableColumn[]>(`${this.apiUrl}/${tableId}/columns`).pipe(
      catchError(this.handleError)
    );
  }

  addColumn(
    tableId: number,
    request: CreateColumnRequest
  ): Observable<TableColumn> {
    return this.http.post<TableColumn>(
      `${this.apiUrl}/${tableId}/columns`,
      request
    ).pipe(catchError(this.handleError));
  }

  deleteColumn(columnId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/columns/${columnId}`).pipe(
      catchError(this.handleError)
    );
  }

  /* =========================
     ROW DATA
     ========================= */

  getRows(tableId: number): Observable<TableRow[]> {
    return this.http.get<TableRow[]>(`${this.apiUrl}/${tableId}/rows`).pipe(
      catchError(this.handleError)
    );
  }

  createRow(
    tableId: number,
    request: CreateRowRequest
  ): Observable<TableRow> {
    return this.http.post<TableRow>(
      `${this.apiUrl}/${tableId}/rows`,
      request
    ).pipe(catchError(this.handleError));
  }

  updateRow(
    tableId: number,
    rowId: number,
    request: UpdateRowRequest
  ): Observable<TableRow> {
    return this.http.put<TableRow>(
      `${this.apiUrl}/${tableId}/rows/${rowId}`,
      request
    ).pipe(catchError(this.handleError));
  }

  deleteRow(tableId: number, rowId: number): Observable<any> {
    return this.http.delete(
      `${this.apiUrl}/${tableId}/rows/${rowId}`
    ).pipe(catchError(this.handleError));
  }

  /* =========================
     ERROR HANDLING
     ========================= */

  private handleError(error: any): Observable<never> {
    console.error('API Error:', error);

    let errorMessage = 'An error occurred';
    if (error.error instanceof ErrorEvent) {
      errorMessage = error.error.message;
    } else if (error.error?.message) {
      errorMessage = error.error.message;
    } else {
      errorMessage = `Error ${error.status}: ${error.message}`;
    }

    return throwError(() => new Error(errorMessage));
  }
}
