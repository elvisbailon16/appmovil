// login.page.ts
import { Component } from '@angular/core';
import {
  IonContent, IonIcon, IonButton, IonSpinner,
  IonInput, IonInputPasswordToggle, IonItem
} from '@ionic/angular/standalone';
import { Router } from '@angular/router';
import { ApiService } from 'src/app/Service/api-service';
import { Auth } from 'src/app/core/services/auth';
import { MsalService } from '@azure/msal-angular';
import { loginRequest } from 'src/app/auth/msal.config';
import { CalendarSyncService } from 'src/app/Service/calendar-sync-service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: true,
  imports: [
    IonContent, IonIcon, IonButton, IonSpinner,
    IonInput, IonInputPasswordToggle, IonItem
  ]
})
export class LoginPage {
  cargando = false;

  constructor(
    private router: Router,
    private apiService: ApiService,
    private authService: Auth,
    private msal: MsalService,
    private calendarSyncService: CalendarSyncService,
  ) {}

  login(email: any, password: any): void {
    this.cargando = true;
    this.apiService.loginUser(email.value, password.value).subscribe({
      next: async (datos: any) => {
        this.cargando = false;
        if (datos.success) {
          await this.authService.setTokens(datos.data.access_token, datos.data.refresh_token);
          await this.authService.setUser(datos.data.user);
          this.router.navigate(['/home']);
          this.calendarSyncService.sync();
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

  goRegister(): void {
    this.router.navigate(['/register']);
  }
}