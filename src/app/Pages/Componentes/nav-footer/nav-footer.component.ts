import { Component, OnInit } from '@angular/core';
import { IonToolbar, IonIcon, IonTitle, IonButton } from '@ionic/angular/standalone';


@Component({
  selector: 'app-nav-footer',
  templateUrl: './nav-footer.component.html',
  styleUrls: ['./nav-footer.component.scss'],
  imports: [IonToolbar, IonIcon, IonTitle, IonButton]
})
export class NavFooterComponent  implements OnInit {

  constructor() { }

  ngOnInit() {}

}
