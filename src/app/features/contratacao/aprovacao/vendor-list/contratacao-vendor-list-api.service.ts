import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../../../environments/environment';
import {
  AberturaContrato,
  AberturaContratoItem,
  AgendarVisitaTecnicaPayload,
  AnalisarAberturaItemPayload,
  AberturaApontamento,
  AtualizarFornecedorUsuarioPayload,
  AvaliacaoTecnica,
  CadastrarFornecedorPayload,
  CadastrarFornecedorUsuarioPayload,
  ConcluirVisitaTecnicaPayload,
  ContratacaoFornecedorListItem,
  ContratacaoVendorListDetail,
  DispensarVisitaTecnicaPayload,
  FornecedorBuscaResponse,
  FornecedorEnrichmentResponse,
  FornecedorUsuario,
  GerarSugestoesFornecedorPayload,
  PropostaApontamento,
  SalvarAvaliacaoTecnicaPayload,
  SalvarPropostaPayload,
  SugestoesFornecedorResponse,
  VisitaTecnica,
} from '../../contratacao.models';

@Injectable({ providedIn: 'root' })
export class ContratacaoVendorListApiService {
  private readonly baseUrl = `${environment.apiUrl}/v1/contratacao/compras/vendor-list`;

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

  registrarAceite(
    uuid: string,
    fornecedorUuid: string,
  ): Observable<ContratacaoFornecedorListItem> {
    return this.http.post<ContratacaoFornecedorListItem>(
      `${this.baseUrl}/${uuid}/fornecedores/${fornecedorUuid}/aceite`,
      {},
    );
  }

  buscarFornecedorPorCnpj(uuid: string, cnpj: string): Observable<FornecedorBuscaResponse> {
    return this.http.get<FornecedorBuscaResponse>(`${this.baseUrl}/${uuid}/fornecedores/buscar`, {
      params: { cnpj },
    });
  }

  enriquecerFornecedor(
    uuid: string,
    payload: Partial<CadastrarFornecedorPayload> & { cidade?: string | null; uf?: string | null },
  ): Observable<FornecedorEnrichmentResponse> {
    return this.http.post<FornecedorEnrichmentResponse>(
      `${this.baseUrl}/${uuid}/fornecedores/enriquecer`,
      payload,
    );
  }

  removerFornecedor(uuid: string, fornecedorUuid: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(
      `${this.baseUrl}/${uuid}/fornecedores/${fornecedorUuid}`,
    );
  }

  gerarSugestoesFornecedores(
    uuid: string,
    payload?: GerarSugestoesFornecedorPayload,
  ): Observable<SugestoesFornecedorResponse> {
    return this.http.post<SugestoesFornecedorResponse>(
      `${this.baseUrl}/${uuid}/sugestoes-fornecedores`,
      payload ?? {},
    );
  }

  salvarProposta(
    uuid: string,
    fornecedorUuid: string,
    payload: SalvarPropostaPayload,
  ): Observable<ContratacaoFornecedorListItem> {
    return this.http.put<ContratacaoFornecedorListItem>(
      `${this.baseUrl}/${uuid}/fornecedores/${fornecedorUuid}/proposta`,
      payload,
    );
  }

  definirVencedor(
    uuid: string,
    fornecedorUuid: string,
  ): Observable<ContratacaoVendorListDetail | ContratacaoFornecedorListItem[]> {
    return this.http.put<ContratacaoVendorListDetail | ContratacaoFornecedorListItem[]>(
      `${this.baseUrl}/${uuid}/fornecedor-vencedor`,
      { fornecedor_uuid: fornecedorUuid },
    );
  }

  aprovarVendorList(uuid: string): Observable<ContratacaoVendorListDetail> {
    return this.http.post<ContratacaoVendorListDetail>(
      `${this.baseUrl}/${uuid}/aprovar-vendor-list`,
      {},
    );
  }

  obterAvaliacaoTecnica(uuid: string): Observable<AvaliacaoTecnica> {
    return this.http.get<AvaliacaoTecnica>(`${this.baseUrl}/${uuid}/avaliacao-tecnica`);
  }

