import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { environment } from '../environments/environment';
import { BrandCreateRequest, Brands, BrandUpdateRequest } from '../model';

@Injectable({
  providedIn: 'root',
})
export class BrandServices {
  private apiUrl = `${environment.apiUrl}/Maintenance/`;
  constructor(private http: HttpClient) {}

  getAllBrands(): Observable<Brands[]> {
    const token = localStorage.getItem('accessToken') || '';
    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });

    return this.http.get<Brands[]>(`${this.apiUrl}GetAllBrands`, { headers }).pipe(
      catchError((error) => {
        console.error('Error fetching brands:', error);
        return throwError(() => new Error('Failed to fetch brands. Please try again later.'));
      })
    );
  }
  getBrandById(id: number): Observable<Brands> {
    const token = localStorage.getItem('accessToken') || '';
    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });

    return this.http.get<Brands>(`${this.apiUrl}GetBrandById/${id}`, { headers }).pipe(
      catchError((error) => {
        console.error(`Error fetching brand with id ${id}:`, error);
        return throwError(() => new Error('Failed to fetch brand. Please try again later.'));
      })
    );
  }
  createBrand(brand: BrandCreateRequest): Observable<Brands> {

    const token = localStorage.getItem('accessToken') || '';

    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`
    });

    return this.http.post<Brands>(
      `${this.apiUrl}CreateBrand`,
      brand,
      { headers }
    ).pipe(
      catchError((error) => {
        console.error('Error creating brand:', error);
        return throwError(() => new Error('Failed to create brand.'));
      })
    );
  }
  updateBrand(id: number, brand: BrandUpdateRequest): Observable<Brands> {
    const token = localStorage.getItem('accessToken') || '';
    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });

    return this.http.put<Brands>(`${this.apiUrl}UpdateBrand/${id}`, brand, { headers }).pipe(
      catchError((error) => {
        console.error(`Error updating brand with id ${id}:`, error);
        return throwError(() => new Error('Failed to update brand. Please try again later.'));
      })
    );
  }
  deleteBrand(id: number): Observable<void> {
    const token = localStorage.getItem('accessToken') || '';
    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });

    return this.http.delete<void>(`${this.apiUrl}DeleteBrand/${id}`, { headers }).pipe(
      catchError((error) => {
        console.error(`Error deleting brand with id ${id}:`, error);
        return throwError(() => new Error('Failed to delete brand. Please try again later.'));
      })
    );
  }
}
