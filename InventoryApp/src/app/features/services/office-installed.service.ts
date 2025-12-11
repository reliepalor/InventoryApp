import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { environment } from '../environments/environment';
import { OfficeInstalledItem } from '../models/office-installed';

@Injectable({
  providedIn: 'root',
})
export class OfficeInstalledService {
  private apiUrl = `${environment.apiUrl}/OfficeInstalled/`;

  constructor(private http: HttpClient) {}

  getAllOfficeInstalled(): Observable<OfficeInstalledItem[]> {
    return this.http.get<OfficeInstalledItem[]>(this.apiUrl + "getAll/").pipe(
      catchError(this.handleError)
    );
  }

  getOfficeInstalledById(id: number): Observable<OfficeInstalledItem> {
    return this.http.get<OfficeInstalledItem>(`${this.apiUrl + "getById"}/${id}`).pipe(
      catchError(this.handleError)
    );
  }

  createOfficeInstalled(officeInstalled: CreateOfficeInstalledRequest): Observable<OfficeInstalledItem> {
    return this.http.post<OfficeInstalledItem>(this.apiUrl + "create/", officeInstalled, { observe: 'body' }).pipe(
      catchError(this.handleError)
    );
  }

  updateOfficeInstalled(id: number, officeInstalled: UpdateOfficeInstalledRequest): Observable<OfficeInstalledItem> {
    return this.http.put<OfficeInstalledItem>(`${this.apiUrl + "update"}/${id}`, officeInstalled, { observe: 'body' }).pipe(
      catchError(this.handleError)
    );
  }

  deleteOfficeInstalled(id: number): Observable<any> {
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

export interface CreateOfficeInstalledRequest {
  referenceId: string;
  officeName: string;
  officeVersion: string;
}

export interface UpdateOfficeInstalledRequest {
  id: number;
  referenceId: string;
  officeName: string;
  officeVersion: string;
}
