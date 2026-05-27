import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_BASE_URL } from './api.config';
import { ContactMessage, ReplyRequest } from './api.models';

@Injectable({ providedIn: 'root' })
export class ContactApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${API_BASE_URL}`;

  submit(payload: { name: string; email: string; phone: string; message: string; workshopId: number }): Observable<ContactMessage> {
    return this.http.post<ContactMessage>(`${this.baseUrl}/contact`, payload);
  }

  listMessages(): Observable<ContactMessage[]> {
    return this.http.get<ContactMessage[]>(`${this.baseUrl}/admin/contact`);
  }

  reply(id: number, payload: ReplyRequest): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/admin/contact/${id}/reply`, payload);
  }
}
