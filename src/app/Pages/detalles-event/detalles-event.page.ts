import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { IonContent, IonSpinner, IonIcon } from '@ionic/angular/standalone';
import { CabeceraComponent } from '../Componentes/cabecera/cabecera.component';
import { ApiService } from 'src/app/Service/api-service';

@Component({
  selector: 'app-detalles-event',
  templateUrl: './detalles-event.page.html',
  styleUrls: ['./detalles-event.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonContent,
    IonSpinner,
    IonIcon,
    CabeceraComponent,
  ],
})
export class DetallesEventPage implements OnInit {

  evento: any = null;
  cargando = false;
  inscrito = false;
  procesando = false;
 
  constructor(
    private route: ActivatedRoute,
    private apiService: ApiService,
  ) {}
 
  ngOnInit(): void {
    // Recibe el id desde los query params: /detalle-evento?id=xxx
    const id = this.route.snapshot.queryParamMap.get('id');
    if (id) {
      console.log(id)
      this.cargarEvento(id);
    }
  }
 
  cargarEvento(id: string): void {
    this.cargando = true;
 
    this.apiService.getEventoById(id).subscribe({
      next: (data) => {
        this.evento  = data;
        console.log('Evento cargado:', this.evento);
        this.cargando = false;
      },
      error: () => {
        this.cargando = false;
      },
    });
  }
 
  get estadoClass(): string {
    if (!this.evento) return '';
    const s = this.evento.statusevento;
    if (s === 'Finalizado') return 'finalizado';
    if (s === 'En curso')   return 'en-curso';
    return '';
  }
 
  async onInscribirse(): Promise<void> {
    this.procesando = true;
    this.inscrito   = true; // optimistic UI
 
    try {
      // TODO: this.apiService.inscribirse(this.evento.id)
      await new Promise(r => setTimeout(r, 800)); // quitar en producción
    } catch {
      this.inscrito = false;
    } finally {
      this.procesando = false;
    }
  }


}
 