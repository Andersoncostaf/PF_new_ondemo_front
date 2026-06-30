import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { MessageModule } from 'primeng/message';

import { AuthService } from '../../../core/auth/auth.service';

@Component({
  selector: 'app-auth-handoff',
  standalone: true,
  imports: [ProgressSpinnerModule, MessageModule],
  template: `
    <div class="handoff">
      @if (errorMessage) {
        <p-message severity="error" [text]="errorMessage" />
      } @else {
        <p-progressSpinner strokeWidth="4" ariaLabel="Entrando no portal" />
        <p>Preparando seu portal…</p>
      }
    </div>
  `,
  styles: [
    `
      .handoff {
        min-height: 100vh;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 1rem;
        padding: 2rem;
        background: #f8fafc;
        color: #475569;
      }
    `,
  ],
})
export class AuthHandoffComponent implements OnInit {
  errorMessage = '';

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly authService: AuthService,
  ) {}

  ngOnInit(): void {
    const token = this.route.snapshot.queryParamMap.get('token')?.trim();
    if (!token) {
      this.errorMessage = 'Sessão inválida. Faça login no portal da sua empresa.';
      return;
    }

    this.authService.completeHandoff(token).subscribe({
      next: () => {
        void this.router.navigate(['/home'], { replaceUrl: true });
      },
      error: () => {
        this.errorMessage = 'Não foi possível entrar no portal. Tente fazer login.';
      },
    });
  }
}
