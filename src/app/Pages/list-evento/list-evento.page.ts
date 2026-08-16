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
  this.error = null;

  if (tab === 'todos') {
    this.cargarEventos();
  } else {
    this.misEventos();
  }
}



cargarEventos(): void {

  this.cargando = true;
  this.error = null;

  this.eventosService.getEventos().subscribe({
    next: (res: any) => {
      this.eventos = res.data ?? res;
      this.cargando = false;   // ← faltaba esto
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
    this.eventosService.getMisEventos().subscribe({
      next: (res: any) => {
        this.eventos = res.data ?? res;
        this.cargando = false;   // ← faltaba esto
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
  setTimeout(() => event.target.complete(), 500);
}


}
