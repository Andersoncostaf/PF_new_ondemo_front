export type ContratacaoStatus = 'rascunho' | 'submetido';

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
