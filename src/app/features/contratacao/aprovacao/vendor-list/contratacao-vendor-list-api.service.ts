import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../../../environments/environment';
import {
  CadastrarFornecedorPayload,
  ContratacaoFornecedorListItem,
  ContratacaoVendorListDetail,
} from '../../contratacao.models';

@Injectable({ providedIn: 'root' })
export class ContratacaoVendorListApiService {
  private readonly baseUrl = `${environment.apiUrl}/v1/contratacao/vendor-list`;

  constructor(private readonly http: HttpClient) {}

  get(uuid: string): Observable<ContratacaoVendorListDetail> {
    return this.http.get<ContratacaoVendorListDetail>(`${this.baseUrl}/${uuid}`);
  }

  listarFornecedores(uuid: string): Observable<{ data: ContratacaoFornecedorListItem[] }> {
    return this.http.get<{ data: ContratacaoFornecedorListItem[] }>(
      `${this.baseUrl}/${uuid}/fornecedores`,
    );
  }

  cadastrarFornecedor(
    uuid: string,
    payload: CadastrarFornecedorPayload,
  ): Observable<ContratacaoFornecedorListItem> {
    return this.http.post<ContratacaoFornecedorListItem>(
      `${this.baseUrl}/${uuid}/fornecedores`,
      payload,
    );
  }

  removerFornecedor(uuid: string, fornecedorUuid: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(
      `${this.baseUrl}/${uuid}/fornecedores/${fornecedorUuid}`,
    );
  }
}
