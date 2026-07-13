export type AuthHeroVariant = 'cadastro' | 'login';

export interface AuthHeroFlowStep {
  label: string;
  icon: string;
}

export interface AuthHeroBenefit {
  icon: string;
  text: string;
  highlight?: boolean;
}

export interface AuthHeroConfig {
  showTrialBadge: boolean;
  headline: string;
  subheadline: string;
  flowSteps: AuthHeroFlowStep[];
  benefits: AuthHeroBenefit[];
  mediaClass: string;
}

export const AUTH_HERO_CONFIG: Record<AuthHeroVariant, AuthHeroConfig> = {
  cadastro: {
    showTrialBadge: true,
    headline: 'Crie o portal da sua empresa em minutos',
    subheadline:
      'Centralize compras, fornecedores e contratações — com transparência para quem presta serviço.',
    flowSteps: [
      { label: 'Contrate', icon: 'pi pi-file-edit' },
      { label: 'Analise', icon: 'pi pi-check-square' },
      { label: 'Receba a nota', icon: 'pi pi-file' },
    ],
    benefits: [
      {
        icon: 'pi pi-file-check',
        text: 'Nota de Serviço com retorno claro: o fornecedor sabe se foi aprovado ou desclassificado na contratação.',
        highlight: true,
      },
      {
        icon: 'pi pi-link',
        text: 'Endereço exclusivo: portalfornecedor.sua-empresa.local',
      },
    ],
    mediaClass: 'auth-hero__media--cadastro',
  },
  login: {
    showTrialBadge: false,
    headline: 'Bem-vindo de volta ao seu portal de compras',
    subheadline:
      'Gerencie fornecedores, contratações e notas de serviço em um só lugar.',
    flowSteps: [
      { label: 'Contrate', icon: 'pi pi-file-edit' },
      { label: 'Analise', icon: 'pi pi-check-square' },
      { label: 'Receba a nota', icon: 'pi pi-file' },
    ],
    benefits: [
      {
        icon: 'pi pi-file-check',
        text: 'Nota de Serviço com retorno claro: o fornecedor sabe se foi aprovado ou desclassificado na contratação.',
        highlight: true,
      },
      {
        icon: 'pi pi-send',
        text: 'Cotações com fornecedores qualificados',
      },
      {
        icon: 'pi pi-shield',
        text: 'Sua empresa em um ambiente seguro e exclusivo',
      },
    ],
    mediaClass: 'auth-hero__media--login',
  },
};
