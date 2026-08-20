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
          // El catchError va ANTES del switchMap a propósito: así solo atrapa errores del
          // refresh en sí. Auth.refreshAccessToken() ya limpia la sesión cuando el servidor
          // rechaza el refresh token; acá solo nos encargamos de navegar a /login en ese caso.
          // Si el refresh tuvo éxito y lo que falla es el REINTENTO de la petición original
          // (otro endpoint con un error puntual, colisión con otra API, etc.), ese error sigue
          // de largo sin pasar por este catchError, así que no se cierra sesión de más.
          catchError((refreshErr) => {
            if (!authService.esErrorDeConectividad(refreshErr)) {
              router.navigate(['/login'], { replaceUrl: true });
            }
            return throwError(() => err);
          }),
          switchMap((newToken) => next(withToken(req, newToken)))
        );
      }
      return throwError(() => err);
    })
  );
};
