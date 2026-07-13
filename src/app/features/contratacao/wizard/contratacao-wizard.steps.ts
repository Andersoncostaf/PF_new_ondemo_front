import { MenuItem } from 'primeng/api';

export interface WizardStepDef {
  slug: string;
  label: string;
  index: number;
}

export const WIZARD_STEPS: WizardStepDef[] = [
  { slug: 'dados-gerais', label: 'Dados gerais', index: 0 },
  { slug: 'tr', label: 'TR / escopo', index: 1 },
  { slug: 'qqp', label: 'QQP', index: 2 },
  { slug: 'anexos', label: 'Anexos', index: 3 },
  { slug: 'solicitacao-servico', label: 'Solicitação de serviço', index: 4 },
  { slug: 'revisao', label: 'Revisão', index: 5 },
];

export const FIRST_STEP_SLUG = WIZARD_STEPS[0].slug;
export const FIRST_STEP_AFTER_CREATE_SLUG = WIZARD_STEPS[1].slug;

export function stepBySlug(slug: string): WizardStepDef | undefined {
  return WIZARD_STEPS.find((step) => step.slug === slug);
}

export function stepByIndex(index: number): WizardStepDef | undefined {
  return WIZARD_STEPS.find((step) => step.index === index);
}

export function nextSlug(slug: string): string | null {
  const step = stepBySlug(slug);
  if (!step) {
    return null;
  }
  return stepByIndex(step.index + 1)?.slug ?? null;
}

export function prevSlug(slug: string): string | null {
  const step = stepBySlug(slug);
  if (!step || step.index === 0) {
    return null;
  }
  return stepByIndex(step.index - 1)?.slug ?? null;
}

export function stepRouterLink(uuid: string | null, slug: string): string[] | null {
  if (uuid) {
    return ['/contratacao', 'nova', uuid, slug];
  }
  if (slug === FIRST_STEP_SLUG) {
    return ['/contratacao', 'nova', FIRST_STEP_SLUG];
  }
  return null;
}

export function buildStepMenuItems(uuid: string | null): MenuItem[] {
  return WIZARD_STEPS.map((step) => {
    const link = stepRouterLink(uuid, step.slug);
    return {
      label: step.label,
      routerLink: link ?? undefined,
      disabled: link === null,
    };
  });
}

export function activeIndexFromSlug(slug: string): number {
  return stepBySlug(slug)?.index ?? 0;
}
