import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonButton, IonIcon, IonButtons, InfiniteScrollCustomEvent, IonInfiniteScroll, IonInfiniteScrollContent } from '@ionic/angular/standalone';
import { EventoComponent } from '../Componentes/evento/evento.component';
import { ApiService } from 'src/app/Service/api-service';
import { CategoriasComponent } from '../Componentes/categorias/categorias.component';
@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
  standalone: true,
  imports: [CategoriasComponent, IonInfiniteScrollContent, IonInfiniteScroll, IonButtons, IonIcon, IonButton, IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule, EventoComponent]
})
export class HomePage implements OnInit {
  eventos: any;
  cargando = false;
  error: string | null = null;
  constructor( private eventosService: ApiService) { }

  ngOnInit() {
    this.cargarEventos();
  }

    cargarEventos(): void {
    this.cargando = true;
    this.error    = null;
 
    this.eventosService.getEventos().subscribe({
      next: (data) => {
        this.eventos  = data;
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

    onIonInfinite(event: InfiniteScrollCustomEvent) {
    this.cargarEventos();
    setTimeout(() => {
      event.target.complete();
    }, 500);
  }

}
