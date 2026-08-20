import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, NavigationEnd } from '@angular/router';
import { IonApp, IonRouterOutlet, IonIcon } from '@ionic/angular/standalone';
import { TabsComponent } from './Pages/Componentes/tabs/tabs.component';
import { ScanerqrComponent } from './Pages/Componentes/scanerqr/scanerqr.component';
import { NotificacionesService } from './Service/notificaciones-service';
import { MsalService, MsalBroadcastService } from '@azure/msal-angular';
import { EventMessage, EventType } from '@azure/msal-browser';
import { HttpClient } from '@angular/common/http';
import { ApiService } from './Service/api-service';
import { Auth } from './core/services/auth';
import { filter } from 'rxjs/operators';
import { LoandingOverlayComponent } from './Pages/Componentes/loanding-overlay/loanding-overlay.component';
import { CalendarSyncService } from './Service/calendar-sync-service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  standalone: true,
  imports: [CommonModule, IonApp, IonRouterOutlet, IonIcon, TabsComponent, ScanerqrComponent, LoandingOverlayComponent],
})
export class AppComponent implements OnInit {
  showTabs = false;
  modalVisible = false;
  private rutasOcultas = ['/login', '/register'];

  constructor(
    private msal: MsalService,
    private broadcast: MsalBroadcastService,
    private http: HttpClient,
    private apiService: ApiService,
    private authService: Auth,
    private router: Router,
    private notificacionesService: NotificacionesService,
    private calendarSyncService: CalendarSyncService
  ) {
    this.router.events
      .pipe(filter(e => e instanceof NavigationEnd))
      .subscribe((e: any) => {
        this.showTabs = !this.rutasOcultas.includes(e.urlAfterRedirects);
      });
  }

  async ngOnInit(): Promise<void> {
    // NotificacionesService ya llama a InitPush() desde su propio constructor
    // (gateado por plataforma capacitor) — no hace falta invocarlo de nuevo acá.

    // 1️⃣ Primero verificamos si ya hay una sesión válida guardada (login propio o Microsoft)
    const hasSession = await this.authService.tryRestoreSession();

    if (hasSession) {
      // Ya está logueado de una sesión anterior → directo a home, sin pasar por login
      this.router.navigate(['/home'], { replaceUrl: true });
      this.calendarSyncService.sync();
    }
    // Si NO hay sesión, no navegamos a ningún lado todavía —
    // dejamos que la app siga su flujo normal hacia /login,
    // y de paso procesamos si el usuario viene de un redirect de Microsoft:

    this.msal.initialize().subscribe(() => {
      this.msal.handleRedirectObservable().subscribe({
        next: async (result) => {
          if (result) {
            const email = result.account?.username;
            console.log('Email obtenido:', email);

            this.apiService.loginMicrosoft(email).subscribe({
              next: async (datos: any) => {
                if (datos.success) {
                  // ⚠️ setTokens/setUser son async (usan Preferences) — hay que esperarlos
                  await this.authService.setTokens(datos.data.access_token, datos.data.refresh_token);
                  await this.authService.setUser(datos.data.user);
                  this.router.navigate(['/home'], { replaceUrl: true });
                  this.calendarSyncService.sync();
                }
              },
              error: (e: any) => console.log('Error auth ESPAM:', e)
            });
          }
        },
        error: (e) => console.log('Error redirect:', e)
      });
    });
  }

  abrirEscaner(): void { this.modalVisible = true; }
  cerrarModal(): void { this.modalVisible = false; }
  onResultadoQR(contenido: string): void {
    console.log('QR escaneado:', contenido);
    this.modalVisible = false;
  }
}