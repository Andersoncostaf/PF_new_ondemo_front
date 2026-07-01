import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';

import {
  ContratacaoListaFiltros,
  EMPTY_CONTRATACAO_LISTA_FILTROS,
} from './contratacao-lista.constants';

@Component({
  selector: 'app-contratacao-lista-filtros',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './contratacao-lista-filtros.component.html',
})
export class ContratacaoListaFiltrosComponent {
  @Input() loading = false;
  @Output() filtrar = new EventEmitter<ContratacaoListaFiltros>();
  @Output() limpar = new EventEmitter<void>();

  filtros: ContratacaoListaFiltros = { ...EMPTY_CONTRATACAO_LISTA_FILTROS };

  aplicarFiltros(): void {
    this.filtrar.emit({ ...this.filtros });
  }

  limparFiltros(): void {
    this.filtros = { ...EMPTY_CONTRATACAO_LISTA_FILTROS };
    this.limpar.emit();
  }
}
