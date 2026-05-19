import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_BASE_URL } from './api.config';
import { AutodiagnosisRequest, AutodiagnosisResponse } from './api.models';

@Injectable({ providedIn: 'root' })
export class AutodiagnosisApiService {
  private readonly base = API_BASE_URL;

  constructor(private http: HttpClient) {}

  diagnose(payload: AutodiagnosisRequest): Observable<AutodiagnosisResponse> {
    return this.http.post<AutodiagnosisResponse>(
      `${this.base}/autodiagnosis/diagnose`,
      payload,
    );
  }

  createIssue(payload: AutodiagnosisRequest): Observable<AutodiagnosisResponse> {
    return this.http.post<AutodiagnosisResponse>(
      `${this.base}/issues`,
      payload,
    );
  }
}
