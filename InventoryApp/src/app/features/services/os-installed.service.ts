import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { environment } from '../environments/environment';
import { OsInstalledItem } from '../models/os-installed';

@Injectable({
  providedIn: 'root',
})
export class OsInstalledService {
  private apiUrl = `${environment.apiUrl}/OsInstalled/`;

  constructor(private http: HttpClient) {}

  getAllOsInstalled(): Observable<OsInstalledItem[]> {
    return this.http.get<OsInstalledItem[]>(this.apiUrl + "getAll/").pipe(
      catchError(this.handleError)
    );
  }

  getOsInstalledById(id: number): Observable<OsInstalledItem> {
    return this.http.get<OsInstalledItem>(`${this.apiUrl + "getById"}/${id}`).pipe(
      catchError(this.handleError)
    );
  }

  createOsInstalled(osInstalled: CreateOsInstalledRequest): Observable<OsInstalledItem> {
    return this.http.post<OsInstalledItem>(this.apiUrl + "create/", osInstalled, { observe: 'body' }).pipe(
      catchError(this.handleError)
    );
  }

  updateOsInstalled(id: number, osInstalled: UpdateOsInstalledRequest): Observable<OsInstalledItem> {
    return this.http.put<OsInstalledItem>(`${this.apiUrl + "update"}/${id}`, osInstalled, { observe: 'body' }).pipe(
      catchError(this.handleError)
    );
  }

  deleteOsInstalled(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl + "delete"}/${id}`, { observe: 'response' }).pipe(
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

export interface CreateOsInstalledRequest {
  referenceId: string;
  osName: string;
  osVersion: string;
}

export interface UpdateOsInstalledRequest {
  id: number;
  referenceId: string;
  osName: string;
  osVersion: string;
}
