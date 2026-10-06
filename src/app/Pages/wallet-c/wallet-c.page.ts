import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonSpinner, IonIcon } from '@ionic/angular/standalone';
import { CabeceraComponent } from '../Componentes/cabecera/cabecera.component';
import { ApiService } from 'src/app/Service/api-service';
import { EmptyStateComponent } from '../Componentes/empty-state/empty-state.component';
import { InscripcionComponent } from '../Componentes/inscripcion/inscripcion.component';


@Component({
  selector: 'app-wallet-c',
  templateUrl: './wallet-c.page.html',
  styleUrls: ['./wallet-c.page.scss'],
  standalone: true,
  imports: [IonContent, IonSpinner, IonIcon, CommonModule, FormsModule, CabeceraComponent, InscripcionComponent, EmptyStateComponent]
})
export class WalletCPage implements OnInit {
  inscripciones: any[] = [];
  cargando = false;
  error: string | null = null;

  constructor(private eventosService: ApiService) { }

  ngOnInit() {
    this.cargarCertificados();
  }

  cargarCertificados() {
    this.cargando = true;
    this.error = null;
    this.eventosService.getMisCertificados().subscribe({
      next: (res: any) => {
        this.inscripciones = res?.data ?? res ?? [];
        this.cargando = false;
      },
      error: () => {
        this.error = 'No se pudieron cargar tus certificados.';
        this.cargando = false;
      },
    })
  }

}
