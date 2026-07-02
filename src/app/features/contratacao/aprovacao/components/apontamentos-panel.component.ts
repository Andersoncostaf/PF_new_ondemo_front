import { Component, EventEmitter, Input, Output } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { EditorModule } from 'primeng/editor';
import { MessageModule } from 'primeng/message';
import { TagModule } from 'primeng/tag';

import { ContratacaoAprovacaoApiService } from '../contratacao-aprovacao-api.service';
import { ContratacaoApontamento } from '../../contratacao.models';

const MAX_FILE_BYTES = 50 * 1024 * 1024;

@Component({
  selector: 'app-apontamentos-panel',
  standalone: true,
  imports: [DatePipe, FormsModule, ButtonModule, EditorModule, MessageModule, TagModule],
  templateUrl: './apontamentos-panel.component.html',
  styleUrl: './apontamentos-panel.component.scss',
})
export class ApontamentosPanelComponent {
  @Input({ required: true }) uuid!: string;
  @Input({ required: true }) etapa!: string;
  @Input() apontamentos: ContratacaoApontamento[] = [];
  @Input() loading = false;
  @Input() readonly = false;

  @Output() changed = new EventEmitter<void>();

  descricao = '';
  arquivo: File | null = null;
  saving = false;
  errorMessage = '';

  constructor(private readonly aprovacaoApi: ContratacaoAprovacaoApiService) {}

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0] ?? null;
    if (file && file.size > MAX_FILE_BYTES) {
      this.errorMessage = 'Arquivo muito grande. O tamanho máximo é 50MB.';
      input.value = '';
      this.arquivo = null;
      return;
    }
    this.arquivo = file;
    this.errorMessage = '';
  }

  salvar(): void {
    const texto = this.descricao.replace(/<[^>]*>/g, '').trim();
    if (!texto && !this.arquivo) {
      this.errorMessage = 'Informe texto na descrição ou anexe um arquivo.';
      return;
    }

    this.saving = true;
    this.errorMessage = '';
    this.aprovacaoApi.salvarApontamento(this.uuid, this.etapa, this.descricao, this.arquivo ?? undefined).subscribe({
      next: () => {
        this.descricao = '';
        this.arquivo = null;
        this.saving = false;
        this.changed.emit();
      },
      error: (err) => {
        this.saving = false;
        this.errorMessage =
          (err.error as { message?: string })?.message ?? 'Não foi possível salvar o apontamento.';
      },
    });
  }

  excluir(apontamento: ContratacaoApontamento): void {
    this.aprovacaoApi.excluirApontamento(this.uuid, apontamento.id).subscribe({
      next: () => this.changed.emit(),
      error: () => {
        this.errorMessage = 'Não foi possível excluir o apontamento.';
      },
    });
  }

  baixarAnexo(apontamento: ContratacaoApontamento): void {
    this.aprovacaoApi.baixarAnexoApontamento(this.uuid, apontamento.id).subscribe({
      next: (blob) => {
        const url = URL.createObjectURL(blob);
        const anchor = document.createElement('a');
        anchor.href = url;
        anchor.download = apontamento.nome_arquivo ?? 'anexo';
        anchor.click();
        URL.revokeObjectURL(url);
      },
    });
  }
}
