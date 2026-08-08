// login.page.ts
import { Component } from '@angular/core';
import {
  IonContent, IonIcon, IonButton, IonSpinner,
  IonInput, IonInputPasswordToggle, IonItem, IonCheckbox
} from '@ionic/angular/standalone';
import { Router } from '@angular/router';
import { ApiService } from 'src/app/Service/api-service';
import { Auth } from 'src/app/core/services/auth';
import { MsalService } from '@azure/msal-angular';
import { loginRequest } from 'src/app/auth/msal.config';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: true,
  imports: [
    IonContent, IonIcon, IonButton, IonSpinner,
    IonInput, IonInputPasswordToggle, IonItem, IonCheckbox
  ]
})
export class LoginPage {
  cargando = false;

  constructor(
    private router: Router,
    private apiService: ApiService,
    private authService: Auth,
    private msal: MsalService,
  ) {}

  login(email: any, password: any): void {
    this.cargando = true;
    this.apiService.loginUser(email.value, password.value).subscribe({
      next: (datos: any) => {
        this.cargando = false;
        if (datos.success) {
          this.authService.setTokens(datos.data.access_token, datos.data.refresh_token);
          localStorage.setItem('user', JSON.stringify(datos.data.user));
          this.router.navigate(['/home']);
        }
      },
      error: (e: any) => {
        this.cargando = false;
        console.log(e);
      }
    });
  }

  loginMicrosoft(): void {
    this.cargando = true;
    this.msal.loginRedirect(loginRequest);
  }

  goForgotPassword(): void {
    this.router.navigate(['/forgot-password']);
  }

  goRegister(): void {
    this.router.navigate(['/register']);
  }
}