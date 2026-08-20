// certificado.component.ts
import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonIcon } from '@ionic/angular/standalone';

export interface Certificado {
  id: string;
  codigo: string;
  tipo: string;
  urldescarga: string;
}

@Component({
  selector: 'app-certificado',
  templateUrl: './certificado.component.html',
  styleUrls: ['./certificado.component.scss'],
  standalone: true,
  imports: [CommonModule, IonIcon],
})
export class CertificadoComponent {
  @Input() certificado!: Certificado;

  name: any;
  
  ngOnInit() {
    this.name = localStorage.getItem('inscripcion');

  }

  descargar(): void {
    if (this.certificado?.urldescarga) {
      window.open(this.certificado.urldescarga, '_blank');
    }
  }
}
