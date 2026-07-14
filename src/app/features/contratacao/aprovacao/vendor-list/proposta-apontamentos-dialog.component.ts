import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
} from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { MessageModule } from 'primeng/message';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { TagModule } from 'primeng/tag';

import { ContratacaoVendorListApiService } from './contratacao-vendor-list-api.service';
import {
  ContratacaoFornecedorListItem,
  PropostaApontamento,
} from '../../contratacao.models';

@Component({
  selector: 'app-proposta-apontamentos-dialog',
  standalone: true,
  imports: [
    CommonModule,
    DatePipe,
    FormsModule,
    ButtonModule,
    DialogModule,
    InputTextareaModule,
    MessageModule,
    ProgressSpinnerModule,
    TagModule,
  ],
  templateUrl: './proposta-apontamentos-dialog.component.html',
  styleUrl: './proposta-apontamentos-dialog.component.scss',
})
export class PropostaApontamentosDialogComponent implements OnChanges {
  @Input() visible = false;
  @Input({ required: true }) contratacaoUuid = '';
  @Input() fornecedor: ContratacaoFornecedorListItem | null = null;
  @Input() readonly = false;
  @Output() visibleChange = new EventEmitter<boolean>();
  @Output() error = new EventEmitter<string>();
  @Output() success = new EventEmitter<string>();

  loading = false;
  salvando = false;
  encerrandoUuid: string | null = null;
  respondendoUuid: string | null = null;
  apontamentos: PropostaApontamento[] = [];
  novaDescricao = '';
  respostaTexto = '';
  formError = '';

  constructor(private readonly api: ContratacaoVendorListApiService) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['visible']?.currentValue === true && this.fornecedor) {
      this.novaDescricao = '';
      this.respostaTexto = '';
      this.formError = '';
      this.carregar();
    }
  }

  onVisibleChange(visible: boolean): void {
    this.visibleChange.emit(visible);
    if (!visible) {
      this.apontamentos = [];
      this.formError = '';
    }
  }

  get titulo(): string {
    return this.fornecedor
      ? `Apontamentos — ${this.fornecedor.razao_social}`
      : 'Apontamentos de proposta';
  }

  carregar(): void {
    if (!this.fornecedor) return;
    this.loading = true;
    this.formError = '';
    this.api.listarApontamentosProposta(this.contratacaoUuid, this.fornecedor.uuid).subscribe({
      next: (res) => {
        this.apontamentos = res.data ?? [];
        this.loading = false;
      },
      error: (err) => {
        this.loading = false;
        this.formError =
          (err.error as { message?: string })?.message ??
          'Não foi possível carregar os apontamentos.';
      },
    });
  }

  criar(): void {
    if (this.readonly || !this.fornecedor || this.salvando) return;
    const descricao = this.novaDescricao.trim();
    if (!descricao) {
      this.formError = 'Informe a descrição do apontamento.';
      return;
    }

    this.salvando = true;
    this.formError = '';
    this.api
      .criarApontamentoProposta(this.contratacaoUuid, this.fornecedor.uuid, { descricao })
      .subscribe({
        next: (ap) => {
          this.salvando = false;
          this.novaDescricao = '';
          this.apontamentos = [ap, ...this.apontamentos];
          this.success.emit('Apontamento registrado.');
        },
        error: (err) => {
          this.salvando = false;
          this.formError =
            (err.error as { message?: string })?.message ??
            'Não foi possível registrar o apontamento.';
        },
      });
  }

  responder(ap: PropostaApontamento): void {
    if (this.readonly || !this.fornecedor || this.respondendoUuid) return;
    const resposta = this.respostaTexto.trim();
    if (!resposta) {
      this.formError = 'Informe a resposta.';
      return;
    }

    this.respondendoUuid = ap.uuid;
    this.formError = '';
    this.api
      .responderApontamentoProposta(this.contratacaoUuid, this.fornecedor.uuid, ap.uuid, {
        resposta,
      })
      .subscribe({
        next: (atualizado) => {
          this.respondendoUuid = null;
          this.respostaTexto = '';
          this.apontamentos = this.apontamentos.map((a) =>
            a.uuid === atualizado.uuid ? atualizado : a,
          );
          this.success.emit('Resposta registrada.');
        },
        error: (err) => {
          this.respondendoUuid = null;
          this.formError =
            (err.error as { message?: string })?.message ??
            'Não foi possível responder o apontamento.';
        },
      });
  }

  encerrar(ap: PropostaApontamento): void {
    if (this.readonly || !this.fornecedor || this.encerrandoUuid) return;
    if (ap.status === 'encerrado') return;

    this.encerrandoUuid = ap.uuid;
    this.formError = '';
    this.api
      .encerrarApontamentoProposta(this.contratacaoUuid, this.fornecedor.uuid, ap.uuid)
      .subscribe({
        next: (atualizado) => {
          this.encerrandoUuid = null;
          this.apontamentos = this.apontamentos.map((a) =>
            a.uuid === atualizado.uuid ? atualizado : a,
          );
          this.success.emit('Apontamento encerrado.');
        },
        error: (err) => {
          this.encerrandoUuid = null;
          this.formError =
            (err.error as { message?: string })?.message ??
            'Não foi possível encerrar o apontamento.';
        },
      });
  }

  labelAutor(origem: string): string {
    return origem === 'FORNECEDOR' ? 'Fornecedor' : 'Compras';
  }

  labelStatus(status: string): string {
    switch (status) {
      case 'aberto':
        return 'Aberto';
      case 'respondido':
        return 'Respondido';
      case 'encerrado':
        return 'Encerrado';
      default:
        return status;
    }
  }

  severityStatus(status: string): 'info' | 'success' | 'secondary' | 'warning' {
    switch (status) {
      case 'aberto':
        return 'warning';
      case 'respondido':
        return 'info';
      case 'encerrado':
        return 'success';
      default:
        return 'secondary';
    }
  }
}
