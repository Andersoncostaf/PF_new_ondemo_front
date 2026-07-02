import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';

import { ContratacaoAprovacaoApiService } from '../contratacao-aprovacao-api.service';
import { Contratacao, ContratacaoApontamento } from '../../contratacao.models';
import { SOLICITACAO_SERVICO_LABELS } from '../../contratacao.models';
import {
  TERMO_REFERENCIA_GROUPS,
  TermoReferenciaCampos,
} from '../../termo-referencia.constants';
import { analiseStepByRouteSlug } from '../contratacao-aprovacao.steps';

@Injectable()
export class AnaliseContratacaoStore {
  private readonly api = inject(ContratacaoAprovacaoApiService);
  private readonly router = inject(Router);

  uuid: string | null = null;
  contratacao: Contratacao | null = null;
  currentRouteSlug = 'filial';
  loading = false;
  errorMessage = '';
  apontamentos: ContratacaoApontamento[] = [];
  apontamentosLoading = false;

  async init(uuid: string): Promise<void> {
    this.uuid = uuid;
    await this.reloadContratacao();
  }

  async reloadContratacao(): Promise<void> {
    if (!this.uuid) return;
    this.loading = true;
    this.errorMessage = '';
    try {
      this.contratacao = await firstValueFrom(this.api.get(this.uuid));
    } catch {
      this.errorMessage = 'Não foi possível carregar a contratação.';
    } finally {
      this.loading = false;
    }
  }

  setCurrentRouteSlug(slug: string): void {
    this.currentRouteSlug = slug;
    void this.loadApontamentos();
  }

  get currentEtapa(): string {
    return analiseStepByRouteSlug(this.currentRouteSlug)?.etapa ?? 'filial';
  }

  get emAnalise(): boolean {
    return this.contratacao?.status === 'em_analise';
  }

  async loadApontamentos(): Promise<void> {
    if (!this.uuid || !this.emAnalise) {
      this.apontamentos = [];
      return;
    }
    this.apontamentosLoading = true;
    try {
      const response = await firstValueFrom(
        this.api.listarApontamentos(this.uuid, this.currentEtapa),
      );
      this.apontamentos = response.data;
    } catch {
      this.apontamentos = [];
    } finally {
      this.apontamentosLoading = false;
    }
  }

  trCamposForReview(): { label: string; value: string }[] {
    const campos = (this.contratacao?.termo_referencia_campos ?? {}) as TermoReferenciaCampos;
    const items: { label: string; value: string }[] = [];
    for (const group of TERMO_REFERENCIA_GROUPS) {
      for (const field of group.fields) {
        const value = campos[field.key as keyof TermoReferenciaCampos];
        if (value) {
          items.push({ label: field.label, value: String(value) });
        }
      }
    }
    return items;
  }

  ssCamposForReview(): { label: string; value: string }[] {
    const ss = this.contratacao?.solicitacao_servico;
    if (!ss) return [];
    return (Object.keys(SOLICITACAO_SERVICO_LABELS) as (keyof typeof SOLICITACAO_SERVICO_LABELS)[])
      .filter((key) => ss[key])
      .map((key) => ({
        label: SOLICITACAO_SERVICO_LABELS[key],
        value: String(ss[key]),
      }));
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  }

  qqpTotal(): number {
    return (this.contratacao?.qqp_itens ?? []).reduce(
      (acc, item) => acc + item.quantidade * item.valor_unitario,
      0,
    );
  }

  stripHtml(html: string): string {
    return html.replace(/<[^>]*>/g, '').trim();
  }

  voltarLista(): void {
    void this.router.navigate(['/contratacao', 'aprovacao']);
  }
}
