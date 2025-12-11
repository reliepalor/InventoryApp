import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, of } from 'rxjs';
import { tap, catchError, switchMap } from 'rxjs/operators';
import { isPlatformBrowser } from '@angular/common';
import { environment } from '../environments/environment';

// Local interfaces aligned to component usage
export interface LoginRequest { username: string; password: string; }
export interface RegisterRequest { username: string; email?: string; password: string; confirmPassword?: string; }
export interface LoginResponse { token?: string; access_token?: string; [key: string]: any }

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = environment.apiUrl ?? '';
  private tokenKey = 'auth_token';
  private userKey = 'auth_user';
  private refreshTokenKey = 'refresh_token';
  private userIdKey = 'auth_user_id';

  constructor(private http: HttpClient, @Inject(PLATFORM_ID) private platformId: Object) {}

  private get isBrowser(): boolean {
    return isPlatformBrowser(this.platformId);
  }

  /**
   * Register. Keep payload flexible — many backends only require username+password,
   * but we preserve email/confirmPassword if provided.
   */
  register(data: RegisterRequest): Observable<any> {
    const payload: any = {
      Username: data.username?.trim(),
      Password: data.password
    };

    if (data.email) payload.Email = data.email?.trim();
    if (data.confirmPassword) payload.ConfirmPassword = data.confirmPassword;

    const candidates = this.buildEndpointCandidates('register');
    return this.postWithFallback<any>(candidates, payload, true);
  }

  // Store refresh token
  getRefreshToken(): string | null {
    if (!this.isBrowser) return null;
    return localStorage.getItem(this.refreshTokenKey);
  }

  setRefreshToken(token: string): void {
    if (!this.isBrowser) return;
    localStorage.setItem(this.refreshTokenKey, token);
  }

  // Store a stable user id for refresh requests
  setUserId(id: string): void {
    if (!this.isBrowser) return;
    localStorage.setItem(this.userIdKey, id);
  }

  getUserId(): string | null {
    if (!this.isBrowser) return null;
    return localStorage.getItem(this.userIdKey);
  }

  // Try to extract user id from a JWT token using common claim keys
  private extractUserIdFromToken(token: string): string | undefined {
    const payload = this.decodeToken(token);
    if (!payload) return undefined;
    const keys = ['nameid', 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier', 'sub', 'id', 'userId'];
    for (const k of keys) {
      if (payload[k]) return String(payload[k]);
    }
    // sometimes claim is nested or uses numeric key
    return undefined;
  }

  // Extract refresh token from various response shapes
  private extractRefreshToken(res: any): string | undefined {
    if (!res) return undefined;
    return (
      res.refreshToken ||
      res.refresh_token ||
      res.refresh ||
      res.data?.refreshToken ||
      res.data?.refresh_token ||
      undefined
    );
  }

  // Request new access token using stored refresh token and user id
  refresh(): Observable<LoginResponse> {
    const userId = this.getUserId();
    const refresh = this.getRefreshToken();
    if (!userId || !refresh) return throwError(() => ({ message: 'No refresh token available' }));
    const url = this.apiBase + '/auth/refresh';
    const body = { UserId: userId, RefreshToken: refresh };
    return this.http.post<LoginResponse>(url, body).pipe(
      tap(res => {
        const token = this.extractToken(res);
        const newRefresh = this.extractRefreshToken(res);
        if (token) {
          this.setToken(token);
          const uid = this.extractUserIdFromToken(token);
          if (uid) this.setUserId(uid);
        }
        if (newRefresh) this.setRefreshToken(newRefresh);
      })
    );
  }

  /**
   * Build common endpoint candidates including variations that match
   * typical ASP.NET routing and casing.
   */
  private buildEndpointCandidates(action: 'login' | 'register'): string[] {
    const cfg = environment as any;
    const configured = cfg?.authPaths?.[action] as string | undefined;
    const basePaths = [
      // canonical API area for controller [Route("api/[controller]")]
      '/api/auth',
      '/api/Auth',
      '/auth',
      '/Auth',
      '/account',
      '/authentication'
    ];

    const actionNames = action === 'login'
      ? ['login', 'Login', 'signin', 'signin']
      : ['register', 'Register', 'signup', 'Signup'];

    const list: string[] = [];

    // configured full path (could be '/auth/login' or full URL)
    if (configured) list.push(configured);

    // combine basePaths with action variations
    for (const bp of basePaths) {
      for (const act of actionNames) {
        list.push(`${bp}/${act}`);
      }
    }

    // also include a few common short patterns
    if (action === 'login') {
      list.push('/auth/login', '/account/login', '/authentication/login', '/account/signin');
    } else {
      list.push('/auth/register', '/account/register', '/authentication/register', '/account/signup');
    }

    // make unique
    return Array.from(new Set(list));
  }

  /**
   * Try POST against multiple candidate paths until one succeeds.
   * If a candidate is an absolute URL (http/https) we use it as-is.
   */
  private postWithFallback<T>(paths: string[], body: any, withCredentials = false): Observable<T> {
    if (!paths?.length) return throwError(() => ({ message: 'No endpoints configured' }));

    const tryPost = (index: number): Observable<T> => {
      if (index >= paths.length) {
        return throwError(() => ({ message: 'All endpoints failed' }));
      }

      const path = paths[index] || '';
      // If path looks like an absolute URL, use it directly.
      const url = /^https?:\/\//i.test(path)
        ? path
        : this.apiBase + (path.startsWith('/') ? path : '/' + path);

      return this.http.post<T>(url, body, { withCredentials }).pipe(
        catchError(err => {
          const status = (err as HttpErrorResponse)?.status;
          const code = (err as any)?.code;

          // If 404 or 405 (endpoint not found/allowed) try next candidate
          if ((status === 404 || status === 405) && index + 1 < paths.length) {
            return tryPost(index + 1);
          }

          // If network-level error (ENOTFOUND / ECONNREFUSED) we might try next
          if ((code === 'ENOTFOUND' || code === 'ECONNREFUSED' || code === 'EAI_AGAIN') && index + 1 < paths.length) {
            return tryPost(index + 1);
          }

          // Do not swallow 400/401 — surface normalized error
          return throwError(() => this.normalizeError(err));
        })
      );
    };

    return tryPost(0);
  }

  private normalizeError(err: any) {
    const httpErr = err as HttpErrorResponse;
    const e = httpErr?.error ?? err;
    const modelState = e?.errors || e?.ModelState || e?.modelState;
    let firstModelError: string | undefined;

    if (modelState && typeof modelState === 'object') {
      try {
        firstModelError = Object.values(modelState).flat().map(String)[0];
      } catch (ex) {
        // ignore
      }
    }

    let message: string | undefined = e?.message || e?.title || firstModelError;

    if (!message) {
      if (typeof e === 'string') message = e;
      else if (typeof e?.error === 'string') message = e.error;
      else if (typeof e?.detail === 'string') message = e.detail;
      else if (firstModelError) message = firstModelError;
    }

    if (httpErr?.status === 400 && !message) {
      message = 'Bad request. Check your input and try again.';
    } else if (httpErr?.status === 401 && !message) {
      message = 'Invalid username or password';
    } else if (httpErr?.status === 404 && !message) {
      message = 'No account found';
    } else if (!message) {
      message = 'Unable to connect to server. Please try again.';
    }

    return { ...err, message: String(message) };
  }

  private get apiBase(): string {
    // ensure no trailing slash in base
    const base = this.apiUrl ?? '';
    return base.endsWith('/') ? base.slice(0, -1) : base;
  }

  /**
   * LOGIN: now supports a static dev credential (admin / admin123).
   * If static cred matches, no backend call is made and a static token is stored.
   */
  login(data: LoginRequest): Observable<LoginResponse> {
    const username = data.username?.trim();
    const password = data.password;

    // 🔥 STATIC LOGIN (development only)
    if (username === 'admin' && password === 'admin123') {
      const staticToken = 'STATIC_DEV_TOKEN';

      // persist token like a normal login
      this.setToken(staticToken);

      // optionally store user id extracted from token if needed (not required here)
      const uid = this.extractUserIdFromToken(staticToken);
      if (uid) this.setUserId(uid);

      // return an Observable that mimics backend response
      return of({
        token: staticToken,
        username: 'admin',
        role: 'developer'
      });
    }

    // ---- FALLBACK TO REAL BACKEND LOGIN ----
    const payload = {
      Username: username,
      Password: password
    };

    const candidates = this.buildEndpointCandidates('login');
    return this.postWithFallback<LoginResponse>(candidates, payload, true).pipe(
      tap(res => {
        // support many token property names
        const token = this.extractToken(res);
        if (token) {
          this.setToken(token);
        }
      })
    );
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
    return !this.isTokenExpired(token);
  }

  private isTokenExpired(token: string): boolean {
    // Static dev token never expires
    if (token === 'STATIC_DEV_TOKEN') return false;

    try {
      const payload = this.decodeToken(token);
      if (!payload || !payload.exp) return true;
      const expirationTime = payload.exp * 1000;
      return Date.now() >= expirationTime;
    } catch {
      return true;
    }
  }

  private decodeToken(token: string): any {
    try {
      const parts = token.split('.');
      if (parts.length !== 3) return null;
      // atob only available in browser — guard
      if (!this.isBrowser) return null;
      const payload = parts[1];
      const padded = payload.replace(/-/g, '+').replace(/_/g, '/')
        + '='.repeat((4 - payload.length % 4) % 4);
      const decoded = atob(padded);
      return JSON.parse(decoded);
    } catch {
      return null;
    }
  }

  logout(): void {
    if (!this.isBrowser) return;
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.userKey);
  }

  // Backwards compat
  Logout(): void {
    this.logout();
  }

  private extractToken(res: any): string | undefined {
    if (!res) return undefined;
    return (
      res.token ||
      res.access_token ||
      res.accessToken ||
      res.data?.token ||
      res.data?.access_token ||
      res.data?.accessToken ||
      undefined
    );
  }
}
