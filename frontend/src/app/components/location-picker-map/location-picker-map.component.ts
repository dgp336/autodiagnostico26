import {
  Component, OnDestroy, inject, effect,
  ElementRef, ViewChild, output,
  PLATFORM_ID, afterNextRender, signal
} from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { GeolocationService } from '../../services/geolocation.service';

@Component({
  selector: 'app-location-picker-map',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './location-picker-map.component.html',
  styleUrl: './location-picker-map.component.css'
})
export class LocationPickerMapComponent implements OnDestroy {
  private geoService = inject(GeolocationService);
  private platformId = inject(PLATFORM_ID);

  /** Emite las coordenadas seleccionadas al hacer clic en el mapa. */
  locationSelected = output<{ lat: number; lng: number }>();

  @ViewChild('pickerMap', { static: false }) mapContainer!: ElementRef;

  private map: any;
  private L: any;
  private marker: any;
  private mapReady = signal(false);

  constructor() {
    if (isPlatformBrowser(this.platformId)) {
      afterNextRender(async () => {
        const leafletModule = await import('leaflet');
        this.L = leafletModule.default || leafletModule;
        this.fixLeafletIcons();
        this.initMap();
      });

      // Centrar en la ubicación del usuario cuando esté disponible
      effect(() => {
        const state = this.geoService.locationState();
        if (this.mapReady() && state.coords && !this.marker) {
          this.map.setView([state.coords.lat, state.coords.lng], 13);
        }
      });
    }
  }

  private fixLeafletIcons() {
    if (!this.L) return;
    const cdnBase = 'https://unpkg.com/leaflet@1.9.4/dist/images/';
    this.L.Icon.Default.mergeOptions({
      iconRetinaUrl: cdnBase + 'marker-icon-2x.png',
      iconUrl: cdnBase + 'marker-icon.png',
      shadowUrl: cdnBase + 'marker-shadow.png',
    });
  }

  private initMap() {
    if (!this.L || !this.mapContainer) return;

    setTimeout(() => {
      // Centro por defecto: España
      this.map = this.L.map(this.mapContainer.nativeElement).setView([40.0, -3.7], 6);

      this.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '© OpenStreetMap contributors'
      }).addTo(this.map);

      // Clic en el mapa → colocar/mover marcador
      this.map.on('click', (e: any) => {
        const { lat, lng } = e.latlng;
        this.placeMarker(lat, lng);
        this.locationSelected.emit({ lat, lng });
      });

      this.mapReady.set(true);
      setTimeout(() => this.map.invalidateSize(), 300);
    }, 100);
  }

  private placeMarker(lat: number, lng: number) {
    if (!this.L || !this.map) return;

    if (this.marker) {
      this.marker.setLatLng([lat, lng]);
    } else {
      this.marker = this.L.marker([lat, lng], { draggable: true })
        .addTo(this.map)
        .bindPopup('Ubicación del taller');

      // Arrastrar marcador → actualizar coordenadas
      this.marker.on('dragend', () => {
        const pos = this.marker.getLatLng();
        this.locationSelected.emit({ lat: pos.lat, lng: pos.lng });
      });
    }
  }

  ngOnDestroy() {
    if (this.map) this.map.remove();
  }
}
