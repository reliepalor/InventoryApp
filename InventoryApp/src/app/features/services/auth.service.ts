import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { tap, map, catchError } from 'rxjs/operators';
import { delay as rxDelay } from 'rxjs/operators';
import { isPlatformBrowser } from '@angular/common';
import { environment } from '../environments/environment';

// Local interfaces aligned to component usage
interface LoginRequest { username: string; password: string; }
interface RegisterRequest { username: string; password: string; confirmPassword: string; }
interface LoginResponse { token?: string; [key: string]: any }

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = environment.apiUrl;
  private tokenKey = 'auth_token';
  private userKey = 'auth_user';

  // static config
  private staticEnabled = !!(environment as any)?.authStatic?.enabled;
  private staticUsers: { username: string; password: string; token: string }[] = (environment as any)?.authStatic?.users || [];
  private staticDelay = (environment as any)?.authStatic?.delayMs ?? 300;

  constructor(private http: HttpClient, @Inject(PLATFORM_ID) private platformId: Object) {}

  get isBrowser(): boolean {
    return isPlatformBrowser(this.platformId);
  }

  register(data: RegisterRequest): Observable<any> {
    const payload = { 
      username: data.username.trim(), 
      password: data.password, 
      confirmPassword: data.confirmPassword 
    };
    const endpoints = this.buildEndpointCandidates('register');
    return this.postWithFallback<any>(endpoints, payload, true).pipe(
      map(res => res)
    ); 
  }

  private buildEndpointCandidates(action: 'login' | 'register'): string[] {
    const cfg = environment as any;
    const configured = cfg?.authPaths?.[action] as string | undefined;
    const list: string[] = [];
    if (configured) list.push(configured);
    // Common ASP.NET/Identity patterns
    if (action === 'login') {
      list.push('/auth/login', '/account/login', '/authentication/login', '/account/signin');
    } else {
      list.push('/auth/register', '/account/register', '/authentication/register', '/account/signup');
    }
    // Make unique
    return Array.from(new Set(list));
  }

  private postWithFallback<T>(paths: string[], body: any, withCredentials = false): Observable<T> {
    if (!paths.length) return throwError(() => ({ message: 'No endpoints configured' }));

    const tryPost = (index: number): Observable<T> => {
      const url = this.apiBase + paths[index];
      return this.http.post<T>(url, body, { withCredentials }).pipe(
        catchError(err => {
          const status = err?.status;
          // Try next path on 404/405 indicating wrong endpoint path
          if (index + 1 < paths.length && (status === 404 || status === 405)) {
            return tryPost(index + 1);
          }
          return throwError(() => this.normalizeError(err));
        })
      );
    };
    return tryPost(0);
  }

  private normalizeError(err: any) {
    const e = err?.error ?? err;
    const modelState = e?.errors || e?.ModelState;
    const firstModelError = modelState
      ? Object.values(modelState).flat().map(String)[0]
      : undefined;
    
    // Check for specific backend error messages
    let message = e?.message || e?.title || firstModelError;
    
    // Handle specific HTTP status codes
    if (err?.status === 400) {
      message = e?.error || e || 'Invalid username or password';
    } else if (err?.status === 401) {
      message = 'Invalid username or password';
    } else if (err?.status === 404) {
      message = 'No account found';
    } else if (!message) {
      message = 'Unable to connect to server. Please try again.';
    }
    
    return { ...err, message };
  }
  private get apiBase(): string {
    return this.apiUrl.endsWith('/') ? this.apiUrl.slice(0, -1) : this.apiUrl;
  }

  login(data: LoginRequest): Observable<LoginResponse> {
    // If static auth is enabled, short-circuit to static login
    if (this.staticEnabled) {
      return this.loginStatic(data);
    }

    const payload = {
      username: data.username.trim(),
      password: data.password,
    };
    const candidates = this.buildEndpointCandidates('login');
    // withCredentials: true enables cookie handling (cookie is set first by backend)
    return this.postWithFallback<LoginResponse>(candidates, payload, true).pipe(
      tap(res => {
        // After cookie is set by backend, store the JWT token from response
        if (res && res.token) {
          this.setToken(res.token);
        }
      })
    );
  }

  // static login implementation
  private loginStatic(data: LoginRequest): Observable<LoginResponse> {
    const username = (data.username || '').trim();
    const password = data.password || '';

    const found = this.staticUsers.find(u => u.username === username && u.password === password);

    if (!found) {
      // simulate HTTP-style error shape and delay
      return throwError(() => ({ status: 401, message: 'Invalid username or password' })).pipe(rxDelay(this.staticDelay));
    }

    const res: LoginResponse = { token: found.token, username: found.username };
    if (res && res.token) {
      this.setToken(res.token);
      if (this.isBrowser) {
        localStorage.setItem(this.userKey, JSON.stringify({ username: found.username }));
      }
    }
    return of(res).pipe(rxDelay(this.staticDelay));
  }

  getToken(): string | null {
    if (!this.isBrowser) return null;
    return localStorage.getItem(this.tokenKey);
  }

  setToken(token: string): void {
    if (!this.isBrowser) return;
    localStorage.setItem(this.tokenKey, token);
  }
  
  isLoggedIn(): boolean {
    const token = this.getToken();
    if (!token) return false;
    
    // Check if token is expired
    return !this.isTokenExpired(token);
  }
  
  private isTokenExpired(token: string): boolean {
    try {
      const payload = this.decodeToken(token);

      // If token can't be decoded and static mode enabled, treat as NOT expired
      if (!payload) {
        return this.staticEnabled ? false : true;
      }

      if (!payload.exp) {
        // no exp claim: accept when static, otherwise treat as expired
        return this.staticEnabled ? false : true;
      }

      // exp is in seconds; Date.now() is ms
      const expirationTime = payload.exp * 1000;
      return Date.now() >= expirationTime;
    } catch (error) {
      // On error, if static mode is enabled, do not mark expired.
      return this.staticEnabled ? false : true;
    }
  }
  
  private decodeToken(token: string): any {
    try {
      const parts = token.split('.');
      if (parts.length !== 3) return null;
      
      const payload = parts[1];
      const decoded = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
      return JSON.parse(decoded);
    } catch (error) {
      return null;
    }
  }
  
  Logout(): void {
    if (!this.isBrowser) return;
    // Clear local storage
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.userKey);
    // Note: HttpOnly cookies cannot be cleared from JavaScript
    // The backend should provide a logout endpoint to clear the cookie
    // or the cookie will expire based on its expiration time (30 minutes)
  }
}
