// sesion-service.ts
import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { MsalService } from '@azure/msal-angular';
import { Auth } from '../core/services/auth';
import { CalendarSyncService } from './calendar-sync-service';
import { RecordatorioService } from './recordatorio-service';

/**
 * Cierre de sesión completo: borra TODO lo guardado del usuario en el dispositivo
 * para que el próximo login (mismo u otro usuario) empiece limpio, sin mezclar datos.
 * Lo que es del dispositivo y no del usuario (ej. push_token) se conserva.
 */
@Injectable({
  providedIn: 'root',
})
export class SesionService {
  /** Avisa a los componentes que mantienen datos del usuario en memoria (ej. último QR) para que los limpien. */
  readonly sesionCerrada$ = new Subject<void>();

  constructor(
    private authService: Auth,
    private msal: MsalService,
    private calendarSyncService: CalendarSyncService,
    private recordatorioService: RecordatorioService,
  ) {}

  async limpiarDatosUsuario(): Promise<void> {
    // Cada paso va por separado: si uno falla (ej. sin permiso de calendario), los demás igual se borran.
    const pasos: Array<[string, () => Promise<void>]> = [
      ['sesión', () => this.authService.clearSession()],
      ['calendario', () => this.calendarSyncService.limpiar()],
      ['recordatorios', () => this.recordatorioService.limpiar()],
      // Cuenta de Microsoft cacheada por MSAL (localStorage) — sin esto el próximo login con
      // Microsoft podría reutilizar la cuenta anterior. clearCache no navega a Microsoft.
      ['cuenta Microsoft', () => this.msal.instance.clearCache()],
    ];

    for (const [nombre, paso] of pasos) {
      try {
        await paso();
      } catch (e) {
        console.error(`Error limpiando ${nombre} al cerrar sesión:`, e);
      }
    }

    this.sesionCerrada$.next();
  }
}
