// src/app/features/services/storage-size.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { environment } from '../environments/environment';
import { StorageSizeItem } from '../models/storage-size';

@Injectable({
  providedIn: 'root',
})
export class StorageSizeService {
  // Ensure this matches your backend route. Adjust the controller name if needed.
  private apiUrl = `${environment.apiUrl}/StorageSize/`;

  constructor(private http: HttpClient) {}

  getAllStorageSizes(): Observable<StorageSizeItem[]> {
    return this.http.get<StorageSizeItem[]>(this.apiUrl + 'getAll/').pipe(
      catchError(this.handleError)
    );
  }

  getStorageSizeById(id: number): Observable<StorageSizeItem> {
    return this.http.get<StorageSizeItem>(`${this.apiUrl + 'getById'}/${id}`).pipe(
      catchError(this.handleError)
    );
  }

  createStorageSize(payload: CreateStorageSizeRequest): Observable<StorageSizeItem> {
    return this.http.post<StorageSizeItem>(this.apiUrl + 'create/', payload, { observe: 'body' }).pipe(
      catchError(this.handleError)
    );
  }

  updateStorageSize(id: number, payload: UpdateStorageSizeRequest): Observable<StorageSizeItem> {
    return this.http.put<StorageSizeItem>(`${this.apiUrl + 'update'}/${id}`, payload, { observe: 'body' }).pipe(
      catchError(this.handleError)
    );
  }

  deleteStorageSize(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl + 'delete'}/${id}`, { observe: 'response' }).pipe(
      catchError(this.handleError)
    );
  }

  private handleError(error: any): Observable<never> {
    console.error('API Error:', error);
    let errorMessage = 'An error occurred';

    if (error.error instanceof ErrorEvent) {
      // client-side / network error
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // backend error
      errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
      if (error.error?.message) {
        errorMessage = error.error.message;
      }
    }

    return throwError(() => new Error(errorMessage));
  }
}

/* Request DTOs — adjust fields to match your backend contract */
export interface CreateStorageSizeRequest {
  referenceId?: string;
  storageModel: string;
  storageSize: string; // e.g. "512 GB", "1 TB"
}

export interface UpdateStorageSizeRequest {
  id: number;
  referenceId?: string;
  storageModel: string;
  storageSize: string;
}
