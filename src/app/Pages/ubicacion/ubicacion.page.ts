// ubicacion.page.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { IonContent, IonIcon, IonSpinner } from '@ionic/angular/standalone';
import { CabeceraComponent } from '../Componentes/cabecera/cabecera.component';
import * as L from 'leaflet';

@Component({
  selector: 'app-ubicacion',
  templateUrl: './ubicacion.page.html',
  styleUrls: ['./ubicacion.page.scss'],
  standalone: true,
  imports: [CommonModule, DecimalPipe, IonContent, IonIcon, IonSpinner, CabeceraComponent],
})
export class UbicacionPage implements OnInit {

  coordenadas: { lat: number; lng: number } | null = null;
  precision: number = 0;
  direccion: string = '';
  cargando = false;
  private mapa: L.Map | null = null;
  private marcador: L.Marker | null = null;

  ngOnInit(): void {
    // Inicia el mapa vacío centrado en Ecuador
    setTimeout(() => this.iniciarMapa(-0.8, -80.7), 100);
    // Obtiene ubicación automáticamente al entrar
    this.actualizarUbicacion();
  }

  actualizarUbicacion(): void {
    this.cargando = true;

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;

        this.coordenadas = { lat, lng };
        this.precision   = Math.round(pos.coords.accuracy);
        this.cargando    = false;

        this.centrarMapa(lat, lng);
        this.obtenerDireccion(lat, lng);
      },
      (err) => {
        console.error('Error ubicación:', err);
        this.cargando = false;
      },
      { enableHighAccuracy: true }
    );
  }

  private iniciarMapa(lat: number, lng: number): void {
    if (this.mapa) return;

    this.mapa = L.map('mapa', { zoomControl: false }).setView([lat, lng], 14);

    // Capa satelital ESRI
    L.tileLayer(
      'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      { attribution: '© Esri', maxZoom: 19 }
    ).addTo(this.mapa);

    // Etiquetas encima del satélite
    L.tileLayer(
      'https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}',
      { opacity: 0.8, maxZoom: 19 }
    ).addTo(this.mapa);
  }

  private centrarMapa(lat: number, lng: number): void {
    if (!this.mapa) {
      setTimeout(() => this.centrarMapa(lat, lng), 200);
      return;
    }

    this.mapa.setView([lat, lng], 17);

    // Ícono personalizado
    const icono = L.icon({
      iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
      iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
      shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
    });

    // Mueve el marcador si ya existe
    if (this.marcador) {
      this.marcador.setLatLng([lat, lng]);
    } else {
      this.marcador = L.marker([lat, lng], { icon: icono })
        .addTo(this.mapa)
        .bindPopup('Tu ubicación actual')
        .openPopup();
    }
  }

  // Obtiene la dirección legible usando OpenStreetMap Nominatim (gratis, sin API key)
  private obtenerDireccion(lat: number, lng: number): void {
    fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`)
      .then(res => res.json())
      .then(data => {
        const d = data.address;
        // Arma una dirección legible con los campos disponibles
        const partes = [
          d.road || d.pedestrian || d.neighbourhood,
          d.city || d.town || d.village || d.county,
          d.state,
          d.country,
        ].filter(Boolean);
        this.direccion = partes.join(', ');
      })
      .catch(() => {
        this.direccion = 'No se pudo obtener la dirección';
      });
  }
}