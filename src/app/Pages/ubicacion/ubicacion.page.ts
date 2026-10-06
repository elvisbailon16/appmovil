// ubicacion.page.ts
import { Component, OnDestroy } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { IonContent, IonIcon, IonSpinner } from '@ionic/angular/standalone';
import { CabeceraComponent } from '../Componentes/cabecera/cabecera.component';
import * as L from 'leaflet';
import { Geolocation } from '@capacitor/geolocation';
import { Capacitor } from '@capacitor/core';

@Component({
  selector: 'app-ubicacion',
  templateUrl: './ubicacion.page.html',
  styleUrls: ['./ubicacion.page.scss'],
  standalone: true,
  imports: [CommonModule, DecimalPipe, IonContent, IonIcon, IonSpinner, CabeceraComponent],
})
export class UbicacionPage implements OnDestroy {

  coordenadas: { lat: number; lng: number } | null = null;
  precision: number = 0;
  direccion: string = '';
  cargando = false;
  cargandoMapa = true;
  errorUbicacion: string | null = null;
  private mapa: L.Map | null = null;
  private marcador: L.Marker | null = null;

  ngOnInit(): void {
    this.actualizarUbicacion();
  }

  ngOnDestroy(): void {
    this.mapa?.remove();
    this.mapa = null;
    this.marcador = null;
  }

  async actualizarUbicacion(): Promise<void> {
    this.cargando = true;
    this.cargandoMapa = true;
    this.errorUbicacion = null;

    try {
      let lat: number;
      let lng: number;
      let precision: number;

      if (Capacitor.isNativePlatform()) {
        // Dispositivo / emulador real -> plugin nativo de Capacitor (mismo enfoque que perfil.page.ts)
        let estado = await Geolocation.checkPermissions();
        if (estado.location !== 'granted') {
          estado = await Geolocation.requestPermissions();
        }
        if (estado.location !== 'granted') {
          this.errorUbicacion = 'Debes conceder el permiso de ubicación en los ajustes del dispositivo.';
          this.cargando = false;
          this.cargandoMapa = false;
          return;
        }

        const pos = await Geolocation.getCurrentPosition({ enableHighAccuracy: true });
        lat = pos.coords.latitude;
        lng = pos.coords.longitude;
        precision = pos.coords.accuracy;
      } else {
        // Navegador (ionic serve) -> API web nativa
        const pos = await new Promise<GeolocationPosition>((resolve, reject) =>
          navigator.geolocation.getCurrentPosition(resolve, reject, { enableHighAccuracy: true })
        );
        lat = pos.coords.latitude;
        lng = pos.coords.longitude;
        precision = pos.coords.accuracy;
      }

      this.coordenadas = { lat, lng };
      this.precision   = Math.round(precision);
      this.cargando    = false;

      // ✅ setTimeout espera que el DOM esté listo
      setTimeout(() => this.iniciarMapa(lat, lng), 150);

      this.obtenerDireccion(lat, lng);
    } catch (err) {
      console.error('Error ubicación:', err);
      this.errorUbicacion = 'No se pudo obtener tu ubicación.';
      this.cargando = false;
      this.cargandoMapa = false;
    }
  }

  private iniciarMapa(lat: number, lng: number): void {
    if (this.mapa) {
      this.mapa.remove();
      this.mapa = null;
      this.marcador = null;
    }

    this.mapa = L.map('mapa', { zoomControl: false }).setView([lat, lng], 17);

    L.tileLayer(
      'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      { attribution: '© Esri', maxZoom: 19 }
    ).addTo(this.mapa);

    L.tileLayer(
      'https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}',
      { opacity: 0.8, maxZoom: 19 }
    ).addTo(this.mapa);

    const icono = L.icon({
      iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
      iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
      shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
    });

    this.marcador = L.marker([lat, lng], { icon: icono })
      .addTo(this.mapa)
      .bindPopup('Tu ubicación actual')
      .openPopup();

    // ✅ Oculta el skeleton cuando los tiles carguen
    this.mapa.once('load', () => {
      this.cargandoMapa = false;
    });

    // ✅ Fallback por si el evento load no dispara
    setTimeout(() => {
      this.cargandoMapa = false;
    }, 3000);
  }

  private obtenerDireccion(lat: number, lng: number): void {
    fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`)
      .then(res => res.json())
      .then(data => {
        const d = data.address;
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