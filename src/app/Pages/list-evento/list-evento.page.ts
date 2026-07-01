import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonButton } from '@ionic/angular/standalone';
import { CabeceraComponent } from '../Componentes/cabecera/cabecera.component';

@Component({
  selector: 'app-list-evento',
  templateUrl: './list-evento.page.html',
  styleUrls: ['./list-evento.page.scss'],
  standalone: true,
  imports: [IonButton, IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule, CabeceraComponent]
})
export class ListEventoPage implements OnInit {
tabActivo: 'todos' | 'mis-eventos' = 'todos';
  constructor() { }

  ngOnInit() {
  }

}
