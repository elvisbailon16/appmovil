import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'ec.espam.terrimeet',
  appName: 'Terrimeet',
  webDir: 'www',
    server: {
    androidScheme: 'https'
  },
   plugins: {
    CapacitorHttp: {
      enabled: true  // ← CRÍTICO: sin esto MSAL falla con CORS
    }
  }
};

export default config;
