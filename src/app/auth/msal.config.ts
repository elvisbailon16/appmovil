import { BrowserCacheLocation, IPublicClientApplication, PublicClientApplication, InteractionType } from '@azure/msal-browser';
import { MsalGuardConfiguration, MsalInterceptorConfiguration } from '@azure/msal-angular';
import { Capacitor } from '@capacitor/core';

// ─── Tus datos de Azure ───────────────────────────────────────────
const CLIENT_ID = '28710e21-ff7e-402f-8506-9b338db2d15b';    // Application (client) ID de Azure Portal
const TENANT_ID = '58340878-4f37-4827-9f69-97e18b833421';   // Directory (tenant) ID de Azure Portal


export const loginRequest = { scopes: ['User.Read'] };

export function MSALInstanceFactory(): IPublicClientApplication {
  return new PublicClientApplication({
    auth: {
      clientId: CLIENT_ID,
      authority: `https://login.microsoftonline.com/${TENANT_ID}`,
      redirectUri: Capacitor.isNativePlatform()
        ? 'msauth://ec.espam.terrimeet/callback'
        : 'http://localhost:8100',
    },
    cache: { cacheLocation: BrowserCacheLocation.LocalStorage },
  });
}

export function MSALGuardConfigFactory(): MsalGuardConfiguration {
  return { interactionType: InteractionType.Redirect, authRequest: loginRequest };
}

export function MSALInterceptorConfigFactory(): MsalInterceptorConfiguration {
  return {
    interactionType: InteractionType.Redirect,
    protectedResourceMap: new Map([['https://graph.microsoft.com/v1.0/me', ['User.Read']]]),
  };
}