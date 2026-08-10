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
    },
    
    SplashScreen: {
      launchShowDuration: 2000,        // ms que se mantiene visible mínimo
      launchAutoHide: true,             // se oculta solo cuando Angular termina de cargar
      backgroundColor: '#005846',       // Verde Bosque — respaldo si la imagen no cubre todo
      androidSplashResourceName: 'splash',
      androidScaleType: 'CENTER_CROP',
      showSpinner: false,               // sin spinner nativo, ya tienes tu overlay propio para eso
      splashFullScreen: true,
      splashImmersive: true,
    },
  }
};

export default config;
