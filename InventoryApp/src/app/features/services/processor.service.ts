import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ProcessorService {
  private apiUrl = `${environment.apiUrl}/Maintenance/`;

  constructor(private http: HttpClient) {}

  getAllProcessors(): Observable<ProcessorItem[]> {
    return this.http.get<ProcessorItem[]>(this.apiUrl + "getAllProcessors/").pipe(
      catchError(this.handleError)
    );
  }

  getProcessorById(id: number): Observable<ProcessorItem> {
    return this.http.get<ProcessorItem>(`${this.apiUrl + "getProcessorById"}/${id}`).pipe(
      catchError(this.handleError)
    );
  }

  createProcessor(processor: CreateProcessorRequest): Observable<ProcessorItem> {
    return this.http.post<ProcessorItem>(this.apiUrl + "createProcessor/", processor, { observe: 'body' }).pipe(
      catchError(this.handleError)
    );
  }

  updateProcessor(id: number, processor: UpdateProcessorRequest): Observable<ProcessorItem> {
    return this.http.put<ProcessorItem>(`${this.apiUrl + "updateProcessor"}/${id}`, processor, { observe: 'body' }).pipe(
      catchError(this.handleError)
    );
  }

  deleteProcessor(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl + "deleteProcessor"}/${id}`, { observe: 'response' }).pipe(
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

// Types used by the processor feature
export interface ProcessorItem {
  id: number;
  referenceId: string;
  processorName: string;
  processorCore: string;
  processorThreads: string;
  iGpu: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface CreateProcessorRequest {
  referenceId: string;
  processorName: string;
  processorCore: string;
  processorThreads: string;
  iGpu: boolean;
}

export interface UpdateProcessorRequest {
  id: number;
  referenceId: string;
  processorName: string;
  processorCore: string;
  processorThreads: string;
  iGpu: boolean;
}