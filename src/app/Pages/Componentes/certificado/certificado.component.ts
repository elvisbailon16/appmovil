// certificado.component.ts
import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
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
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CertificadoComponent {
  @Input() certificado!: Certificado;

  descargar(): void {
    if (this.certificado?.urldescarga) {
      window.open(this.certificado.urldescarga, '_blank');
    }
  }
}
