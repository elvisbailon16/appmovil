import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar } from '@ionic/angular/standalone';

@Component({
  selector: 'app-wallet-c',
  templateUrl: './wallet-c.page.html',
  styleUrls: ['./wallet-c.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule]
})
export class WalletCPage implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
