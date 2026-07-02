import { Routes } from '@angular/router';

import { authGuard } from './core/auth/auth.guard';
import {
  adminTenantGuard,
  contratacaoAprovacaoGuard,
  contratacaoWizardGuard,
} from './guards/contratacao-aprovacao.guard';
import { moduloGuard } from './guards/modulo.guard';
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
    path: 'auth/handoff',
    loadComponent: () =>
      import('./features/auth/handoff/auth-handoff.component').then((m) => m.AuthHandoffComponent),
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
        canActivate: [contratacaoWizardGuard],
        loadChildren: () =>
          import('./features/contratacao/contratacao.routes').then((m) => m.contratacaoRoutes),
      },
      {
        path: 'contratacao/aprovacao',
        canActivate: [contratacaoAprovacaoGuard],
        loadChildren: () =>
          import('./features/contratacao/aprovacao/contratacao-aprovacao.routes').then(
            (m) => m.contratacaoAprovacaoRoutes,
          ),
      },
      {
        path: 'admin/usuarios',
        canActivate: [adminTenantGuard],
        loadComponent: () =>
          import('./features/admin/usuarios/admin-usuarios.page').then(
            (m) => m.AdminUsuariosPageComponent,
          ),
      },
      {
        path: 'nota-fiscal',
        canActivate: [moduloGuard('nota_fiscal')],
        loadComponent: () =>
          import('./features/shared/em-breve.page').then((m) => m.EmBrevePageComponent),
      },
      {
        path: 'admin/auditoria',
        canActivate: [moduloGuard('auditoria')],
        loadComponent: () =>
          import('./features/shared/em-breve.page').then((m) => m.EmBrevePageComponent),
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
