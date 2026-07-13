import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';

export interface ColaboradorItem {
  id: string;
  nome: string;
  email: string;
  cargo?: string | null;
  perfil: string;
  status: string;
  created_at?: string;
}

export interface ConvidarColaboradorPayload {
  nome: string;
  email: string;
  password: string;
  perfil: string;
  cargo?: string | null;
}

export const PERFIS_OPERACIONAIS = [
  { value: 'area', label: 'Área' },
  { value: 'compras', label: 'Compras' },
  { value: 'gestor', label: 'Gestor' },
  { value: 'fiscal', label: 'Fiscal' },
  { value: 'auditoria', label: 'Auditoria' },
];

@Injectable({ providedIn: 'root' })
export class AdminUsuariosApiService {
  private readonly baseUrl = `${environment.apiUrl}/v1/admin/usuarios`;

  constructor(private readonly http: HttpClient) {}

  listar(): Observable<{ data: ColaboradorItem[] }> {
    return this.http.get<{ data: ColaboradorItem[] }>(this.baseUrl);
  }

  convidar(payload: ConvidarColaboradorPayload): Observable<ColaboradorItem> {
    return this.http.post<ColaboradorItem>(this.baseUrl, payload);
  }

  atualizar(uuid: string, payload: Partial<ColaboradorItem>): Observable<ColaboradorItem> {
    return this.http.patch<ColaboradorItem>(`${this.baseUrl}/${uuid}`, payload);
  }

  redefinirSenha(uuid: string, password: string, password_confirmation: string): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.baseUrl}/${uuid}/redefinir-senha`, {
      password,
      password_confirmation,
    });
  }
}
