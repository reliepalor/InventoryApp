import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ModelService {
  private apiUrl = `${environment.apiUrl}/Maintenance/`;

  constructor(private http: HttpClient) {}

  getAllModels(): Observable<ModelItem[]> {
    return this.http.get<ModelItem[]>(this.apiUrl + "getAllModels/").pipe(
      catchError(this.handleError)
    );
  }

  getModelById(id: number): Observable<ModelItem> {
    return this.http.get<ModelItem>(`${this.apiUrl + "getBrandModelById"}/${id}`).pipe(
      catchError(this.handleError)
    );
  }

  createModel(model: CreateModelRequest): Observable<ModelItem> {
    return this.http.post<ModelItem>(this.apiUrl + "createModel/", model, { observe: 'body' }).pipe(
      catchError(this.handleError)
    );
  }

  updateModel(id: number, model: UpdateModelRequest): Observable<ModelItem> {
    return this.http.put<ModelItem>(`${this.apiUrl + "updateModel"}/${id}`, model, { observe: 'body' }).pipe(
      catchError(this.handleError)
    );
  }

  deleteModel(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl + "deleteModel"}/${id}`, { observe: 'response' }).pipe(
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

// Types used by the model feature
export interface ModelItem {
  id: number;
  referenceId: string;
  modelName: string;
  created_at?: string;
  updated_at?: string;
}

export interface CreateModelRequest {
  referenceId: string;
  modelName: string;
}

export interface UpdateModelRequest {
  id: number;
  referenceId: string;
  modelName: string;
}
