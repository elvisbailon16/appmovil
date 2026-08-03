import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonIcon, IonButton, IonSpinner } from '@ionic/angular/standalone';
import { Router } from '@angular/router';
import { ApiService } from 'src/app/Service/api-service';
import { Auth } from 'src/app/core/services/auth';
import { Subject } from 'rxjs';
import { takeUntil, filter } from 'rxjs/operators';
import { AuthService } from 'src/app/auth/services/auth';
import { MsalBroadcastService } from '@azure/msal-angular';
import { EventMessage, EventType } from '@azure/msal-browser';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: true,
  imports: [
    IonIcon, IonContent, IonHeader, IonTitle, IonToolbar,
    IonButton, IonSpinner,
    CommonModule, FormsModule
  ]
})
export class LoginPage implements OnInit, OnDestroy {
  valor: boolean = false;
  cargando: boolean = false;
  usuario: any = null;
  private destroy$ = new Subject<void>();

  constructor(
    private router: Router,
    private apiService: ApiService,
    private authService: Auth,           // tu auth actual (tokens JWT)
    private msAuthService: AuthService,  // nueva auth de Microsoft
    private broadcast: MsalBroadcastService
  ) {}

  ngOnInit(): void {
    // Si ya hay sesión de Microsoft activa, ir directo al home
    if (this.msAuthService.isLoggedIn()) {
      this.router.navigate(['/home'], { replaceUrl: true });
      return;
    }

    // Escuchar cuando Microsoft regresa con login exitoso
    this.broadcast.msalSubject$
      .pipe(
        filter((msg: EventMessage) => msg.eventType === EventType.LOGIN_SUCCESS),
        takeUntil(this.destroy$)
      )
      .subscribe(() => {
        this.cargando = false;

        // Recuperar el correo del usuario desde Graph API
        this.msAuthService.getUserEmail().subscribe(info => {
          if (info?.email) {
            localStorage.setItem('ms_user', JSON.stringify(info));
          }
          this.router.navigate(['/home'], { replaceUrl: true });
        });
      });
  }

  // ─── Login tradicional (tu flujo actual, sin cambios) ──────────────
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
      error: (e: any) => {
        console.log(e);
      }
    });
  }

  // ─── Login con Microsoft ───────────────────────────────────────────
  loginMicrosoft(): void {
    this.cargando = true;
    this.msAuthService.login();
        this.msAuthService.getUserEmail().subscribe(info => {
      this.usuario = info;
      console.log('Correo:', info?.email);
    });
  
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }


}