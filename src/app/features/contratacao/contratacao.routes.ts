import { Routes } from '@angular/router';

import { contratacaoResolver } from './wizard/contratacao.resolver';
import { ContratacaoWizardStore } from './wizard/contratacao-wizard.store';

export const contratacaoRoutes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./lista/contratacao-lista.page').then((m) => m.ContratacaoListaPageComponent),
  },
  {
    path: 'nova',
    loadComponent: () =>
      import('./wizard/contratacao-wizard-shell.component').then(
        (m) => m.ContratacaoWizardShellComponent,
      ),
    providers: [ContratacaoWizardStore],
    children: [
      {
        path: 'dados-gerais',
        loadComponent: () =>
          import('./wizard/steps/dados-gerais-step.component').then((m) => m.DadosGeraisStepComponent),
      },
      {
        path: ':uuid',
        resolve: { contratacao: contratacaoResolver },
        children: [
          { path: '', redirectTo: 'dados-gerais', pathMatch: 'full' },
          {
            path: 'dados-gerais',
            loadComponent: () =>
              import('./wizard/steps/dados-gerais-step.component').then(
                (m) => m.DadosGeraisStepComponent,
              ),
          },
          {
            path: 'tr',
            loadComponent: () =>
              import('./wizard/steps/tr-step.component').then((m) => m.TrStepComponent),
          },
          {
            path: 'qqp',
            loadComponent: () =>
              import('./wizard/steps/qqp-step.component').then((m) => m.QqpStepComponent),
          },
          {
            path: 'anexos',
            loadComponent: () =>
              import('./wizard/steps/anexos-step.component').then((m) => m.AnexosStepComponent),
          },
          {
            path: 'solicitacao-servico',
            loadComponent: () =>
              import('./wizard/steps/solicitacao-servico-step.component').then(
                (m) => m.SolicitacaoServicoStepComponent,
              ),
          },
          {
            path: 'revisao',
            loadComponent: () =>
              import('./wizard/steps/revisao-step.component').then((m) => m.RevisaoStepComponent),
          },
        ],
      },
      { path: '', redirectTo: 'dados-gerais', pathMatch: 'full' },
    ],
  },
  {
    path: ':uuid/editar',
    redirectTo: 'nova/:uuid/dados-gerais',
    pathMatch: 'full',
  },
];
