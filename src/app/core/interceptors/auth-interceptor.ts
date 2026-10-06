// auth.interceptor.ts
import { HttpErrorResponse, HttpInterceptorFn, HttpRequest } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, from, switchMap, throwError } from 'rxjs';
import { Auth } from '../services/auth';
import { SesionService } from 'src/app/Service/sesion-service';
import { environment } from 'src/environments/environment';

const PUBLIC_ROUTES = ['/auth/login', '/auth/refresh', '/auth/microsoft'];
// Dominio propio del backend. Cualquier request a otro host (Microsoft Graph vía
// MsalInterceptor, tiles de mapas, etc.) no debe llevar nuestro Bearer token: lo
// pisaría sobre el que ya puso el interceptor correspondiente, o lo filtraría a
// un tercero sin necesidad.
const API_HOST = new URL(environment.apiUrl).host;

function withToken(req: HttpRequest<unknown>, token: string | null): HttpRequest<unknown> {
  return token ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } }) : req;
}

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(Auth);
  const router = inject(Router);
  const sesionService = inject(SesionService);

  // Solo interceptamos peticiones a nuestro propio backend.
  if (!req.url.includes(API_HOST)) {
    return next(req);
  }

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
              // La sesión venció del todo: se borran también los demás datos del usuario.
              sesionService.limpiarDatosUsuario();
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
