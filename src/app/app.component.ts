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

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  standalone: true,
  imports: [CommonModule, IonApp, IonRouterOutlet, IonIcon, TabsComponent, ScanerqrComponent],
})
export class AppComponent implements OnInit {
  showTabs = false;
  modalVisible = false;
  private rutasOcultas = ['/login'];

  constructor(
    private msal: MsalService,
    private broadcast: MsalBroadcastService,
    private http: HttpClient,
    private apiService: ApiService,
    private authService: Auth,
    private router: Router,
    private notificacionesService: NotificacionesService
  ) {
    this.router.events
      .pipe(filter(e => e instanceof NavigationEnd))
      .subscribe((e: any) => {
        this.showTabs = !this.rutasOcultas.includes(e.urlAfterRedirects);
      });
  }

ngOnInit(): void {
  this.notificacionesService.InitPush();

  this.msal.initialize().subscribe(() => {
    this.msal.handleRedirectObservable().subscribe({
      next: (result) => {
        if (result) {
          // ✅ El correo viene directo en el resultado, sin necesidad de Graph API
          const email = result.account?.username;
          console.log('Email obtenido:', email);

          this.apiService.loginMicrosoft(email).subscribe({
            next: (datos: any) => {
              if (datos.success) {
                this.authService.setTokens(datos.data.access_token, datos.data.refresh_token);
                localStorage.setItem('user', JSON.stringify(datos.data.user));
                this.router.navigate(['/home'], { replaceUrl: true });
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