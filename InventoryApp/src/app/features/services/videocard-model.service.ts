// src/app/features/services/videocard-model.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, throwError, map } from 'rxjs';
import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class VideocardModelService {
  private apiUrl = `${environment.apiUrl}/Maintenance/`;

  constructor(private http: HttpClient) {}

  /**
   * Return a normalized array of VideoCardItem regardless of backend field names.
   */
  getAllVideocards(): Observable<VideoCardItem[]> {
    return this.http.get<any[]>(this.apiUrl + 'getAllVideoCards/').pipe(
      map(items => (items || []).map(i => this.mapToFrontend(i))),
      catchError(this.handleError)
    );
  }

  /**
   * Get single item by id (number or string). Response normalized to VideoCardItem.
   */
  getVideocardById(id: number | string): Observable<VideoCardItem> {
    return this.http.get<any>(`${this.apiUrl + 'getVideocardById'}/${id}`).pipe(
      map(i => this.mapToFrontend(i)),
      catchError(this.handleError)
    );
  }

  /**
   * Create a new videoc ard. Accepts CreateVideoCardRequest (frontend shape).
   * Returns normalized VideoCardItem.
   */
  createVideocard(videocard: CreateVideoCardRequest): Observable<VideoCardItem> {
    return this.http.post<any>(this.apiUrl + 'createVideocard/', videocard, { observe: 'body' }).pipe(
      map(i => this.mapToFrontend(i)),
      catchError(this.handleError)
    );
  }

  /**
   * Update an existing videoc ard. id may be number or string.
   * Returns normalized VideoCardItem.
   */
  updateVideocard(id: number | string, videocard: UpdateVideoCardRequest): Observable<VideoCardItem> {
    return this.http.put<any>(`${this.apiUrl + 'updateVideocard'}/${id}`, videocard, { observe: 'body' }).pipe(
      map(i => this.mapToFrontend(i)),
      catchError(this.handleError)
    );
  }

  /**
   * Delete by id. Returns the raw server response (status, etc).
   */
  deleteVideocard(id: number | string): Observable<any> {
    return this.http.delete(`${this.apiUrl + 'deleteVideocard'}/${id}`, { observe: 'response' }).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Normalize backend response fields to VideoCardItem used by frontend.
   * Handles older names like modelName, chipset, _id, etc.
   */
  private mapToFrontend(item: any): VideoCardItem {
    if (!item) {
      return {
        id: undefined,
        referenceId: '',
        videoCardName: '',
        videoCardChipset: ''
      };
    }

    return {
      id: item.id ?? item._id ?? undefined,
      referenceId: item.referenceId ?? item.referenceID ?? item._id ?? (item.id ? String(item.id) : ''),
      videoCardName: item.videoCardName ?? item.modelName ?? item.name ?? '',
      videoCardChipset: item.videoCardChipset ?? item.chipset ?? item.videoCardChip ?? ''
    };
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
 * Types used by the Video Card service (frontend shape)
 * Keep these in sync with the page/component expectations.
 */

export interface VideoCardItem {
  // id may be numeric (SQL) or string (Mongo/_id) depending on backend; keep optional
  id?: number | string;

  // reference identifier from backend (might be ObjectId string or custom ref)
  referenceId?: string;

  // frontend fields that map to backend DTO
  videoCardName?: string;
  videoCardChipset?: string;

  // optional legacy / extra fields you might still use elsewhere
  modelName?: string;
  manufacturer?: string;
  memoryGb?: number;
  created_at?: string;
  updated_at?: string;
}

export interface CreateVideoCardRequest {
  referenceId?: string;
  videoCardName: string;
  videoCardChipset: string;
  // optional extras (if backend accepts them)
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
  id?: number | string;
  referenceId?: string;
  videoCardName?: string;
  videoCardChipset?: string;
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
