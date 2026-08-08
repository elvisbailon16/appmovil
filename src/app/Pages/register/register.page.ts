// register.page.ts
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  IonContent, IonIcon, IonButton, IonSpinner,
  IonInput, IonInputPasswordToggle, IonItem,
  IonCheckbox, IonLabel
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
  ) {}

  // register(identificacion: any, nombres: any, correo: any, password: any, confirmPassword: any): void {
  //   if (password.value !== confirmPassword.value) {
  //     console.log('Las contraseñas no coinciden');
  //     return;
  //   }

  //   this.cargando = true;
  //   this.apiService.registerUser({
  //     identificacion: identificacion.value,
  //     nombres: nombres.value,
  //     correo: correo.value,
  //     password: password.value,
  //   }).subscribe({
  //     next: (datos: any) => {
  //       this.cargando = false;
  //       if (datos.success) {
  //         this.router.navigate(['/login']);
  //       }
  //     },
  //     error: (e: any) => {
  //       this.cargando = false;
  //       console.log(e);
  //     }
  //   });
  // }

  goLogin(): void {
    this.router.navigate(['/login']);
  }

  openTerms(event: Event): void {
    event.stopPropagation();
    // navegar a modal/página de términos
  }
}