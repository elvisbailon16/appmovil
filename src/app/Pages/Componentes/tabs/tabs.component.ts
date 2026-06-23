import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  homeOutline,
  calendarOutline,
  qrCodeOutline,
  walletOutline,
  personOutline
} from 'ionicons/icons';

@Component({
  selector: 'app-tabs',
  templateUrl: './tabs.component.html',
  styleUrls: ['./tabs.component.scss'],
  standalone: true,
  imports: [CommonModule, IonIcon]
})
export class TabsComponent implements OnInit {

  activeTab: string = 'home';

  constructor(private router: Router) {
    addIcons({
      homeOutline,
      calendarOutline,
      qrCodeOutline,
      walletOutline,
      personOutline
    });
  }

  ngOnInit() {
    // Sincroniza la tab activa con la URL actual al cargar
    const segment = this.router.url.split('/')[1];
    if (segment) this.activeTab = segment;

    // Actualiza cuando navegas
    this.router.events
      .pipe(filter(e => e instanceof NavigationEnd))
      .subscribe((e: NavigationEnd) => {
        const seg = e.urlAfterRedirects.split('/')[1];
        if (seg) this.activeTab = seg;
      });
  }

  selectTab(tabId: string) {
    this.activeTab = tabId;
    this.router.navigate([`/${tabId}`]);
  }
}