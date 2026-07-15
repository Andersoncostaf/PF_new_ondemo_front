import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { MessageModule } from 'primeng/message';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { TagModule } from 'primeng/tag';

import { ContratacaoVendorListApiService } from './contratacao-vendor-list-api.service';
import {
  ContratacaoFornecedorListItem,
  VisitaTecnica,
  visitaTecnicaResolucaoLabel,
  visitaTecnicaStatusLabel,
} from '../../contratacao.models';

@Component({
  selector: 'app-visita-tecnica-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ButtonModule,
    DialogModule,
    InputTextModule,
    InputTextareaModule,
    MessageModule,
    ProgressSpinnerModule,
    TagModule,
  ],
  templateUrl: './visita-tecnica-dialog.component.html',
  styleUrl: './visita-tecnica-dialog.component.scss',
})
export class VisitaTecnicaDialogComponent implements OnChanges {
  @Input() visible = false;
  @Input({ required: true }) contratacaoUuid = '';
  @Input() fornecedor: ContratacaoFornecedorListItem | null = null;
  @Input() readonly = false;
  @Output() visibleChange = new EventEmitter<boolean>();
  @Output() changed = new EventEmitter<void>();
  @Output() error = new EventEmitter<string>();
  @Output() success = new EventEmitter<string>();

  loading = false;
  salvando = false;
  visita: VisitaTecnica | null = null;
  formError = '';

  data = '';
  hora = '';
  local = '';
  observacao = '';

  readonly statusLabel = visitaTecnicaStatusLabel;
  readonly resolucaoLabel = visitaTecnicaResolucaoLabel;

  constructor(private readonly api: ContratacaoVendorListApiService) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['visible']?.currentValue === true && this.fornecedor) {
      this.carregar();
    }
  }

  onVisibleChange(visible: boolean): void {
    this.visibleChange.emit(visible);
    if (!visible) {
      this.formError = '';
      this.visita = null;
    }
  }

  get titulo(): string {
    return this.fornecedor
      ? `Visita técnica — ${this.fornecedor.razao_social}`
      : 'Visita técnica';
  }

  get resolvida(): boolean {
    return !!this.visita?.resolvida;
  }

  get podeEditar(): boolean {
    return !this.readonly && !this.resolvida;
  }

  carregar(): void {
    if (!this.fornecedor) return;
    this.loading = true;
    this.formError = '';
    this.api.obterVisitaTecnica(this.contratacaoUuid, this.fornecedor.uuid).subscribe({
      next: (data) => {
        this.visita = data;
        this.data = data.visita_agendada_data ?? '';
        this.hora = data.visita_agendada_hora ?? '';
        this.local = data.visita_agendada_local ?? '';
        this.observacao = data.visita_tecnica_observacao ?? '';
        this.loading = false;
      },
      error: (err) => {
        this.loading = false;
        this.formError = err?.error?.message || 'Não foi possível carregar a visita técnica.';
        this.error.emit(this.formError);
      },
    });
  }

  agendar(): void {
    if (!this.fornecedor || !this.podeEditar) return;
    if (!this.data || !this.hora || !this.local.trim()) {
      this.formError = 'Informe data, hora e local para agendar.';
      return;
    }

    this.salvando = true;
    this.formError = '';
    this.api
      .agendarVisitaTecnica(this.contratacaoUuid, this.fornecedor.uuid, {
        data: this.data,
        hora: this.hora,
        local: this.local.trim(),
        observacao: this.observacao.trim() || null,
      })
      .subscribe({
        next: (data) => {
          this.visita = data;
          this.salvando = false;
          this.success.emit('Visita técnica agendada.');
          this.changed.emit();
        },
        error: (err) => {
          this.salvando = false;
          this.formError = err?.error?.message || 'Não foi possível agendar a visita.';
          this.error.emit(this.formError);
        },
      });
  }

  concluir(): void {
    if (!this.fornecedor || !this.podeEditar) return;

    const payload: {
      observacao?: string | null;
      data?: string;
      hora?: string;
      local?: string;
    } = {
      observacao: this.observacao.trim() || null,
    };

    const temAgenda = !!(this.data || this.hora || this.local.trim());
    if (temAgenda) {
      if (!this.data || !this.hora || !this.local.trim()) {
        this.formError = 'Para concluir com agendamento, informe data, hora e local.';
        return;
      }
      payload.data = this.data;
      payload.hora = this.hora;
      payload.local = this.local.trim();
    }

    this.salvando = true;
    this.formError = '';
    this.api.concluirVisitaTecnica(this.contratacaoUuid, this.fornecedor.uuid, payload).subscribe({
      next: (data) => {
        this.visita = data;
        this.salvando = false;
        this.success.emit('Visita técnica registrada como concluída.');
        this.changed.emit();
      },
      error: (err) => {
        this.salvando = false;
        this.formError = err?.error?.message || 'Não foi possível concluir a visita.';
        this.error.emit(this.formError);
      },
    });
  }

  dispensar(): void {
    if (!this.fornecedor || !this.podeEditar) return;

    this.salvando = true;
    this.formError = '';
    this.api
      .dispensarVisitaTecnica(this.contratacaoUuid, this.fornecedor.uuid, {
        justificativa: this.observacao.trim() || null,
        observacao: this.observacao.trim() || null,
      })
      .subscribe({
        next: (data) => {
          this.visita = data;
          this.salvando = false;
          this.success.emit('Visita técnica dispensada.');
          this.changed.emit();
        },
        error: (err) => {
          this.salvando = false;
          this.formError = err?.error?.message || 'Não foi possível dispensar a visita.';
          this.error.emit(this.formError);
        },
      });
  }

  resolucaoSeverity(resolucao: string | null | undefined): 'success' | 'warn' | 'info' | 'secondary' {
    switch (resolucao) {
      case 'concluida':
        return 'success';
      case 'dispensada':
        return 'info';
      case 'aguardando_aprovacao_dispensa':
        return 'warn';
      default:
        return 'secondary';
    }
  }
}
