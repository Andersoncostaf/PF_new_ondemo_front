import { Routes } from '@angular/router';

export const contratacaoRoutes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./contratacao-lista.component').then((m) => m.ContratacaoListaComponent),
  },
  {
    path: 'nova',
    loadChildren: () =>
      import('./wizard/contratacao-wizard.routes').then((m) => m.contratacaoWizardRoutes),
  },
  {
    path: ':uuid/editar',
    redirectTo: 'nova/:uuid/dados-gerais',
    pathMatch: 'full',
  },
];
