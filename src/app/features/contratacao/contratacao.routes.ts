import { Routes } from '@angular/router';

export const contratacaoRoutes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./contratacao-lista.component').then((m) => m.ContratacaoListaComponent),
  },
  {
    path: 'nova',
    loadComponent: () =>
      import('./contratacao-wizard.component').then((m) => m.ContratacaoWizardComponent),
  },
  {
    path: ':uuid/editar',
    loadComponent: () =>
      import('./contratacao-wizard.component').then((m) => m.ContratacaoWizardComponent),
  },
];
