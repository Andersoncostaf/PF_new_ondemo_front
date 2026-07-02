import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { MessageModule } from 'primeng/message';

import { ContratacaoApiService } from '../contratacao-api.service';
import { ContratacaoListItem } from '../contratacao.models';
import {
  ContratacaoListaFiltros,
  EMPTY_CONTRATACAO_LISTA_FILTROS,
  filtrosToQueryParams,
} from './contratacao-lista.constants';
import { ContratacaoListaFiltrosComponent } from './contratacao-lista-filtros.component';
import { ContratacaoListaTabelaComponent } from './contratacao-lista-tabela.component';

@Component({
  selector: 'app-contratacao-lista-page',
  standalone: true,
  imports: [
    ButtonModule,
    CardModule,
    MessageModule,
    ContratacaoListaFiltrosComponent,
    ContratacaoListaTabelaComponent,
  ],
  templateUrl: './contratacao-lista.page.html',
  styleUrl: './contratacao-lista.scss',
})
export class ContratacaoListaPageComponent {
  contratacoes: ContratacaoListItem[] = [];
  loading = false;
  errorMessage = '';

  currentPage = 1;
  rows = 20;
  totalRecords = 0;
  first = 0;

  private filtrosAtivos: ContratacaoListaFiltros = { ...EMPTY_CONTRATACAO_LISTA_FILTROS };

  constructor(
    private readonly contratacaoApi: ContratacaoApiService,
    private readonly router: Router,
  ) {}

  load(page = this.currentPage, rows = this.rows): void {
    this.loading = true;
    this.errorMessage = '';
    this.currentPage = page;
    this.rows = rows;
    this.first = (page - 1) * rows;

    this.contratacaoApi
      .list({
        page,
        per_page: rows,
        ...filtrosToQueryParams(this.filtrosAtivos),
      })
      .subscribe({
        next: (response) => {
          this.contratacoes = response.data.map((item) => this.normalizeListItem(item));
          this.totalRecords = response.meta.total;
          this.loading = false;
        },
        error: () => {
          this.loading = false;
          this.errorMessage = 'Não foi possível carregar as solicitações.';
        },
      });
  }

  onFiltrar(filtros: ContratacaoListaFiltros): void {
    this.filtrosAtivos = { ...filtros };
    this.first = 0;
    this.load(1, this.rows);
  }

  onLimparFiltros(): void {
    this.filtrosAtivos = { ...EMPTY_CONTRATACAO_LISTA_FILTROS };
    this.first = 0;
    this.load(1, this.rows);
  }

  onPageChange(event: { page: number; rows: number }): void {
    this.first = (event.page - 1) * event.rows;
    this.load(event.page, event.rows);
  }

  nova(): void {
    void this.router.navigate(['/contratacao', 'nova', 'dados-gerais']);
  }

  editar(contratacao: ContratacaoListItem): void {
    void this.router.navigate(['/contratacao', 'nova', contratacao.uuid, 'dados-gerais']);
  }

  visualizar(contratacao: ContratacaoListItem): void {
    void this.router.navigate(['/contratacao', 'nova', contratacao.uuid, 'revisao']);
  }

  ajustes(contratacao: ContratacaoListItem): void {
    void this.router.navigate(['/contratacao', 'ajustes', contratacao.uuid]);
  }

  private normalizeListItem(item: ContratacaoListItem): ContratacaoListItem {
    return {
      ...item,
      numero_exibicao:
        item.numero_exibicao ||
        item.uuid.replace(/-/g, '').substring(0, 8).toUpperCase(),
    };
  }
}
