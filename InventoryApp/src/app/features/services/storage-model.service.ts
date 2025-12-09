// src/app/features/services/storage-model.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { environment } from '../environments/environment';
import { StorageModelItem } from '../models/storage-model';

@Injectable({
  providedIn: 'root',
})
export class StorageModelService {
  // Adjust backend controller name if backend uses a different endpoint
  private apiUrl = `${environment.apiUrl}/StorageModel/`;

  constructor(private http: HttpClient) {}

  getAllStorageModels(): Observable<StorageModelItem[]> {
    return this.http.get<StorageModelItem[]>(this.apiUrl + 'getAll/').pipe(
      catchError(this.handleError)
    );
  }

  getStorageModelById(id: number): Observable<StorageModelItem> {
    return this.http.get<StorageModelItem>(`${this.apiUrl + 'getById'}/${id}`).pipe(
      catchError(this.handleError)
    );
  }

  createStorageModel(storageModel: CreateStorageModelRequest): Observable<StorageModelItem> {
    return this.http.post<StorageModelItem>(this.apiUrl + 'create/', storageModel, { observe: 'body' }).pipe(
      catchError(this.handleError)
    );
  }

  updateStorageModel(id: number, storageModel: UpdateStorageModelRequest): Observable<StorageModelItem> {
    return this.http.put<StorageModelItem>(`${this.apiUrl + 'update'}/${id}`, storageModel, { observe: 'body' }).pipe(
      catchError(this.handleError)
    );
  }

  deleteStorageModel(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl + 'delete'}/${id}`, { observe: 'response' }).pipe(
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

/* Request DTOs — Adjust according to backend fields */
export interface CreateStorageModelRequest {
  referenceId?: string;
  storageModel: string;
  storageType: string;
}

export interface UpdateStorageModelRequest {
  id: number;
  referenceId?: string;
  storageModel: string;
  storageType: string;
}
