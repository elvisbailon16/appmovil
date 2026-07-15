// qr.page.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonContent, IonIcon } from '@ionic/angular/standalone';
import { CabeceraComponent } from '../Componentes/cabecera/cabecera.component';

@Component({
  selector: 'app-qr',
  templateUrl: './qr.page.html',
  styleUrls: ['./qr.page.scss'],
  standalone: true,
  imports: [CommonModule, IonContent, IonIcon, CabeceraComponent],
})
export class QrPage {

  // TODO: reemplazar con datos reales del usuario autenticado
  usuario = {
    nombre: 'BAILON ZAMBRANO ELVIS STEEVEN',
    cedula: '1317467577',
  };

  // TODO: reemplazar con el QR real que devuelva la API
  // qrUrl = this.apiService.getQR(this.usuario.cedula);

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
}