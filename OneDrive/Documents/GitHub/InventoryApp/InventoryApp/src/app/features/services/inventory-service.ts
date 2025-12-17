import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { environment } from '../environments/environment';
import { Inventy } from '../model';

@Injectable({
  providedIn: 'root',
})
export class InventoryService {
  private apiUrl = `${environment.apiUrl}/Inventy/`;

  constructor(private http: HttpClient) {}

  getAllInventory(): Observable<Inventy[]> {
    const token = localStorage.getItem('accessToken') || '';
    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });

    return this.http.get<Inventy[]>(`${this.apiUrl}GetAllInventory`, { headers }).pipe(
      catchError((error) => {
        console.error('Error fetching inventory:', error);
        return throwError(() => new Error('Failed to fetch inventory. Please try again later.'));
      })
    );
  }

  getInventoryById(id: number): Observable<Inventy> {
    const token = localStorage.getItem('accessToken') || '';
    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });

    return this.http.get<Inventy>(`${this.apiUrl}GetInventoryById/${id}`, { headers }).pipe(
      catchError((error) => {
        console.error(`Error fetching inventory with id ${id}:`, error);
        return throwError(() => new Error('Failed to fetch inventory. Please try again later.'));
      })
    );
  }

  createInventory(inventory: Partial<Inventy>): Observable<Inventy> {
    const token = localStorage.getItem('accessToken') || '';
    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });

    return this.http.post<Inventy>(`${this.apiUrl}CreateInventory`, inventory, { headers }).pipe(
      catchError((error) => {
        console.error('Error creating inventory:', error);
        return throwError(() => new Error('Failed to create inventory.'));
      })
    );
  }

  updateInventory(id: number, inventory: Partial<Inventy>): Observable<Inventy> {
    const token = localStorage.getItem('accessToken') || '';
    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });

    return this.http.put<Inventy>(`${this.apiUrl}UpdateInventory/${id}`, inventory, { headers }).pipe(
      catchError((error) => {
        console.error(`Error updating inventory with id ${id}:`, error);
        return throwError(() => new Error('Failed to update inventory. Please try again later.'));
      })
    );
  }

  deleteInventory(id: number): Observable<void> {
    const token = localStorage.getItem('accessToken') || '';
    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });

    return this.http.delete<void>(`${this.apiUrl}DeleteInventory/${id}`, { headers }).pipe(
      catchError((error) => {
        console.error(`Error deleting inventory with id ${id}:`, error);
        return throwError(() => new Error('Failed to delete inventory. Please try again later.'));
      })
    );
  }
}
