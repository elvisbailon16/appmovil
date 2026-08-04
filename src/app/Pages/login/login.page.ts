import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonIcon, IonButton, IonSpinner } from '@ionic/angular/standalone';
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
    IonIcon, IonContent, IonHeader, IonTitle, IonToolbar,
    IonButton, IonSpinner, CommonModule, FormsModule
  ]
})
export class LoginPage {
  valor = false;
  cargando = false;

  constructor(
    private router: Router,
    private apiService: ApiService,
    private authService: Auth,
    private msal: MsalService,
  ) {}

  login(email: any, password: any): void {
    this.apiService.loginUser(email.value, password.value).subscribe({
      next: (datos: any) => {
        this.valor = datos.success;
        if (this.valor) {
          this.authService.setTokens(datos.data.access_token, datos.data.refresh_token);
          localStorage.setItem('user', JSON.stringify(datos.data.user));
          this.router.navigate(['/home']);
        }
      },
      error: (e: any) => console.log(e)
    });
  }

  loginMicrosoft(): void {
    this.cargando = true;
    this.msal.loginRedirect(loginRequest);
  }
}