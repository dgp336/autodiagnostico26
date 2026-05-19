import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_BASE_URL } from './api.config';
import { AuthUserResponse, UpdateUserRequest, UpdatePasswordRequest } from './api.models';

@Injectable({ providedIn: 'root' })
export class UserApiService {
  private readonly baseUrl = `${API_BASE_URL}/users`;

  constructor(private readonly http: HttpClient) {}

  getProfile(userId: number): Observable<AuthUserResponse> {
    return this.http.get<AuthUserResponse>(`${this.baseUrl}/${userId}`);
  }

  updateProfile(userId: number, payload: UpdateUserRequest): Observable<AuthUserResponse> {
    return this.http.put<AuthUserResponse>(`${this.baseUrl}/${userId}`, payload);
  }

  updatePassword(userId: number, payload: UpdatePasswordRequest): Observable<void> {
    return this.http.put<void>(`${this.baseUrl}/${userId}/password`, payload);
  }

  uploadAvatar(userId: number, file: File): Observable<{ avatarUrl: string }> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<{ avatarUrl: string }>(`${this.baseUrl}/${userId}/avatar`, formData);
  }

  deleteAccount(userId: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${userId}`);
  }
}
