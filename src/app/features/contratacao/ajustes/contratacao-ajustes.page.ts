import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { MessageModule } from 'primeng/message';
import { TagModule } from 'primeng/tag';

import { ContratacaoApiService } from '../contratacao-api.service';
import { Contratacao, ContratacaoApontamento } from '../contratacao.models';
import { contratacaoStatusLabel } from '../contratacao-status.utils';

@Component({
  selector: 'app-contratacao-ajustes-page',
  standalone: true,
  imports: [
    FormsModule,
    ButtonModule,
    CardModule,
    InputTextareaModule,
    MessageModule,
    TagModule,
  ],
  templateUrl: './contratacao-ajustes.page.html',
  styleUrl: './contratacao-ajustes.page.scss',
})
export class ContratacaoAjustesPageComponent implements OnInit {
  uuid = '';
  contratacao: Contratacao | null = null;
  apontamentos: ContratacaoApontamento[] = [];
  respostas: Record<string, string> = {};
  loading = false;
  savingId: string | null = null;
  reenviando = false;
  errorMessage = '';
  successMessage = '';

  readonly statusLabel = contratacaoStatusLabel;

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly contratacaoApi: ContratacaoApiService,
  ) {}

  ngOnInit(): void {
    this.uuid = this.route.snapshot.paramMap.get('uuid') ?? '';
    this.load();
  }

  load(): void {
    this.loading = true;
    this.errorMessage = '';
    this.contratacaoApi.get(this.uuid).subscribe({
      next: (contratacao) => {
        this.contratacao = contratacao;
        this.contratacaoApi.listarApontamentos(this.uuid).subscribe({
          next: (response) => {
            this.apontamentos = response.data;
            this.loading = false;
          },
          error: () => {
            this.loading = false;
            this.errorMessage = 'Não foi possível carregar os apontamentos.';
          },
        });
      },
      error: () => {
        this.loading = false;
        this.errorMessage = 'Não foi possível carregar a contratação.';
      },
    });
  }

  responder(apontamento: ContratacaoApontamento): void {
    const resposta = (this.respostas[apontamento.id] ?? '').trim();
    if (!resposta) {
      this.errorMessage = 'Informe a resposta ao apontamento.';
      return;
    }

    this.savingId = apontamento.id;
    this.errorMessage = '';
    this.contratacaoApi.responderApontamento(this.uuid, apontamento.id, resposta).subscribe({
      next: () => {
        this.savingId = null;
        this.successMessage = 'Resposta registrada.';
        this.load();
      },
      error: (err) => {
        this.savingId = null;
        this.errorMessage =
          (err.error as { message?: string })?.message ?? 'Não foi possível registrar a resposta.';
      },
    });
  }

  reenviar(): void {
    this.reenviando = true;
    this.errorMessage = '';
    this.contratacaoApi.reenviar(this.uuid).subscribe({
      next: () => {
        this.reenviando = false;
        void this.router.navigate(['/contratacao']);
      },
      error: (err) => {
        this.reenviando = false;
        this.errorMessage =
          (err.error as { message?: string })?.message ?? 'Não foi possível reenviar a solicitação.';
      },
    });
  }

  get pendentes(): number {
    return this.apontamentos.filter((a) => a.status === 'pendente').length;
  }

  voltar(): void {
    void this.router.navigate(['/contratacao']);
  }
}
