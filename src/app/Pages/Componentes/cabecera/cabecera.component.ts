import { Component, OnInit, Input } from '@angular/core';
import { IonHeader, IonToolbar, IonButtons } from "@ionic/angular/standalone";

@Component({
  selector: 'app-cabecera',
  templateUrl: './cabecera.component.html',
  styleUrls: ['./cabecera.component.scss'],
  imports: [IonHeader, IonToolbar, IonButtons]
})
export class CabeceraComponent  implements OnInit {
  @Input() titulo: string = '';

  constructor() { }

  ngOnInit() {}

}
