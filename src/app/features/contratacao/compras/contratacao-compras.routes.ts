import { Routes } from '@angular/router';

import { AnaliseContratacaoStore } from '../aprovacao/analise/analise-contratacao.store';

export const contratacaoComprasRoutes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./lista/compras-lista.page').then((m) => m.ComprasListaPageComponent),
  },
  {
    path: 'analise/:uuid',
    loadComponent: () =>
      import('../aprovacao/analise/analise-shell.component').then((m) => m.AnaliseShellComponent),
    providers: [AnaliseContratacaoStore],
    children: [
      { path: '', redirectTo: 'filial', pathMatch: 'full' },
      {
        path: 'filial',
        loadComponent: () =>
          import('../aprovacao/analise/analise-etapa.page').then((m) => m.AnaliseEtapaPageComponent),
      },
      {
        path: 'tr',
        loadComponent: () =>
          import('../aprovacao/analise/analise-etapa.page').then((m) => m.AnaliseEtapaPageComponent),
      },
      {
        path: 'qqp',
        loadComponent: () =>
          import('../aprovacao/analise/analise-etapa.page').then((m) => m.AnaliseEtapaPageComponent),
      },
      {
        path: 'anexos',
        loadComponent: () =>
          import('../aprovacao/analise/analise-etapa.page').then((m) => m.AnaliseEtapaPageComponent),
      },
      {
        path: 'solicitacao-servico',
        loadComponent: () =>
          import('../aprovacao/analise/analise-etapa.page').then((m) => m.AnaliseEtapaPageComponent),
      },
    ],
  },
  {
    path: 'vendor-list/:uuid',
    loadComponent: () =>
      import('../aprovacao/vendor-list/vendor-list.page').then((m) => m.VendorListPageComponent),
  },
];
