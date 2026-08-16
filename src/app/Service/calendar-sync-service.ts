import { Injectable } from '@angular/core';
import { Platform } from '@ionic/angular';
import { Preferences } from '@capacitor/preferences';
import { CapacitorCalendar, CalendarPermissionScope } from '@ebarooni/capacitor-calendar';
import { ApiService } from './api-service';

const SYNC_MAP_KEY = 'calendar_sync_map';

interface EventoSincronizado {
  nativeId: string;
  hash: string;
}

/**
 * Mantiene el calendario nativo del dispositivo alineado con las inscripciones
 * del usuario (mismos datos que se muestran en Wallet: getMisCertificados()).
 * Se dispara automáticamente al iniciar sesión (ver app.component.ts / login.page.ts).
 */
@Injectable({
  providedIn: 'root',
})
export class CalendarSyncService {
  private syncing = false;

  constructor(
    private apiService: ApiService,
    private platform: Platform,
  ) {}

  async sync(): Promise<void> {
    if (this.syncing || !this.platform.is('capacitor')) return;
    this.syncing = true;

    try {
      const tienePermiso = await this.asegurarPermiso();
      if (!tienePermiso) return;

      const inscripciones = await this.obtenerInscripciones();
      const mapa = await this.obtenerMapaSincronizado();
      const idsVigentes = new Set<string>();

      for (const evento of inscripciones) {
        if (evento?.id === undefined || evento?.id === null) continue;
        const id = String(evento.id);
        idsVigentes.add(id);

        const opciones = this.mapearEvento(evento);
        if (!opciones) continue; // sin fecha de inicio válida, no se puede agendar

        const hash = JSON.stringify(opciones);
        const existente = mapa[id];

        if (!existente) {
          const nativeId = await this.crearEventoNativo(opciones);
          if (nativeId) mapa[id] = { nativeId, hash };
        } else if (existente.hash !== hash) {
          const actualizado = await this.actualizarEventoNativo(existente.nativeId, opciones);
          if (actualizado) mapa[id] = { nativeId: existente.nativeId, hash };
        }
      }

      // Inscripciones que ya no están en la lista (ej. el usuario se dio de baja) -> quitarlos del calendario
      for (const id of Object.keys(mapa)) {
        if (!idsVigentes.has(id)) {
          await this.eliminarEventoNativo(mapa[id].nativeId);
          delete mapa[id];
        }
      }

      await this.guardarMapaSincronizado(mapa);
    } catch (e) {
      console.error('Error sincronizando calendario del dispositivo:', e);
    } finally {
      this.syncing = false;
    }
  }

  private async asegurarPermiso(): Promise<boolean> {
    try {
      const { result } = await CapacitorCalendar.checkPermission({
        scope: CalendarPermissionScope.WRITE_CALENDAR,
      });
      if (result === 'granted') return true;
      if (result === 'denied') return false; // el usuario ya lo negó, no insistir en cada apertura

      const { result: solicitado } = await CapacitorCalendar.requestFullCalendarAccess();
      return solicitado === 'granted';
    } catch (e) {
      console.error('No se pudo solicitar permiso de calendario:', e);
      return false;
    }
  }

  private obtenerInscripciones(): Promise<any[]> {
    return new Promise((resolve, reject) => {
      this.apiService.getMisCertificados().subscribe({
        next: (res: any) => resolve(res?.data ?? res ?? []),
        error: reject,
      });
    });
  }

  private mapearEvento(evento: any): { title: string; startDate: number; endDate: number; isAllDay: boolean; location?: string; description?: string } | null {
    const fechas = this.construirFechas(evento);
    if (!fechas) return null;

    const notas = [evento.descripcion, evento.horario ? `Horario: ${evento.horario}` : null]
      .filter(Boolean)
      .join('\n\n');

    return {
      title: evento.nombre || 'Evento',
      startDate: fechas.startDate,
      endDate: fechas.endDate,
      isAllDay: fechas.isAllDay,
      location: evento.sede || evento.direccion || undefined,
      description: notas || undefined,
    };
  }

  private construirFechas(evento: any): { startDate: number; endDate: number; isAllDay: boolean } | null {
    const inicio = evento.fechainicio ? new Date(evento.fechainicio) : null;
    if (!inicio || isNaN(inicio.getTime())) return null;

    const fin = evento.fechafin ? new Date(evento.fechafin) : new Date(inicio);
    if (isNaN(fin.getTime())) fin.setTime(inicio.getTime());

    const horas = this.extraerHoras(evento.horario);
    if (horas) {
      inicio.setHours(horas.inicio.h, horas.inicio.m, 0, 0);
      const finHora = horas.fin ?? horas.inicio;
      fin.setHours(finHora.h, finHora.m, 0, 0);
      if (fin.getTime() <= inicio.getTime()) {
        fin.setTime(inicio.getTime() + 60 * 60 * 1000); // fallback: 1 hora de duración
      }
      return { startDate: inicio.getTime(), endDate: fin.getTime(), isAllDay: false };
    }

    // sin horario -> se agenda como evento de todo el día
    inicio.setHours(0, 0, 0, 0);
    fin.setHours(23, 59, 0, 0);
    return { startDate: inicio.getTime(), endDate: fin.getTime(), isAllDay: true };
  }

  private extraerHoras(horario?: string): { inicio: { h: number; m: number }; fin?: { h: number; m: number } } | null {
    if (!horario) return null;
    const regex = /(\d{1,2}):(\d{2})/g;
    const matches: RegExpExecArray[] = [];
    let m: RegExpExecArray | null;
    while ((m = regex.exec(horario)) !== null) {
      matches.push(m);
    }
    if (matches.length === 0) return null;

    const aHora = (m: RegExpExecArray) => ({ h: Number(m[1]), m: Number(m[2]) });
    return { inicio: aHora(matches[0]), fin: matches[1] ? aHora(matches[1]) : undefined };
  }

  private async crearEventoNativo(opciones: ReturnType<CalendarSyncService['mapearEvento']> & object): Promise<string | null> {
    try {
      const { id } = await CapacitorCalendar.createEvent(opciones as any);
      return id;
    } catch (e) {
      console.error('No se pudo crear el evento en el calendario nativo:', opciones?.title, e);
      return null;
    }
  }

  private async actualizarEventoNativo(nativeId: string, opciones: ReturnType<CalendarSyncService['mapearEvento']> & object): Promise<boolean> {
    try {
      await CapacitorCalendar.modifyEvent({ id: nativeId, ...opciones } as any);
      return true;
    } catch (e) {
      console.error('No se pudo actualizar el evento en el calendario nativo:', nativeId, e);
      return false;
    }
  }

  private async eliminarEventoNativo(nativeId: string): Promise<void> {
    try {
      await CapacitorCalendar.deleteEvent({ id: nativeId });
    } catch (e) {
      console.error('No se pudo eliminar el evento del calendario nativo:', nativeId, e);
    }
  }

  private async obtenerMapaSincronizado(): Promise<Record<string, EventoSincronizado>> {
    const { value } = await Preferences.get({ key: SYNC_MAP_KEY });
    return value ? JSON.parse(value) : {};
  }

  private async guardarMapaSincronizado(mapa: Record<string, EventoSincronizado>): Promise<void> {
    await Preferences.set({ key: SYNC_MAP_KEY, value: JSON.stringify(mapa) });
  }
}
