import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../../../environments/environment';
import {
  Contratacao,
  ContratacaoListQuery,
  ContratacaoListResponse,
} from '../contratacao.models';

@Injectable({ providedIn: 'root' })
export class ContratacaoComprasApiService {
  private readonly baseUrl = `${environment.apiUrl}/v1/contratacao/compras`;

  constructor(private readonly http: HttpClient) {}

  listFila(query: ContratacaoListQuery = {}): Observable<ContratacaoListResponse> {
    let params = new HttpParams();
    if (query.page) params = params.set('page', String(query.page));
    if (query.per_page) params = params.set('per_page', String(query.per_page));
    if (query.data_inicio) params = params.set('data_inicio', query.data_inicio);
    if (query.data_fim) params = params.set('data_fim', query.data_fim);
    if (query.numero) params = params.set('numero', query.numero);

    return this.http.get<ContratacaoListResponse>(`${this.baseUrl}/fila`, { params });
  }

  assumirVendorList(uuid: string): Observable<Contratacao> {
    return this.http.post<Contratacao>(`${this.baseUrl}/${uuid}/assumir-vendor-list`, {});
  }

  get(uuid: string): Observable<Contratacao> {
    return this.http.get<Contratacao>(`${this.baseUrl}/${uuid}`);
  }
}
