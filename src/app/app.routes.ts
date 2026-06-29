import { Routes } from '@angular/router';

import { authGuard } from './core/auth/auth.guard';
import { contratacaoGuard } from './guards/contratacao.guard';
import { LoginComponent } from './features/auth/login/login.component';
import { ShellComponent } from './features/shell/shell.component';
import { HomeComponent } from './features/home/home.component';
import { ContratacaoPlaceholderComponent } from './features/contratacao/contratacao-placeholder.component';

export const routes: Routes = [
  {
    path: 'auth/login',
    component: LoginComponent,
  },
  {
    path: '',
    component: ShellComponent,
    canActivate: [authGuard],
    children: [
      {
        path: 'home',
        component: HomeComponent,
      },
      {
        path: 'contratacao',
        component: ContratacaoPlaceholderComponent,
        canActivate: [contratacaoGuard],
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
