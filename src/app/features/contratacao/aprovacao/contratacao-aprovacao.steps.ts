export interface AnaliseStepDef {
  routeSlug: string;
  etapa: string;
  label: string;
  index: number;
}

export const ANALISE_STEPS: AnaliseStepDef[] = [
  { routeSlug: 'filial', etapa: 'filial', label: 'Filial / dados gerais', index: 0 },
  { routeSlug: 'tr', etapa: 'tr', label: 'TR / escopo', index: 1 },
  { routeSlug: 'qqp', etapa: 'qqp', label: 'QQP', index: 2 },
  { routeSlug: 'anexos', etapa: 'anexos', label: 'Anexos', index: 3 },
  {
    routeSlug: 'solicitacao-servico',
    etapa: 'solicitacao_servico',
    label: 'Solicitação de serviço',
    index: 4,
  },
];

export function analiseStepByRouteSlug(slug: string): AnaliseStepDef | undefined {
  return ANALISE_STEPS.find((step) => step.routeSlug === slug);
}

export function analiseStepRouterLink(uuid: string, routeSlug: string): string[] {
  return ['/contratacao', 'aprovacao', 'analise', uuid, routeSlug];
}

export function analiseNextRouteSlug(routeSlug: string): string | null {
  const step = analiseStepByRouteSlug(routeSlug);
  if (!step) return null;
  return ANALISE_STEPS.find((s) => s.index === step.index + 1)?.routeSlug ?? null;
}

export function analisePrevRouteSlug(routeSlug: string): string | null {
  const step = analiseStepByRouteSlug(routeSlug);
  if (!step || step.index === 0) return null;
  return ANALISE_STEPS.find((s) => s.index === step.index - 1)?.routeSlug ?? null;
}
