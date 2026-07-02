export type ContratacaoStatus =
  | 'rascunho'
  | 'aguardando_analise_compras'
  | 'em_analise'
  | 'aguardando_ajuste_area'
  | 'aprovado_compras';

export const CONTRATACAO_STATUS_LABELS: Record<ContratacaoStatus, string> = {
  rascunho: 'Rascunho',
  aguardando_analise_compras: 'Aguardando análise',
  em_analise: 'Em análise',
  aguardando_ajuste_area: 'Aguardando ajuste',
  aprovado_compras: 'Aprovado (Compras)',
};

export function contratacaoStatusLabel(status: string): string {
  return CONTRATACAO_STATUS_LABELS[status as ContratacaoStatus] ?? status;
}

export function contratacaoStatusSeverity(
  status: string,
): 'success' | 'info' | 'warning' | 'danger' | 'secondary' {
  switch (status) {
    case 'rascunho':
      return 'warning';
    case 'aguardando_analise_compras':
      return 'info';
    case 'em_analise':
      return 'info';
    case 'aguardando_ajuste_area':
      return 'danger';
    case 'aprovado_compras':
      return 'success';
    default:
      return 'secondary';
  }
}

export function contratacaoPodeEditar(status: string): boolean {
  return status === 'rascunho';
}

export function contratacaoPodeVisualizar(status: string): boolean {
  return status !== 'rascunho' && status !== 'aguardando_ajuste_area';
}

export function contratacaoPodeAjustes(status: string): boolean {
  return status === 'aguardando_ajuste_area';
}
