import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { MessageModule } from 'primeng/message';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { SkeletonModule } from 'primeng/skeleton';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { ConfirmationService } from 'primeng/api';

import { AberturaContratoDialogComponent } from './abertura-contrato-dialog.component';
import { AvaliacaoTecnicaPanelComponent } from './avaliacao-tecnica-panel.component';
import { CadastrarFornecedorDialogComponent } from './cadastrar-fornecedor-dialog.component';
import { ContratacaoVendorListApiService } from './contratacao-vendor-list-api.service';
import { FornecedorUsuariosDialogComponent } from './fornecedor-usuarios-dialog.component';
import { PropostaApontamentosDialogComponent } from './proposta-apontamentos-dialog.component';
import { ResumoPropostasPanelComponent } from './resumo-propostas-panel.component';
import {
  AvaliacaoTecnica,
  CadastrarFornecedorPayload,
  ContratacaoFornecedorListItem,
  ContratacaoVendorListDetail,
  SugestaoFornecedorItem,
  aberturaContratoStatusLabel,
} from '../../contratacao.models';
import { contratacaoStatusLabel, contratacaoStatusSeverity } from '../../contratacao-status.utils';
import { formatCnpj, formatTelefone } from '../../../../core/utils/br/br-document.util';

@Component({
  selector: 'app-vendor-list-page',
  standalone: true,
  imports: [
    CommonModule,
    ButtonModule,
    CardModule,
    ConfirmDialogModule,
    MessageModule,
    ProgressSpinnerModule,
    SkeletonModule,
    TableModule,
    TagModule,
    AberturaContratoDialogComponent,
    AvaliacaoTecnicaPanelComponent,
    CadastrarFornecedorDialogComponent,
    FornecedorUsuariosDialogComponent,
    PropostaApontamentosDialogComponent,
    ResumoPropostasPanelComponent,
  ],
  providers: [ConfirmationService],
  templateUrl: './vendor-list.page.html',
  styleUrl: './vendor-list.page.scss',
})
export class VendorListPageComponent implements OnInit {
  uuid = '';
  contratacao: ContratacaoVendorListDetail | null = null;
  fornecedores: ContratacaoFornecedorListItem[] = [];
  loading = false;
  errorMessage = '';
  successMessage = '';
  dialogVisible = false;
  prefillFornecedor: CadastrarFornecedorPayload | null = null;
  enriquecerAoAbrir = false;
  aceiteEmAndamento: string | null = null;
  exclusaoEmAndamento: string | null = null;
  aprovando = false;

  gerandoSugestoes = false;
  sugestoes: SugestaoFornecedorItem[] = [];
  sugestoesAviso = '';
  sugestoesVazio = false;
  sugestoesGeradas = false;

  avaliacao: AvaliacaoTecnica | null = null;
  avaliacaoReloadToken = 0;

  fornecedorDialog: ContratacaoFornecedorListItem | null = null;
  aberturaDialogVisible = false;
  usuariosDialogVisible = false;
  apontamentosDialogVisible = false;

