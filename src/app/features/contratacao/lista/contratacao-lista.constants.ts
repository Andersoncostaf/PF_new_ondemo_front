export const LISTA_COLUNAS_LARGURAS = [
  { width: '6.5rem' },
  { width: '10.5rem' },
  { width: '12rem' },
  { width: '10.5rem' },
  { width: '10rem' },
  { width: '18rem' },
  { width: '11rem' },
  { width: '13rem' },
  { width: '10.5rem' },
  { width: '12rem' },
  { width: '9.5rem' },
  { width: '10rem' },
] as const;

export interface ContratacaoListaFiltros {
  dataInicio: string;
  dataFim: string;
  numeroContratacao: string;
}

export const EMPTY_CONTRATACAO_LISTA_FILTROS: ContratacaoListaFiltros = {
  dataInicio: '',
  dataFim: '',
  numeroContratacao: '',
};

export function filtrosToQueryParams(filtros: ContratacaoListaFiltros): {
  data_inicio?: string;
  data_fim?: string;
  numero?: string;
} {
  return {
    data_inicio: filtros.dataInicio || undefined,
    data_fim: filtros.dataFim || undefined,
    numero: filtros.numeroContratacao.trim() || undefined,
  };
}

export function displayOrDash(value: string | null | undefined): string {
  const trimmed = String(value ?? '').trim();
  return trimmed.length > 0 ? trimmed : '—';
}
