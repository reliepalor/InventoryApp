// src/app/features/services/videocard-model.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class VideocardModelService {
  private apiUrl = `${environment.apiUrl}/Maintenance/`;

  constructor(private http: HttpClient) {}

  getAllVideocards(): Observable<VideoCardItem[]> {
    return this.http.get<VideoCardItem[]>(this.apiUrl + 'getAllVideoCards/').pipe(
      catchError(this.handleError)
    );
  }

  getVideocardById(id: number): Observable<VideoCardItem> {
    return this.http.get<VideoCardItem>(`${this.apiUrl + 'getVideocardById'}/${id}`).pipe(
      catchError(this.handleError)
    );
  }

  createVideocard(videocard: CreateVideoCardRequest): Observable<VideoCardItem> {
    return this.http.post<VideoCardItem>(this.apiUrl + 'createVideocard/', videocard, { observe: 'body' }).pipe(
      catchError(this.handleError)
    );
  }

  updateVideocard(id: number, videocard: UpdateVideoCardRequest): Observable<VideoCardItem> {
    return this.http.put<VideoCardItem>(`${this.apiUrl + 'updateVideocard'}/${id}`, videocard, { observe: 'body' }).pipe(
      catchError(this.handleError)
    );
  }

  deleteVideocard(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl + 'deleteVideocard'}/${id}`, { observe: 'response' }).pipe(
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

/**
 * Types used by the Video Card feature
 *
 * NOTE: adjust field names to match your backend DTOs (for example: modelName vs videoCardModel,
 * memoryGb vs vramGb, etc.). These are sensible defaults that match the table component provided earlier.
 */

export interface VideoCardItem {
  id: number;
  referenceId: string;
  modelName: string;           // e.g. "RTX 4070 Ti"
  manufacturer?: string;       // e.g. "NVIDIA / ASUS"
  memoryGb?: number;           // VRAM size in GB
  memoryType?: string;         // e.g. "GDDR6X"
  memoryBus?: number;          // e.g. 256 (bits)
  coreClock?: number;          // MHz
  boostClock?: number;         // MHz
  tdp?: number;                // Watts
  pciExpress?: string;         // e.g. "PCIe 4.0 x16"
  outputs?: string[];          // e.g. ["HDMI", "DisplayPort"]
  lengthMm?: number;           // physical length in mm (optional)
  created_at?: string;
  updated_at?: string;
}

export interface CreateVideoCardRequest {
  referenceId: string;
  modelName: string;
  manufacturer?: string;
  memoryGb?: number;
  memoryType?: string;
  memoryBus?: number;
  coreClock?: number;
  boostClock?: number;
  tdp?: number;
  pciExpress?: string;
  outputs?: string[];
  lengthMm?: number;
}

export interface UpdateVideoCardRequest {
  id: number;
  referenceId: string;
  modelName: string;
  manufacturer?: string;
  memoryGb?: number;
  memoryType?: string;
  memoryBus?: number;
  coreClock?: number;
  boostClock?: number;
  tdp?: number;
  pciExpress?: string;
  outputs?: string[];
  lengthMm?: number;
}
