import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonButton, IonIcon, IonButtons, InfiniteScrollCustomEvent, IonInfiniteScroll, IonInfiniteScrollContent } from '@ionic/angular/standalone';
import { EventoComponent } from '../Componentes/evento/evento.component';
import { ApiService } from 'src/app/Service/api-service';
import { CategoriasComponent } from '../Componentes/categorias/categorias.component';
import { EmptyStateComponent } from '../Componentes/empty-state/empty-state.component';
import { DestacadosEventComponent } from '../Componentes/destacados-event/destacados-event.component';
@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
  standalone: true,
  imports: [CategoriasComponent, DestacadosEventComponent, IonInfiniteScrollContent, IonInfiniteScroll, IonButtons, IonContent, IonHeader, IonToolbar, CommonModule, FormsModule, EventoComponent, EmptyStateComponent]
})
export class HomePage implements OnInit {
  
  eventos: any[] = [];
  cargando = false;
  error: string | null = null;
  usuario: any = null;
  constructor( private eventosService: ApiService) { }

  ngOnInit() {
    this.cargarEventos();
    this.cargarUsuario();
  }

  cargarUsuario(): void {
    this.eventosService.getPerfilUsuario().subscribe({
      next: (datos: any) => { this.usuario = datos.data; },
      error: (e) => console.log('Error obteniendo usuario:', e)
    });
  }

    cargarEventos(): void {
    this.cargando = true;
    this.error    = null;
 
    this.eventosService.getEventos().subscribe({
      next: (res:any) => {
        this.eventos  = res.data ?? res;
        this.cargando = false;
      },
      error: (err) => {
        this.error    = err.status === 401
          ? 'Sesión expirada. Vuelve a iniciar sesión.'
          : 'No se pudo conectar al servidor.';
        this.cargando = false;
      },
    });
  }




 categoriaActiva: string | null = null;

onCategoriaSeleccionada(id: string | null): void {
  this.categoriaActiva = id; // ← guarda la categoría activa
  if (id) {
    this.cargando = true;
    this.eventosService.getEventosByCategoria(id).subscribe({
      next: (res:any) => {
        this.eventos = res.data ?? res;
        //  console.log("Eventos filtrados por categoría:", data);
        this.cargando = false;
      },
      error: () => { this.cargando = false; }
    });
  } else {
    this.cargarEventos();
  }
}

onIonInfinite(event: InfiniteScrollCustomEvent) {
  // El backend no pagina get_eventos/get_eventos_categoria: la carga inicial ya trae
  // la lista completa, así que no hay nada más que pedir. Se deshabilita para no
  // repetir la misma petición en cada scroll al final de la lista.
  event.target.complete();
  event.target.disabled = true;
}

}
