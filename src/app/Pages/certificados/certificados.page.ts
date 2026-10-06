import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { IonContent, IonSpinner, IonIcon } from '@ionic/angular/standalone';
import { CabeceraComponent } from '../Componentes/cabecera/cabecera.component';
import { EmptyStateComponent } from '../Componentes/empty-state/empty-state.component';
import { CertificadoComponent } from '../Componentes/certificado/certificado.component';
import { ApiService } from 'src/app/Service/api-service';

interface Certificado {
  id: string;
  codigo: string;
  tipo: string;
  urldescarga: string;
}

@Component({
  selector: 'app-certificados',
  templateUrl: './certificados.page.html',
  styleUrls: ['./certificados.page.scss'],
  standalone: true,
  imports: [CommonModule, IonContent, IonSpinner, IonIcon, CabeceraComponent, EmptyStateComponent, CertificadoComponent],
})
export class CertificadosPage implements OnInit {

  certificados: Certificado[] | null = null;
  evento: any = null;
  nombreEvento: string | null = null;
  cargando = false;
  error: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private apiService: ApiService,
  ) {}

  ngOnInit(): void {

    this.nombreEvento = this.route.snapshot.queryParamMap.get('evento');

    // La lista de certificados llega como JSON serializado en el query param:
    // /certificados?certificados=[{"id":...,"codigo":...,"tipo":...,"urldescarga":...}]
    const raw = this.route.snapshot.queryParamMap.get('certificados');
    if (raw) {
      try {
        this.certificados = JSON.parse(raw);
      } catch {
        this.certificados = null;
      }
    }
    if (!this.certificados) {
        this.error = 'No se encontró el evento.';
    }

  }

  // cargarCertificados(): void {
  //   this.cargando = true;
  //   this.error = null;

  //   // get_certificados_usuario trae, por cada evento del usuario, un array
  //   // anidado "certificados" con uno o más certificados (ej. Participante,
  //   // Ponente). Acá buscamos el evento que corresponde al id recibido.
  //   this.apiService.getMisCertificados().subscribe({
  //     next: (res: any) => {
  //       const eventos: any[] = res?.data ?? res ?? [];
  //       this.evento = eventos.find((e: any) => String(e.id) === String(this.id)) ?? null;
  //       this.certificados = this.evento?.certificados ?? [];
  //       this.cargando = false;
  //     },
  //     error: () => {
  //       this.cargando = false;
  //       this.error = 'No se pudieron cargar los certificados.';
  //     },
  //   });
  // }
}
