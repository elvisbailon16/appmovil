// destacados-event.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { IonIcon } from '@ionic/angular/standalone';
import { ApiService } from 'src/app/Service/api-service';

// TODO: por ahora se arman los destacados recortando la lista general de
// eventos (getEventos()). Cuando exista un endpoint propio de destacados,
// basta con reemplazar cargarDestacados() por esa llamada.
const MAX_DESTACADOS = 10;

@Component({
  selector: 'app-destacados-event',
  templateUrl: './destacados-event.component.html',
  styleUrls: ['./destacados-event.component.scss'],
  standalone: true,
  imports: [CommonModule, IonIcon],
})
export class DestacadosEventComponent implements OnInit {
  destacados: any[] = [];
  cargando = false;

  constructor(private apiService: ApiService, private router: Router) {}

  ngOnInit(): void {
    this.cargarDestacados();
  }

  cargarDestacados(): void {
    this.cargando = true;
    this.apiService.getEventos().subscribe({
      next: (res: any) => {
        const eventos = res.data ?? res;
        this.destacados = (eventos ?? []).slice(0, MAX_DESTACADOS);
        this.cargando = false;
      },
      error: (err) => {
        console.error('Error cargando destacados:', err);
        this.cargando = false;
      },
    });
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

  abrirEvento(id: string): void {
    this.router.navigate(['/detalles-event'], { queryParams: { id } });
  }
}
