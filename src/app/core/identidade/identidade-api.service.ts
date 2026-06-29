import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import {
  AuthResponse,
  ModulosResponse,
  PerfilResponse,
} from './identidade.models';

@Injectable({ providedIn: 'root' })
export class IdentidadeApiService {
  private readonly baseUrl = environment.apiUrl;

  constructor(private readonly http: HttpClient) {}

  login(email: string, password: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.baseUrl}/v1/auth/login`, {
      email,
      password,
    });
  }

  logout(): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.baseUrl}/v1/auth/logout`, {});
  }

  getModulos(): Observable<ModulosResponse> {
    return this.http.get<ModulosResponse>(`${this.baseUrl}/v1/me/modulos`);
  }

  getPerfil(): Observable<PerfilResponse> {
    return this.http.get<PerfilResponse>(`${this.baseUrl}/v1/me`);
  }
}
