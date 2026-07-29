import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';


const ACCESS_TOKEN_KEY = 'token';
const REFRESH_TOKEN_KEY = 'refresh_token';
const EXPIRES_AT_KEY = 'expiresAt';
const TOKEN_LIFETIME_MS = 3600 * 1000;

@Injectable({
  providedIn: 'root',
})
export class Auth {
  private refreshPromise: Promise<string> | null = null;

  constructor(private httpclient: HttpClient) {}

  // Logica de refresh token para la app movil, se guarda en el local storage y se refresca cada 1 hora

  getAccessToken(): string | null {
    return localStorage.getItem(ACCESS_TOKEN_KEY);
  }

  getRefreshToken(): string | null {
    return localStorage.getItem(REFRESH_TOKEN_KEY);
  }

  setTokens(accessToken: string, refreshToken?: string): void {
    localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
    if (refreshToken) localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
    const expiresAt = Date.now() + TOKEN_LIFETIME_MS;
    localStorage.setItem(EXPIRES_AT_KEY, expiresAt.toString());
  }

  isTokenExpired(marginMs = 10000): boolean {
    const expiresAt = localStorage.getItem(EXPIRES_AT_KEY);
    if (!expiresAt) return true;
    return Date.now() > (Number(expiresAt) - marginMs);
  }

  clearTokens(): void {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(EXPIRES_AT_KEY);
  }

  async refreshAccessToken(): Promise<string> {
    if (this.refreshPromise) return this.refreshPromise; // evita refrescos duplicados

    this.refreshPromise = (async () => {
      const refreshToken = this.getRefreshToken();
      if (!refreshToken) throw new Error('No hay refresh token');

      try {
        const data: any = await firstValueFrom(
          this.httpclient.post(`https://ws.espam.edu.ec/api/auth/refresh`, { refresh_token: refreshToken })
        );
        this.setTokens(data.access_token, data.refresh_token);
        return data.access_token;
      } catch (err) {
        this.clearTokens();
        throw err;
      }
    })();

    try {
      return await this.refreshPromise;
    } finally {
      this.refreshPromise = null;
    }
  }
  
}
