import { Injectable, signal, WritableSignal } from '@angular/core';
import { API_BASE_URL } from './api.config';

export interface GeoLocationState {
  coords: { lat: number; lng: number } | null;
  error: string | null;
  loading: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class GeolocationService {
  private state: WritableSignal<GeoLocationState> = signal({
    coords: null,
    error: null,
    loading: true
  });

  readonly locationState = this.state.asReadonly();

  // Proveer locacion por IP publica en caso de fallo por GPS utilizando el Proxy del Backend (CORS-free)
  public async getIpFallback() {
    try {
      const response = await fetch(`${API_BASE_URL}/geolocation`);
      if (!response.ok) throw new Error('Proxy lookup failed');
      const coords = await response.json();
      this.state.set({ coords, error: null, loading: false });
    } catch (e) {
      console.warn('IP proxy failed, using default coords:', e);
      // Fallback a coordenadas predeterminadas (Madrid) para prevenir bucles de efectos reactivos
      this.state.set({ coords: { lat: 40.416775, lng: -3.703790 }, error: null, loading: false });
    }
  }

  constructor() {
    this.initWatch();
  }

  private initWatch() {
    if (!navigator.geolocation) {
      this.state.set({ coords: null, error: 'Geolocalización no soportada', loading: false });
      return;
    }

    navigator.geolocation.watchPosition(
      (pos) => {
        this.state.set({
          coords: { lat: pos.coords.latitude, lng: pos.coords.longitude },
          error: null,
          loading: false
        });
      },
      (err) => {
        let msg = 'Error desconocido';
        switch (err.code) {
          case err.PERMISSION_DENIED: msg = 'Permiso denegado'; break;
          case err.POSITION_UNAVAILABLE: msg = 'Ubicación no disponible'; break;
          case err.TIMEOUT: msg = 'Tiempo de espera agotado'; break;
        }
        this.state.update(s => ({ ...s, error: msg, loading: false }));
      },
      { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
    );
  }
}
