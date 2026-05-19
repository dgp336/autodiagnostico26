import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_BASE_URL } from './api.config';
import { Workshop, WorkshopSelectionResponse } from './api.models';

@Injectable({
  providedIn: 'root'
})
export class WorkshopService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${API_BASE_URL}/workshops`;

  listWorkshops(clientId?: number | null): Observable<Workshop[]> {
    const query = clientId ? `?clientId=${clientId}` : '';
    return this.http.get<Workshop[]>(`${this.baseUrl}${query}`);
  }

  getWorkshop(workshopId: number, clientId?: number | null): Observable<Workshop> {
    const query = clientId ? `?clientId=${clientId}` : '';
    return this.http.get<Workshop>(`${this.baseUrl}/${workshopId}${query}`);
  }

  selectWorkshop(workshopId: number, clientId: number, personalVehicleId: number): Observable<WorkshopSelectionResponse> {
    return this.http.post<WorkshopSelectionResponse>(`${this.baseUrl}/${workshopId}/select`, {
      clientId,
      personalVehicleId,
    });
  }

  getNearbyWorkshops(
    lat: number,
    lng: number
  ): Observable<Workshop[]> {

    return this.http.get<Workshop[]>(
      `${this.baseUrl}`
    );
  }
  
}  
