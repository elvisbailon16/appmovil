import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { IonContent, IonSpinner, IonIcon } from '@ionic/angular/standalone';
import { CabeceraComponent } from '../Componentes/cabecera/cabecera.component';
import { ApiService } from 'src/app/Service/api-service';

@Component({
  selector: 'app-act-evento',
  templateUrl: './act-evento.page.html',
  styleUrls: ['./act-evento.page.scss'],
  standalone: true,
  imports: [CommonModule, IonContent, IonSpinner, IonIcon, CabeceraComponent],
})
export class ActEventoPage implements OnInit, OnDestroy {

  evento: any = null;
  emojis: any[] = [];
  cargando = false;
  error: string | null = null;

  actividadSeleccionada: any = null;
  emojiSeleccionado: any = null;

  /** Retraso (ms) entre cada reacción en cola antes de que comience a llover. Ajustable. */
  retrasoColaLluvia = 1000;

  lluviaEmojis: {
    id: number;
    icono: string;
    left: number;
    duration: number;
    delay: number;
    size: number;
    drift: number;
  }[] = [];

  private eventoId = '';
  private queryParamSub: any;
  private lluviaBatchId = 0;
  private colaLluvia: string[] = [];
  private procesandoColaLluvia = false;

  constructor(
    private route: ActivatedRoute,
    private apiService: ApiService,
  ) {}

  ngOnInit(): void {
    this.queryParamSub = this.route.queryParamMap.subscribe(params => {
      const id = params.get('id');
      if (id && id !== this.eventoId) {
        this.eventoId = id;
        this.cargarActividades();
      }
    });
  }

  ngOnDestroy(): void {
    this.queryParamSub?.unsubscribe();
  }

  cargarActividades(): void {
    this.cargando = true;
    this.error = null;
    this.actividadSeleccionada = null;

    this.apiService.getActividadesByEvento(this.eventoId).subscribe({
      next: (res: any) => {
        this.evento = res?.data?.evento ?? null;
        this.emojis = res?.data?.emojis ?? [];
        this.cargando = false;
      },
      error: () => {
        this.error = 'No se pudo cargar la agenda de actividades.';
        this.cargando = false;
      },
    });
  }

  seleccionarActividad(actividad: any): void {
    this.actividadSeleccionada = actividad;
    this.emojiSeleccionado = null;
  }

  cerrarDetalle(): void {
    this.actividadSeleccionada = null;
    this.emojiSeleccionado = null;
  }

  reaccionar(emoji: any): void {
    this.emojiSeleccionado = emoji;
    this.colaLluvia.push(emoji.icono);
    this.procesarColaLluvia();
  }

  // Consume la cola en orden, dejando `retrasoColaLluvia` ms entre el inicio
  // de cada lluvia. Las lluvias no se cancelan entre sí: se suman a las que
  // ya están cayendo para que se vean una detrás de otra, no una reemplazando a otra.
  private procesarColaLluvia(): void {
    if (this.procesandoColaLluvia) return;

    const icono = this.colaLluvia.shift();
    if (!icono) return;

    this.procesandoColaLluvia = true;
    this.dispararLluviaEmoji(icono);

    setTimeout(() => {
      this.procesandoColaLluvia = false;
      this.procesarColaLluvia();
    }, this.retrasoColaLluvia);
  }

  /** Tope de partículas simultáneas en pantalla — evita que reaccionar varias
   *  veces seguido acumule cientos de elementos animando a la vez y trabe
   *  el render en equipos de gama media/baja. */
  private readonly MAX_PARTICULAS_SIMULTANEAS = 80;

  private dispararLluviaEmoji(icono: string): void {
    const batchId = ++this.lluviaBatchId;
    const cantidad = 30;

    const nuevasParticulas = Array.from({ length: cantidad }, (_, i) => ({
      id: batchId * 1000 + i,
      icono,
      left: Math.random() * 92,
      duration: 3.6 + Math.random() * 1.8,
      delay: Math.random() * 1.5,
      size: 22 + Math.random() * 18,
      drift: (Math.random() - 0.5) * 80,
    }));

    // Se agregan a la lluvia ya en curso en lugar de reemplazarla, pero
    // recortando las partículas más viejas si nos pasamos del tope.
    const combinadas = [...this.lluviaEmojis, ...nuevasParticulas];
    this.lluviaEmojis = combinadas.length > this.MAX_PARTICULAS_SIMULTANEAS
      ? combinadas.slice(combinadas.length - this.MAX_PARTICULAS_SIMULTANEAS)
      : combinadas;

    const duracionMaxima = Math.max(...nuevasParticulas.map(p => p.duration + p.delay));
    setTimeout(() => {
      const idsBatch = new Set(nuevasParticulas.map(p => p.id));
      this.lluviaEmojis = this.lluviaEmojis.filter(p => !idsBatch.has(p.id));
    }, duracionMaxima * 1000 + 200);
  }

  estadoClass(estado: string): string {
    switch (estado) {
      case 'Finalizado': return 'finalizado';
      case 'En curso': return 'en-curso';
      case 'Próximo':
      case 'Pendiente': return 'proximo';
      default: return '';
    }
  }

  estadoIcon(estado: string): string {
    switch (estado) {
      case 'Finalizado': return 'checkmark-circle-outline';
      case 'En curso': return 'radio-button-on-outline';
      case 'Próximo':
      case 'Pendiente': return 'time-outline';
      default: return 'ellipse-outline';
    }
  }

  formatHora(hora: string): string {
    return hora ? hora.slice(0, 5) : '';
  }
}
