import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { IonIcon } from "@ionic/angular/standalone";
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-inscripcion',
  templateUrl: './inscripcion.component.html',
  styleUrls: ['./inscripcion.component.scss'],
  imports: [IonIcon, CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InscripcionComponent {
  @Input() inscripcion!: any;

  constructor(private router: Router) { }

  eventClick(inscripcion: any) {
    this.router.navigate(['/certificados'], {
      queryParams: {
        certificados: JSON.stringify(inscripcion.certificados),
        evento: inscripcion.nombre,
      }
    });
  }

}
