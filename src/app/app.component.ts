import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, NavigationEnd } from '@angular/router';
import { IonApp, IonRouterOutlet, IonIcon } from '@ionic/angular/standalone';
import { TabsComponent } from './Pages/Componentes/tabs/tabs.component';
import { filter } from 'rxjs/operators';
import { ScanerqrComponent } from './Pages/Componentes/scanerqr/scanerqr.component';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  standalone: true,
  imports: [CommonModule, IonApp, IonRouterOutlet, IonIcon, TabsComponent, ScanerqrComponent],
})
export class AppComponent {
  showTabs = false;
  modalVisible = false;

  // Páginas donde NO se muestran los tabs ni el botón
  private rutasOcultas = ['/login'];

  constructor(private router: Router) {
    this.router.events
      .pipe(filter(e => e instanceof NavigationEnd))
      .subscribe((e: any) => {
        this.showTabs = !this.rutasOcultas.includes(e.urlAfterRedirects);
      });
  }

  abrirEscaner(): void {
    this.modalVisible = true;
    // TODO: iniciar cámara con @capacitor/camera o barcode-scanner
  }

  cerrarModal(): void {
    this.modalVisible = false;
  }

  onResultadoQR(contenido: string): void {
  console.log('QR escaneado:', contenido);
  this.modalVisible = false;
  // TODO: navegar o procesar el contenido del QR
}
}