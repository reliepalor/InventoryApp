import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent } from '@angular/common/http';
import { Observable, BehaviorSubject, throwError } from 'rxjs';
import { tap, catchError, switchMap, filter, take, finalize } from 'rxjs/operators';
import { isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from './auth.service';

@Injectable()
export class TokenInterceptorService implements HttpInterceptor {
  private isRefreshing = false;
  private refreshTokenSubject: BehaviorSubject<string | null> = new BehaviorSubject<string | null>(null);
  constructor(
    private auth: AuthService,
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // 👇 Prevents errors in SSR (Angular Universal)
    if (!isPlatformBrowser(this.platformId)) {
      return next.handle(req);
    }
    const token = this.auth.getToken();

    const addAuthHeader = (r: HttpRequest<any>, t: string | null) => {
      if (!t) return r;
      return r.clone({ setHeaders: { Authorization: `Bearer ${t}` } });
    };

    const authReq = token ? addAuthHeader(req, token) : req;

    return next.handle(authReq).pipe(
      catchError(err => {
        if (err?.status === 401) {
          return this.handle401Error(req, next);
        }
        return throwError(() => err);
      })
    );
  }

  private handle401Error(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // If refresh is already in progress, wait for it to finish
    if (!this.isRefreshing) {
      this.isRefreshing = true;
      this.refreshTokenSubject.next(null);

      return this.auth.refresh().pipe(
        switchMap(() => {
          const newToken = this.auth.getToken();
          if (newToken) {
            this.refreshTokenSubject.next(newToken);
            const cloned = req.clone({ setHeaders: { Authorization: `Bearer ${newToken}` } });
            return next.handle(cloned);
          }
          // couldn't refresh
          this.auth.logout();
          if (isPlatformBrowser(this.platformId)) this.router.navigate(['/login']);
          return throwError(() => ({ message: 'Could not refresh token' }));
        }),
        catchError(err => {
          this.auth.logout();
          if (isPlatformBrowser(this.platformId)) this.router.navigate(['/login']);
          return throwError(() => err);
        }),
        finalize(() => {
          this.isRefreshing = false;
        })
      );
    }

    return this.refreshTokenSubject.pipe(
      filter(token => token != null),
      take(1),
      switchMap((token) => {
        const cloned = token ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } }) : req;
        return next.handle(cloned);
      })
    );
  }
}
