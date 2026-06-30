import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import {
  Contratacao,
  ContratacaoAnexo,
  ContratacaoListResponse,
  ContratacaoPayload,
} from './contratacao.models';

@Injectable({ providedIn: 'root' })
export class ContratacaoApiService {
  private readonly baseUrl = `${environment.apiUrl}/v1/contratacao`;

  constructor(private readonly http: HttpClient) {}

  list(page = 1): Observable<ContratacaoListResponse> {
    return this.http.get<ContratacaoListResponse>(this.baseUrl, {
      params: { page: String(page) },
    });
  }

  get(uuid: string): Observable<Contratacao> {
    return this.http.get<Contratacao>(`${this.baseUrl}/${uuid}`);
  }

  create(payload: ContratacaoPayload): Observable<Contratacao> {
    return this.http.post<Contratacao>(this.baseUrl, payload);
  }

  update(uuid: string, payload: ContratacaoPayload): Observable<Contratacao> {
    return this.http.patch<Contratacao>(`${this.baseUrl}/${uuid}`, payload);
  }

  submeter(uuid: string): Observable<Contratacao> {
    return this.http.post<Contratacao>(`${this.baseUrl}/${uuid}/submeter`, {});
  }

  uploadAnexo(uuid: string, descricao: string, arquivo: File): Observable<ContratacaoAnexo> {
    const formData = new FormData();
    formData.append('descricao', descricao);
    formData.append('arquivo', arquivo);

    return this.http.post<ContratacaoAnexo>(`${this.baseUrl}/${uuid}/anexos`, formData);
  }

  deleteAnexo(uuid: string, anexoId: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${uuid}/anexos/${anexoId}`);
  }
}