  salvarAvaliacaoTecnica(
    uuid: string,
    payload: SalvarAvaliacaoTecnicaPayload,
  ): Observable<AvaliacaoTecnica> {
    return this.http.put<AvaliacaoTecnica>(`${this.baseUrl}/${uuid}/avaliacao-tecnica`, payload);
  }

  concluirAvaliacaoTecnica(uuid: string): Observable<AvaliacaoTecnica> {
    return this.http.post<AvaliacaoTecnica>(
      `${this.baseUrl}/${uuid}/avaliacao-tecnica/concluir`,
      {},
    );
  }

  obterAberturaContrato(
    uuid: string,
    fornecedorUuid: string,
  ): Observable<AberturaContrato> {
    return this.http.get<AberturaContrato>(
      `${this.baseUrl}/${uuid}/fornecedores/${fornecedorUuid}/abertura-contrato`,
    );
  }

  solicitarAberturaContrato(
    uuid: string,
    fornecedorUuid: string,
  ): Observable<AberturaContrato> {
    return this.http.post<AberturaContrato>(
      `${this.baseUrl}/${uuid}/fornecedores/${fornecedorUuid}/abertura-contrato/solicitar`,
      {},
    );
  }

  analisarItemAbertura(
    uuid: string,
    fornecedorUuid: string,
    itemUuid: string,
    payload: AnalisarAberturaItemPayload,
  ): Observable<AberturaContrato | AberturaContratoItem> {
    return this.http.post<AberturaContrato | AberturaContratoItem>(
      `${this.baseUrl}/${uuid}/fornecedores/${fornecedorUuid}/abertura-contrato/itens/${itemUuid}/analisar`,
      payload,
    );
  }

  confirmarAberturaContrato(
    uuid: string,
    fornecedorUuid: string,
  ): Observable<AberturaContrato | ContratacaoFornecedorListItem> {
    return this.http.post<AberturaContrato | ContratacaoFornecedorListItem>(
      `${this.baseUrl}/${uuid}/fornecedores/${fornecedorUuid}/abertura-contrato/confirmar`,
      {},
    );
  }

  obterVisitaTecnica(uuid: string, fornecedorUuid: string): Observable<VisitaTecnica> {
    return this.http.get<VisitaTecnica>(
      `${this.baseUrl}/${uuid}/fornecedores/${fornecedorUuid}/visita-tecnica`,
    );
  }

  agendarVisitaTecnica(
    uuid: string,
    fornecedorUuid: string,
    payload: AgendarVisitaTecnicaPayload,
  ): Observable<VisitaTecnica> {
    return this.http.put<VisitaTecnica>(
      `${this.baseUrl}/${uuid}/fornecedores/${fornecedorUuid}/visita-tecnica/agendar`,
      payload,
    );
  }

  concluirVisitaTecnica(
    uuid: string,
    fornecedorUuid: string,
    payload: ConcluirVisitaTecnicaPayload = {},
  ): Observable<VisitaTecnica> {
    return this.http.post<VisitaTecnica>(
      `${this.baseUrl}/${uuid}/fornecedores/${fornecedorUuid}/visita-tecnica/concluir`,
      payload,
    );
  }

  dispensarVisitaTecnica(
    uuid: string,
    fornecedorUuid: string,
    payload: DispensarVisitaTecnicaPayload = {},
  ): Observable<VisitaTecnica> {
    return this.http.post<VisitaTecnica>(
      `${this.baseUrl}/${uuid}/fornecedores/${fornecedorUuid}/visita-tecnica/dispensar`,
      payload,
    );
  }

  listarUsuariosFornecedor(
    uuid: string,
    fornecedorUuid: string,
  ): Observable<{ data: FornecedorUsuario[] }> {
    return this.http.get<{ data: FornecedorUsuario[] }>(
      `${this.baseUrl}/${uuid}/fornecedores/${fornecedorUuid}/usuarios`,
    );
  }

