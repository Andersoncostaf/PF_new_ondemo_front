import type { ContratacaoStatus } from './contratacao-status.utils';

export type { ContratacaoStatus };

export type ApontamentoEtapa = 'filial' | 'tr' | 'qqp' | 'anexos' | 'solicitacao_servico';

export type ApontamentoStatus = 'pendente' | 'respondido' | 'cancelado';

export interface ContratacaoApontamento {
  id: string;
  uuid: string;
  etapa: ApontamentoEtapa;
  descricao: string | null;
  status: ApontamentoStatus;
  resposta: string | null;
  autor_nome?: string | null;
  respondedor_nome?: string | null;
  nome_arquivo?: string | null;
  tamanho_bytes?: number;
  created_at?: string;
  updated_at?: string;
}

export type { TermoReferenciaCampoKey, TermoReferenciaCampos } from './termo-referencia.constants';

export interface QqpItem {
  id?: string;
  ordem: number;
  descricao: string;
  quantidade: number;
  unidade: string;
  valor_unitario: number;
}

export interface ContratacaoAnexo {
  id: string;
  descricao: string;
  nome_arquivo: string;
  mime_type?: string | null;
  tamanho_bytes?: number;
  created_at?: string;
}

export interface SolicitacaoServico {
  codigo_servico?: string | null;
  centro_custo?: string | null;
  projeto?: string | null;
  fase?: string | null;
  conta_financeira?: string | null;
  conta_contabil?: string | null;
  transacao?: string | null;
  valor_servico?: string | null;
  observacao_ss?: string | null;
}

export interface Contratacao {
  uuid: string;
  titulo: string | null;
  categoria_servico: string | null;
  local: string | null;
  prazo_desejado: string | null;
  empresa: string | null;
  empresa_cnpj: string | null;
  empresa_endereco: string | null;
  departamento: string | null;
  termo_referencia: string | null;
  termo_referencia_campos: Partial<import('./termo-referencia.constants').TermoReferenciaCamposPayload>;
  solicitacao_servico?: SolicitacaoServico | null;
  status: ContratacaoStatus;
  criado_por_usuario_id?: string;
  created_at?: string;
  updated_at?: string;
  qqp_itens: QqpItem[];
  anexos?: ContratacaoAnexo[];
}

export interface ContratacaoListItem {
  uuid: string;
  numero_exibicao: string;
  titulo: string | null;
  empresa: string | null;
  empresa_cnpj: string | null;
  departamento: string | null;
  criado_por_nome: string | null;
  categoria_servico: string | null;
  status: ContratacaoStatus;
  created_at?: string;
  updated_at?: string;
  fornecedor_vencedor?: string | null;
  data_inicio_analise?: string | null;
  responsavel_analise?: string | null;
  apontamentos_pendentes?: number | null;
}

export interface ContratacaoListQuery {
  page?: number;
  per_page?: number;
  data_inicio?: string;
  data_fim?: string;
  numero?: string;
}

export interface ContratacaoListResponse {
  data: ContratacaoListItem[];
  meta: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}

export type AberturaContratoStatus =
  | 'nao_iniciada'
  | 'aguardando_envio'
  | 'enviado_pelo_fornecedor'
  | 'em_ajuste'
  | 'aceito';

export type AberturaItemStatusAnalise = 'pendente' | 'sim' | 'nao' | 'na';

export type AvaliacaoTecnicaStatus = 'rascunho' | 'aguardando_area' | 'concluida';

export type FornecedorUsuarioPerfil = 'PADRAO' | 'ADMIN';

export type PropostaApontamentoStatus = 'aberto' | 'respondido' | 'encerrado';

export type PropostaApontamentoAutor = 'COMPRAS' | 'FORNECEDOR';

export interface ContratacaoFornecedorListItem {
  uuid: string;
  cnpj: string;
  razao_social: string;
  telefone: string | null;
  email: string | null;
  vendedor: string | null;
  aceite: boolean;
  status_participacao: string;
  proposta_inicial?: number | null;
  proposta_equalizada?: number | null;
  proposta_final?: number | null;
  condicao_pagamento_dias?: number | null;
  observacao_proposta?: string | null;
  vencedor?: boolean;
  abertura_contrato_status?: AberturaContratoStatus | string;
  abertura_solicitada_em?: string | null;
  abertura_enviada_em?: string | null;
  abertura_confirmada_em?: string | null;
  optante_simples?: boolean;
  created_at?: string;
}

export interface ContratacaoVendorListDetail extends Contratacao {
  fornecedores?: ContratacaoFornecedorListItem[];
  fornecedor_vencedor_uuid?: string | null;
}

export interface SalvarPropostaPayload {
  proposta_inicial?: number | null;
  proposta_equalizada?: number | null;
  proposta_final?: number | null;
  condicao_pagamento_dias?: number | null;
  observacao_proposta?: string | null;
}

export interface AvaliacaoTecnicaItem {
  uuid: string;
  codigo: string;
  label: string;
  peso_percentual: number;
  nota: number | null;
  observacao?: string | null;
}

export interface AvaliacaoTecnica {
  uuid: string;
  status: AvaliacaoTecnicaStatus | string;
  fornecedor_vencedor_uuid?: string | null;
  indice_percentual: number | null;
  observacao?: string | null;
  itens: AvaliacaoTecnicaItem[];
}

export interface SalvarAvaliacaoTecnicaPayload {
  observacao?: string | null;
  itens: Array<{
    uuid: string;
    nota: number | null;
    observacao?: string | null;
  }>;
}

