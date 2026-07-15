import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { MessageModule } from 'primeng/message';
import { RadioButtonModule } from 'primeng/radiobutton';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';

import { ContratacaoVendorListApiService } from './contratacao-vendor-list-api.service';
import {
  EqualizacaoTabela,
  montarTabelaEqualizacao,
} from './equalizacao-propostas.util';
import {
  ContratacaoFornecedorListItem,
  QqpItem,
  SalvarPropostaPayload,
} from '../../contratacao.models';

interface PropostaRow {
  uuid: string;
  razao_social: string;
  proposta_inicial: number | null;
  proposta_equalizada: number | null;
  proposta_final: number | null;
  condicao_pagamento_dias: number | null;
  observacao_proposta: string;
  vencedor: boolean;
  salvando: boolean;
}

@Component({
  selector: 'app-resumo-propostas-panel',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ButtonModule,
    InputNumberModule,
    InputTextModule,
    MessageModule,
    RadioButtonModule,
    TableModule,
    TagModule,
  ],
  templateUrl: './resumo-propostas-panel.component.html',
  styleUrl: './resumo-propostas-panel.component.scss',
})
export class ResumoPropostasPanelComponent implements OnChanges {
  @Input({ required: true }) contratacaoUuid = '';
  @Input() fornecedores: ContratacaoFornecedorListItem[] = [];
  @Input() qqpItens: QqpItem[] = [];
  @Input() tituloServico = 'Serviço contratado';
  @Input() readonly = false;
  @Output() changed = new EventEmitter<void>();
  @Output() error = new EventEmitter<string>();
  @Output() success = new EventEmitter<string>();

  rows: PropostaRow[] = [];
  vencedorUuid: string | null = null;
  definindoVencedor = false;
  equalizacao: EqualizacaoTabela | null = null;

  constructor(private readonly api: ContratacaoVendorListApiService) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['fornecedores'] || changes['qqpItens'] || changes['tituloServico']) {
      this.syncRows();
    }
  }

  economiaValor(row: PropostaRow): number | null {
    if (row.proposta_equalizada == null || row.proposta_final == null) {
      return null;
    }
    return Math.round((Number(row.proposta_equalizada) - Number(row.proposta_final)) * 100) / 100;
  }

  economiaPercentual(row: PropostaRow): number | null {
    if (
      row.proposta_equalizada == null ||
      row.proposta_final == null ||
      Number(row.proposta_equalizada) === 0
    ) {
      return null;
    }
    return (
      Math.round((Number(row.proposta_final) / Number(row.proposta_equalizada) - 1) * 10000) / 100
    );
  }

  formatCurrency(value: number | null): string {
    if (value == null) return '—';
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  }

  formatPercent(value: number | null): string {
    if (value == null) return '—';
    const sinal = value > 0 ? '+' : '';
    return `${sinal}${value.toFixed(2)}%`;
  }

  salvarProposta(row: PropostaRow): void {
    if (this.readonly || row.salvando) return;

    const payload: SalvarPropostaPayload = {
      proposta_inicial: row.proposta_inicial,
      proposta_equalizada: row.proposta_equalizada,
      proposta_final: row.proposta_final,
      condicao_pagamento_dias: row.condicao_pagamento_dias,
      observacao_proposta: row.observacao_proposta?.trim() || null,
    };

    row.salvando = true;
    this.api.salvarProposta(this.contratacaoUuid, row.uuid, payload).subscribe({
      next: () => {
        row.salvando = false;
        this.success.emit(`Proposta de ${row.razao_social} salva.`);
        this.changed.emit();
      },
      error: (err) => {
        row.salvando = false;
        this.error.emit(
          (err.error as { message?: string })?.message ??
            `Não foi possível salvar a proposta de ${row.razao_social}.`,
        );
      },
    });
  }

  onSelecionarVencedor(uuid: string | null): void {
    if (this.readonly || this.definindoVencedor || !uuid) return;
    const atual = this.rows.find((r) => r.vencedor)?.uuid ?? null;
    if (atual === uuid) return;

    this.definindoVencedor = true;
    this.api.definirVencedor(this.contratacaoUuid, uuid).subscribe({
      next: () => {
        this.definindoVencedor = false;
        this.vencedorUuid = uuid;
        this.rows = this.rows.map((r) => ({ ...r, vencedor: r.uuid === uuid }));
        this.success.emit('Fornecedor vencedor definido.');
        this.changed.emit();
      },
      error: (err) => {
        this.definindoVencedor = false;
        this.syncRows();
        this.error.emit(
          (err.error as { message?: string })?.message ??
            'Não foi possível definir o fornecedor vencedor.',
        );
      },
    });
  }

  private syncRows(): void {
    this.rows = this.fornecedores.map((f) => ({
      uuid: f.uuid,
      razao_social: f.razao_social,
      proposta_inicial: f.proposta_inicial ?? null,
      proposta_equalizada: f.proposta_equalizada ?? null,
      proposta_final: f.proposta_final ?? null,
      condicao_pagamento_dias: f.condicao_pagamento_dias ?? null,
      observacao_proposta: f.observacao_proposta ?? '',
      vencedor: !!f.vencedor,
      salvando: false,
    }));
    this.vencedorUuid = this.rows.find((r) => r.vencedor)?.uuid ?? null;
    this.equalizacao =
      this.fornecedores.length > 0
        ? montarTabelaEqualizacao(this.qqpItens, this.fornecedores, this.tituloServico)
        : null;
  }
}
