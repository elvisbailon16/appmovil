import { BrowserCacheLocation, IPublicClientApplication, PublicClientApplication } from '@azure/msal-browser';
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
      // El WebView de Android se sirve desde https://localhost (ver androidScheme: 'https'
      // en capacitor.config.ts) — por eso el redirect vuelve ahí y no a un esquema msauth://
      // (eso es del SDK nativo de MSAL para Android, que este proyecto no usa).
      redirectUri: Capacitor.isNativePlatform()
        ? 'https://localhost'
        : 'http://localhost:8100',
    },
    cache: { cacheLocation: BrowserCacheLocation.LocalStorage },
  });
}