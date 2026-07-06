import { Component, Input, OnInit } from '@angular/core';
import { ApiService } from 'src/app/Service/api-service';
import { IonIcon } from "@ionic/angular/standalone";
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
@Component({
  selector: 'app-evento',
  templateUrl: './evento.component.html',
  styleUrls: ['./evento.component.scss'],
  imports: [IonIcon, CommonModule]
})
export class EventoComponent  implements OnInit {
@Input() evento!: any;

 
  constructor(private eventosService: ApiService, private router: Router) {}
 
  ngOnInit(){
  }
 
  eventClick(id: string) {
    this.router.navigate(['/detalles-event'], {
      queryParams: { id: id }
    });
    console.log("hello", id);
  }
}
