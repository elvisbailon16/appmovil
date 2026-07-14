// ponente-card.component.ts
import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { IonIcon } from '@ionic/angular/standalone';

export interface Ponente {
  idponente: string;
  nombre: string;
  user_id: string;
  organizacion: string;
  foto: string;
  nombre_evento: string;
  etiqueta: string;
}

@Component({
  selector: 'app-ponente-card',
  templateUrl: './ponente-card.component.html',
  styleUrls: ['./ponente-card.component.scss'],
  standalone: true,
  imports: [CommonModule, IonIcon],
})
export class PonenteCardComponent {
  @Input() ponente!: Ponente;

  constructor(private router: Router) {}

  verDetalle(): void {
    this.router.navigate(['/detalle-ponente'], {
      queryParams: { id: this.ponente.idponente }
    });
  }
}