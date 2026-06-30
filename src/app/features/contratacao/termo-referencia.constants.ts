export type TermoReferenciaCampoKey =
  | 'objetivo'
  | 'escopo'
  | 'gestor_contrato'
  | 'materiais_recursos'
  | 'responsabilidade_contratante'
  | 'responsabilidade_contratada'
  | 'ferramentas_equipamentos'
  | 'mao_de_obra'
  | 'regime_trabalho'
  | 'documentos_exigidos'
  | 'prazo_execucao'
  | 'formas_pagamento'
  | 'subcontratacao'
  | 'comissionamento'
  | 'condicoes_gerais'
  | 'visita_tecnica';

export type TermoReferenciaCampos = Record<TermoReferenciaCampoKey, string>;

export interface TermoReferenciaCampoPersonalizado {
  id: string;
  titulo: string;
  conteudo: string;
  ordem?: number;
}

export type TermoReferenciaCamposPayload = Partial<TermoReferenciaCampos> & {
  campos_personalizados?: TermoReferenciaCampoPersonalizado[];
};

export interface TermoReferenciaFieldDef {
  key: TermoReferenciaCampoKey;
  label: string;
  hint: string;
  icon: string;
  rows: number;
  singleLine?: boolean;
}

export interface TermoReferenciaGroupDef {
  id: string;
  title: string;
  subtitle: string;
  icon: string;
  accent: string;
  fields: TermoReferenciaFieldDef[];
}

export const TERMO_REFERENCIA_KEYS: TermoReferenciaCampoKey[] = [
  'objetivo',
  'escopo',
  'gestor_contrato',
  'materiais_recursos',
  'responsabilidade_contratante',
  'responsabilidade_contratada',
  'ferramentas_equipamentos',
  'mao_de_obra',
  'regime_trabalho',
  'documentos_exigidos',
  'prazo_execucao',
  'formas_pagamento',
  'subcontratacao',
  'comissionamento',
  'condicoes_gerais',
  'visita_tecnica',
];

export const TERMO_REFERENCIA_GROUPS: TermoReferenciaGroupDef[] = [
  {
    id: 'escopo',
    title: 'Escopo e gestão',
    subtitle: 'Defina o propósito e quem conduzirá o contrato',
    icon: 'pi pi-compass',
    accent: '#2563eb',
    fields: [
      {
        key: 'objetivo',
        label: 'Objetivo',
        hint: 'Qual resultado a contratação deve alcançar?',
        icon: 'pi pi-flag',
        rows: 3,
      },
      {
        key: 'escopo',
        label: 'Escopo',
        hint: 'Descreva os serviços incluídos e exclusões relevantes',
        icon: 'pi pi-list-check',
        rows: 4,
      },
      {
        key: 'gestor_contrato',
        label: 'Gestor do contrato',
        hint: 'Nome ou função do responsável pelo acompanhamento',
        icon: 'pi pi-user',
        rows: 1,
        singleLine: true,
      },
      {
        key: 'prazo_execucao',
        label: 'Prazo de execução',
        hint: 'Cronograma, marcos ou duração esperada dos serviços',
        icon: 'pi pi-calendar',
        rows: 3,
      },
    ],
  },
  {
    id: 'recursos',
    title: 'Recursos e operação',
    subtitle: 'Materiais, equipe e forma de trabalho',
    icon: 'pi pi-box',
    accent: '#0d9488',
    fields: [
      {
        key: 'materiais_recursos',
        label: 'Materiais / recursos',
        hint: 'Insumos, consumíveis ou infraestrutura necessários',
        icon: 'pi pi-inbox',
        rows: 3,
      },
      {
        key: 'ferramentas_equipamentos',
        label: 'Ferramentas e equipamentos',
        hint: 'Equipamentos, EPIs ou ferramentas exigidas',
        icon: 'pi pi-wrench',
        rows: 3,
      },
      {
        key: 'mao_de_obra',
        label: 'Mão de obra',
        hint: 'Perfil, quantidade e qualificação da equipe',
        icon: 'pi pi-users',
        rows: 3,
      },
      {
        key: 'regime_trabalho',
        label: 'Regime de trabalho',
        hint: 'Horários, turnos, presencial/remoto, etc.',
        icon: 'pi pi-clock',
        rows: 3,
      },
    ],
  },
  {
    id: 'responsabilidades',
    title: 'Responsabilidades e documentação',
    subtitle: 'Obrigações das partes e requisitos formais',
    icon: 'pi pi-shield',
    accent: '#7c3aed',
    fields: [
      {
        key: 'responsabilidade_contratante',
        label: 'Responsabilidade da contratante',
        hint: 'O que a empresa contratante deve fornecer ou garantir',
        icon: 'pi pi-building',
        rows: 3,
      },
      {
        key: 'responsabilidade_contratada',
        label: 'Responsabilidade da contratada',
        hint: 'Entregas, garantias e deveres do fornecedor',
        icon: 'pi pi-briefcase',
        rows: 3,
      },
      {
        key: 'documentos_exigidos',
        label: 'Documentos exigidos (licenças, certificações)',
        hint: 'Alvarás, NR, certidões ou comprovantes necessários',
        icon: 'pi pi-file-check',
        rows: 3,
      },
      {
        key: 'visita_tecnica',
        label: 'Visita técnica',
        hint: 'Se aplicável, descreva necessidade, local e critérios',
        icon: 'pi pi-map-marker',
        rows: 3,
      },
    ],
  },
  {
    id: 'comercial',
    title: 'Condições comerciais',
    subtitle: 'Pagamento, subcontratação e regras gerais',
    icon: 'pi pi-wallet',
    accent: '#ea580c',
    fields: [
      {
        key: 'formas_pagamento',
        label: 'Formas de pagamento',
        hint: 'Parcelas, medições, retenções ou prazos de faturamento',
        icon: 'pi pi-credit-card',
        rows: 3,
      },
      {
        key: 'subcontratacao',
        label: 'Subcontratação',
        hint: 'Permitida ou vedada; limites e aprovações',
        icon: 'pi pi-sitemap',
        rows: 3,
      },
      {
        key: 'comissionamento',
        label: 'Comissionamento',
        hint: 'Testes finais, aceite ou critérios de entrega',
        icon: 'pi pi-check-circle',
        rows: 3,
      },
      {
        key: 'condicoes_gerais',
        label: 'Condições gerais',
        hint: 'Cláusulas adicionais, penalidades ou observações',
        icon: 'pi pi-book',
        rows: 4,
      },
    ],
  },
];

export function emptyTermoReferenciaCampos(): TermoReferenciaCampos {
  return TERMO_REFERENCIA_KEYS.reduce((acc, key) => {
    acc[key] = '';
    return acc;
  }, {} as TermoReferenciaCampos);
}

/** Funciona em HTTP (.local) onde crypto.randomUUID não está disponível. */
export function generateTrCampoId(preferred?: string): string {
  if (preferred) {
    return preferred;
  }

  const cryptoRef = globalThis.crypto;
  if (cryptoRef && typeof cryptoRef.randomUUID === 'function') {
    return cryptoRef.randomUUID();
  }

  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (char) => {
    const random = Math.trunc(Math.random() * 16);
    if (char === 'x') {
      return random.toString(16);
    }
    return ((random & 0x3) | 0x8).toString(16);
  });
}

export function countFilledTermoCampos(campos: Partial<TermoReferenciaCampos> | null | undefined): number {
  if (!campos) {
    return 0;
  }

  return TERMO_REFERENCIA_KEYS.filter((key) => (campos[key] ?? '').trim().length > 0).length;
}
