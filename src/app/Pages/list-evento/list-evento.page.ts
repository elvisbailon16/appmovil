import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonSearchbar, InfiniteScrollCustomEvent, IonInfiniteScroll, IonInfiniteScrollContent, IonSpinner } from '@ionic/angular/standalone';
import { CabeceraComponent } from '../Componentes/cabecera/cabecera.component';
import { ApiService } from 'src/app/Service/api-service';
import { EventoComponent } from '../Componentes/evento/evento.component';
import { EmptyStateComponent } from '../Componentes/empty-state/empty-state.component';
@Component({
  selector: 'app-list-evento',
  templateUrl: './list-evento.page.html',
  styleUrls: ['./list-evento.page.scss'],
  standalone: true,
  imports: [IonSpinner, IonInfiniteScroll, EventoComponent, IonContent, IonSearchbar, CommonModule, FormsModule, CabeceraComponent, IonInfiniteScrollContent, EmptyStateComponent]
})
export class ListEventoPage implements OnInit {
eventos: any[] = [];
private todosLosEventos: any[] = [];
terminoBusqueda = '';
cargando = false;
error: string | null = null;
selectedTab: 'todos' | 'mis-eventos' = 'todos';

constructor(private eventosService: ApiService) {}

ngOnInit() {
  this.cargarEventos();
}

selectTab(tab: 'todos' | 'mis-eventos') {
  this.selectedTab = tab;
  this.eventos = [];
  this.todosLosEventos = [];
  this.terminoBusqueda = '';
  this.error = null;

  if (tab === 'todos') {
    this.cargarEventos();
  } else {
    this.misEventos();
  }
}

/** Reintenta la carga de la pestaña activa (usado por el botón "Reintentar"). */
recargar(): void {
  if (this.selectedTab === 'todos') {
    this.cargarEventos();
  } else {
    this.misEventos();
  }
}

buscar(termino: string | null | undefined): void {
  this.terminoBusqueda = termino ?? '';
  const q = this.terminoBusqueda.trim().toLowerCase();

  this.eventos = q
    ? this.todosLosEventos.filter(e =>
        (e.nombre ?? '').toLowerCase().includes(q) ||
        (e.categoria ?? '').toLowerCase().includes(q) ||
        (e.sede ?? e.direccion ?? '').toLowerCase().includes(q)
      )
    : this.todosLosEventos;
}

cargarEventos(): void {

  this.cargando = true;
  this.error = null;

  this.eventosService.getEventos().subscribe({
    next: (res: any) => {
      this.todosLosEventos = res.data ?? res;
      this.buscar(this.terminoBusqueda);
      this.cargando = false;
    },
    error: (err) => {
      this.error = err.status === 401
        ? 'Sesión expirada. Vuelve a iniciar sesión.'
        : 'No se pudo conectar al servidor.';
      this.cargando = false;
    },
  });
}

  misEventos(): void {
    this.cargando = true;
    this.error = null;

    this.eventosService.getMisEventos().subscribe({
      next: (res: any) => {
        this.todosLosEventos = res.data ?? res;
        this.buscar(this.terminoBusqueda);
        this.cargando = false;
      },
      error: (err) => {
        this.error = err.status === 401
          ? 'Sesión expirada. Vuelve a iniciar sesión.'
          : 'No se pudo conectar al servidor.';
        this.cargando = false;
      },
    });
  }

onIonInfinite(event: InfiniteScrollCustomEvent) {
  // El backend no pagina get_eventos/get_mis_eventos: ya se trajo la lista completa
  // en la carga inicial, así que no hay nada más que pedir. Se deshabilita para no
  // repetir la misma petición en cada scroll al final de la lista.
  event.target.complete();
  event.target.disabled = true;
}


}
