import {
  BrowserCacheLocation,
  InteractionType,
  IPublicClientApplication,
  PublicClientApplication,
} from '@azure/msal-browser';
import {
  MsalGuardConfiguration,
  MsalInterceptorConfiguration,
} from '@azure/msal-angular';
import { Capacitor } from '@capacitor/core';

// ─── Tus datos de Azure ───────────────────────────────────────────
const CLIENT_ID = 'TU_CLIENT_ID';    // Application (client) ID de Azure Portal
const TENANT_ID = 'TU_TENANT_ID';   // Directory (tenant) ID de Azure Portal

// El redirect URI cambia según la plataforma
function getRedirectUri(): string {
  if (Capacitor.isNativePlatform()) {
    // Deep link: debe coincidir con el registrado en Azure → plataforma "Móvil y escritorio"
    return 'msauth://ec.espam.terrimeet/callback';
  }
  return 'http://localhost:8100'; // Web local
}

// ─── Configuración principal de MSAL ─────────────────────────────
export const msalConfig = {
  auth: {
    clientId: CLIENT_ID,
    authority: `https://login.microsoftonline.com/${TENANT_ID}`,
    redirectUri: getRedirectUri(),
    postLogoutRedirectUri: 'http://localhost:8100',
  },
  cache: {
    cacheLocation: BrowserCacheLocation.LocalStorage,
    storeAuthStateInCookie: false,
  },
};

// ─── Scopes: solo lo necesario para recuperar el correo ──────────
export const loginRequest = {
  scopes: ['openid', 'profile', 'email', 'User.Read'],
};

// ─── Factories para proveedores de Angular ────────────────────────
export function MSALInstanceFactory(): IPublicClientApplication {
  return new PublicClientApplication(msalConfig);
}

export function MSALGuardConfigFactory(): MsalGuardConfiguration {
  return {
    interactionType: InteractionType.Redirect,
    authRequest: loginRequest,
  };
}

export function MSALInterceptorConfigFactory(): MsalInterceptorConfiguration {
  return {
    interactionType: InteractionType.Redirect,
    protectedResourceMap: new Map([
      ['https://graph.microsoft.com/v1.0/me', ['User.Read']],
    ]),
  };
}