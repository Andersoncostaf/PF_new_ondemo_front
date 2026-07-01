import { Component, EventEmitter, Input, Output } from '@angular/core';
import { DatePipe } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { TableLazyLoadEvent, TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';

import { ContratacaoListItem } from '../contratacao.models';
import { displayOrDash, LISTA_COLUNAS_LARGURAS } from './contratacao-lista.constants';

@Component({
  selector: 'app-contratacao-lista-tabela',
  standalone: true,
  imports: [DatePipe, ButtonModule, TableModule, TagModule, TooltipModule],
  templateUrl: './contratacao-lista-tabela.component.html',
})
export class ContratacaoListaTabelaComponent {
  @Input() contratacoes: ContratacaoListItem[] = [];
  @Input() loading = false;
  @Input() rows = 20;
  @Input() totalRecords = 0;
  @Input() first = 0;

  @Output() pageChange = new EventEmitter<{ page: number; rows: number }>();
  @Output() editar = new EventEmitter<ContratacaoListItem>();
  @Output() visualizar = new EventEmitter<ContratacaoListItem>();

  readonly colunasLarguras = LISTA_COLUNAS_LARGURAS;

  displayOrDash = displayOrDash;

  onPage(event: TableLazyLoadEvent): void {
    const rows = event.rows ?? this.rows;
    const first = event.first ?? 0;
    const page = Math.floor(first / rows) + 1;
    this.pageChange.emit({ page, rows });
  }

  statusLabel(status: string): string {
    return status === 'submetido' ? 'Submetido' : 'Rascunho';
  }

  statusSeverity(status: string): 'success' | 'warning' {
    return status === 'submetido' ? 'success' : 'warning';
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
    return item.status === 'rascunho';
  }

  podeVisualizar(item: ContratacaoListItem): boolean {
    return item.status === 'submetido';
  }
}
