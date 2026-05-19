import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_BASE_URL } from './api.config';
import { CreatePersonalVehicleRequest, PersonalVehicleResponse } from './api.models';

@Injectable({ providedIn: 'root' })
export class PersonalVehicleApiService {
  private readonly base = `${API_BASE_URL}/personal-vehicles`;

  constructor(private http: HttpClient) {}

  listByOwner(ownerId: number): Observable<PersonalVehicleResponse[]> {
    const params = new HttpParams().set('ownerId', ownerId);
    return this.http.get<PersonalVehicleResponse[]>(this.base, { params });
  }

  getById(id: number): Observable<PersonalVehicleResponse> {
    return this.http.get<PersonalVehicleResponse>(`${this.base}/${id}`);
  }

  create(request: CreatePersonalVehicleRequest): Observable<PersonalVehicleResponse> {
    return this.http.post<PersonalVehicleResponse>(this.base, request);
  }

  delete(id: number, ownerId: number): Observable<void> {
    const params = new HttpParams().set('ownerId', ownerId);
    return this.http.delete<void>(`${this.base}/${id}`, { params });
  }
}
