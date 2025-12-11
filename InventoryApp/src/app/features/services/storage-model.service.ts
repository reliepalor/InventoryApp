// src/app/features/services/storage-model.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../environments/environment';
import { StorageModelItem } from '../models/storage-model';

@Injectable({
  providedIn: 'root',
})
export class StorageModelService {
  // Adjust backend controller name if backend uses a different endpoint
  private apiUrl = `${environment.apiUrl}/StorageModel/`;

  constructor(private http: HttpClient) {}

  private mapToItem(dto: any): StorageModelItem {
    // normalize the backend response to our frontend interface
    return {
      id: dto?.id ?? dto?.Id ?? 0,
      referenceId: dto?.referenceId ?? dto?.referenceID ?? dto?.reference_id ?? null,
      storageName: dto?.storageName ?? dto?.storage_name ?? dto?.storageModel ?? '',
      storageType: dto?.storageType ?? dto?.storage_type ?? '',
      storageInterface: dto?.storageInterface ?? dto?.storage_interface ?? '',
    };
  }

  getAllStorageModels(): Observable<StorageModelItem[]> {
    return this.http.get<any[]>(this.apiUrl + 'getAll/').pipe(
      map((arr) => (Array.isArray(arr) ? arr.map((x) => this.mapToItem(x)) : [])),
      catchError(this.handleError)
    );
  }

  getStorageModelById(id: number): Observable<StorageModelItem> {
    return this.http.get<any>(`${this.apiUrl + 'getById'}/${id}`).pipe(
      map((dto) => this.mapToItem(dto)),
      catchError(this.handleError)
    );
  }

  createStorageModel(storageModel: CreateStorageModelRequest): Observable<StorageModelItem> {
    return this.http.post<any>(this.apiUrl + 'create/', storageModel).pipe(
      map((dto) => this.mapToItem(dto)),
      catchError(this.handleError)
    );
  }

  updateStorageModel(id: number, storageModel: UpdateStorageModelRequest): Observable<StorageModelItem> {
    return this.http.put<any>(`${this.apiUrl + 'update'}/${id}`, storageModel).pipe(
      map((dto) => this.mapToItem(dto)),
      catchError(this.handleError)
    );
  }

  deleteStorageModel(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl + 'delete'}/${id}`).pipe(
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

/* Request DTOs — match backend fields */
export interface CreateStorageModelRequest {
  referenceId?: string;
  storageName: string;
  storageType: string;
  storageInterface?: string;
}

/* Update request should NOT include `id` — the id is passed via the route parameter */
export interface UpdateStorageModelRequest {
  referenceId?: string;
  storageName: string;
  storageType: string;
  storageInterface?: string;
}
