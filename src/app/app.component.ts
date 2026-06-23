import { Component } from '@angular/core';
import { IonApp, IonRouterOutlet, IonTabs } from '@ionic/angular/standalone';
import { TabsComponent } from './Pages/Componentes/tabs/tabs.component';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  imports: [TabsComponent, IonApp, IonRouterOutlet, ],
})
export class AppComponent {
  showTabs = false;

  // Rutas donde el tab NO debe aparecer
  private hiddenRoutes = ['/login'];

  constructor(private router: Router) {}

  ngOnInit() {
    this.router.events
      .pipe(filter(e => e instanceof NavigationEnd))
      .subscribe((e: NavigationEnd) => {
        this.showTabs = !this.hiddenRoutes.includes(e.urlAfterRedirects);
      });
  }
}
