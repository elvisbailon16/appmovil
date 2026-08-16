import { Component, OnInit, Input } from '@angular/core';
import { IonIcon } from "@ionic/angular/standalone";
import { ApiService } from 'src/app/Service/api-service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-inscripcion',
  templateUrl: './inscripcion.component.html',
  styleUrls: ['./inscripcion.component.scss'],
  imports: [IonIcon, CommonModule]
})
export class InscripcionComponent  implements OnInit {
@Input() inscripcion!: any;
  cargando = false;
  error: string | null = null;
  constructor(private apiService: ApiService, private router:Router ) { }

  ngOnInit() { 

  }



  eventClick(inscripcion: any) {
    this.router.navigate(['/detalles-event'], {
      queryParams: { id: inscripcion.id }
    });
  }

}
