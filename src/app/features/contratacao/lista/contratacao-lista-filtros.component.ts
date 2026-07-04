import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';

import {
  ContratacaoListaFiltros,
  EMPTY_CONTRATACAO_LISTA_FILTROS,
  hasActiveFiltros,
} from './contratacao-lista.constants';

@Component({
  selector: 'app-contratacao-lista-filtros',
  standalone: true,
  imports: [FormsModule, ButtonModule],
  templateUrl: './contratacao-lista-filtros.component.html',
  styleUrl: './contratacao-lista.scss',
})
export class ContratacaoListaFiltrosComponent {
  @Input() loading = false;
  @Output() filtrar = new EventEmitter<ContratacaoListaFiltros>();
  @Output() limpar = new EventEmitter<void>();

  filtros: ContratacaoListaFiltros = { ...EMPTY_CONTRATACAO_LISTA_FILTROS };

  get hasActive(): boolean {
    return hasActiveFiltros(this.filtros);
  }

  aplicarFiltros(): void {
    this.filtrar.emit({ ...this.filtros });
  }

  limparFiltros(): void {
    this.filtros = { ...EMPTY_CONTRATACAO_LISTA_FILTROS };
    this.limpar.emit();
  }
}
