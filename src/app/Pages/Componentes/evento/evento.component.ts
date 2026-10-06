import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { IonIcon } from "@ionic/angular/standalone";
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-evento',
  templateUrl: './evento.component.html',
  styleUrls: ['./evento.component.scss'],
  imports: [IonIcon, CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EventoComponent {
  @Input() evento!: any;

  constructor(private router: Router) {}

  eventClick(id: string) {
    this.router.navigate(['/detalles-event'], {
      queryParams: { id: id }
    });
  }
}
