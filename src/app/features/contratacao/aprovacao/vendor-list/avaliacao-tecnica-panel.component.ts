import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { MessageModule } from 'primeng/message';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';

import { ContratacaoVendorListApiService } from './contratacao-vendor-list-api.service';
import { AvaliacaoTecnica, AvaliacaoTecnicaItem } from '../../contratacao.models';

@Component({
  selector: 'app-avaliacao-tecnica-panel',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ButtonModule,
    InputNumberModule,
    InputTextModule,
    InputTextareaModule,
    MessageModule,
    ProgressSpinnerModule,
    TableModule,
    TagModule,
  ],
  templateUrl: './avaliacao-tecnica-panel.component.html',
  styleUrl: './avaliacao-tecnica-panel.component.scss',
})
export class AvaliacaoTecnicaPanelComponent implements OnInit, OnChanges {
  @Input({ required: true }) contratacaoUuid = '';
  @Input() temVencedor = false;
  @Input() readonly = false;
  @Input() reloadToken = 0;
  @Output() changed = new EventEmitter<AvaliacaoTecnica | null>();
  @Output() error = new EventEmitter<string>();
  @Output() success = new EventEmitter<string>();

  loading = false;
  salvando = false;
  concluindo = false;
  avaliacao: AvaliacaoTecnica | null = null;
  itens: AvaliacaoTecnicaItem[] = [];
  observacao = '';

  readonly indiceMinimo = 70;

  constructor(private readonly api: ContratacaoVendorListApiService) {}

  ngOnInit(): void {
    if (this.contratacaoUuid) {
      this.carregar();
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (
      (changes['contratacaoUuid'] && !changes['contratacaoUuid'].firstChange) ||
      (changes['reloadToken'] && !changes['reloadToken'].firstChange)
    ) {
      this.carregar();
    }
  }

  get editavel(): boolean {
    if (this.readonly || !this.avaliacao) return false;
    return this.avaliacao.status !== 'concluida';
  }

  get indiceLocal(): number | null {
    if (!this.itens.length) return null;
    let soma = 0;
    let preenchidos = 0;
    for (const item of this.itens) {
      if (item.nota == null) continue;
      preenchidos += 1;
      soma += (Number(item.nota) / 10) * Number(item.peso_percentual);
    }
    if (preenchidos === 0) return null;
    return Math.round(soma * 100) / 100;
  }

  get podeConcluir(): boolean {
    const indice = this.indiceLocal;
    return (
      this.editavel &&
      this.temVencedor &&
      this.itens.every((i) => i.nota != null) &&
      indice != null &&
      indice >= this.indiceMinimo &&
      !this.salvando &&
      !this.concluindo
    );
  }

  carregar(): void {
    if (!this.contratacaoUuid) return;
    this.loading = true;
    this.api.obterAvaliacaoTecnica(this.contratacaoUuid).subscribe({
      next: (data) => {
        this.avaliacao = data;
        this.itens = (data.itens ?? []).map((i) => ({ ...i }));
        this.observacao = data.observacao ?? '';
        this.loading = false;
        this.changed.emit(data);
      },
      error: (err) => {
        this.loading = false;
        this.avaliacao = null;
        this.itens = [];
        this.changed.emit(null);
        // Endpoint ainda pode não existir / avaliação sem rascunho — não bloquear a página.
        if (err.status === 404 || err.status === 501) {
          return;
        }
        this.error.emit(
          (err.error as { message?: string })?.message ??
            'Não foi possível carregar a avaliação técnica.',
        );
      },
    });
  }

  salvar(): void {
    if (!this.editavel || this.salvando) return;

    this.salvando = true;
    this.api
      .salvarAvaliacaoTecnica(this.contratacaoUuid, {
        observacao: this.observacao.trim() || null,
        itens: this.itens.map((i) => ({
          codigo: i.codigo,
          nota: i.nota,
          observacao: i.observacao ?? null,
        })),
      })
      .subscribe({
        next: (data) => {
          this.salvando = false;
          this.avaliacao = data;
          this.itens = (data.itens ?? []).map((i) => ({ ...i }));
          this.observacao = data.observacao ?? '';
          this.success.emit('Avaliação técnica salva.');
          this.changed.emit(data);
        },
        error: (err) => {
          this.salvando = false;
          this.error.emit(
            (err.error as { message?: string })?.message ??
              'Não foi possível salvar a avaliação técnica.',
          );
        },
      });
  }

  concluir(): void {
    if (!this.podeConcluir) return;

    this.concluindo = true;
    this.api
      .salvarAvaliacaoTecnica(this.contratacaoUuid, {
        observacao: this.observacao.trim() || null,
        itens: this.itens.map((i) => ({
          codigo: i.codigo,
          nota: i.nota,
          observacao: i.observacao ?? null,
        })),
      })
      .subscribe({
        next: () => {
          this.api.concluirAvaliacaoTecnica(this.contratacaoUuid).subscribe({
            next: (data) => {
              this.concluindo = false;
              this.avaliacao = data;
              this.itens = (data.itens ?? []).map((i) => ({ ...i }));
              this.success.emit('Avaliação técnica concluída.');
              this.changed.emit(data);
            },
            error: (err) => {
              this.concluindo = false;
              this.error.emit(
                (err.error as { message?: string })?.message ??
                  'Não foi possível concluir a avaliação técnica.',
              );
            },
          });
        },
        error: (err) => {
          this.concluindo = false;
          this.error.emit(
            (err.error as { message?: string })?.message ??
              'Não foi possível salvar as notas antes de concluir.',
          );
        },
      });
  }

  labelStatus(status: string): string {
    switch (status) {
      case 'rascunho':
        return 'Rascunho';
      case 'aguardando_area':
        return 'Aguardando área';
      case 'concluida':
        return 'Concluída';
      default:
        return status;
    }
  }

  severityStatus(status: string): 'success' | 'info' | 'warning' | 'secondary' {
    switch (status) {
      case 'concluida':
        return 'success';
      case 'aguardando_area':
        return 'warning';
      case 'rascunho':
        return 'info';
      default:
        return 'secondary';
    }
  }
}
