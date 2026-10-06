import { bootstrapApplication } from '@angular/platform-browser';
import { RouteReuseStrategy, provideRouter, withPreloading, PreloadAllModules } from '@angular/router';
import { IonicRouteStrategy, provideIonicAngular } from '@ionic/angular/standalone';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { routes } from './app/app.routes';
import { AppComponent } from './app/app.component';
import { isDevMode } from '@angular/core';
import { provideServiceWorker } from '@angular/service-worker';
import { Capacitor } from '@capacitor/core';
import { authInterceptor } from './app/core/interceptors/auth-interceptor';

import { MsalService, MsalBroadcastService, MSAL_INSTANCE } from '@azure/msal-angular';

import { MSALInstanceFactory } from './app/auth/msal.config';
import { loadingInterceptor } from './app/core/interceptors/loading-interceptor';

bootstrapApplication(AppComponent, {
  providers: [
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    provideIonicAngular(),
    provideRouter(routes, withPreloading(PreloadAllModules)),

    provideHttpClient(withInterceptors([loadingInterceptor, authInterceptor])),

    // MSAL solo se usa para el login con Microsoft (loginRedirect + handleRedirectObservable);
    // no hay rutas con MsalGuard ni llamadas a Microsoft Graph, así que no se registran.
    { provide: MSAL_INSTANCE, useFactory: MSALInstanceFactory },
    MsalService,
    MsalBroadcastService,

    // El service worker solo tiene sentido en la versión web (PWA en Firebase Hosting);
    // dentro del APK los archivos ya vienen empaquetados en el dispositivo.
    provideServiceWorker('ngsw-worker.js', {
      enabled: !isDevMode() && !Capacitor.isNativePlatform(),
      registrationStrategy: 'registerWhenStable:30000'
    }),
  ],
});