export interface AberturaContratoItem {
  uuid: string;
  codigo: string;
  label: string;
  ordem: number;
  obrigatorio: boolean;
  condicional?: boolean;
  condicao?: string | null;
  controla_vencimento?: boolean;
  validade_dias?: number | null;
  parent_codigo?: string | null;
  padrao?: boolean;
  status_analise: AberturaItemStatusAnalise | string;
  observacao_analise?: string | null;
  vencimento?: string | null;
  nome_arquivo?: string | null;
}

export interface AberturaContrato {
  status: AberturaContratoStatus | string;
  itens: AberturaContratoItem[];
  total_obrigatorios?: number;
  conformes?: number;
}

export interface AnalisarAberturaItemPayload {
  status_analise: 'sim' | 'nao' | 'na';
  observacao?: string | null;
}

export interface FornecedorUsuario {
  uuid: string;
  nome: string;
  email: string;
  telefone: string | null;
  perfil: FornecedorUsuarioPerfil | string;
  ativo: boolean;
  created_at?: string;
}

export interface CadastrarFornecedorUsuarioPayload {
  nome: string;
  email: string;
  telefone?: string | null;
  perfil: FornecedorUsuarioPerfil;
}

export interface AtualizarFornecedorUsuarioPayload {
  nome?: string;
  email?: string;
  telefone?: string | null;
  perfil?: FornecedorUsuarioPerfil;
}

export interface PropostaApontamento {
  uuid: string;
  descricao: string;
  status: PropostaApontamentoStatus | string;
  autor_origem: PropostaApontamentoAutor | string;
  resposta?: string | null;
  created_at?: string;
  updated_at?: string;
}

export const ABERTURA_CONTRATO_STATUS_LABELS: Record<AberturaContratoStatus, string> = {
  nao_iniciada: 'Não iniciada',
  aguardando_envio: 'Aguardando envio',
  enviado_pelo_fornecedor: 'Enviado pelo fornecedor',
  em_ajuste: 'Em ajuste',
  aceito: 'Documentação OK',
};

export function aberturaContratoStatusLabel(status: string): string {
  return ABERTURA_CONTRATO_STATUS_LABELS[status as AberturaContratoStatus] ?? status;
}

export interface CadastrarFornecedorPayload {
  cnpj: string;
  razao_social: string;
  telefone?: string;
  email?: string;
  vendedor: string;
  site?: string | null;
  instagram?: string | null;
  linkedin?: string | null;
  facebook?: string | null;
  cidade?: string | null;
  uf?: string | null;
}

export interface FornecedorBuscaResponse {
  encontrado: boolean;
  origem?: SugestaoFornecedorOrigem | 'brasil_api';
  cnpj?: string;
  razao_social?: string;
  telefone?: string | null;
  email?: string | null;
  vendedor?: string | null;
  cidade?: string | null;
  uf?: string | null;
}

export interface FornecedorEnrichmentResponse {
  encontrado: boolean;
  fonte: string;
  cnpj?: string | null;
  razao_social?: string | null;
  telefone?: string | null;
  email?: string | null;
  vendedor?: string | null;
  cidade?: string | null;
  uf?: string | null;
  site?: string | null;
  instagram?: string | null;
  linkedin?: string | null;
  facebook?: string | null;
  campos_preenchidos: string[];
  aviso: string;
}

export type SugestaoFornecedorOrigem = 'historico_tenant' | 'catalogo_tenant' | 'ia_externa';

export interface SugestaoFornecedorItem {
  id: string;
  rank: number;
  score: number;
  origem: SugestaoFornecedorOrigem;
  cnpj: string;
  razao_social: string;
  telefone: string | null;
  email: string | null;
  cidade: string | null;
  uf: string | null;
  site?: string | null;
  instagram?: string | null;
  linkedin?: string | null;
  facebook?: string | null;
  motivo: string;
  ja_cadastrado: boolean;
}

export interface SugestoesFornecedorResponse {
  contratacao_uuid: string;
  gerado_em: string;
  fonte: string;
  aviso: string;
  contexto_resumido: {
    categoria_servico: string | null;
    local: string | null;
    titulo: string | null;
  };
  sugestoes: SugestaoFornecedorItem[];
  meta: {
    total_encontrado: number;
    retornados: number;
    cache_hit: boolean;
  };
}

export interface GerarSugestoesFornecedorPayload {
  limite?: number;
  forcar_regeneracao?: boolean;
}

export interface ContratacaoPayload {
  titulo?: string | null;
  categoria_servico?: string | null;
  local?: string | null;
  prazo_desejado?: string | null;
  empresa?: string | null;
  empresa_cnpj?: string | null;
  empresa_endereco?: string | null;
  departamento?: string | null;
  termo_referencia?: string | null;
  termo_referencia_campos?: Partial<import('./termo-referencia.constants').TermoReferenciaCamposPayload>;
  solicitacao_servico?: SolicitacaoServico | null;
  qqp_itens?: QqpItem[];
}

export interface ApiErrorBody {
  message?: string;
  code?: string;
}

export const SOLICITACAO_SERVICO_LABELS: Record<keyof SolicitacaoServico, string> = {
  codigo_servico: 'Código do serviço',
  centro_custo: 'Centro de custo',
  projeto: 'Projeto',
  fase: 'Fase',
  conta_financeira: 'Conta financeira',
  conta_contabil: 'Conta contábil',
  transacao: 'Transação',
  valor_servico: 'Valor do serviço',
  observacao_ss: 'Observação SS',
};
