// src/app/core/services/auth.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { firstValueFrom, timeout } from 'rxjs';
import { Preferences } from '@capacitor/preferences';
import { environment } from 'src/environments/environment';

/** Se lanza cuando no se pudo ni siquiera contactar al servidor (sin internet). */
class ErrorSinConexion extends Error {}
/** Se lanza cuando localmente no hay forma de restaurar la sesión (no es un tema de red). */
class ErrorSesionInvalida extends Error {}
/** Tiempo máximo que esperamos por el refresh antes de asumir que la red no responde. */
const REFRESH_TIMEOUT_MS = 10000;

const ACCESS_TOKEN_KEY = 'token';
const REFRESH_TOKEN_KEY = 'refresh_token';
const EXPIRES_AT_KEY = 'expiresAt';
const USER_KEY = 'user';
const TOKEN_LIFETIME_MS = 3600 * 1000;

@Injectable({
  providedIn: 'root',
})
export class Auth {
  private refreshPromise: Promise<string> | null = null;

  constructor(private httpclient: HttpClient) {}

  async getAccessToken(): Promise<string | null> {
    const result = await Preferences.get({ key: ACCESS_TOKEN_KEY });
    return result.value;
  }

  async getRefreshToken(): Promise<string | null> {
    const result = await Preferences.get({ key: REFRESH_TOKEN_KEY });
    return result.value;
  }

  async setTokens(accessToken: string, refreshToken?: string): Promise<void> {
    await Preferences.set({ key: ACCESS_TOKEN_KEY, value: accessToken });
    if (refreshToken) {
      await Preferences.set({ key: REFRESH_TOKEN_KEY, value: refreshToken });
    }
    const expiresAt = Date.now() + TOKEN_LIFETIME_MS;
    await Preferences.set({ key: EXPIRES_AT_KEY, value: expiresAt.toString() });
  }

  async isTokenExpired(marginMs = 10000): Promise<boolean> {
    const result = await Preferences.get({ key: EXPIRES_AT_KEY });
    if (!result.value) return true;
    return Date.now() > (Number(result.value) - marginMs);
  }

  async setUser(user: unknown): Promise<void> {
    await Preferences.set({ key: USER_KEY, value: JSON.stringify(user) });
  }

  async getUser<T = any>(): Promise<T | null> {
    const result = await Preferences.get({ key: USER_KEY });
    return result.value ? JSON.parse(result.value) : null;
  }

  /**
   * Borra todo lo de la sesión (tokens + usuario). Se usa tanto en logout
   * explícito como cuando el refresh falla y la sesión ya no es recuperable.
   */
  async clearSession(): Promise<void> {
    await Promise.all([
      Preferences.remove({ key: ACCESS_TOKEN_KEY }),
      Preferences.remove({ key: REFRESH_TOKEN_KEY }),
      Preferences.remove({ key: EXPIRES_AT_KEY }),
      Preferences.remove({ key: USER_KEY }),
    ]);
  }

  /** true si el error es por falta de conexión (o no se puede determinar), no porque el servidor
   *  haya rechazado explícitamente el refresh token. Ante la duda, preferimos NO cerrar la sesión:
   *  en la app nativa (Capacitor con CapacitorHttp habilitado, ver capacitor.config.ts) los errores
   *  de red no siempre llegan como un HttpErrorResponse con status 0 — el bridge nativo a veces
   *  lanza un error "crudo" sin status, o navigator.onLine reporta mal la conectividad real en
   *  WebView. Solo tratamos el error como un rechazo real cuando el servidor efectivamente
   *  respondió con un status HTTP. */
  esErrorDeConectividad(err: unknown): boolean {
    if (err instanceof ErrorSesionInvalida) return false;
    if (err instanceof ErrorSinConexion) return true;
    if (err instanceof HttpErrorResponse) {
      return !err.status || err.status <= 0;
    }
    return true;
  }

  async refreshAccessToken(): Promise<string> {
    if (this.refreshPromise) return this.refreshPromise;

    this.refreshPromise = (async () => {
      const refreshToken = await this.getRefreshToken();
      if (!refreshToken) throw new ErrorSesionInvalida('No hay refresh token');

      if (typeof navigator !== 'undefined' && navigator.onLine === false) {
        throw new ErrorSinConexion('Sin conexión a internet');
      }

      try {
        const respuesta: any = await firstValueFrom(
          this.httpclient
            .post(`${environment.apiUrl}/auth/refresh`, { refresh_token: refreshToken })
            .pipe(timeout(REFRESH_TIMEOUT_MS))
        );
        // El login envuelve la respuesta en { data: { access_token, ... } }; el refresh puede
        // venir igual (envuelto) o plano. Soportamos ambos para no guardar "undefined" como token.
        const payload = respuesta?.data ?? respuesta;
        if (!payload?.access_token) {
          throw new Error('Respuesta de refresh sin access_token');
        }
        await this.setTokens(payload.access_token, payload.refresh_token);
        return payload.access_token;
      } catch (err) {
        // Si fue por falta de internet, el refresh token sigue siendo válido: no cerramos sesión,
        // se reintentará la próxima vez que haya conexión.
        if (!this.esErrorDeConectividad(err)) {
          await this.clearSession();
        }
        throw err;
      }
    })();

    try {
      return await this.refreshPromise;
    } finally {
      this.refreshPromise = null;
    }
  }

  /**
   * NUEVO — se llama UNA vez al arrancar la app.
   * Determina si hay sesión válida sin obligar al usuario a loguearse de nuevo.
   */
  async tryRestoreSession(): Promise<boolean> {
    const accessToken = await this.getAccessToken();
    if (!accessToken) return false;

    const expired = await this.isTokenExpired();
    if (!expired) return true;

    // el access_token venció → intenta refrescar silenciosamente
    try {
      await this.refreshAccessToken();
      return true;
    } catch (err) {
      // Sin internet: seguimos teniendo credenciales guardadas y válidas, no forzamos el login.
      // La sesión se corta solo si el servidor de verdad rechazó el refresh token.
      if (this.esErrorDeConectividad(err)) return true;
      return false;
    }
  }
}