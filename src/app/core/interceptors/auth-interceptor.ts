// auth.interceptor.ts
import { HttpErrorResponse, HttpInterceptorFn, HttpRequest } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, from, switchMap, throwError } from 'rxjs';
import { Auth } from '../services/auth';

const PUBLIC_ROUTES = ['/auth/login', '/auth/refresh', '/auth/microsoft'];

function withToken(req: HttpRequest<unknown>, token: string | null): HttpRequest<unknown> {
  return token ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } }) : req;
}

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(Auth);
  const router = inject(Router);

  // no interceptar rutas públicas (evita el loop/error que viste)
  if (PUBLIC_ROUTES.some(route => req.url.includes(route))) {
    return next(req);
  }

  return from(authService.getAccessToken()).pipe(
    switchMap((token) => next(withToken(req, token))),
    catchError((err) => {
      // El token que mandamos no sirvió (venció, fue revocado, etc.) → refrescamos UNA vez y reintentamos.
      if (err instanceof HttpErrorResponse && err.status === 401) {
        return from(authService.refreshAccessToken()).pipe(
          switchMap((newToken) => next(withToken(req, newToken))),
          catchError(() =>
            from(
              (async () => {
                await authService.clearSession();
                router.navigate(['/login'], { replaceUrl: true });
                throw err;
              })()
            )
          )
        );
      }
      return throwError(() => err);
    })
  );
};
