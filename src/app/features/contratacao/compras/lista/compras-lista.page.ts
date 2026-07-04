import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { MessageModule } from 'primeng/message';
import { TableLazyLoadEvent, TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';
import { ConfirmationService } from 'primeng/api';

import { ContratacaoComprasApiService } from '../contratacao-compras-api.service';
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
import {
  comprasAnaliseStepRouterLink,
  comprasVendorListRouterLink,
} from '../contratacao-compras.steps';

@Component({
  selector: 'app-compras-lista-page',
  standalone: true,
  imports: [
    ButtonModule,
    CardModule,
    ConfirmDialogModule,
    MessageModule,
    TableModule,
    TagModule,
    TooltipModule,
    ContratacaoListaFiltrosComponent,
  ],
  providers: [ConfirmationService],
  templateUrl: './compras-lista.page.html',
  styleUrl: './compras-lista.page.scss',
})
export class ComprasListaPageComponent implements OnInit {
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
    private readonly comprasApi: ContratacaoComprasApiService,
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

    this.comprasApi
      .listFila({
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
          this.errorMessage = 'Não foi possível carregar a fila de Compras.';
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

  assumirVendorList(item: ContratacaoListItem): void {
    this.confirmation.confirm({
      header: 'Assumir processamento',
      message: 'Deseja assumir esta contratação para análise de fornecedores (VendorList)?',
      icon: 'pi pi-question-circle',
      acceptLabel: 'Sim, assumir',
      rejectLabel: 'Cancelar',
      accept: () => {
        this.comprasApi.assumirVendorList(item.uuid).subscribe({
          next: () => {
            void this.router.navigate(comprasVendorListRouterLink(item.uuid));
          },
          error: (err) => {
            this.errorMessage =
              (err.error as { message?: string })?.message ??
              'Não foi possível assumir o processamento.';
          },
        });
      },
    });
  }

  verDetalhes(item: ContratacaoListItem): void {
    void this.router.navigate(comprasAnaliseStepRouterLink(item.uuid, 'filial'), {
      queryParams: { consulta: '1' },
    });
  }

  abrirVendorList(item: ContratacaoListItem): void {
    void this.router.navigate(comprasVendorListRouterLink(item.uuid));
  }

  podeAssumir(status: string): boolean {
    return status === 'aprovado_compras';
  }

  emVendorList(status: string): boolean {
    return status === 'em_vendor_list';
  }

  formatarData(value?: string | null): string {
    if (!value) return '—';
    return new Date(value).toLocaleString('pt-BR');
  }
}
