import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { LoginDTO, RegisterDTO, TokenRequestDTO, TokenResponseDTO } from '../model/AuthModels';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private baseUrl = 'http://localhost:5044/api/Auth';

  constructor(private http: HttpClient) {}
  // This method sends a login request to the backend
  login(payload: LoginDTO): Observable<TokenResponseDTO> {
    const body = {
      username: payload.username?.trim(),
      password: payload.password,
    };

    return this.http.post<TokenResponseDTO>(`${this.baseUrl}/Login`, body).pipe(
      tap((res) => {
        localStorage.setItem('accessToken', res.accessToken);
        localStorage.setItem('refreshToken', res.refreshToken);
      })
    );
  }
  // Retrieve refresh token from local storage
  getRefreshToken(): string | null {
    return localStorage.getItem('refreshToken');
  }
  // This method sends a request to refresh the access token
  refreshToken(payload: TokenRequestDTO): Observable<TokenResponseDTO> {
    return this.http.post<TokenResponseDTO>(`${this.baseUrl}/refresh-token`, payload).pipe(
      tap((res) => {
        localStorage.setItem('accessToken', res.accessToken);
        localStorage.setItem('refreshToken', res.refreshToken);
      })
    );
  }
  // Check if user is logged in
  isLoggedIn(): boolean {
    const token = this.getAccessToken();
    if (!token) {
      return false;
    }
    return !this.isTokenExpired(token);
  }

  // Check if token is expired
  isTokenExpired(token: string): boolean {
    try {
      if (!token) return true;
      const parts = token.split('.');
      if (parts.length < 2) return true;
      const payload = JSON.parse(atob(parts[1]));
      const exp = payload?.exp;
      if (typeof exp !== 'number') return true;
      const currentTime = Math.floor(Date.now() / 1000);
      return exp < currentTime;
    } catch (e) {
      return true;
    }
  }
  logout(): void {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  }

  getAccessToken(): string | null {
    return localStorage.getItem('accessToken');
  }

  // Retrieve username (if present) from the access token payload
  getUsername(): string | null {
    const token = this.getAccessToken();
    if (!token) return null;
    try {
      const parts = token.split('.');
      if (parts.length < 2) return null;
      const payload = JSON.parse(atob(parts[1]));
      return (
        payload?.username ?? payload?.unique_name ?? payload?.name ?? payload?.email ?? null
      );
    } catch (e) {
      return null;
    }
  }

  // Store tokens (used by interceptor when refreshing tokens)
  storeTokens(res: TokenResponseDTO): void {
    try {
      localStorage.setItem('accessToken', res.accessToken);
      localStorage.setItem('refreshToken', res.refreshToken);
    } catch (e) {
      // ignore storage errors in rare environments
    }
  }

  register(payload: RegisterDTO): Observable<any> {
    const apiUrl = `${this.baseUrl}/Register`;
    const body: any = {
      Username: (payload as any).username ?? (payload as any).Username,
      Email: (payload as any).email ?? (payload as any).Email,
      Password: (payload as any).password ?? (payload as any).Password,
      Role: (payload as any).role ?? (payload as any).Role ?? 'User'
    };
    return this.http.post<any>(apiUrl, body);
  }
}
