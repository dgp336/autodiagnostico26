import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_BASE_URL } from './api.config';
import { ChatJoinResponse, ChatMessageRequest, ChatMessageResponse } from './api.models';

@Injectable({ providedIn: 'root' })
export class ChatApiService {
  private readonly baseUrl = `${API_BASE_URL}/chat`;

  constructor(private readonly http: HttpClient) {}

  joinRoom(sessionUuid: string, participantId: number): Observable<ChatJoinResponse> {
    return this.http.post<ChatJoinResponse>(
      `${this.baseUrl}/join?sessionUuid=${encodeURIComponent(sessionUuid)}&participantId=${participantId}`,
      {},
    );
  }

  leaveRoom(sessionUuid: string, participantId: number): Observable<ChatJoinResponse> {
    return this.http.post<ChatJoinResponse>(
      `${this.baseUrl}/leave?sessionUuid=${encodeURIComponent(sessionUuid)}&participantId=${participantId}`,
      {},
    );
  }

  listMessages(sessionUuid: string, limit = 60, afterId?: number): Observable<ChatMessageResponse[]> {
    let url = `${this.baseUrl}/mensajes?sessionUuid=${encodeURIComponent(sessionUuid)}&limit=${limit}`;
    if (typeof afterId === 'number' && afterId > 0) {
      url += `&afterId=${afterId}`;
    }
    return this.http.get<ChatMessageResponse[]>(url);
  }

  sendMessage(payload: ChatMessageRequest): Observable<ChatMessageResponse> {
    return this.http.post<ChatMessageResponse>(`${this.baseUrl}/mensajes`, payload);
  }

  unreadCount(sessionUuid: string): Observable<number> {
    return this.http.get<number>(`${this.baseUrl}/unread?sessionUuid=${encodeURIComponent(sessionUuid)}`);
  }

  markReadByUser(sessionUuid: string): Observable<number> {
    return this.http.post<number>(`${this.baseUrl}/mark-read?sessionUuid=${encodeURIComponent(sessionUuid)}`, {});
  }
  
  getMessages(sessionUuid: string) {
    return this.http.get<any[]>(`${this.baseUrl}/mensajes?sessionUuid=${encodeURIComponent(sessionUuid)}`);
  }

  isUserOnline(sessionUuid: string, participantId: number): Observable<boolean> {
    return this.http.get<boolean>(
      `${this.baseUrl}/presence?sessionUuid=${encodeURIComponent(sessionUuid)}&participantId=${participantId}`,
    );
  }
}
