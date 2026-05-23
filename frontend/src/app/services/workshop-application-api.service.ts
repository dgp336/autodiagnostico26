import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_BASE_URL } from './api.config';
import {
  WorkshopApplicationRequest,
  WorkshopApplicationResponse,
} from './api.models';

@Injectable({
  providedIn: 'root'
})
export class WorkshopApplicationApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${API_BASE_URL}/workshop-applications`;

  submit(payload: WorkshopApplicationRequest): Observable<WorkshopApplicationResponse> {
    return this.http.post<WorkshopApplicationResponse>(this.baseUrl, payload);
  }

  listPending(): Observable<WorkshopApplicationResponse[]> {
    return this.http.get<WorkshopApplicationResponse[]>(`${this.baseUrl}/pending`);
  }

  approve(applicationId: number): Observable<WorkshopApplicationResponse> {
    return this.http.post<WorkshopApplicationResponse>(`${this.baseUrl}/${applicationId}/approve`, {});
  }

  reject(applicationId: number): Observable<WorkshopApplicationResponse> {
    return this.http.post<WorkshopApplicationResponse>(`${this.baseUrl}/${applicationId}/reject`, {});
  }
}