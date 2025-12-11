// src/app/features/services/brand.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class BrandService {
  private apiUrl = `${environment.apiUrl}/Maintenance/`;

  constructor(private http: HttpClient) {}

  getAllBrands(): Observable<BrandItem[]> {
    return this.http.get<BrandItem[]>(this.apiUrl + "getAllBrands/").pipe(
      catchError(this.handleError)
    );
  }

  getBrandById(id: number): Observable<BrandItem> {
    return this.http.get<BrandItem>(`${this.apiUrl + "getBrandById"}/${id}`).pipe(
      catchError(this.handleError)
    );
  }

  createBrand(brand: CreateBrandRequest): Observable<BrandItem> {
    return this.http.post<BrandItem>(this.apiUrl + "createBrand/", brand, { observe: 'body' }).pipe(
      catchError(this.handleError)
    );
  }

  updateBrand(id: number, brand: UpdateBrandRequest): Observable<BrandItem> {
    return this.http.put<BrandItem>(`${this.apiUrl + "updateBrand"}/${id}`, brand, { observe: 'body' }).pipe(
      catchError(this.handleError)
    );
  }

  deleteBrand(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl + "deleteBrand"}/${id}`, { observe: 'response' }).pipe(
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

// Types used by the brand feature
export interface BrandItem {
  id: number;
  referenceId: string;
  modelId?: number;
  motherboardId?: number;
  officeInstalledId?: number;
  osInstalledId?: number;
  processorId?: number;
  ramModelId?: number;
  ramSizeId?: number;
  ramSizeIds?: number[];
  storageModelId?: number;
  storageSizeId?: number;
  videocardMemoryId?: number;
  videocardModelId?: number;
}

export interface CreateBrandRequest {
  referenceId: string;
  modelId?: number;
  motherboardId?: number;
  officeInstalledId?: number;
  osInstalledId?: number;
  processorId?: number;
  ramModelId?: number;
  ramSizeId?: number;
  ramSizeIds?: number[];
  storageModelId?: number;
  storageSizeId?: number;
  videocardMemoryId?: number;
  videocardModelId?: number;
}

export interface UpdateBrandRequest {
  id: number;
  referenceId: string;
  modelId?: number;
  motherboardId?: number;
  officeInstalledId?: number;
  osInstalledId?: number;
  processorId?: number;
  ramModelId?: number;
  ramSizeId?: number;
  ramSizeIds?: number[];
  storageModelId?: number;
  storageSizeId?: number;
  videocardMemoryId?: number;
  videocardModelId?: number;
}
