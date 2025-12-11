// videocard-memory.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { VideocardMemoryItem } from '../models/videocard-memory';

@Injectable({
  providedIn: 'root'
})
export class VideocardMemoryService {

  private apiUrl = '/api/VideocardMemory'; // adjust if your backend uses a different route

  constructor(private http: HttpClient) {}

  // GET ALL
  getAll(): Observable<VideocardMemoryItem[]> {
    return this.http.get<VideocardMemoryItem[]>(this.apiUrl);
  }

  // GET BY ID
  getById(id: number): Observable<VideocardMemoryItem> {
    return this.http.get<VideocardMemoryItem>(`${this.apiUrl}/${id}`);
  }

  // CREATE
  create(model: VideocardMemoryItem): Observable<VideocardMemoryItem> {
    return this.http.post<VideocardMemoryItem>(this.apiUrl, model);
  }

  // UPDATE
  update(id: number, model: VideocardMemoryItem): Observable<VideocardMemoryItem> {
    return this.http.put<VideocardMemoryItem>(`${this.apiUrl}/${id}`, model);
  }

  // DELETE
  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
