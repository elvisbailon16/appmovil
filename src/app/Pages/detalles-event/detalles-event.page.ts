import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { IonContent, IonSpinner, IonIcon } from '@ionic/angular/standalone';
import { CabeceraComponent } from '../Componentes/cabecera/cabecera.component';
import { ApiService } from 'src/app/Service/api-service';
import { Router } from '@angular/router';
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
  error: string | null = null;
  inscrito = false;
  procesando = false;
  id: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private apiService: ApiService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Recibe el id desde los query params: /detalle-evento?id=xxx
    this.id = this.route.snapshot.queryParamMap.get('id');
    if (this.id) {
      this.cargarEvento(this.id);
    } else {
      this.error = 'No se encontró el evento.';
    }
  }

  cargarEvento(id: string): void {
    this.cargando = true;
    this.error = null;

    this.apiService.getEventoById(id).subscribe({
      next: (data) => {
        this.evento  = data;
        this.cargando = false;
      },
      error: () => {
        this.cargando = false;
        this.error = 'No se pudo cargar el evento.';
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

  verPonentes(){
    this.router.navigate(['/ponentes'], {
      queryParams: { id: this.evento.id }
    });
  }
  verActividades(){
    this.router.navigate(['/act-evento'], {
      queryParams: { id: this.evento.id }
    });
  }


}
 