// scanerqr.component.ts
import { Component, EventEmitter, Output, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonIcon } from '@ionic/angular/standalone';
import {
  BarcodeScanner,
  BarcodeFormat,
} from '@capacitor-mlkit/barcode-scanning';
import type { PluginListenerHandle } from '@capacitor/core';
import { Capacitor } from '@capacitor/core';

@Component({
  selector: 'app-scanerqr',
  templateUrl: './scanerqr.component.html',
  styleUrls: ['./scanerqr.component.scss'],
  standalone: true,
  imports: [CommonModule, IonIcon],
})
export class ScanerqrComponent implements OnDestroy {

  @Output() cerrar = new EventEmitter<void>();
  @Output() resultado = new EventEmitter<string>();

  escaneando = false;
  resultadoTexto: string | null = null;
  error: string | null = null;
  torchDisponible = false;
  torchEncendida = false;

  private listenerBarcodes?: PluginListenerHandle;
  private listenerError?: PluginListenerHandle;

  async iniciarEscaneo(): Promise<void> {
    this.escaneando = true;
    this.resultadoTexto = null;
    this.error = null;

    // En web no hay cámara nativa disponible — simulamos para desarrollo
    if (!Capacitor.isNativePlatform()) {
      await this.simularEscaneoWeb();
      return;
    }

    try {
      // 1. Solicita permiso de cámara
      const permisos = await BarcodeScanner.requestPermissions();
      if (permisos.camera !== 'granted' && permisos.camera !== 'limited') {
        this.error = 'Permiso de cámara denegado.';
        this.escaneando = false;
        return;
      }

      // 2. Hace el fondo transparente para ver la cámara del dispositivo detrás
      document.body.classList.add('barcode-scanner-active');

      // 3. Escucha los códigos detectados en vivo (cámara embebida, sin pantalla aparte)
      this.listenerBarcodes = await BarcodeScanner.addListener('barcodesScanned', async (event) => {
        if (this.resultadoTexto) return;
        const barcode = event.barcodes[0];
        if (!barcode) return;
        this.resultadoTexto = barcode.rawValue ?? barcode.displayValue;
        await this.detenerCamara();
        this.resultado.emit(this.resultadoTexto);
      });

      this.listenerError = await BarcodeScanner.addListener('scanError', async (event) => {
        console.error('Error escaneando:', event.message);
        this.error = 'No se pudo escanear. Intenta de nuevo.';
        await this.detenerCamara();
      });

      // 4. Inicia la cámara nativa del dispositivo embebida en esta pantalla
      await BarcodeScanner.startScan({ formats: [BarcodeFormat.QrCode] });

      // 5. Revisa si el dispositivo tiene linterna disponible
      const torch = await BarcodeScanner.isTorchAvailable();
      this.torchDisponible = torch.available;

    } catch (err: any) {
      console.error('Error iniciando la cámara:', err);
      this.error = 'No se pudo escanear. Intenta de nuevo.';
      await this.detenerCamara();
    }
  }

  async toggleLinterna(): Promise<void> {
    if (!this.torchDisponible) return;
    await BarcodeScanner.toggleTorch();
    const estado = await BarcodeScanner.isTorchEnabled();
    this.torchEncendida = estado.enabled;
  }

  async onCerrar(): Promise<void> {
    if (this.escaneando) {
      await this.detenerCamara();
    }
    this.cerrar.emit();
  }

  ngOnDestroy(): void {
    this.detenerCamara();
  }

  private async detenerCamara(): Promise<void> {
    if (Capacitor.isNativePlatform()) {
      await BarcodeScanner.stopScan().catch(() => {});
      await this.listenerBarcodes?.remove();
      await this.listenerError?.remove();
    }
    this.listenerBarcodes = undefined;
    this.listenerError = undefined;
    document.body.classList.remove('barcode-scanner-active');
    this.escaneando = false;
    this.torchDisponible = false;
    this.torchEncendida = false;
  }

  // Solo para desarrollo en navegador (no hay cámara nativa embebida en web)
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