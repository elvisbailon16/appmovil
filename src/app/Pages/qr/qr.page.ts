// qr.page.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonContent, IonIcon } from '@ionic/angular/standalone';
import { CabeceraComponent } from '../Componentes/cabecera/cabecera.component';
import { QrCodeComponent } from 'ng-qrcode';
import { Auth } from 'src/app/core/services/auth';

@Component({
  selector: 'app-qr',
  templateUrl: './qr.page.html',
  styleUrls: ['./qr.page.scss'],
  standalone: true,
  imports: [CommonModule, IonContent, IonIcon, CabeceraComponent, QrCodeComponent],
})
export class QrPage implements OnInit {
  user: any = null;

  constructor(private authService: Auth) {}

  ngOnInit() {
    this.cargarQR();
  }

  compartirQR(): void {
    // TODO: implementar compartir con Capacitor Share
    // import { Share } from '@capacitor/share';
    // Share.share({
    //   title: 'Mi QR TerriMeet',
    //   text: 'Este es mi código QR para los eventos ESPAM MFL',
    //   dialogTitle: 'Compartir QR',
    // });
    console.log('Compartir QR — pendiente de implementar');
  }

  async cargarQR(): Promise<void> {
    this.user = await this.authService.getUser();
  }
}