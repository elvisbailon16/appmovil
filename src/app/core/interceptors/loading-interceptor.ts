// src/app/core/interceptors/loading.interceptor.ts
import { HttpInterceptorFn, HttpContextToken } from '@angular/common/http';
import { inject } from '@angular/core';
import { finalize } from 'rxjs';
import { LoadingService } from '../services/loading';

/**
 * Token para excluir peticiones puntuales del overlay
 * (ej: polling de ubicación en tiempo real, que no debe bloquear la pantalla).
 * Uso: this.http.get(url, { context: new HttpContext().set(SKIP_LOADING, true) })
 */
export const SKIP_LOADING = new HttpContextToken<boolean>(() => false);

export const loadingInterceptor: HttpInterceptorFn = (req, next) => {
  const loadingService = inject(LoadingService);

  if (req.context.get(SKIP_LOADING)) {
    return next(req);
  }

  loadingService.show();

  return next(req).pipe(
    finalize(() => loadingService.hide())
  );
};