// register.page.ts
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  IonContent, IonIcon, IonButton, IonSpinner,
  IonInput, IonInputPasswordToggle, IonItem,
  IonCheckbox, IonLabel, ToastController
} from '@ionic/angular/standalone';
import { Router } from '@angular/router';
import { ApiService } from 'src/app/Service/api-service';

@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
  standalone: true,
  imports: [
    IonContent, IonIcon, IonButton, IonSpinner,
    IonInput, IonInputPasswordToggle, IonItem,
    IonCheckbox, IonLabel, FormsModule
  ]
})
export class RegisterPage {
  cargando = false;
  aceptaTerminos = false;

  constructor(
    private router: Router,
    private apiService: ApiService,
    private toastController: ToastController,
  ) {}

  // El backend todavía no expone un endpoint de registro (ApiService no tiene
  // registerUser). Hasta que exista, el botón no debe fingir que crea la cuenta:
  // se avisa explícitamente en vez de quedar "muerto" sin feedback.
  async register(): Promise<void> {
    const toast = await this.toastController.create({
      message: 'El registro todavía no está disponible. Vuelve pronto.',
      duration: 3000,
      color: 'warning',
      position: 'top',
    });
    await toast.present();
  }

  goLogin(): void {
    this.router.navigate(['/login']);
  }

  openTerms(event: Event): void {
    event.stopPropagation();
    // navegar a modal/página de términos
  }
}