  readonly statusLabel = contratacaoStatusLabel;
  readonly statusSeverity = contratacaoStatusSeverity;
  readonly aberturaStatusLabel = aberturaContratoStatusLabel;

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly api: ContratacaoVendorListApiService,
    private readonly confirmation: ConfirmationService,
  ) {}

  ngOnInit(): void {
    this.uuid = this.route.snapshot.paramMap.get('uuid') ?? '';
    if (this.uuid) {
      this.load();
    }
  }

  get cnpjsCadastrados(): string[] {
    return this.fornecedores.map((f) => f.cnpj);
  }

  get temVencedor(): boolean {
    return this.fornecedores.some((f) => f.vencedor);
  }

  get vencedor(): ContratacaoFornecedorListItem | null {
    return this.fornecedores.find((f) => f.vencedor) ?? null;
  }

  get workflowReadonly(): boolean {
    return this.contratacao?.status === 'vencedor_definido';
  }

  /** Documentação, usuários e apontamentos seguem editáveis após o vencedor. */
  get posCotacaoReadonly(): boolean {
    return false;
  }

  get podeAprovarVendorList(): boolean {
    if (!this.contratacao || this.workflowReadonly || this.aprovando) {
      return false;
    }
    if (this.contratacao.status !== 'em_vendor_list') {
      return false;
    }
    const vencedores = this.fornecedores.filter((f) => f.vencedor);
    if (vencedores.length !== 1) {
      return false;
    }
    const propostaFinal = Number(vencedores[0].proposta_final ?? 0);
    if (!(propostaFinal > 0)) {
      return false;
    }
    if (this.avaliacao && this.avaliacao.status !== 'concluida') {
      return false;
    }
    return true;
  }

  load(): void {
    this.loading = true;
    this.errorMessage = '';
    this.api.get(this.uuid).subscribe({
      next: (data) => {
        this.contratacao = data;
        this.fornecedores = data.fornecedores ?? [];
        this.loading = false;
        this.avaliacaoReloadToken += 1;
      },
      error: (err) => {
        this.loading = false;
        this.errorMessage =
          (err.error as { message?: string })?.message ??
          'Não foi possível carregar a seleção de fornecedores.';
      },
    });
  }

  voltarLista(): void {
    void this.router.navigate(['/contratacao', 'compras']);
  }

  abrirDialog(): void {
    this.successMessage = '';
    this.errorMessage = '';
    this.prefillFornecedor = null;
    this.enriquecerAoAbrir = false;
    this.dialogVisible = true;
  }

  onDialogVisibleChange(visible: boolean): void {
    this.dialogVisible = visible;
    if (!visible) {
      this.enriquecerAoAbrir = false;
    }
  }

  gerarSugestoes(): void {
    this.gerandoSugestoes = true;
    this.sugestoesVazio = false;
    this.errorMessage = '';
    this.api.gerarSugestoesFornecedores(this.uuid).subscribe({
      next: (data) => {
        this.sugestoes = data.sugestoes ?? [];
        this.sugestoesAviso = data.aviso;
        this.sugestoesVazio = this.sugestoes.length === 0;
        this.sugestoesGeradas = true;
        this.gerandoSugestoes = false;
      },
      error: (err) => {
        this.gerandoSugestoes = false;
        this.errorMessage =
          (err.error as { message?: string })?.message ??
          'Não foi possível gerar sugestões de fornecedores.';
      },
    });
  }

  usarSugestao(item: SugestaoFornecedorItem): void {
    if (item.ja_cadastrado) {
      return;
    }

    this.prefillFornecedor = {
      cnpj: item.cnpj ?? '',
      razao_social: item.razao_social,
      telefone: item.telefone ?? undefined,
      email: item.email ?? undefined,
      vendedor: '',
      site: item.site ?? null,
      instagram: item.instagram ?? null,
      linkedin: item.linkedin ?? null,
      facebook: item.facebook ?? null,
      cidade: item.cidade,
      uf: item.uf,
    };
    this.enriquecerAoAbrir = true;
    this.successMessage = '';
    this.errorMessage = '';
    this.dialogVisible = true;
  }

  labelOrigem(origem: SugestaoFornecedorItem['origem']): string {
    const labels: Record<SugestaoFornecedorItem['origem'], string> = {
      historico_tenant: 'Histórico',
      catalogo_tenant: 'Catálogo',
      ia_externa: 'IA externa',
    };
    return labels[origem] ?? origem;
  }

  formatarScore(score: number): string {
    return `${Math.round(score)}%`;
  }

  formatarLocalidade(item: SugestaoFornecedorItem): string {
    if (item.cidade && item.uf) {
      return `${item.cidade} - ${item.uf}`;
    }
    return item.cidade ?? item.uf ?? '—';
  }

  onFornecedorSalvo(fornecedor: ContratacaoFornecedorListItem): void {
    this.fornecedores = [...this.fornecedores, fornecedor];
    this.errorMessage = '';
    this.successMessage = `Fornecedor ${fornecedor.razao_social} cadastrado com sucesso.`;
    this.prefillFornecedor = null;
    this.enriquecerAoAbrir = false;
    this.sugestoes = this.sugestoes.map((s) =>
      s.cnpj === fornecedor.cnpj ? { ...s, ja_cadastrado: true } : s,
    );
  }

  onPanelError(message: string): void {
    this.errorMessage = message;
    this.successMessage = '';
  }

  onPanelSuccess(message: string): void {
    this.successMessage = message;
    this.errorMessage = '';
  }

  onPropostasChanged(): void {
    this.load();
  }

  onAvaliacaoChanged(avaliacao: AvaliacaoTecnica | null): void {
    this.avaliacao = avaliacao;
  }

  abrirDocumentacao(fornecedor: ContratacaoFornecedorListItem): void {
    this.fornecedorDialog = fornecedor;
    this.aberturaDialogVisible = true;
  }

  abrirUsuarios(fornecedor: ContratacaoFornecedorListItem): void {
    this.fornecedorDialog = fornecedor;
    this.usuariosDialogVisible = true;
  }

  abrirApontamentos(fornecedor: ContratacaoFornecedorListItem): void {
    this.fornecedorDialog = fornecedor;
    this.apontamentosDialogVisible = true;
  }

  onAberturaChanged(): void {
    this.load();
  }

  confirmarAprovarVendorList(): void {
    if (!this.podeAprovarVendorList) {
      return;
    }

    const nome = this.vencedor?.razao_social ?? 'o fornecedor vencedor';
    this.confirmation.confirm({
      header: 'Aprovar seleção de fornecedores',
      message: `Confirmar a aprovação da Vendor List com ${nome} como vencedor? Os demais serão desqualificados.`,
      icon: 'pi pi-check-circle',
      acceptLabel: 'Aprovar seleção',
      rejectLabel: 'Cancelar',
      acceptButtonStyleClass: 'p-button-success',
      accept: () => this.aprovarVendorList(),
    });
  }

  confirmarAceite(fornecedor: ContratacaoFornecedorListItem): void {
    if (fornecedor.aceite || this.aceiteEmAndamento || this.workflowReadonly) {
      return;
    }

    this.confirmation.confirm({
      header: 'Registrar aceite de participação',
      message: `Confirmar que ${fornecedor.razao_social} aceitou participar desta contratação?`,
      icon: 'pi pi-check-circle',
      acceptLabel: 'Confirmar aceite',
      rejectLabel: 'Cancelar',
      acceptButtonStyleClass: 'p-button-success',
      accept: () => this.registrarAceite(fornecedor),
    });
  }

  confirmarExclusao(fornecedor: ContratacaoFornecedorListItem): void {
    if (this.exclusaoEmAndamento || this.workflowReadonly) {
      return;
    }

    this.confirmation.confirm({
      header: 'Excluir fornecedor',
      message: `Deseja excluir ${fornecedor.razao_social} desta contratação? O fornecedor sairá da lista de cotação.`,
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Excluir',
      rejectLabel: 'Cancelar',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => this.excluirFornecedor(fornecedor),
    });
  }

  formatarCnpj(value: string): string {
    if (!value?.trim()) {
      return 'Não informado';
    }
    return formatCnpj(value);
  }

  formatarTelefone(value?: string | null): string {
    if (!value) return '—';
    return formatTelefone(value);
  }

  private aprovarVendorList(): void {
    this.aprovando = true;
    this.errorMessage = '';
    this.successMessage = '';
    this.api.aprovarVendorList(this.uuid).subscribe({
      next: (data) => {
        this.aprovando = false;
        this.contratacao = data;
        this.fornecedores = data.fornecedores ?? this.fornecedores;
        this.successMessage = 'Seleção aprovada. Vencedor definido.';
      },
      error: (err) => {
        this.aprovando = false;
        this.errorMessage =
          (err.error as { message?: string })?.message ??
          'Não foi possível aprovar a seleção de fornecedores.';
      },
    });
  }

  private registrarAceite(fornecedor: ContratacaoFornecedorListItem): void {
    this.aceiteEmAndamento = fornecedor.uuid;
    this.errorMessage = '';
    this.successMessage = '';

    this.api.registrarAceite(this.uuid, fornecedor.uuid).subscribe({
      next: (atualizado) => {
        this.fornecedores = this.fornecedores.map((f) =>
          f.uuid === atualizado.uuid ? atualizado : f,
        );
        this.aceiteEmAndamento = null;
        this.successMessage = `${atualizado.razao_social} aceitou participar da contratação.`;
      },
      error: (err) => {
        this.aceiteEmAndamento = null;
        this.errorMessage =
          (err.error as { message?: string })?.message ??
          'Não foi possível registrar o aceite do fornecedor.';
      },
    });
  }

  private excluirFornecedor(fornecedor: ContratacaoFornecedorListItem): void {
    this.exclusaoEmAndamento = fornecedor.uuid;
    this.errorMessage = '';
    this.successMessage = '';

    this.api.removerFornecedor(this.uuid, fornecedor.uuid).subscribe({
      next: () => {
        this.fornecedores = this.fornecedores.filter((f) => f.uuid !== fornecedor.uuid);
        this.sugestoes = this.sugestoes.map((s) =>
          s.cnpj === fornecedor.cnpj ? { ...s, ja_cadastrado: false } : s,
        );
        this.exclusaoEmAndamento = null;
        this.successMessage = `Fornecedor ${fornecedor.razao_social} excluído da contratação.`;
      },
      error: (err) => {
        this.exclusaoEmAndamento = null;
        this.errorMessage =
          (err.error as { message?: string })?.message ??
          'Não foi possível excluir o fornecedor.';
      },
    });
  }
}
