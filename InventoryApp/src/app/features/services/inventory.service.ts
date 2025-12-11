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

  createInventory(payload: CreateInventoryRequest): Observable<InventoryItem> {
    return this.http.post<InventoryItem>(this.apiUrl + 'createInventory/', payload, { observe: 'body' }).pipe(
      catchError(this.handleError)
    );
  }

  updateInventory(id: number, payload: UpdateInventoryRequest): Observable<InventoryItem> {
    return this.http.put<InventoryItem>(`${this.apiUrl + 'updateInventory'}/${id}`, payload, { observe: 'body' }).pipe(
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
 * Inventory types used by the inventory feature
 */
export interface InventoryItem {
  id: number;
  tagNumber: string;
  datePurchased: string | Date;
  department?: string;
  assignedTo?: string;
  type?: string;
  brand?: string;
  model?: string;
  motherboard?: string;
  officeInstalled?: boolean;
  osInstalled?: string;
  processor?: string;
  ramModel?: string;
  ramSize?: string;
  storageModel?: string;
  storageSize?: string;
  videoMemory?: string;
  videoModel?: string;
  // additional optional fields you might need can be added here (e.g., location, status)
}

export interface CreateInventoryRequest {
  tagNumber: string;
  datePurchased: string | Date;
  department?: string;
  assignedTo?: string;
  type?: string;
  brand?: string;
  // add other fields required by your API
}

export interface UpdateInventoryRequest {
  id: number;
  tagNumber: string;
  datePurchased: string | Date;
  department?: string;
  assignedTo?: string;
  type?: string;
  brand?: string;
  // add other fields required by your API
}
