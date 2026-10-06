import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, NavigationEnd } from '@angular/router';
import { IonApp, IonRouterOutlet, IonIcon, AlertController } from '@ionic/angular/standalone';
import { TabsComponent } from './Pages/Componentes/tabs/tabs.component';
import { ScanerqrComponent } from './Pages/Componentes/scanerqr/scanerqr.component';
import { NotificacionesService } from './Service/notificaciones-service';
import { MsalService } from '@azure/msal-angular';
import { ApiService } from './Service/api-service';
import { Auth } from './core/services/auth';
import { filter } from 'rxjs/operators';
import { LoandingOverlayComponent } from './Pages/Componentes/loanding-overlay/loanding-overlay.component';
import { CalendarSyncService } from './Service/calendar-sync-service';
import { RecordatorioService } from './Service/recordatorio-service';
import { SesionService } from './Service/sesion-service';

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
  // Último valor leído por el escáner; se mantiene hasta el próximo escaneo
  ultimoQR: string | null = null;
  private rutasOcultas = ['/login', '/register'];

  constructor(
    private msal: MsalService,
    private apiService: ApiService,
    private authService: Auth,
    private router: Router,
    private notificacionesService: NotificacionesService,
    private calendarSyncService: CalendarSyncService,
    private recordatorioService: RecordatorioService,
    private alertController: AlertController,
    private sesionService: SesionService
  ) {
    // Al cerrar sesión se olvida el último QR escaneado
    this.sesionService.sesionCerrada$.subscribe(() => this.ultimoQR = null);

    this.router.events
      .pipe(filter(e => e instanceof NavigationEnd))
      .subscribe((e: any) => {
        this.showTabs = !this.rutasOcultas.includes(e.urlAfterRedirects);
      });
  }

  async ngOnInit(): Promise<void> {
    // NotificacionesService y RecordatorioService se inyectan solo para que se instancien
    // al arrancar: cada uno se inicializa en su propio constructor (solo en Capacitor).

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
              error: (e: any) => console.error('Error auth ESPAM:', e)
            });
          }
        },
        error: (e) => console.error('Error redirect MSAL:', e)
      });
    });
  }

  abrirEscaner(): void { this.modalVisible = true; }
  cerrarModal(): void { this.modalVisible = false; }
  async onResultadoQR(contenido: string): Promise<void> {
    this.ultimoQR = contenido;
    console.log('QR escaneado:', this.ultimoQR);

    // Cierra el escáner por completo antes de mostrar el resultado
    this.modalVisible = false;

    const alert = await this.alertController.create({
      header: 'QR leído',
      message: contenido,
      buttons: ['Aceptar'],
    });
    await alert.present();
  }
}