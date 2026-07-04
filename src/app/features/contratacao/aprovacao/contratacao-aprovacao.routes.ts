import { Routes } from '@angular/router';

import { AnaliseContratacaoStore } from './analise/analise-contratacao.store';

export const contratacaoAprovacaoRoutes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./lista/aprovacao-lista.page').then((m) => m.AprovacaoListaPageComponent),
  },
  {
    path: 'analise/:uuid',
    loadComponent: () =>
      import('./analise/analise-shell.component').then((m) => m.AnaliseShellComponent),
    providers: [AnaliseContratacaoStore],
    children: [
      { path: '', redirectTo: 'filial', pathMatch: 'full' },
      {
        path: 'filial',
        loadComponent: () =>
          import('./analise/analise-etapa.page').then((m) => m.AnaliseEtapaPageComponent),
      },
      {
        path: 'tr',
        loadComponent: () =>
          import('./analise/analise-etapa.page').then((m) => m.AnaliseEtapaPageComponent),
      },
      {
        path: 'qqp',
        loadComponent: () =>
          import('./analise/analise-etapa.page').then((m) => m.AnaliseEtapaPageComponent),
      },
      {
        path: 'anexos',
        loadComponent: () =>
          import('./analise/analise-etapa.page').then((m) => m.AnaliseEtapaPageComponent),
      },
      {
        path: 'solicitacao-servico',
        loadComponent: () =>
          import('./analise/analise-etapa.page').then((m) => m.AnaliseEtapaPageComponent),
      },
    ],
  },
];
