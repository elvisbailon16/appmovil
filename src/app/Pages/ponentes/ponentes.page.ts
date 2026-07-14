import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { IonContent, IonSpinner, IonIcon } from '@ionic/angular/standalone';
import { CabeceraComponent } from '../Componentes/cabecera/cabecera.component';
import {PonenteCardComponent} from '../Componentes/ponente-card/ponente-card.component';
import { ApiService } from 'src/app/Service/api-service';
@Component({
  selector: 'app-ponentes',
  templateUrl: './ponentes.page.html',
  styleUrls: ['./ponentes.page.scss'],
  standalone: true,
  imports: [IonContent, IonSpinner, IonIcon, CabeceraComponent, PonenteCardComponent, CommonModule]
})
export class PonentesPage implements OnInit {
  // @Input() id:string = '';
  ponentes: any;
  cargando = false;
  error: string | null = null;
  private eventoId: string = '';
  private queryParamSub: any;
 
  constructor(
    private route: ActivatedRoute,
    private apiService: ApiService,
  ) {}

    ngOnInit(): void {
    // Nos suscribimos en vez de usar snapshot,
    // así reaccionamos cada vez que cambia el "id" en la URL.
    this.queryParamSub = this.route.queryParamMap.subscribe(params => {
      const id = params.get('id');
      if (id && id !== this.eventoId) {
        this.eventoId = id;
        this.cargarPonentes();
      }
    });
  }
 
  cargarPonentes(): void {
    this.cargando = true;
    this.error = null;
 
    this.apiService.getPonentesByEvento(this.eventoId).subscribe({
      next: (data: any) => {
        this.ponentes = data.data;
        this.cargando = false;
      },
      error: () => {
        this.error = 'No se pudo cargar los ponentes.';
        this.cargando = false;
      },
    });
  }
}
