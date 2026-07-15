import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonSpinner, IonContent, IonHeader, IonTitle, IonToolbar, IonIcon } from '@ionic/angular/standalone';
import { CabeceraComponent } from '../Componentes/cabecera/cabecera.component';
import * as L from 'leaflet';
import { Router } from '@angular/router';

@Component({
  selector: 'app-perfil',
  templateUrl: './perfil.page.html',
  styleUrls: ['./perfil.page.scss'],
  standalone: true,
  imports: [IonIcon, IonContent, IonHeader, IonTitle, IonToolbar, IonSpinner, CommonModule, FormsModule, CabeceraComponent]
})
export class PerfilPage {

  mapaVisible = false;
  cargandoMapa = false;
  private mapa: L.Map | null = null;
  statActivo: 'insignias' | 'inscripciones' = 'insignias';

  constructor(private router: Router) { }
  ngOnInit(): void {
    this.obtenerUbicacion();
  }

  insignias = [
    { id: 1, nombre: 'Congreso estudiantil de investigación', puntos: 3 },
    { id: 2, nombre: 'Congreso estudiantil de investigación', puntos: 3 },
    { id: 3, nombre: 'Congreso estudiantil de investigación', puntos: 3 },
  ];

  cerrarSesion(): void {
    localStorage.removeItem('token');
    this.router.navigate(['/login']);
  }

  // pageUbicacion(){
  //   this.router.navigate(['/ubicacion'])

  // }

  obtenerUbicacion(): void {
    this.cargandoMapa = true;

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        this.mapaVisible = true;
        setTimeout(() => this.iniciarMapa(lat, lng), 150);
        this.cargandoMapa = false;
      },
      (err) => {
        console.error('Error obteniendo ubicación:', err);
        this.cargandoMapa = false;
      },
      { enableHighAccuracy: true }
    );
  }

  private iniciarMapa(lat: number, lng: number): void {
    if (this.mapa) {
      this.mapa.remove();
      this.mapa = null;
    }

    this.mapa = L.map('mapa', { zoomControl: true }).setView([lat, lng], 16);

    // Capa satelital
    L.tileLayer(
      'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      { attribution: '© Esri', maxZoom: 19 }
    ).addTo(this.mapa);

    // Capa de etiquetas encima
    L.tileLayer(
      'https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}',
      { opacity: 0.8, maxZoom: 19 }
    ).addTo(this.mapa);

    L.marker([lat, lng])
      .addTo(this.mapa)
      .bindPopup('Tu ubicación actual')
      .openPopup();
  }
}