  cadastrarUsuarioFornecedor(
    uuid: string,
    fornecedorUuid: string,
    payload: CadastrarFornecedorUsuarioPayload,
  ): Observable<FornecedorUsuario> {
    return this.http.post<FornecedorUsuario>(
      `${this.baseUrl}/${uuid}/fornecedores/${fornecedorUuid}/usuarios`,
      payload,
    );
  }

  atualizarUsuarioFornecedor(
    uuid: string,
    fornecedorUuid: string,
    usuarioUuid: string,
    payload: AtualizarFornecedorUsuarioPayload,
  ): Observable<FornecedorUsuario> {
    return this.http.patch<FornecedorUsuario>(
      `${this.baseUrl}/${uuid}/fornecedores/${fornecedorUuid}/usuarios/${usuarioUuid}`,
      payload,
    );
  }

  inativarUsuarioFornecedor(
    uuid: string,
    fornecedorUuid: string,
    usuarioUuid: string,
  ): Observable<FornecedorUsuario> {
    return this.http.post<FornecedorUsuario>(
      `${this.baseUrl}/${uuid}/fornecedores/${fornecedorUuid}/usuarios/${usuarioUuid}/inativar`,
      {},
    );
  }

  listarApontamentosProposta(
    uuid: string,
    fornecedorUuid: string,
  ): Observable<{ data: PropostaApontamento[] }> {
    return this.http.get<{ data: PropostaApontamento[] }>(
      `${this.baseUrl}/${uuid}/fornecedores/${fornecedorUuid}/proposta/apontamentos`,
    );
  }

  criarApontamentoProposta(
    uuid: string,
    fornecedorUuid: string,
    payload: { descricao: string },
  ): Observable<PropostaApontamento> {
    return this.http.post<PropostaApontamento>(
      `${this.baseUrl}/${uuid}/fornecedores/${fornecedorUuid}/proposta/apontamentos`,
      payload,
    );
  }

  responderApontamentoProposta(
    uuid: string,
    fornecedorUuid: string,
    apontamentoUuid: string,
    payload: { resposta: string },
  ): Observable<PropostaApontamento> {
    return this.http.post<PropostaApontamento>(
      `${this.baseUrl}/${uuid}/fornecedores/${fornecedorUuid}/proposta/apontamentos/${apontamentoUuid}/responder`,
      payload,
    );
  }

  encerrarApontamentoProposta(
    uuid: string,
    fornecedorUuid: string,
    apontamentoUuid: string,
  ): Observable<PropostaApontamento> {
    return this.http.post<PropostaApontamento>(
      `${this.baseUrl}/${uuid}/fornecedores/${fornecedorUuid}/proposta/apontamentos/${apontamentoUuid}/encerrar`,
      {},
    );
  }

  abrirApontamentoAbertura(
    uuid: string,
    fornecedorUuid: string,
    itemUuid: string,
    payload: { descricao: string },
  ): Observable<AberturaApontamento> {
    return this.http.post<AberturaApontamento>(
      `${this.baseUrl}/${uuid}/fornecedores/${fornecedorUuid}/abertura-contrato/itens/${itemUuid}/apontamentos`,
      payload,
    );
  }

  responderApontamentoAbertura(
    uuid: string,
    fornecedorUuid: string,
    apontamentoUuid: string,
    payload: { resposta: string },
  ): Observable<AberturaApontamento> {
    return this.http.post<AberturaApontamento>(
      `${this.baseUrl}/${uuid}/fornecedores/${fornecedorUuid}/abertura-contrato/apontamentos/${apontamentoUuid}/responder`,
      payload,
    );
  }

  encerrarApontamentoAbertura(
    uuid: string,
    fornecedorUuid: string,
    apontamentoUuid: string,
  ): Observable<AberturaApontamento> {
    return this.http.post<AberturaApontamento>(
      `${this.baseUrl}/${uuid}/fornecedores/${fornecedorUuid}/abertura-contrato/apontamentos/${apontamentoUuid}/encerrar`,
      {},
    );
  }
}
