import {
  Component, OnDestroy, effect, inject,
  ElementRef, ViewChild, output, input,
  // TODO: eliminar — computed no se usa actualmente
  // computed,
  PLATFORM_ID, afterNextRender, signal
} from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { GeolocationService } from '../../services/geolocation.service';
import { Workshop } from '../../services/api.models';

@Component({
  selector: 'app-map',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './map.component.html',
  styleUrl: './map.component.css'
})
export class MapComponent implements OnDestroy {
  private geoService = inject(GeolocationService);
  private platformId = inject(PLATFORM_ID);

  // ── Inputs desde el componente padre ────────────────────────────────────
  /** Lista de talleres a mostrar (la provee TallerComponent desde la BD). */
  workshops = input<Workshop[]>([]);
  // TODO: eliminar — selectedWorkshop no se usa tras quitar el sidebar
  // selectedWorkshop = input<Workshop | null>(null);

  // ── Outputs hacia el componente padre ────────────────────────────────────
  /** Emite cuando el usuario hace clic en un marcador del mapa. */
  workshopSelected = output<Workshop>();

  @ViewChild('mapContainer', { static: false }) mapContainer!: ElementRef;

  private map: any;
  private L: any;
  private userMarker?: any;
  private workshopMarkers: any[] = [];
  private mapReady = signal(false);

  constructor() {
    if (isPlatformBrowser(this.platformId)) {
      afterNextRender(async () => {
        const leafletModule = await import('leaflet');
        this.L = leafletModule.default || leafletModule;
        this.fixLeafletIcons();
        this.initMap();
      });

      // Actualiza marcador del usuario cuando cambia la geolocalización
      effect(() => {
        this.refreshLocation();
      });

      // Re-renderiza marcadores de talleres cuando cambia la lista o el mapa está listo
      effect(() => {
        const ws = this.workshops();
        if (!this.mapReady()) return;
        this.renderWorkshopMarkers(ws);
      });
    }
  }

  public onRefreshClick(): void {
    this.refreshLocation(true);
  }

  private refreshLocation(forceCenter: boolean = false) {
    let state = this.geoService.locationState();
    if (state.error) {
      this.geoService.getIpFallback();
      state = this.geoService.locationState();
    }
    if (this.mapReady() && state.coords) {
      this.updateUserPosition(state.coords.lat, state.coords.lng);
      if (forceCenter) {
        this.map.setView([state.coords.lat, state.coords.lng], 13);
      }
    }
  }

  // ── Métodos públicos (llamados desde el template) ────────────────────────

  /** Notifica al padre que el usuario ha seleccionado este taller (clic en marcador). */
  selectWorkshop(workshop: Workshop): void {
    this.workshopSelected.emit(workshop);
  }

  // ── Helpers privados ─────────────────────────────────────────────────────

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
      this.map = this.L.map(this.mapContainer.nativeElement).setView([0, 0], 2);

      this.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '© OpenStreetMap contributors'
      }).addTo(this.map);

      this.mapReady.set(true);

      setTimeout(() => this.map.invalidateSize(), 300);
    }, 100);
  }

  private updateUserPosition(lat: number, lng: number) {
    if (!this.L || !this.map) return;

    if (!this.userMarker) {
      this.map.setView([lat, lng], 13);
      this.userMarker = this.L.marker([lat, lng], {
        icon: this.L.divIcon({
          className: 'user-location-marker-container',
          html: '<div class="user-location-marker"><div class="pulse"></div></div>',
          iconSize: [20, 20],
          iconAnchor: [10, 10]
        })
      }).addTo(this.map).bindPopup('Tu ubicación');
    } else {
      this.userMarker.setLatLng([lat, lng]);
    }
  }

  private renderWorkshopMarkers(workshops: Workshop[]) {
    if (!this.L || !this.map) return;

    this.clearWorkshopMarkers();

    workshops.forEach(w => {
      const marker = this.L
        .marker([w.latitude, w.longitude])
        .addTo(this.map)
        .bindPopup(`<b>${w.name}</b><br>${w.address}`);

      // Clic en el marcador del mapa → selecciona el taller en el padre
      marker.on('click', () => this.selectWorkshop(w));

      this.workshopMarkers.push(marker);
    });
  }

  private clearWorkshopMarkers() {
    if (!this.map) return;
    this.workshopMarkers.forEach(m => this.map.removeLayer(m));
    this.workshopMarkers = [];
  }

  ngOnDestroy() {
    if (this.map) this.map.remove();
  }
}
