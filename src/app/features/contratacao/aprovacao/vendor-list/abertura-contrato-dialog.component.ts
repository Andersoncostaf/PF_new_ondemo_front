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
import { InputTextareaModule } from 'primeng/inputtextarea';
import { MessageModule } from 'primeng/message';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { SelectButtonModule } from 'primeng/selectbutton';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';

import { ContratacaoVendorListApiService } from './contratacao-vendor-list-api.service';
import {
  AberturaApontamento,
  AberturaContrato,
  AberturaContratoItem,
  aberturaContratoStatusLabel,
  ContratacaoFornecedorListItem,
} from '../../contratacao.models';

@Component({
  selector: 'app-abertura-contrato-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ButtonModule,
    DialogModule,
    InputTextareaModule,
    MessageModule,
    ProgressSpinnerModule,
    SelectButtonModule,
    TableModule,
    TagModule,
  ],
  templateUrl: './abertura-contrato-dialog.component.html',
  styleUrl: './abertura-contrato-dialog.component.scss',
})
export class AberturaContratoDialogComponent implements OnChanges {
  @Input() visible = false;
  @Input({ required: true }) contratacaoUuid = '';
  @Input() fornecedor: ContratacaoFornecedorListItem | null = null;
  @Input() readonly = false;
  @Output() visibleChange = new EventEmitter<boolean>();
  @Output() changed = new EventEmitter<void>();
  @Output() error = new EventEmitter<string>();
  @Output() success = new EventEmitter<string>();

  loading = false;
  solicitando = false;
  confirmando = false;
  analisandoUuid: string | null = null;
  abertura: AberturaContrato | null = null;
  observacoes: Record<string, string> = {};
  novoApontamento: Record<string, string> = {};
  apontamentoEmAndamento: string | null = null;
  formError = '';

  readonly opcoesAnalise = [
    { label: 'SIM', value: 'sim' },
    { label: 'NÃO', value: 'nao' },
    { label: 'N/A', value: 'na' },
  ];

