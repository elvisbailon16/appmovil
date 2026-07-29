// auth.interceptor.ts
import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { from, switchMap } from 'rxjs';
import { Auth } from '../services/auth';
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(Auth);

  // no interceptar la propia llamada de refresh (evita loop infinito)
  if (req.url.includes('/auth/refresh')) {
    return next(req);
  }

  const ensureValidToken = authService.isTokenExpired()
    ? from(authService.refreshAccessToken())
    : from(Promise.resolve(authService.getAccessToken()!));

  return ensureValidToken.pipe(
    switchMap((token) => {
      const cloned = req.clone({
        setHeaders: { Authorization: `Bearer ${token}` },
      });
      return next(cloned);
    })
  );
};