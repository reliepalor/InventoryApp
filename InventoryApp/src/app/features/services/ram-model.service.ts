// src/app/features/services/ram-model.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { environment } from '../environments/environment';
import { RamModelItem } from '../models/ram-model';

@Injectable({
  providedIn: 'root',
})
export class RamModelService {
  // Ensure this matches your backend route. Adjust the controller name if needed.
  private apiUrl = `${environment.apiUrl}/RamModel/`;

  constructor(private http: HttpClient) {}

  getAllRamModels(): Observable<RamModelItem[]> {
    return this.http.get<RamModelItem[]>(this.apiUrl + 'getAll/').pipe(
      catchError(this.handleError)
    );
  }

  getRamModelById(id: number): Observable<RamModelItem> {
    return this.http.get<RamModelItem>(`${this.apiUrl + 'getById'}/${id}`).pipe(
      catchError(this.handleError)
    );
  }

  createRamModel(ramModel: CreateRamModelRequest): Observable<RamModelItem> {
    return this.http.post<RamModelItem>(this.apiUrl + 'create/', ramModel, { observe: 'body' }).pipe(
      catchError(this.handleError)
    );
  }

  updateRamModel(id: number, ramModel: UpdateRamModelRequest): Observable<RamModelItem> {
    return this.http.put<RamModelItem>(`${this.apiUrl + 'update'}/${id}`, ramModel, { observe: 'body' }).pipe(
      catchError(this.handleError)
    );
  }

  deleteRamModel(id: number): Observable<any> {
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
export interface CreateRamModelRequest {
  referenceId?: string;
  ramModel: string;
  ramType: string;
}

export interface UpdateRamModelRequest {
  id: number;
  referenceId?: string;
  ramModel: string;
  ramType: string;
}
