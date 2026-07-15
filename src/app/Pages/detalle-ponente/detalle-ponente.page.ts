// detalle-ponente.page.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { IonContent, IonSpinner, IonIcon } from '@ionic/angular/standalone';
import { CabeceraComponent } from '../Componentes/cabecera/cabecera.component';
import { ApiService } from 'src/app/Service/api-service';

@Component({
  selector: 'app-detalle-ponente',
  templateUrl: './detalle-ponente.page.html',
  styleUrls: ['./detalle-ponente.page.scss'],
  standalone: true,
  imports: [CommonModule, IonContent, IonSpinner, IonIcon, CabeceraComponent],
})
export class DetallePonentePage implements OnInit {

  ponente: any = null;
  cargando = false;
  private queryParamSub: any;
  private eventoId: string = '';

  constructor(
    private route: ActivatedRoute,
    private apiService: ApiService,
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.queryParamMap.get('id');
    if (id) this.cargarPonente(id);

    this.queryParamSub = this.route.queryParamMap.subscribe(params => {
    const id = params.get('id');
    if (id && id !== this.eventoId) {
        this.eventoId = id;
        this.cargarPonente(id);
      }
    });
  }

  cargarPonente(id: string): void {
    this.cargando = true;

    this.apiService.getDetallePonente(id).subscribe({
      next: (res: any) => {
        this.ponente = res.data ?? res;
        this.cargando = false;
      },
      error: () => {
        this.cargando = false;
      },
    });
  }
}