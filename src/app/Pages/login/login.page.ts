import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonIcon } from '@ionic/angular/standalone';
import { Router } from '@angular/router';
import { ApiService } from 'src/app/Service/api-service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: true,
  imports: [IonIcon, IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule]
})
export class LoginPage implements OnInit {
  valor:boolean = false;

  constructor(private router: Router, private apiService: ApiService) { }

  ngOnInit() {
  }

    login(username:any, password:any){
    this.apiService.loginUser(username.value, password.value).subscribe({
      next: (datos:any)=>{
        this.valor = datos.success;

        if(this.valor){
          this.router.navigate(['/home'])
        }

      },
      error:(e:any)=>{
        debugger
        console.log(e);
      }
    })
  }

}
