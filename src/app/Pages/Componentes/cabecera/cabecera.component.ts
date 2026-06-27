import { Component, OnInit, Input } from '@angular/core';
import { IonHeader, IonToolbar, IonIcon, IonButtons, IonButton } from "@ionic/angular/standalone";

@Component({
  selector: 'app-cabecera',
  templateUrl: './cabecera.component.html',
  styleUrls: ['./cabecera.component.scss'],
  imports: [IonHeader, IonToolbar, IonIcon, IonButtons, IonButton]
})
export class CabeceraComponent  implements OnInit {
  @Input() titulo: string = '';

  constructor() { }

  ngOnInit() {}

}
