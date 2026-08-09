// src/app/shared/components/empty-state/empty-state.component.ts
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonIcon, IonButton } from '@ionic/angular/standalone';

@Component({
  selector: 'app-empty-state',
  standalone: true,
  imports: [CommonModule, IonIcon, IonButton],
  templateUrl: './empty-state.component.html',
  styleUrls: ['./empty-state.component.scss']
})
export class EmptyStateComponent {
  /** Imagen ilustrativa (mascota Terri). Si no se pasa, se usa el ícono. */
  @Input() imageSrc?: string = 'https://terrimeet.espam.edu.ec/images/fondo_login.png';

  /** Ícono de respaldo si no hay imagen (ej: 'calendar-outline', 'search-outline') */
  @Input() icon: string = 'calendar-outline';

  @Input() title: string = 'No hay eventos disponibles';
  @Input() message: string = 'Por ahora no encontramos eventos para mostrarte aquí.';

  /** Texto del botón de acción. Si es null/undefined, el botón no se muestra. */
  @Input() actionText?: string;

  @Output() actionClick = new EventEmitter<void>();

  onAction(): void {
    this.actionClick.emit();
  }
}