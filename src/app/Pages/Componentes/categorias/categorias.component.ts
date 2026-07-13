// categorias.component.ts
import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonIcon } from '@ionic/angular/standalone';
import { ApiService } from 'src/app/Service/api-service';

@Component({
  selector: 'app-categorias',
  templateUrl: './categorias.component.html',
  styleUrls: ['./categorias.component.scss'],
  standalone: true,
  imports: [CommonModule, IonIcon],
})
export class CategoriasComponent implements OnInit {

  // Emite la categoría seleccionada al padre
  @Output() categoriaSeleccionada = new EventEmitter<string | null>();

  categorias: any;
  categoriaActiva: string | null = null;

  // Mapeo de categoría → ícono de Ionicons
  private iconos: Record<string, string> = {
  'Congreso':                 'business-outline',
  'Encuentro':                'people-outline',
  'Workshop':                 'hammer-outline',
  'Día de campo':             'leaf-outline',
  'Conversatorio':            'chatbubbles-outline',
  'Feria':                    'storefront-outline',
  'Académico e Intercultural':'globe-outline',
  'Evento':                   'calendar-outline',
  'Taller':                   'construct-outline',
  'Autoevaluación':           'clipboard-outline',
  'Capacitación':             'bar-chart-outline',
  'Curso':                    'school-outline',
  'Seminario':                'mic-outline',
  'Académico':                'library-outline',
};

  constructor(private apiService: ApiService) {}

  ngOnInit(): void {
    this.cargarCategorias();
  }

  cargarCategorias(): void {
    this.apiService.getCategorias().subscribe({
      next: (data) => {
        this.categorias = data;
      },
      error: (err) => {
        console.error('Error cargando categorías:', err);
      },
    });
  }

  getIcono(descripcion: string): string {
    return this.iconos[descripcion] ?? 'apps-outline';
  }

  seleccionar(descripcion: string, id: string): void {
    // Si toca la misma categoría la deselecciona (toggle)
    if (this.categoriaActiva === descripcion) {
      this.categoriaActiva = null;
      this.categoriaSeleccionada.emit(null);
    } else {
      this.categoriaActiva = descripcion;
      this.categoriaSeleccionada.emit(id); // Emitir el ID de la categoría seleccionada
    }
  }

  // filter(id_categoria: string){
  //   this.apiService.getEventosByCategoria(id_categoria).subscribe({
  //     next: (data) => {
  //       console.log('Eventos filtrados por categoría:', data);
        
  //     },
  //     error: (err) => {
  //       console.error('Error filtrando eventos por categoría:', err);
  //     },
  //   });
  // }
}