// recordatorios.page.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonIcon, IonToggle, IonSpinner } from '@ionic/angular/standalone';
import { CabeceraComponent } from '../Componentes/cabecera/cabecera.component';
import { RecordatorioService, Recordatorio } from 'src/app/Service/recordatorio-service';

@Component({
  selector: 'app-recordatorios',
  templateUrl: './recordatorios.page.html',
  styleUrls: ['./recordatorios.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonContent, IonIcon, IonToggle, IonSpinner, CabeceraComponent],
})
export class RecordatoriosPage implements OnInit {
  recordatorios: Recordatorio[] = [];
  cargando = true;

  mostrarFormulario = false;
  guardando = false;
  error: string | null = null;
  editandoId: number | null = null;

  formTitulo = '';
  formMensaje = '';
  formHora = '12:00';

  constructor(private recordatorioService: RecordatorioService) {}

  ngOnInit(): void {
    this.cargar();
  }

  async cargar(): Promise<void> {
    this.cargando = true;
    const lista = await this.recordatorioService.listar();
    this.recordatorios = lista.sort((a, b) => (a.hora * 60 + a.minuto) - (b.hora * 60 + b.minuto));
    this.cargando = false;
  }

  abrirNuevo(): void {
    this.editandoId = null;
    this.formTitulo = '';
    this.formMensaje = '';
    this.formHora = '12:00';
    this.error = null;
    this.mostrarFormulario = true;
  }

  editar(r: Recordatorio): void {
    this.editandoId = r.id;
    this.formTitulo = r.titulo;
    this.formMensaje = r.mensaje;
    this.formHora = this.formatHora(r);
    this.error = null;
    this.mostrarFormulario = true;
  }

  cancelarFormulario(): void {
    this.mostrarFormulario = false;
    this.error = null;
  }

  async guardar(): Promise<void> {
    if (!this.formTitulo.trim() || !this.formHora) {
      this.error = 'Completa el título y la hora.';
      return;
    }

    const [hora, minuto] = this.formHora.split(':').map(Number);
    const recordatorio: Recordatorio = {
      id: this.editandoId ?? this.recordatorioService.nuevoId(),
      titulo: this.formTitulo.trim(),
      mensaje: this.formMensaje.trim() || 'Recordatorio de TerriMeet',
      hora,
      minuto,
      activo: true,
    };

    this.guardando = true;
    this.error = null;

    const ok = await this.recordatorioService.guardar(recordatorio);
    this.guardando = false;

    if (!ok) {
      this.error = 'Se guardó, pero falta el permiso de notificaciones del sistema para activarlo. Actívalo en los ajustes del dispositivo.';
    } else {
      this.mostrarFormulario = false;
    }

    await this.cargar();
  }

  async alternar(r: Recordatorio, event: CustomEvent): Promise<void> {
    const activo = (event.detail as any).checked as boolean;
    const ok = await this.recordatorioService.alternar(r.id, activo);
    if (!ok && activo) {
      this.error = 'No se pudo activar: falta el permiso de notificaciones del sistema.';
    }
    await this.cargar();
  }

  async eliminar(r: Recordatorio): Promise<void> {
    await this.recordatorioService.eliminar(r.id);
    await this.cargar();
  }

  formatHora(r: Recordatorio): string {
    return `${String(r.hora).padStart(2, '0')}:${String(r.minuto).padStart(2, '0')}`;
  }
}
