import { DatePipe, NgTemplateOutlet } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { PaginatorModule, PaginatorState } from 'primeng/paginator';
import { TableLazyLoadEvent, TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';

import { ContratacaoListItem } from '../contratacao.models';
import {
  contratacaoPodeAjustes,
  contratacaoPodeEditar,
  contratacaoPodeExcluir,
  contratacaoPodeVisualizar,
  contratacaoStatusLabel,
  contratacaoStatusSeverity,
} from '../contratacao-status.utils';
import {
  DEFAULT_LISTA_PAGE_SIZE,
  displayOrDash,
  LISTA_COLUNAS_LARGURAS,
  LISTA_ROWS_PER_PAGE_OPTIONS,
  MIN_LISTA_PAGE_SIZE,
} from './contratacao-lista.constants';

@Component({
  selector: 'app-contratacao-lista-tabela',
  standalone: true,
  imports: [
    DatePipe,
    NgTemplateOutlet,
    ButtonModule,
    TableModule,
    TagModule,
    TooltipModule,
    PaginatorModule,
  ],
  templateUrl: './contratacao-lista-tabela.component.html',
  styleUrl: './contratacao-lista.scss',
})
export class ContratacaoListaTabelaComponent {
  @Input() contratacoes: ContratacaoListItem[] = [];
  @Input() loading = false;
  @Input() rows = DEFAULT_LISTA_PAGE_SIZE;
  @Input() totalRecords = 0;
  @Input() first = 0;

  @Output() pageChange = new EventEmitter<{ page: number; rows: number }>();
  @Output() editar = new EventEmitter<ContratacaoListItem>();
  @Output() visualizar = new EventEmitter<ContratacaoListItem>();
  @Output() ajustes = new EventEmitter<ContratacaoListItem>();
  @Output() excluir = new EventEmitter<ContratacaoListItem>();

  readonly colunasLarguras = LISTA_COLUNAS_LARGURAS;
  readonly rowsPerPageOptions = [...LISTA_ROWS_PER_PAGE_OPTIONS];

  displayOrDash = displayOrDash;
  statusLabel = contratacaoStatusLabel;
  statusSeverity = contratacaoStatusSeverity;

  onPage(event: TableLazyLoadEvent): void {
    this.emitPage(event.first ?? 0, event.rows ?? this.rows);
  }

  onPaginatorChange(event: PaginatorState): void {
    const rows = Math.max(MIN_LISTA_PAGE_SIZE, event.rows ?? this.rows);
    this.emitPage(event.first ?? 0, rows);
  }

  apontamentosLabel(item: ContratacaoListItem): string {
    const pendentes = item.apontamentos_pendentes;
    if (pendentes && pendentes > 0) {
      return `Sim: ${pendentes}`;
    }
    return 'Não';
  }

  apontamentosSeverity(item: ContratacaoListItem): 'success' | 'danger' {
    return item.apontamentos_pendentes && item.apontamentos_pendentes > 0 ? 'danger' : 'success';
  }

  podeEditar(item: ContratacaoListItem): boolean {
    return contratacaoPodeEditar(item.status);
  }

  podeVisualizar(item: ContratacaoListItem): boolean {
    return contratacaoPodeVisualizar(item.status);
  }

  podeAjustes(item: ContratacaoListItem): boolean {
    return contratacaoPodeAjustes(item.status);
  }

  podeExcluir(item: ContratacaoListItem): boolean {
    return contratacaoPodeExcluir(item.status);
  }

  private emitPage(first: number, rows: number): void {
    const safeRows = Math.max(MIN_LISTA_PAGE_SIZE, rows);
    const page = Math.floor(first / safeRows) + 1;
    this.pageChange.emit({ page, rows: safeRows });
  }
}
