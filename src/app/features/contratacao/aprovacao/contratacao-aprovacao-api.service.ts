import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../../../environments/environment';
import {
  Contratacao,
  ContratacaoApontamento,
  ContratacaoListQuery,
  ContratacaoListResponse,
} from '../contratacao.models';

@Injectable({ providedIn: 'root' })
export class ContratacaoAprovacaoApiService {
  private readonly baseUrl = `${environment.apiUrl}/v1/contratacao/aprovacao`;

  constructor(private readonly http: HttpClient) {}

  listPendentes(query: ContratacaoListQuery = {}): Observable<ContratacaoListResponse> {
    let params = new HttpParams();
    if (query.page) params = params.set('page', String(query.page));
    if (query.per_page) params = params.set('per_page', String(query.per_page));
    if (query.data_inicio) params = params.set('data_inicio', query.data_inicio);
    if (query.data_fim) params = params.set('data_fim', query.data_fim);
    if (query.numero) params = params.set('numero', query.numero);

    return this.http.get<ContratacaoListResponse>(`${this.baseUrl}/pendentes`, { params });
  }

  assumir(uuid: string): Observable<Contratacao> {
    return this.http.post<Contratacao>(`${this.baseUrl}/${uuid}/assumir`, {});
  }

  get(uuid: string): Observable<Contratacao> {
    return this.http.get<Contratacao>(`${this.baseUrl}/${uuid}`);
  }

  listarApontamentos(uuid: string, etapa?: string): Observable<{ data: ContratacaoApontamento[] }> {
    let params = new HttpParams();
    if (etapa) params = params.set('etapa', etapa);
    return this.http.get<{ data: ContratacaoApontamento[] }>(
      `${this.baseUrl}/${uuid}/apontamentos`,
      { params },
    );
  }

  salvarApontamento(uuid: string, etapa: string, descricao: string, arquivo?: File): Observable<ContratacaoApontamento> {
    const formData = new FormData();
    formData.append('etapa', etapa);
    formData.append('descricao', descricao);
    if (arquivo) formData.append('arquivo', arquivo);
    return this.http.post<ContratacaoApontamento>(`${this.baseUrl}/${uuid}/apontamentos`, formData);
  }

  excluirApontamento(uuid: string, apontamentoId: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.baseUrl}/${uuid}/apontamentos/${apontamentoId}`);
  }

  baixarAnexoApontamento(uuid: string, apontamentoId: string): Observable<Blob> {
    return this.http.get(`${this.baseUrl}/${uuid}/apontamentos/${apontamentoId}/anexo`, {
      responseType: 'blob',
    });
  }

  retornarAjustes(uuid: string): Observable<Contratacao> {
    return this.http.post<Contratacao>(`${this.baseUrl}/${uuid}/retornar-ajustes`, {});
  }

  aprovarAnalise(uuid: string): Observable<Contratacao> {
    return this.http.post<Contratacao>(`${this.baseUrl}/${uuid}/aprovar-analise`, {});
  }
}
