// login.page.ts
import { Component, OnDestroy, OnInit } from '@angular/core';
import {
  IonContent, IonIcon, IonButton, IonSpinner,
  IonInput, IonInputPasswordToggle, IonItem, ToastController
} from '@ionic/angular/standalone';
import { Router } from '@angular/router';
import { ApiService } from 'src/app/Service/api-service';
import { Auth } from 'src/app/core/services/auth';
import { MsalService, MsalBroadcastService } from '@azure/msal-angular';
import { InteractionStatus } from '@azure/msal-browser';
import { filter, Subject, takeUntil } from 'rxjs';
import { loginRequest } from 'src/app/auth/msal.config';
import { CalendarSyncService } from 'src/app/Service/calendar-sync-service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: true,
  imports: [
    IonContent, IonIcon, IonButton, IonSpinner,
    IonInput, IonInputPasswordToggle, IonItem
  ]
})
export class LoginPage implements OnInit, OnDestroy {
  cargando = false;

  private destroy$ = new Subject<void>();
  // Handler ligado a `this` para poder añadirlo y quitarlo del `document` sin perder contexto.
  private onPageShow = (event: PageTransitionEvent) => {
    // event.persisted = true → el navegador restauró la página desde el back/forward
    // cache (bfcache) en vez de recargarla. Pasa en el WebView al volver con el botón
    // atrás desde el login redirect de Microsoft si el usuario cancela antes de que
    // MSAL complete el flujo: el estado de este componente (cargando=true, botón
    // deshabilitado) queda "congelado" tal cual estaba antes de salir, porque nunca
    // se vuelve a ejecutar ngOnInit ni el bootstrap de Angular.
    if (event.persisted) {
      this.cargando = false;
    }
  };

  constructor(
    private router: Router,
    private apiService: ApiService,
    private authService: Auth,
    private msal: MsalService,
    private msalBroadcastService: MsalBroadcastService,
    private calendarSyncService: CalendarSyncService,
    private toastController: ToastController,
  ) {}

  ngOnInit(): void {
    window.addEventListener('pageshow', this.onPageShow);

    // Red de seguridad adicional: si MSAL termina cualquier interacción (login
    // redirect incluido) sin que este componente haya navegado a /home, ya no hay
    // nada cargando y no debe quedar el botón bloqueado.
    this.msalBroadcastService.inProgress$
      .pipe(
        filter((status) => status === InteractionStatus.None),
        takeUntil(this.destroy$)
      )
      .subscribe(() => {
        this.cargando = false;
      });
  }

  ngOnDestroy(): void {
    window.removeEventListener('pageshow', this.onPageShow);
    this.destroy$.next();
    this.destroy$.complete();
  }

  login(email: any, password: any): void {
    this.cargando = true;
    this.apiService.loginUser(email.value, password.value).subscribe({
      next: async (datos: any) => {
        this.cargando = false;
        if (datos.success) {
          await this.authService.setTokens(datos.data.access_token, datos.data.refresh_token);
          await this.authService.setUser(datos.data.user);
          this.router.navigate(['/home']);
          this.calendarSyncService.sync();
        } else {
          this.mostrarError(datos.message || 'Correo o contraseña incorrectos.');
        }
      },
      error: (e: any) => {
        this.cargando = false;
        this.mostrarError(
          e.status === 0
            ? 'No se pudo conectar al servidor. Revisa tu conexión.'
            : 'Correo o contraseña incorrectos.'
        );
      }
    });
  }

  private async mostrarError(mensaje: string): Promise<void> {
    const toast = await this.toastController.create({
      message: mensaje,
      duration: 3000,
      color: 'danger',
      position: 'top',
    });
    await toast.present();
  }

  loginMicrosoft(): void {
    this.cargando = true;
    this.msal.loginRedirect(loginRequest);
  }

  goRegister(): void {
    this.router.navigate(['/register']);
  }
}