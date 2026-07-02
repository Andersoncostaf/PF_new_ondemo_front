import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import {
  Contratacao,
  ContratacaoAnexo,
  ContratacaoApontamento,
  ContratacaoListQuery,
  ContratacaoListResponse,
  ContratacaoPayload,
} from './contratacao.models';

@Injectable({ providedIn: 'root' })
export class ContratacaoApiService {
  private readonly baseUrl = `${environment.apiUrl}/v1/contratacao`;

  constructor(private readonly http: HttpClient) {}

  list(query: ContratacaoListQuery = {}): Observable<ContratacaoListResponse> {
    let params = new HttpParams();

    if (query.page) {
      params = params.set('page', String(query.page));
    }
    if (query.per_page) {
      params = params.set('per_page', String(query.per_page));
    }
    if (query.data_inicio) {
      params = params.set('data_inicio', query.data_inicio);
    }
    if (query.data_fim) {
      params = params.set('data_fim', query.data_fim);
    }
    if (query.numero) {
      params = params.set('numero', query.numero);
    }

    return this.http.get<ContratacaoListResponse>(this.baseUrl, { params });
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

  listarApontamentos(uuid: string, etapa?: string): Observable<{ data: ContratacaoApontamento[] }> {
    let params = new HttpParams();
    if (etapa) params = params.set('etapa', etapa);
    return this.http.get<{ data: ContratacaoApontamento[] }>(
      `${this.baseUrl}/${uuid}/apontamentos`,
      { params },
    );
  }

  responderApontamento(uuid: string, apontamentoId: string, resposta: string): Observable<ContratacaoApontamento> {
    return this.http.post<ContratacaoApontamento>(
      `${this.baseUrl}/${uuid}/apontamentos/${apontamentoId}/responder`,
      { resposta },
    );
  }

  reenviar(uuid: string): Observable<Contratacao> {
    return this.http.post<Contratacao>(`${this.baseUrl}/${uuid}/reenviar`, {});
  }
}
