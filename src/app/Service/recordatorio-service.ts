// recordatorio-service.ts
import { Injectable } from '@angular/core';
import { Platform } from '@ionic/angular';
import { Preferences } from '@capacitor/preferences';
import { LocalNotifications } from '@capacitor/local-notifications';

const STORAGE_KEY = 'recordatorios_locales';

export interface Recordatorio {
  id: number;
  titulo: string;
  mensaje: string;
  hora: number;   // 0-23
  minuto: number; // 0-59
  activo: boolean;
}

/**
 * Recordatorios locales configurables por el usuario (distintos de las
 * notificaciones push de Firebase). Se agendan con el plugin LocalNotifications
 * usando un horario tipo "cron" (`on: { hour, minute }` sin día/mes), que hace
 * que el sistema operativo la repita automáticamente todos los días a esa hora,
 * sin depender de que la app esté abierta.
 */
@Injectable({
  providedIn: 'root',
})
export class RecordatorioService {
  private inicializado = false;

  constructor(private platform: Platform) {
    if (this.platform.is('capacitor')) {
      this.init();
    }
  }

  private async init(): Promise<void> {
    if (this.inicializado) return;
    this.inicializado = true;

    try {
      let recordatorios = await this.listar();

      // Primera vez que se abre la app: se deja un recordatorio de ejemplo ya activo,
      // para que el usuario vea cómo funciona antes de crear los suyos.
      if (recordatorios.length === 0) {
        const ejemplo: Recordatorio = {
          id: 1,
          titulo: 'Recordatorio diario',
          mensaje: 'No olvides revisar tus eventos de hoy en TerriMeet.',
          hora: 12,
          minuto: 0,
          activo: true,
        };
        recordatorios = [ejemplo];
        await this.guardarLista(recordatorios);
      }

      // Reinstala en el sistema los recordatorios activos (ej. tras reinstalar la app
      // o limpiar datos, ya que las alarmas del SO no sobreviven eso aunque Preferences sí).
      for (const r of recordatorios.filter(r => r.activo)) {
        await this.reprogramar(r);
      }
    } catch (e) {
      console.error('[Recordatorios] error inicializando:', e);
    }
  }

  async listar(): Promise<Recordatorio[]> {
    const { value } = await Preferences.get({ key: STORAGE_KEY });
    return value ? JSON.parse(value) : [];
  }

  nuevoId(): number {
    return Date.now() % 2147483647;
  }

  /** Crea o actualiza un recordatorio. Devuelve false si se guardó pero no se pudo agendar (ej. falta el permiso del sistema). */
  async guardar(recordatorio: Recordatorio): Promise<boolean> {
    const lista = await this.listar();
    const idx = lista.findIndex(r => r.id === recordatorio.id);
    if (idx >= 0) lista[idx] = recordatorio; else lista.push(recordatorio);
    await this.guardarLista(lista);

    if (!recordatorio.activo) {
      await this.cancelar(recordatorio.id);
      return true;
    }
    return this.reprogramar(recordatorio);
  }

  async eliminar(id: number): Promise<void> {
    const lista = (await this.listar()).filter(r => r.id !== id);
    await this.guardarLista(lista);
    await this.cancelar(id);
  }

  async alternar(id: number, activo: boolean): Promise<boolean> {
    const lista = await this.listar();
    const recordatorio = lista.find(r => r.id === id);
    if (!recordatorio) return false;

    recordatorio.activo = activo;
    await this.guardarLista(lista);

    if (!activo) {
      await this.cancelar(id);
      return true;
    }
    return this.reprogramar(recordatorio);
  }

  /** Al cerrar sesión: cancela las alarmas del sistema y borra los recordatorios guardados. */
  async limpiar(): Promise<void> {
    if (this.platform.is('capacitor')) {
      for (const r of await this.listar()) {
        await this.cancelar(r.id);
      }
    }
    await Preferences.remove({ key: STORAGE_KEY });
  }

  private async guardarLista(lista: Recordatorio[]): Promise<void> {
    await Preferences.set({ key: STORAGE_KEY, value: JSON.stringify(lista) });
  }

  private async asegurarPermiso(): Promise<boolean> {
    try {
      const estado = await LocalNotifications.checkPermissions();
      if (estado.display === 'granted') return true;
      const solicitado = await LocalNotifications.requestPermissions();
      return solicitado.display === 'granted';
    } catch (e) {
      console.error('[Recordatorios] no se pudo solicitar permiso de notificaciones:', e);
      return false;
    }
  }

  // Agenda el recordatorio para repetirse todos los días a la hora indicada.
  // Un `on` sin día/mes es interpretado por el plugin como una regla recurrente
  // diaria (equivalente a un cron "a las H:M todos los días").
  private async reprogramar(recordatorio: Recordatorio): Promise<boolean> {
    const permiso = await this.asegurarPermiso();
    if (!permiso) {
      console.warn('[Recordatorios] permiso de notificaciones no concedido, no se pudo programar:', recordatorio.titulo);
      return false;
    }

    try {
      await LocalNotifications.schedule({
        notifications: [{
          id: recordatorio.id,
          title: recordatorio.titulo,
          body: recordatorio.mensaje,
          schedule: {
            on: { hour: recordatorio.hora, minute: recordatorio.minuto },
            allowWhileIdle: true,
          },
        }],
      });
      return true;
    } catch (e) {
      console.error('[Recordatorios] no se pudo programar:', recordatorio.titulo, e);
      return false;
    }
  }

  private async cancelar(id: number): Promise<void> {
    await LocalNotifications.cancel({ notifications: [{ id }] }).catch(() => {});
  }
}