  readonly statusLabel = aberturaContratoStatusLabel;

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
      this.abertura = null;
    }
  }

  get titulo(): string {
    return this.fornecedor
      ? `Documentação — ${this.fornecedor.razao_social}`
      : 'Documentação / Abertura de contrato';
  }

  get podeSolicitar(): boolean {
    if (this.readonly || !this.fornecedor) return false;
    const status = this.abertura?.status ?? this.fornecedor.abertura_contrato_status ?? 'nao_iniciada';
    return status === 'nao_iniciada';
  }

  get podeConfirmar(): boolean {
    if (this.readonly || !this.abertura) return false;
    if (this.abertura.status === 'aceito') return false;
    if (!this.abertura.itens?.length) return false;
    return this.abertura.itens
      .filter((i) => i.obrigatorio)
      .every((i) => i.status_analise === 'sim' || i.status_analise === 'na');
  }

  carregar(): void {
    if (!this.fornecedor) return;
    this.loading = true;
    this.formError = '';
    this.api.obterAberturaContrato(this.contratacaoUuid, this.fornecedor.uuid).subscribe({
      next: (data) => {
        this.abertura = data;
        this.syncObservacoes(data.itens ?? []);
        this.loading = false;
      },
      error: (err) => {
        this.loading = false;
        // Checklist ainda não solicitado — estado inicial ok
        if (err.status === 404) {
          this.abertura = {
            status: this.fornecedor?.abertura_contrato_status ?? 'nao_iniciada',
            itens: [],
          };
          return;
        }
        this.formError =
          (err.error as { message?: string })?.message ??
          'Não foi possível carregar a documentação.';
      },
    });
  }

  solicitar(): void {
    if (!this.fornecedor || this.solicitando) return;
    this.solicitando = true;
    this.formError = '';
    this.api.solicitarAberturaContrato(this.contratacaoUuid, this.fornecedor.uuid).subscribe({
      next: (data) => {
        this.solicitando = false;
        this.abertura = data;
        this.syncObservacoes(data.itens ?? []);
        this.success.emit('Abertura de contrato solicitada.');
        this.changed.emit();
      },
      error: (err) => {
        this.solicitando = false;
        this.formError =
          (err.error as { message?: string })?.message ??
          'Não foi possível solicitar a abertura de contrato.';
      },
    });
  }

  analisar(item: AberturaContratoItem, status: 'sim' | 'nao' | 'na'): void {
    if (!this.fornecedor || this.readonly || this.analisandoUuid) return;

    this.analisandoUuid = item.uuid;
    this.formError = '';
    this.api
      .analisarItemAbertura(this.contratacaoUuid, this.fornecedor.uuid, item.uuid, {
        status_analise: status,
        observacao_analise: this.observacoes[item.uuid]?.trim() || null,
      })
      .subscribe({
        next: (res) => {
          this.analisandoUuid = null;
          if ('itens' in res && Array.isArray(res.itens)) {
            this.abertura = res;
            this.syncObservacoes(res.itens);
          } else if (this.abertura) {
            this.abertura = {
              ...this.abertura,
              itens: this.abertura.itens.map((i) =>
                i.uuid === item.uuid
                  ? {
                      ...i,
                      status_analise: status,
                      observacao_analise: this.observacoes[item.uuid]?.trim() || null,
                    }
                  : i,
              ),
            };
          }
        },
        error: (err) => {
          this.analisandoUuid = null;
          this.formError =
            (err.error as { message?: string })?.message ??
            'Não foi possível registrar a análise do item.';
        },
      });
  }

  confirmar(): void {
    if (!this.fornecedor || !this.podeConfirmar || this.confirmando) return;
    this.confirmando = true;
    this.formError = '';
    this.api.confirmarAberturaContrato(this.contratacaoUuid, this.fornecedor.uuid).subscribe({
      next: (res) => {
        this.confirmando = false;
        if ('itens' in res && Array.isArray((res as AberturaContrato).itens)) {
          this.abertura = res as AberturaContrato;
        } else if (this.abertura) {
          this.abertura = { ...this.abertura, status: 'aceito' };
        }
        this.success.emit('Documentação confirmada.');
        this.changed.emit();
      },
      error: (err) => {
        this.confirmando = false;
        this.formError =
          (err.error as { message?: string })?.message ??
          'Não foi possível confirmar a documentação.';
      },
    });
  }

  labelAnalise(status: string): string {
    switch (status) {
      case 'sim':
        return 'SIM';
      case 'nao':
        return 'NÃO';
      case 'na':
        return 'N/A';
      default:
        return 'Pendente';
    }
  }

  severityAnalise(status: string): 'success' | 'danger' | 'secondary' | 'warning' {
    switch (status) {
      case 'sim':
        return 'success';
      case 'nao':
        return 'danger';
      case 'na':
        return 'secondary';
      default:
        return 'warning';
    }
  }

  private syncObservacoes(itens: AberturaContratoItem[]): void {
    const next: Record<string, string> = {};
    for (const item of itens) {
      next[item.uuid] = item.observacao_analise ?? '';
      if (!(item.uuid in this.novoApontamento)) {
        this.novoApontamento[item.uuid] = '';
      }
    }
    this.observacoes = next;
  }

  abrirApontamento(item: AberturaContratoItem): void {
    if (!this.fornecedor || this.readonly || this.apontamentoEmAndamento) return;
    const descricao = (this.novoApontamento[item.uuid] ?? '').trim();
    if (!descricao) {
      this.formError = 'Informe a descrição do apontamento.';
      return;
    }

    this.apontamentoEmAndamento = item.uuid;
    this.formError = '';
    this.api
      .abrirApontamentoAbertura(this.contratacaoUuid, this.fornecedor.uuid, item.uuid, {
        descricao,
      })
      .subscribe({
        next: (apontamento) => {
          this.apontamentoEmAndamento = null;
          this.novoApontamento[item.uuid] = '';
          if (this.abertura) {
            this.abertura = {
              ...this.abertura,
              status: 'em_ajuste',
              itens: this.abertura.itens.map((i) =>
                i.uuid === item.uuid
                  ? { ...i, apontamentos: [...(i.apontamentos ?? []), apontamento] }
                  : i,
              ),
            };
          }
          this.success.emit('Apontamento aberto.');
          this.changed.emit();
        },
        error: (err) => {
          this.apontamentoEmAndamento = null;
          this.formError =
            (err.error as { message?: string })?.message ??
            'Não foi possível abrir o apontamento.';
        },
      });
  }

  encerrarApontamento(item: AberturaContratoItem, apontamento: AberturaApontamento): void {
    if (!this.fornecedor || this.readonly || this.apontamentoEmAndamento) return;
    this.apontamentoEmAndamento = apontamento.uuid;
    this.formError = '';
    this.api
      .encerrarApontamentoAbertura(this.contratacaoUuid, this.fornecedor.uuid, apontamento.uuid)
      .subscribe({
        next: (atualizado) => {
          this.apontamentoEmAndamento = null;
          if (this.abertura) {
            this.abertura = {
              ...this.abertura,
              itens: this.abertura.itens.map((i) =>
                i.uuid === item.uuid
                  ? {
                      ...i,
                      apontamentos: (i.apontamentos ?? []).map((a) =>
                        a.uuid === apontamento.uuid ? atualizado : a,
                      ),
                    }
                  : i,
              ),
            };
          }
          this.success.emit('Apontamento encerrado.');
        },
        error: (err) => {
          this.apontamentoEmAndamento = null;
          this.formError =
            (err.error as { message?: string })?.message ??
            'Não foi possível encerrar o apontamento.';
        },
      });
  }
}
