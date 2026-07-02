import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { MessageModule } from 'primeng/message';
import { ConfirmationService } from 'primeng/api';

import { ContratacaoAprovacaoApiService } from '../contratacao-aprovacao-api.service';

@Component({
  selector: 'app-aprovacao-acoes-bar',
  standalone: true,
  imports: [ButtonModule, ConfirmDialogModule, MessageModule],
  providers: [ConfirmationService],
  templateUrl: './aprovacao-acoes-bar.component.html',
  styleUrl: './aprovacao-acoes-bar.component.scss',
})
export class AprovacaoAcoesBarComponent {
  @Input({ required: true }) uuid!: string;
  @Output() concluido = new EventEmitter<void>();

  loading = false;
  errorMessage = '';

  constructor(
    private readonly aprovacaoApi: ContratacaoAprovacaoApiService,
    private readonly confirmation: ConfirmationService,
    private readonly router: Router,
  ) {}

  retornarAjustes(): void {
    this.confirmation.confirm({
      header: 'Retornar para ajustes',
      message: 'Deseja retornar a solicitação à Área com os apontamentos pendentes?',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Retornar',
      rejectLabel: 'Cancelar',
      accept: () => this.executar(() => this.aprovacaoApi.retornarAjustes(this.uuid)),
    });
  }

  aprovarAnalise(): void {
    this.confirmation.confirm({
      header: 'Aprovar análise',
      message: 'Confirma a aprovação da análise de Compras?',
      icon: 'pi pi-check-circle',
      acceptLabel: 'Aprovar',
      rejectLabel: 'Cancelar',
      accept: () => this.executar(() => this.aprovacaoApi.aprovarAnalise(this.uuid)),
    });
  }

  private executar(
    action: () => ReturnType<ContratacaoAprovacaoApiService['retornarAjustes']>,
  ): void {
    this.loading = true;
    this.errorMessage = '';
    action().subscribe({
      next: () => {
        this.loading = false;
        this.concluido.emit();
        void this.router.navigate(['/contratacao', 'aprovacao']);
      },
      error: (err) => {
        this.loading = false;
        this.errorMessage =
          (err.error as { message?: string })?.message ?? 'Não foi possível concluir a ação.';
      },
    });
  }
}
