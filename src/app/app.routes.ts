import { Routes } from '@angular/router';

import { authGuard } from './core/auth/auth.guard';
import { contratacaoGuard } from './guards/contratacao.guard';
import { ShellComponent } from './features/shell/shell.component';

export const routes: Routes = [
  {
    path: 'auth/login',
    loadComponent: () =>
      import('./features/auth/login/login.component').then((m) => m.LoginComponent),
  },
  {
    path: 'auth/cadastro',
    loadComponent: () =>
      import('./features/auth/cadastro/cadastro.component').then((m) => m.CadastroComponent),
  },
  {
    path: '',
    component: ShellComponent,
    canActivate: [authGuard],
    children: [
      {
        path: 'home',
        loadComponent: () =>
          import('./features/home/home.component').then((m) => m.HomeComponent),
      },
      {
        path: 'contratacao',
        canActivate: [contratacaoGuard],
        loadChildren: () =>
          import('./features/contratacao/contratacao.routes').then((m) => m.contratacaoRoutes),
      },
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'home',
      },
    ],
  },
  {
    path: '**',
    redirectTo: 'home',
  },
];
