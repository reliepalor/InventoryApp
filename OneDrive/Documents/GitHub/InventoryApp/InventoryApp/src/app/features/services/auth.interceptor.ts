import { Injectable } from '@angular/core';
import {
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
  HttpErrorResponse,
} from '@angular/common/http';
import { Observable, BehaviorSubject, throwError } from 'rxjs';
import { catchError, filter, switchMap, take } from 'rxjs/operators';
import { AuthService } from './AuthService';
import { TokenRequestDTO, TokenResponseDTO } from '../model/AuthModels';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  private isRefreshing = false;
  private refreshTokenSubject = new BehaviorSubject<string | null>(null);

  constructor(private authService: AuthService) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {

    // ⛔ Skip auth endpoints to prevent infinite loop
    if (this.isAuthEndpoint(req.url)) {
      return next.handle(req);
    }

    const accessToken = this.authService.getAccessToken();
    const authReq = accessToken ? this.addTokenHeader(req, accessToken) : req;

    return next.handle(authReq).pipe(
      catchError((error) => {
        if (error instanceof HttpErrorResponse && error.status === 401) {
          return this.handle401Error(authReq, next);
        }
        return throwError(() => error);
      })
    );
  }

  private addTokenHeader(request: HttpRequest<any>, token: string) {
    return request.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
      },
    });
  }

  private handle401Error(request: HttpRequest<any>, next: HttpHandler) {

    const refreshToken = this.authService.getRefreshToken();

    // ❌ No refresh token → logout immediately
    if (!refreshToken) {
      this.authService.logout();
      return throwError(() => new Error('No refresh token'));
    }

    if (!this.isRefreshing) {
      this.isRefreshing = true;
      this.refreshTokenSubject.next(null);

      const payload: TokenRequestDTO = {
        accessToken: this.authService.getAccessToken() ?? '',
        refreshToken: refreshToken,
      };

      return this.authService.refreshToken(payload).pipe(
        switchMap((res: TokenResponseDTO) => {
          this.isRefreshing = false;

          this.authService.storeTokens(res);
          this.refreshTokenSubject.next(res.accessToken);

          return next.handle(this.addTokenHeader(request, res.accessToken));
        }),
        catchError((err) => {
          this.isRefreshing = false;
          this.authService.logout();
          return throwError(() => err);
        })
      );
    }

    return this.refreshTokenSubject.pipe(
      filter((token): token is string => token !== null),
      take(1),
      switchMap((token) =>
        next.handle(this.addTokenHeader(request, token))
      )
    );
  }

  private isAuthEndpoint(url: string): boolean {
    return (
      url.includes('/Auth/login') ||
      url.includes('/Auth/register') ||
      url.includes('/Auth/refresh')
    );
  }
}
