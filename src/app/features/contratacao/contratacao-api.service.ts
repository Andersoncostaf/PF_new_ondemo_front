import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import {
  Contratacao,
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
}
