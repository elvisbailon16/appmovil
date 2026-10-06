import { Injectable } from '@angular/core';
import { Platform } from '@ionic/angular';
import { Preferences } from '@capacitor/preferences';
import { CapacitorCalendar, CalendarPermissionScope } from '@ebarooni/capacitor-calendar';
import { ApiService } from './api-service';
import { environment } from 'src/environments/environment';

/** Log de diagnóstico del sync, silenciado en producción (puede incluir datos del usuario). */
function logSync(...args: unknown[]): void {
  if (!environment.production) console.log('[CalendarSync]', ...args);
}

const SYNC_MAP_KEY = 'calendar_sync_map';

interface EventoSincronizado {
  nativeId: string;
  hash: string;
}

/**
 * Mantiene el calendario nativo del dispositivo alineado con los eventos del
 * usuario (mismos datos que se muestran en "Mis eventos": getMisEventos()).
 * Si el evento trae horainicio/horafin se agenda con esa franja horaria exacta;
 * si no, se agenda como fecha marcada (todo el día) entre fechainicio y fechafin.
 * Incluye recordatorios (1 día antes y 1 hora antes del inicio).
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
    logSync('sync() invocado. syncing =', this.syncing, '| es plataforma capacitor =', this.platform.is('capacitor'));
    if (this.syncing || !this.platform.is('capacitor')) return;
    this.syncing = true;

    try {
      const tienePermiso = await this.asegurarPermiso();
      logSync('permiso de calendario concedido =', tienePermiso);
      if (!tienePermiso) return;

      const inscripciones = await this.obtenerInscripciones();
      logSync('inscripciones obtenidas de la API =', inscripciones.length);
      const mapa = await this.obtenerMapaSincronizado();
      const idsVigentes = new Set<string>();

      for (const evento of inscripciones) {
        if (evento?.id === undefined || evento?.id === null) continue;
        const id = String(evento.id);
        idsVigentes.add(id);

        const opciones = this.mapearEvento(evento);
        if (!opciones) {
          console.warn('[CalendarSync] evento sin fecha válida, se omite:', evento);
          continue;
        }

        const hash = JSON.stringify(opciones);
        const existente = mapa[id];

        if (!existente) {
          const nativeId = await this.crearEventoNativo(opciones);
          logSync('evento creado en calendario nativo:', opciones.title, '| nativeId =', nativeId);
          if (nativeId) mapa[id] = { nativeId, hash };
        } else if (existente.hash !== hash) {
          const actualizado = await this.actualizarEventoNativo(existente.nativeId, opciones);
          logSync('evento actualizado:', opciones.title, '| ok =', actualizado);
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

  /** Al cerrar sesión: quita del calendario nativo los eventos del usuario y olvida el mapa de sincronización. */
  async limpiar(): Promise<void> {
    if (this.platform.is('capacitor')) {
      const mapa = await this.obtenerMapaSincronizado();
      for (const { nativeId } of Object.values(mapa)) {
        await this.eliminarEventoNativo(nativeId);
      }
    }
    await Preferences.remove({ key: SYNC_MAP_KEY });
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
      this.apiService.getMisEventos().subscribe({
        next: (res: any) => resolve(res?.data ?? res ?? []),
        error: reject,
      });
    });
  }

  private mapearEvento(evento: any): { title: string; startDate: number; endDate: number; isAllDay: boolean; location?: string; description?: string; alerts: number[] } | null {
    const fechas = this.construirFechas(evento);
    if (!fechas) return null;

    const horario = evento.horainicio && evento.horafin
      ? `Horario: ${this.formatHora(evento.horainicio)} – ${this.formatHora(evento.horafin)}`
      : null;
    const notas = [evento.descripcion, horario].filter(Boolean).join('\n\n');

    return {
      title: evento.nombre || 'Evento',
      startDate: fechas.startDate,
      endDate: fechas.endDate,
      isAllDay: fechas.isAllDay,
      location: evento.sede || evento.direccion || undefined,
      description: notas || undefined,
      // Recordatorio: 1 día antes y 1 hora antes del inicio del evento.
      alerts: [-1440, -60],
    };
  }

  private formatHora(hora: string): string {
    return hora ? hora.slice(0, 5) : '';
  }

  // Si el evento trae horainicio (y opcionalmente horafin) se agenda con esa
  // franja horaria exacta; si no, se agenda como fecha marcada (todo el día)
  // entre fechainicio y fechafin (o solo fechainicio si no hay fechafin).
  //
  // fechainicio/fechafin llegan como "YYYY-MM-DD" y horainicio/horafin como
  // "HH:MM:SS", ambos en hora LOCAL del evento — sin sufijo de zona horaria.
  // `new Date('YYYY-MM-DD')` los interpreta como medianoche UTC, y luego
  // setHours() los vuelve a anclar en hora LOCAL del dispositivo: en cualquier
  // huso horario con offset negativo (p.ej. Ecuador, UTC-5) el evento terminaba
  // agendado UN DÍA ANTES de la fecha real. Por eso acá se arman las fechas a
  // mano con los componentes (año, mes, día, hora, minuto) en vez de dejar que
  // el motor de JS interprete el string.
  private construirFechas(evento: any): { startDate: number; endDate: number; isAllDay: boolean } | null {
    const tieneHorario = !!evento.horainicio;
    const inicio = this.combinarFechaHora(evento.fechainicio, evento.horainicio);
    if (!inicio) return null;

    if (tieneHorario) {
      let fin = this.combinarFechaHora(evento.fechafin || evento.fechainicio, evento.horafin || evento.horainicio);
      if (!fin || fin.getTime() <= inicio.getTime()) {
        fin = new Date(inicio.getTime() + 60 * 60 * 1000); // datos inconsistentes -> 1h por defecto
      }
      return { startDate: inicio.getTime(), endDate: fin.getTime(), isAllDay: false };
    }

    const fin = this.combinarFechaHora(evento.fechafin || evento.fechainicio, null) ?? new Date(inicio);
    inicio.setHours(0, 0, 0, 0);
    fin.setHours(23, 59, 0, 0);

    return { startDate: inicio.getTime(), endDate: fin.getTime(), isAllDay: true };
  }

  // Combina una fecha "YYYY-MM-DD" con una hora opcional "HH:MM:SS" construyendo
  // el Date a partir de sus componentes (siempre en hora local del dispositivo),
  // en vez de pasar el string directo a `new Date(...)`.
  private combinarFechaHora(fecha: string | null | undefined, hora: string | null | undefined): Date | null {
    if (!fecha) return null;
    const [anio, mes, dia] = fecha.split('T')[0].split('-').map(Number);
    if (!anio || !mes || !dia) return null;

    let horas = 0, minutos = 0, segundos = 0;
    if (hora) {
      const partes = hora.split(':').map(Number);
      horas = partes[0] || 0;
      minutos = partes[1] || 0;
      segundos = partes[2] || 0;
    }

    const resultado = new Date(anio, mes - 1, dia, horas, minutos, segundos);
    return isNaN(resultado.getTime()) ? null : resultado;
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
