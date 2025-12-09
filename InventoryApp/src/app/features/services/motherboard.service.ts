import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { environment } from '../environments/environment';
import { MotherboardCreateRequest, MotherboardUpdateRequest } from '../models/maintenance';

export interface MotherboardItem {
  id: number;
  referenceId: string;
  mbName: string;
  mbSocket: string;
  mbChipset: string;
  mbDescription: string;
  created_at?: string;
  updated_at?: string;
}

@Injectable({
  providedIn: 'root',
})
export class MotherboardService {
  private apiUrl = `${environment.apiUrl}/Maintenance/`;

  constructor(private http: HttpClient) {}

  getAllMotherboards(): Observable<MotherboardItem[]> {
    return this.http.get<MotherboardItem[]>(this.apiUrl + "getAllMotherboard").pipe(
      catchError(this.handleError)
    );
  }

  getMotherboardById(id: number): Observable<MotherboardItem> {
    return this.http.get<MotherboardItem>(`${this.apiUrl + "getMotherboardById"}/${id}`).pipe(
      catchError(this.handleError)
    );
  }

  createMotherboard(motherboard: MotherboardCreateRequest): Observable<MotherboardItem> {
    return this.http.post<MotherboardItem>(this.apiUrl + "createMotherboard/", motherboard, { observe: 'body' }).pipe(
      catchError(this.handleError)
    );
  }

  updateMotherboard(id: number, motherboard: MotherboardUpdateRequest): Observable<MotherboardItem> {
    return this.http.put<MotherboardItem>(`${this.apiUrl + "updateMotherboard"}/${id}`, motherboard, { observe: 'body' }).pipe(
      catchError(this.handleError)
    );
  }

  deleteMotherboard(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}deleteMotherboard/${id}`, { observe: 'response' }).pipe(
      catchError(this.handleError)
    );
  }

  private handleError(error: any): Observable<never> {
    console.error('API Error Details:', error);
    console.error('Error Status:', error.status);
    console.error('Error Body:', error.error);
    
    let errorMessage = 'An error occurred';
    
    if (error.error instanceof ErrorEvent) {
      errorMessage = `Error: ${error.error.message}`;
    } else {
      errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
      if (error.error?.message) {
        errorMessage = error.error.message;
      } else if (error.error?.title) {
        errorMessage = error.error.title;
      } else if (typeof error.error === 'string') {
        errorMessage = error.error;
      }
    }
    
    return throwError(() => new Error(errorMessage));
  }
}
