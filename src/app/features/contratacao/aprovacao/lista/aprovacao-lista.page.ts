import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { MessageModule } from 'primeng/message';
import { TableLazyLoadEvent, TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { ConfirmationService } from 'primeng/api';

import { ContratacaoAprovacaoApiService } from '../contratacao-aprovacao-api.service';
import { ContratacaoListItem } from '../../contratacao.models';
import {
  contratacaoStatusLabel,
  contratacaoStatusSeverity,
} from '../../contratacao-status.utils';
import {
  EMPTY_CONTRATACAO_LISTA_FILTROS,
  ContratacaoListaFiltros,
  filtrosToQueryParams,
} from '../../lista/contratacao-lista.constants';
import { ContratacaoListaFiltrosComponent } from '../../lista/contratacao-lista-filtros.component';
import { analiseStepRouterLink } from '../contratacao-aprovacao.steps';

@Component({
  selector: 'app-aprovacao-lista-page',
  standalone: true,
  imports: [
    ButtonModule,
    CardModule,
    ConfirmDialogModule,
    MessageModule,
    TableModule,
    TagModule,
    ContratacaoListaFiltrosComponent,
  ],
  providers: [ConfirmationService],
  templateUrl: './aprovacao-lista.page.html',
  styleUrl: './aprovacao-lista.page.scss',
})
export class AprovacaoListaPageComponent implements OnInit {
  contratacoes: ContratacaoListItem[] = [];
  loading = false;
  errorMessage = '';

  currentPage = 1;
  rows = 20;
  totalRecords = 0;
  first = 0;

  private filtrosAtivos: ContratacaoListaFiltros = { ...EMPTY_CONTRATACAO_LISTA_FILTROS };

  readonly statusLabel = contratacaoStatusLabel;
  readonly statusSeverity = contratacaoStatusSeverity;

  constructor(
    private readonly aprovacaoApi: ContratacaoAprovacaoApiService,
    private readonly router: Router,
    private readonly confirmation: ConfirmationService,
  ) {}

  ngOnInit(): void {
    this.load();
  }

  load(page = this.currentPage, rows = this.rows): void {
    this.loading = true;
    this.errorMessage = '';
    this.currentPage = page;
    this.rows = rows;
    this.first = (page - 1) * rows;

    this.aprovacaoApi
      .listPendentes({
        page,
        per_page: rows,
        ...filtrosToQueryParams(this.filtrosAtivos),
      })
      .subscribe({
        next: (response) => {
          this.contratacoes = response.data;
          this.totalRecords = response.meta.total;
          this.loading = false;
        },
        error: () => {
          this.loading = false;
          this.errorMessage = 'Não foi possível carregar a fila de análise.';
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

  onPage(event: TableLazyLoadEvent): void {
    const rows = event.rows ?? this.rows;
    const first = event.first ?? 0;
    this.load(Math.floor(first / rows) + 1, rows);
  }

  iniciarAnalise(item: ContratacaoListItem): void {
    this.confirmation.confirm({
      header: 'Iniciar análise',
      message: 'Deseja iniciar a análise desta contratação?',
      icon: 'pi pi-question-circle',
      acceptLabel: 'Sim, assumir',
      rejectLabel: 'Cancelar',
      accept: () => {
        this.aprovacaoApi.assumir(item.uuid).subscribe({
          next: () => {
            void this.router.navigate(analiseStepRouterLink(item.uuid, 'filial'));
          },
          error: (err) => {
            this.errorMessage =
              (err.error as { message?: string })?.message ?? 'Não foi possível assumir a análise.';
          },
        });
      },
    });
  }

  continuarAnalise(item: ContratacaoListItem): void {
    void this.router.navigate(analiseStepRouterLink(item.uuid, 'filial'));
  }

  podeAssumir(status: string): boolean {
    return status === 'aguardando_analise_compras';
  }

  podeContinuar(status: string): boolean {
    return status === 'em_analise';
  }
}
