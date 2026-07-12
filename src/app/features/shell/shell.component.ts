import { AsyncPipe } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { ButtonModule } from 'primeng/button';

import { AuthService } from '../../core/auth/auth.service';
import { ModulosService } from '../../core/identidade/modulos.service';
import { ThemeService } from '../../core/theme/theme.service';
import { ThemeToggleComponent } from '../../core/theme/theme-toggle.component';
import {
  SHELL_HOME_ICON,
  shellNavBadge,
  shellNavIcon,
} from './shell-nav.config';

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    AsyncPipe,
    ButtonModule,
    ThemeToggleComponent,
  ],
  templateUrl: './shell.component.html',
  styleUrl: './shell.component.scss',
})
export class ShellComponent {
  private readonly authService = inject(AuthService);
  private readonly modulosService = inject(ModulosService);
  private readonly themeService = inject(ThemeService);

  readonly modulos$ = this.modulosService.modulos$;
  readonly sidebarOpen = signal(false);
  readonly homeIcon = SHELL_HOME_ICON;
  readonly logoSrc = computed(() => this.themeService.logoHorizontalSrc());

  readonly moduloIcon = shellNavIcon;
  readonly moduloBadge = shellNavBadge;

  get usuarioNome(): string {
    return this.authService.getUsuario()?.nome ?? 'Usuário';
  }

  get tenantNome(): string {
    return this.authService.getTenant()?.razao_social ?? '';
  }

  toggleSidebar(): void {
    this.sidebarOpen.update((open) => !open);
  }

  closeSidebar(): void {
    this.sidebarOpen.set(false);
  }

  closeSidebarOnNavigate(): void {
    if (window.matchMedia('(max-width: 767px)').matches) {
      this.sidebarOpen.set(false);
    }
  }

  logout(): void {
    this.authService.logout().subscribe();
  }
}
