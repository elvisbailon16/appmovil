import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonIcon } from '@ionic/angular/standalone';
import { CabeceraComponent } from '../Componentes/cabecera/cabecera.component';
import * as L from 'leaflet';
import { Router } from '@angular/router';
import { Geolocation } from '@capacitor/geolocation';
import { Capacitor } from '@capacitor/core';
import { ApiService } from 'src/app/Service/api-service';
import { SesionService } from 'src/app/Service/sesion-service';

@Component({
  selector: 'app-perfil',
  templateUrl: './perfil.page.html',
  styleUrls: ['./perfil.page.scss'],
  standalone: true,
  imports: [IonIcon, IonContent, CommonModule, FormsModule, CabeceraComponent]
})
export class PerfilPage implements OnInit, OnDestroy {

  mapaVisible = false;
  cargandoMapa = false;
  errorUbicacion: string | null = null;
  private mapa: L.Map | null = null;
  statActivo: 'insignias' | 'inscripciones' = 'insignias';
  userData: any;

  constructor(private router: Router, private apiService: ApiService, private sesionService: SesionService) { }

  ngOnInit(): void {
    this.obtenerUbicacion();
    this.apiService.getPerfilUsuario().subscribe({
      next: (datos: any) => {
        this.userData = datos.data;
      },
      error: (e) => console.log('Error obteniendo perfil:', e)
    })
  }

  ngOnDestroy(): void {
    this.mapa?.remove();
    this.mapa = null;
  }


  insignias = [
    { id: 1, nombre: 'Congreso estudiantil de investigación', puntos: 3 },
    { id: 2, nombre: 'Congreso estudiantil de investigación', puntos: 3 },
    { id: 3, nombre: 'Congreso estudiantil de investigación', puntos: 3 },
  ];

  irAConfiguracion(): void {
    this.router.navigate(['/configuracion']);
  }

  cerrarSesion(): void {
    this.apiService.cerrarSesion().subscribe({
      next: async () => {
        await this.sesionService.limpiarDatosUsuario();
        this.router.navigate(['/login'], { replaceUrl: true });
      },
      error: async (e) => {
        console.log('Error cerrando sesión:', e);
        // Aunque el backend falle (ej. sin red), no dejamos al usuario atascado logueado localmente.
        await this.sesionService.limpiarDatosUsuario();
        this.router.navigate(['/login'], { replaceUrl: true });
      }
    });
  }

  async obtenerUbicacion(): Promise<void> {
    this.cargandoMapa = true;
    this.errorUbicacion = null;

    try {
      let lat: number;
      let lng: number;

      if (Capacitor.isNativePlatform()) {
        // Dispositivo / emulador real -> plugin nativo de Capacitor
        let estado = await Geolocation.checkPermissions();

        if (estado.location !== 'granted') {
          estado = await Geolocation.requestPermissions();
        }

        if (estado.location !== 'granted') {
          this.errorUbicacion = 'Debes conceder el permiso de ubicación en los ajustes del dispositivo.';
          this.cargandoMapa = false;
          return;
        }

        const pos = await Geolocation.getCurrentPosition({ enableHighAccuracy: true });
        lat = pos.coords.latitude;
        lng = pos.coords.longitude;

      } else {
        // Navegador (ionic serve) -> API web nativa
        const pos = await new Promise<GeolocationPosition>((resolve, reject) =>
          navigator.geolocation.getCurrentPosition(resolve, reject, { enableHighAccuracy: true })
        );
        lat = pos.coords.latitude;
        lng = pos.coords.longitude;
      }

      this.mapaVisible = true;
      setTimeout(() => this.iniciarMapa(lat, lng), 150);

    } catch (err) {
      console.error('Error obteniendo ubicación:', err);
      this.errorUbicacion = 'No se pudo obtener tu ubicación.';
    } finally {
      this.cargandoMapa = false;
    }
  }

  private iniciarMapa(lat: number, lng: number): void {
    if (this.mapa) {
      this.mapa.remove();
      this.mapa = null;
    }

    this.mapa = L.map('mapa', { zoomControl: true }).setView([lat, lng], 16);

    L.tileLayer(
      'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      { attribution: '© Esri', maxZoom: 19 }
    ).addTo(this.mapa);

    L.tileLayer(
      'https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}',
      { opacity: 0.8, maxZoom: 19 }
    ).addTo(this.mapa);

    L.marker([lat, lng])
      .addTo(this.mapa)
      .bindPopup('Tu ubicación actual')
      .openPopup();

    // Por si el contenedor no tenía el tamaño correcto al montar
    setTimeout(() => this.mapa?.invalidateSize(), 200);
  }
}