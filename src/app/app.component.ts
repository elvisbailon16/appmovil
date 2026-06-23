import { Component } from '@angular/core';
import { IonApp, IonRouterOutlet, IonTabs } from '@ionic/angular/standalone';
import { TabsComponent } from './Pages/Componentes/tabs/tabs.component';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  imports: [TabsComponent, IonApp, IonRouterOutlet, ],
})
export class AppComponent {
  constructor() {}
}
