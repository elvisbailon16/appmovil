
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { MsalService } from '@azure/msal-angular';
import { AccountInfo, InteractionStatus } from '@azure/msal-browser';
import { MsalBroadcastService } from '@azure/msal-angular';
import { Observable, of } from 'rxjs';
import { filter, switchMap, map, catchError } from 'rxjs/operators';
import { loginRequest } from '../msal.config';
import { Capacitor } from '@capacitor/core';

export interface MsUserInfo {
  email: string;
  nombre: string;
  id: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {

  constructor(
    private msal: MsalService,
    private broadcast: MsalBroadcastService,
    private http: HttpClient
  ) {}

  // ─── Login ───────────────────────────────────────────────────────
  login(): void {
    if (Capacitor.isNativePlatform()) {
      // En móvil: redirige al navegador del sistema (no al WebView)
      this.msal.loginRedirect(loginRequest);
    } else {
      // En web: popup o redirect (usamos redirect para consistencia)
      this.msal.loginRedirect(loginRequest);
    }
  }

  // ─── Logout ──────────────────────────────────────────────────────
  logout(): void {
    this.msal.logoutRedirect();
  }

  // ─── ¿Está autenticado? ──────────────────────────────────────────
  isLoggedIn(): boolean {
    return this.msal.instance.getAllAccounts().length > 0;
  }

  // ─── Cuenta activa ───────────────────────────────────────────────
  getAccount(): AccountInfo | null {
    const accounts = this.msal.instance.getAllAccounts();
    return accounts.length > 0 ? accounts[0] : null;
  }

  // ─── Recuperar correo desde Microsoft Graph ───────────────────────
  // El campo 'mail' es el correo institucional, 'userPrincipalName' es el fallback
  getUserEmail(): Observable<MsUserInfo | null> {
    return this.http.get<any>('https://graph.microsoft.com/v1.0/me').pipe(
      map(profile => ({
        email: profile.mail ?? profile.userPrincipalName ?? '',
        nombre: profile.displayName ?? '',
        id: profile.id ?? '',
      })),
      catchError(() => of(null))
    );
  }

  // ─── Esperar a que MSAL termine su flujo antes de actuar ─────────
  waitForMsal(): Observable<InteractionStatus> {
    return this.broadcast.inProgress$.pipe(
      filter(status => status === InteractionStatus.None)
    );
  }
}