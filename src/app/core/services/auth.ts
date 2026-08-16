// src/app/core/services/auth.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { Preferences } from '@capacitor/preferences';

/** Se lanza cuando no se pudo ni siquiera contactar al servidor (sin internet). */
class ErrorSinConexion extends Error {}

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

  /** true si el error es por falta de conexión, no porque el servidor haya rechazado el refresh token. */
  esErrorDeConectividad(err: unknown): boolean {
    if (err instanceof ErrorSinConexion) return true;
    // status 0 = el request nunca llegó a obtener respuesta del servidor (sin internet, DNS, etc.)
    return err instanceof HttpErrorResponse && err.status === 0;
  }

  async refreshAccessToken(): Promise<string> {
    if (this.refreshPromise) return this.refreshPromise;

    this.refreshPromise = (async () => {
      const refreshToken = await this.getRefreshToken();
      if (!refreshToken) throw new Error('No hay refresh token');

      if (typeof navigator !== 'undefined' && navigator.onLine === false) {
        throw new ErrorSinConexion('Sin conexión a internet');
      }

      try {
        const data: any = await firstValueFrom(
          this.httpclient.post(`https://ws.espam.edu.ec/api/auth/refresh`, { refresh_token: refreshToken })
        );
        await this.setTokens(data.access_token, data.refresh_token);
        return data.access_token;
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