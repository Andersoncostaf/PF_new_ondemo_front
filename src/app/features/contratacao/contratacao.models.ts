export type ContratacaoStatus = 'rascunho' | 'submetido';

export interface QqpItem {
  id?: string;
  ordem: number;
  descricao: string;
  quantidade: number;
  unidade: string;
}

export interface Contratacao {
  uuid: string;
  titulo: string | null;
  categoria_servico: string | null;
  local: string | null;
  prazo_desejado: string | null;
  termo_referencia: string | null;
  status: ContratacaoStatus;
  criado_por_usuario_id?: string;
  created_at?: string;
  updated_at?: string;
  qqp_itens: QqpItem[];
}

export interface ContratacaoListItem {
  uuid: string;
  titulo: string | null;
  categoria_servico: string | null;
  status: ContratacaoStatus;
  created_at?: string;
  updated_at?: string;
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
  termo_referencia?: string | null;
  qqp_itens?: QqpItem[];
}

export interface ApiErrorBody {
  message?: string;
  code?: string;
}
