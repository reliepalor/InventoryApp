// src/app/features/services/ram-size.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { environment } from '../environments/environment';
import { RamSizeItem } from '../models/ram-size';

@Injectable({
  providedIn: 'root',
})
export class RamSizeService {
  private apiUrl = `${environment.apiUrl}/RamSize/`;

  constructor(private http: HttpClient) {}

  getAllRamSizes(): Observable<RamSizeItem[]> {
    return this.http.get<RamSizeItem[]>(this.apiUrl + 'getAll/').pipe(
      catchError(this.handleError)
    );
  }

  getRamSizeById(id: number): Observable<RamSizeItem> {
    return this.http.get<RamSizeItem>(`${this.apiUrl + 'getById'}/${id}`).pipe(
      catchError(this.handleError)
    );
  }

  createRamSize(ramSize: CreateRamSizeRequest): Observable<RamSizeItem> {
    return this.http.post<RamSizeItem>(this.apiUrl + 'create/', ramSize, { observe: 'body' }).pipe(
      catchError(this.handleError)
    );
  }

  updateRamSize(id: number, ramSize: UpdateRamSizeRequest): Observable<RamSizeItem> {
    return this.http.put<RamSizeItem>(`${this.apiUrl + 'update'}/${id}`, ramSize, { observe: 'body' }).pipe(
      catchError(this.handleError)
    );
  }

  deleteRamSize(id: number): Observable<any> {
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

/* DTOs — match your backend expectations */
export interface CreateRamSizeRequest {
  referenceId?: string;
  size: string;        // e.g. "8GB", "16GB"
}

export interface UpdateRamSizeRequest {
  id: number;
  referenceId?: string;
  size: string;
}
