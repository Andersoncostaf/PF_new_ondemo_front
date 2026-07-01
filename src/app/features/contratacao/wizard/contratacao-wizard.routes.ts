import { Routes } from '@angular/router';

import { contratacaoResolver } from './contratacao.resolver';

export const contratacaoWizardRoutes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./contratacao-wizard-shell.component').then((m) => m.ContratacaoWizardShellComponent),
    children: [
      {
        path: 'dados-gerais',
        loadComponent: () =>
          import('./steps/dados-gerais-step.component').then((m) => m.DadosGeraisStepComponent),
      },
      {
        path: ':uuid',
        resolve: { contratacao: contratacaoResolver },
        children: [
          { path: '', redirectTo: 'dados-gerais', pathMatch: 'full' },
          {
            path: 'dados-gerais',
            loadComponent: () =>
              import('./steps/dados-gerais-step.component').then((m) => m.DadosGeraisStepComponent),
          },
          {
            path: 'tr',
            loadComponent: () => import('./steps/tr-step.component').then((m) => m.TrStepComponent),
          },
          {
            path: 'qqp',
            loadComponent: () => import('./steps/qqp-step.component').then((m) => m.QqpStepComponent),
          },
          {
            path: 'anexos',
            loadComponent: () =>
              import('./steps/anexos-step.component').then((m) => m.AnexosStepComponent),
          },
          {
            path: 'solicitacao-servico',
            loadComponent: () =>
              import('./steps/solicitacao-servico-step.component').then(
                (m) => m.SolicitacaoServicoStepComponent,
              ),
          },
          {
            path: 'revisao',
            loadComponent: () =>
              import('./steps/revisao-step.component').then((m) => m.RevisaoStepComponent),
          },
        ],
      },
      { path: '', redirectTo: 'dados-gerais', pathMatch: 'full' },
    ],
  },
];
