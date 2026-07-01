import { Routes } from '@angular/router';

import { ContratacaoWizardStore } from './wizard/contratacao-wizard.store';

export const contratacaoRoutes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./lista/contratacao-lista.page').then((m) => m.ContratacaoListaPageComponent),
  },
  {
    path: 'nova',
    providers: [ContratacaoWizardStore],
    loadChildren: () =>
      import('./wizard/contratacao-wizard.routes').then((m) => m.contratacaoWizardRoutes),
  },
  {
    path: ':uuid/editar',
    redirectTo: 'nova/:uuid/dados-gerais',
    pathMatch: 'full',
  },
];
