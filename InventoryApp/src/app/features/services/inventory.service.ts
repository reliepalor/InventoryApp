// src/app/features/services/inventory.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class InventoryService {
  private apiUrl = `${environment.apiUrl}/Maintenance/`;

  constructor(private http: HttpClient) {}

  getAllInventory(): Observable<InventoryItem[]> {
    return this.http.get<InventoryItem[]>(this.apiUrl + 'getAllInventory/').pipe(
      catchError(this.handleError)
    );
  }

  getInventoryById(id: number): Observable<InventoryItem> {
    return this.http.get<InventoryItem>(`${this.apiUrl + 'getInventoryById'}/${id}`).pipe(
      catchError(this.handleError)
    );
  }

  createInventory(item: CreateInventoryRequest): Observable<InventoryItem> {
    return this.http.post<InventoryItem>(this.apiUrl + 'createInventory/', item, { observe: 'body' }).pipe(
      catchError(this.handleError)
    );
  }

  updateInventory(id: number, item: UpdateInventoryRequest): Observable<InventoryItem> {
    return this.http.put<InventoryItem>(`${this.apiUrl + 'updateInventory'}/${id}`, item, { observe: 'body' }).pipe(
      catchError(this.handleError)
    );
  }

  deleteInventory(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl + 'deleteInventory'}/${id}`, { observe: 'response' }).pipe(
      catchError(this.handleError)
    );
  }

  private handleError(error: any): Observable<never> {
    console.error('API Error:', error);
    let errorMessage = 'An error occurred';

    if (error.error instanceof ErrorEvent) {
      errorMessage = `Error: ${error.error.message}`;
    } else {
      errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
      if (error.error?.message) {
        errorMessage = error.error.message;
      }
    }

    return throwError(() => new Error(errorMessage));
  }
}

/**
 * Inventory item types used by the inventory feature
 *
 * Fields chosen to match your inventory table columns:
 * - brand, model, motherboard
 * - officeInstalled (boolean) => Office Installed
 * - osInstalled => OS Installed
 * - processor => Processor (string)
 * - ramModel, ramSize
 * - storageModel, storageSize
 * - videoMemory, videoModel
 *
 * id and optional referenceId included for record identity (adjust as needed).
 */

export interface InventoryItem {
  id: number;
  // optional identifier if you use an asset tag/reference id
  referenceId?: string | null;

  brand?: string | null;
  model?: string | null;
  motherboard?: string | null;

  // true = installed, false = not installed, null = unknown / not set
  officeInstalled?: boolean | null;

  osInstalled?: string | null;
  processor?: string | null;

  ramModel?: string | null;
  // use string so you can store "8 GB", "16GB (2x8)" etc.
  ramSize?: string | null;

  storageModel?: string | null;
  storageSize?: string | null;

  // GPU/video card info
  videoMemory?: string | null; // e.g. "4 GB", "512 MB"
  videoModel?: string | null;

  // optional metadata
  created_at?: string | null;
  updated_at?: string | null;
}

export interface CreateInventoryRequest {
  referenceId?: string | null;

  brand?: string | null;
  model?: string | null;
  motherboard?: string | null;

  officeInstalled?: boolean | null;

  osInstalled?: string | null;
  processor?: string | null;

  ramModel?: string | null;
  ramSize?: string | null;

  storageModel?: string | null;
  storageSize?: string | null;

  videoMemory?: string | null;
  videoModel?: string | null;
}

export interface UpdateInventoryRequest {
  id: number;
  referenceId?: string | null;

  brand?: string | null;
  model?: string | null;
  motherboard?: string | null;

  officeInstalled?: boolean | null;

  osInstalled?: string | null;
  processor?: string | null;

  ramModel?: string | null;
  ramSize?: string | null;

  storageModel?: string | null;
  storageSize?: string | null;

  videoMemory?: string | null;
  videoModel?: string | null;
}
