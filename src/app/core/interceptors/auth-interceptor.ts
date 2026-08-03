// auth.interceptor.ts
import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { from, switchMap } from 'rxjs';
import { Auth } from '../services/auth';

const PUBLIC_ROUTES = ['/auth/login','/auth/refresh']; 

export const authInterceptor: HttpInterceptorFn = (req, next) => {
    const authService = inject(Auth);

  // no interceptar rutas públicas (evita el loop/error que viste)
  if (PUBLIC_ROUTES.some(route => req.url.includes(route))) {
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
