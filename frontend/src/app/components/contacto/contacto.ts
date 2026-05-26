import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, effect, inject, signal } from '@angular/core';
import { Workshop } from '../../services/api.models';
import { GeolocationService } from '../../services/geolocation.service';
import { WorkshopService } from '../../services/workshop.service';
import { MapComponent } from '../map/map.component';
import { FormularioContactoComponent } from './formulario-contacto/formulario-contacto';

@Component({
  selector: 'app-contacto-page',
  standalone: true,
  imports: [CommonModule, MapComponent, FormularioContactoComponent],
  templateUrl: './contacto.html',
  styleUrls: ['./contacto.css']
})
export class ContactoComponent implements OnInit {
  private readonly workshopService = inject(WorkshopService);
  private readonly geoService = inject(GeolocationService);

  private readonly _workshops = signal<Workshop[]>([]);

  readonly searchLocation = signal<string>('');

  readonly workshops = computed(() => {
    let ws = this._workshops();
    const coords = this.geoService.locationState().coords;
    const search = this.searchLocation()?.toLowerCase().trim();

    if (search) {
      ws = ws.filter(w => w.address.toLowerCase().includes(search));
    }

    if (!coords) return ws;
    return [...ws].sort(
      (a, b) => this.haversineKm(coords.lat, coords.lng, a.latitude, a.longitude)
        - this.haversineKm(coords.lat, coords.lng, b.latitude, b.longitude)
    );
  });

  readonly selectedWorkshop = signal<Workshop | null>(null);
  readonly showForm = signal(false);
  readonly loading = signal(true);
  readonly error = signal('');

  constructor() {
    effect(() => {
      const list = this.workshops();
      const selected = this.selectedWorkshop();
      if (selected && !list.some(w => w.id === selected.id)) {
        this.selectedWorkshop.set(null);
        this.showForm.set(false);
      }
    });
  }

  ngOnInit(): void {
    this.loadWorkshops();
  }

  loadWorkshops(): void {
    this.loading.set(true);
    this.error.set('');

    this.workshopService.listWorkshops().subscribe({
      next: (workshops) => {
        this._workshops.set(workshops);
        this.selectedWorkshop.set(null);
        this.showForm.set(false);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('No se han podido cargar los talleres. Intentalo de nuevo en unos segundos.');
        this.loading.set(false);
      }
    });
  }

  selectWorkshop(workshop: Workshop): void {
    this.selectedWorkshop.set(workshop);
    this.showForm.set(false);
  }

  contactToForm(): void {
    this.showForm.set(true);
  }

  cancelForm(): void {
    this.showForm.set(false);
  }

  onFormDone(): void {
    this.showForm.set(false);
    this.selectedWorkshop.set(null);
  }

  onSearchInput(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.searchLocation.set(value);
  }

  getDistanceLabel(workshop: Workshop): string | null {
    const coords = this.geoService.locationState().coords;
    if (!coords) return null;
    const dist = this.haversineKm(coords.lat, coords.lng, workshop.latitude, workshop.longitude);
    return dist < 1 ? `${Math.round(dist * 1000)} m` : `${dist.toFixed(1)} km`;
  }

  isOpenNow(scheduleStr: string): boolean {
    if (!scheduleStr) return false;
    const parts = scheduleStr.trim().split(/\s+/);
    if (parts.length < 2) return false;
    const daysPart = parts[0].toUpperCase();
    const hoursPart = parts[1];

    const now = new Date();
    const currentDay = now.getDay();

    let isActiveDay = false;
    if (daysPart === 'L-V') {
      isActiveDay = currentDay >= 1 && currentDay <= 5;
    } else if (daysPart === 'L-S') {
      isActiveDay = currentDay >= 1 && currentDay <= 6;
    } else {
      isActiveDay = currentDay >= 1 && currentDay <= 5;
    }

    if (!isActiveDay) return false;

    const hoursSplit = hoursPart.split('-');
    if (hoursSplit.length < 2) return false;

    const [startStr, endStr] = hoursSplit;
    const [startHour, startMin] = startStr.split(':').map(Number);
    const [endHour, endMin] = endStr.split(':').map(Number);

    if (isNaN(startHour) || isNaN(startMin) || isNaN(endHour) || isNaN(endMin)) return false;

    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    const startMinutes = startHour * 60 + startMin;
    const endMinutes = endHour * 60 + endMin;

    return currentMinutes >= startMinutes && currentMinutes <= endMinutes;
  }

  private haversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 6371;
    const toRad = (deg: number) => deg * Math.PI / 180;
    const dLat = toRad(lat2 - lat1);
    const dLng = toRad(lng2 - lng1);
    const a = Math.sin(dLat / 2) ** 2
      + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  }
}
