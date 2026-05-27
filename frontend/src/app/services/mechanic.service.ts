import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { API_BASE_URL } from './api.config';
import { DiagnosedPart } from './api.models';

export interface MechanicClient {
  clientId: number;
  workshopId: number | null;
  workshopName: string | null;
  mechanicId?: number | null;
  mechanicName?: string | null;
  clientName: string;
  clientEmail: string;
  clientAvatar: string;
  carInfo: string;
  problemDescription: string;
  aiDiagnosis: string;
  recommendedParts: DiagnosedPart[];
  estimatedPrice: number | null;
  createdAt: string;
  acceptedAt: string | null;
  inProgressAt: string | null;
  fixedAt: string | null;
  status: 'verde' | 'amarillo' | 'naranja' | 'rojo';
  latestUpdate?: string;
  sessionUuid: string;
  issueId: number;
  tallerAssignmentId: number;
}

@Injectable({ providedIn: 'root' })
export class MechanicService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${API_BASE_URL}/mechanic`;
  private readonly clientsSubject = new BehaviorSubject<MechanicClient[]>([]);

  readonly clients$ = this.clientsSubject.asObservable();

  getClientsForMechanic(mechanicId: number): Observable<MechanicClient[]> {
    return this.http.get<MechanicClient[]>(`${this.baseUrl}/${mechanicId}/clients`);
  }

  getTrackingsForClient(clientId: number): Observable<MechanicClient[]> {
    return this.http.get<MechanicClient[]>(`${this.baseUrl}/client/${clientId}/trackings`);
  }

  updateTrackingStatus(mechanicId: number, sessionUuid: string, status: string): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/${mechanicId}/tracking/${encodeURIComponent(sessionUuid)}/status`, { status });
  }

  updateTrackingMessageBySessionUuid(mechanicId: number, sessionUuid: string, message: string): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/${mechanicId}/tracking/${encodeURIComponent(sessionUuid)}/tracking-update`, { message });
  }

  loadClientsForMechanic(mechanicId: number): void {
    this.getClientsForMechanic(mechanicId).subscribe({
      next: (clients) => this.clientsSubject.next(clients),
      error: (err) => console.error('Error loading clients:', err)
    });
  }

  getTrackingBySessionUuid(sessionUuid: string): Observable<MechanicClient> {
    return this.http.get<MechanicClient>(`${this.baseUrl}/tracking/${encodeURIComponent(sessionUuid)}`);
  }

}
