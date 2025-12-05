import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { isPlatformBrowser } from '@angular/common';
import { environment } from 'environments/environment';
import { Observable, tap } from 'rxjs';
import { LoginRequest, RegisterRequest, AuthResponse } from '../models/auth';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private base = environment.apiUrl + '/auth';
  private tokenKey = 'auth_token';
  private userKey = 'auth_user';

  constructor(
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  get isBrowser(): boolean {
    return isPlatformBrowser(this.platformId);
  }

  register(data: RegisterRequest): Observable<any> {
    return this.http.post<any>(`${this.base}/register`, data);
  }

  login(data: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.base}/login`, data).pipe(
      tap(res => {
        if (this.isBrowser && res && res.token) {
          localStorage.setItem(this.tokenKey, res.token);
          if (res.user) {
            localStorage.setItem(this.userKey, JSON.stringify(res.user));
          }
        }
      })
    );
  }

  logout(): void {
    if (this.isBrowser) {
      localStorage.removeItem(this.tokenKey);
      localStorage.removeItem(this.userKey);
    }
  }

  getToken(): string | null {
    if (!this.isBrowser) return null;
    return localStorage.getItem(this.tokenKey);
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  getUser(): any | null {
    if (!this.isBrowser) return null;
    const v = localStorage.getItem(this.userKey);
    return v ? JSON.parse(v) : null;
  }
}
