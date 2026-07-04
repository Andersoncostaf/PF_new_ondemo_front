import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { MessageModule } from 'primeng/message';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { ConfirmationService } from 'primeng/api';

import { ContratacaoVendorListApiService } from './contratacao-vendor-list-api.service';
import {
  CadastrarFornecedorPayload,
  ContratacaoFornecedorListItem,
  ContratacaoVendorListDetail,
} from '../../contratacao.models';
import { contratacaoStatusLabel, contratacaoStatusSeverity } from '../../contratacao-status.utils';

@Component({
  selector: 'app-vendor-list-page',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ButtonModule,
    CardModule,
    ConfirmDialogModule,
    DialogModule,
    InputTextModule,
    MessageModule,
    TableModule,
    TagModule,
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
  dialogVisible = false;
  salvando = false;

  form: CadastrarFornecedorPayload = {
    cnpj: '',
    razao_social: '',
    telefone: '',
    email: '',
    vendedor: '',
  };

  readonly statusLabel = contratacaoStatusLabel;
  readonly statusSeverity = contratacaoStatusSeverity;

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

  load(): void {
    this.loading = true;
    this.errorMessage = '';
    this.api.get(this.uuid).subscribe({
      next: (data) => {
        this.contratacao = data;
        this.fornecedores = data.fornecedores ?? [];
        this.loading = false;
      },
      error: (err) => {
        this.loading = false;
        this.errorMessage =
          (err.error as { message?: string })?.message ??
          'Não foi possível carregar a análise de fornecedores.';
      },
    });
  }

  voltarLista(): void {
    void this.router.navigate(['/contratacao', 'aprovacao']);
  }

  abrirDialog(): void {
    this.form = { cnpj: '', razao_social: '', telefone: '', email: '', vendedor: '' };
    this.dialogVisible = true;
  }

  salvarFornecedor(): void {
    if (!this.form.cnpj.trim() || !this.form.razao_social.trim()) {
      return;
    }

    this.salvando = true;
    this.api.cadastrarFornecedor(this.uuid, this.form).subscribe({
      next: (fornecedor) => {
        this.fornecedores = [...this.fornecedores, fornecedor];
        this.dialogVisible = false;
        this.salvando = false;
      },
      error: (err) => {
        this.salvando = false;
        this.errorMessage =
          (err.error as { message?: string })?.message ?? 'Não foi possível cadastrar o fornecedor.';
      },
    });
  }

  confirmarExclusao(fornecedor: ContratacaoFornecedorListItem): void {
    this.confirmation.confirm({
      header: 'Remover fornecedor',
      message: `Deseja remover ${fornecedor.razao_social}?`,
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Remover',
      rejectLabel: 'Cancelar',
      accept: () => {
        this.api.removerFornecedor(this.uuid, fornecedor.uuid).subscribe({
          next: () => {
            this.fornecedores = this.fornecedores.filter((f) => f.uuid !== fornecedor.uuid);
          },
          error: (err) => {
            this.errorMessage =
              (err.error as { message?: string })?.message ?? 'Não foi possível remover o fornecedor.';
          },
        });
      },
    });
  }

  formatarData(value?: string | null): string {
    if (!value) return '—';
    return new Date(value).toLocaleString('pt-BR');
  }
}
