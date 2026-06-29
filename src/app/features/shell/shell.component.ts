import { AsyncPipe } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { ButtonModule } from 'primeng/button';

import { AuthService } from '../../core/auth/auth.service';
import { ModulosService } from '../../core/identidade/modulos.service';

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, AsyncPipe, ButtonModule],
  templateUrl: './shell.component.html',
  styleUrl: './shell.component.scss',
})
export class ShellComponent {
  readonly modulos$ = this.modulosService.modulos$;

  constructor(
    private readonly authService: AuthService,
    private readonly modulosService: ModulosService,
  ) {}

  get usuarioNome(): string {
    return this.authService.getUsuario()?.nome ?? 'Usuário';
  }

  get tenantNome(): string {
    return this.authService.getTenant()?.razao_social ?? '';
  }

  logout(): void {
    this.authService.logout().subscribe();
  }
}
