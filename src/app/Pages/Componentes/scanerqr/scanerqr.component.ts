// scanerqr.component.ts
import { Component, EventEmitter, Output, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonIcon, IonSpinner } from '@ionic/angular/standalone';
import {
  BarcodeScanner,
  BarcodeFormat,
  LensFacing,
} from '@capacitor-mlkit/barcode-scanning';
import { Capacitor } from '@capacitor/core';

@Component({
  selector: 'app-scanerqr',
  templateUrl: './scanerqr.component.html',
  styleUrls: ['./scanerqr.component.scss'],
  standalone: true,
  imports: [CommonModule, IonIcon, IonSpinner],
})
export class ScanerqrComponent implements OnDestroy {

  @Output() cerrar = new EventEmitter<void>();
  @Output() resultado = new EventEmitter<string>();
  
  
  escaneando = false;
  resultadoTexto: any;
  error: string | null = null;

  async iniciarEscaneo(): Promise<void> {
    this.escaneando = true;
    this.resultadoTexto;
    this.error = null;

    // En web no está soportado por ML Kit — simulamos
    if (!Capacitor.isNativePlatform()) {
      await this.simularEscaneoWeb();
      return;
    }

    try {
      // 1. Solicita permiso de cámara
      const permisos = await BarcodeScanner.requestPermissions();
      if (permisos.camera !== 'granted') {
        this.error = 'Permiso de cámara denegado.';
        this.escaneando = false;
        return;
      }

      // 2. Hace el fondo transparente para ver la cámara
      document.body.classList.add('barcode-scanner-active');

      // 3. Inicia el escaneo
      const { barcodes } = await BarcodeScanner.scan({
        formats: [BarcodeFormat.QrCode],
        // lensFacing: LensFacing.Back,
      });

      // 4. Procesa el resultado
      if (barcodes.length > 0) {
        this.resultadoTexto = barcodes[0].rawValue;
        this.resultado.emit(this.resultadoTexto);
      }

    } catch (err: any) {
      console.error('Error escaneando:', err);
      this.error = 'No se pudo escanear. Intenta de nuevo.';
    } finally {
      // 5. Restaura la visibilidad del fondo
      document.body.classList.remove('barcode-scanner-active');
      this.escaneando = false;
    }
  }

  onCerrar(): void {
    // Detiene la cámara si estaba activa
    if (this.escaneando && Capacitor.isNativePlatform()) {
      BarcodeScanner.stopScan().catch(() => {});
      document.body.classList.remove('barcode-scanner-active');
    }
    this.cerrar.emit();
  }

  ngOnDestroy(): void {
    // Limpieza al destruir el componente
    if (Capacitor.isNativePlatform()) {
      BarcodeScanner.stopScan().catch(() => {});
    }
    document.body.classList.remove('barcode-scanner-active');
  }

  // Solo para desarrollo en navegador
  private simularEscaneoWeb(): Promise<void> {
    return new Promise(resolve => {
      setTimeout(() => {
        this.resultadoTexto = 'TerriMeet-ESPAM-1317467577';
        this.resultado.emit(this.resultadoTexto);
        this.escaneando = false;
        resolve();
      }, 2000);
    });
  }
}