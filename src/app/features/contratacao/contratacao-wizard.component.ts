import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AccordionModule } from 'primeng/accordion';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { StepsModule } from 'primeng/steps';
import { MessageModule } from 'primeng/message';
import { ProgressBarModule } from 'primeng/progressbar';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';
import { MenuItem } from 'primeng/api';

import { ContratacaoApiService } from './contratacao-api.service';
import { ApiErrorBody, ContratacaoPayload } from './contratacao.models';
import {
  countFilledTermoCampos,
  emptyTermoReferenciaCampos,
  TERMO_REFERENCIA_GROUPS,
  TERMO_REFERENCIA_KEYS,
  TermoReferenciaCampoKey,
  TermoReferenciaCampos,
  TermoReferenciaFieldDef,
  TermoReferenciaGroupDef,
} from './termo-referencia.constants';

@Component({
  selector: 'app-contratacao-wizard',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    AccordionModule,
    ButtonModule,
    CardModule,
    InputTextModule,
    InputTextareaModule,
    StepsModule,
    MessageModule,
    ProgressBarModule,
    TagModule,
    TooltipModule,
  ],
  templateUrl: './contratacao-wizard.component.html',
  styleUrl: './contratacao-wizard.component.scss',
})
export class ContratacaoWizardComponent implements OnInit {
  activeStep = 0;
  loading = false;
  saving = false;
  errorMessage = '';
  successMessage = '';
  uuid: string | null = null;
  status: 'rascunho' | 'submetido' = 'rascunho';
  isNova = true;
  trAccordionIndex: number | number[] = [0];

  readonly steps: MenuItem[] = [
    { label: 'Dados gerais' },
    { label: 'TR / escopo' },
    { label: 'QQP' },
    { label: 'Revisão' },
  ];

  readonly trGroups = TERMO_REFERENCIA_GROUPS;
  readonly trTotalFields = TERMO_REFERENCIA_KEYS.length;

  readonly form = this.formBuilder.group({
    titulo: ['', Validators.required],
    categoria_servico: ['', Validators.required],
    local: [''],
    prazo_desejado: [''],
    termo_referencia_campos: this.buildTermoReferenciaGroup(),
    qqp_itens: this.formBuilder.array([this.createQqpItemGroup()]),
  });

  constructor(
    private readonly formBuilder: FormBuilder,
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly contratacaoApi: ContratacaoApiService,
  ) {}

  ngOnInit(): void {
    const uuidParam = this.route.snapshot.paramMap.get('uuid');

    if (uuidParam && uuidParam !== 'nova') {
      this.isNova = false;
      this.uuid = uuidParam;
      this.loadContratacao(uuidParam);
    }
  }

  get qqpItens(): FormArray {
    return this.form.controls.qqp_itens;
  }

  get trCamposGroup(): FormGroup {
    return this.form.controls.termo_referencia_campos;
  }

  get readOnly(): boolean {
    return this.status === 'submetido';
  }

  get trFilledCount(): number {
    return countFilledTermoCampos(this.trCamposGroup.getRawValue() as TermoReferenciaCampos);
  }

  get trProgressPercent(): number {
    return Math.round((this.trFilledCount / this.trTotalFields) * 100);
  }

  private buildTermoReferenciaGroup(): FormGroup {
    const controls: Record<string, ReturnType<FormBuilder['control']>> = {};

    for (const key of TERMO_REFERENCIA_KEYS) {
      controls[key] = this.formBuilder.control('', Validators.required);
    }

    return this.formBuilder.group(controls);
  }

  createQqpItemGroup(): ReturnType<FormBuilder['group']> {
    return this.formBuilder.group({
      descricao: ['', Validators.required],
      quantidade: [1, [Validators.required, Validators.min(0.0001)]],
      unidade: ['un', Validators.required],
    });
  }

  addQqpItem(): void {
    this.qqpItens.push(this.createQqpItemGroup());
  }

  removeQqpItem(index: number): void {
    if (this.qqpItens.length <= 1) {
      return;
    }
    this.qqpItens.removeAt(index);
  }

  loadContratacao(uuid: string): void {
    this.loading = true;
    this.errorMessage = '';

    this.contratacaoApi.get(uuid).subscribe({
      next: (data) => {
        this.status = data.status;
        this.patchForm(data);
        this.loading = false;

        if (data.status === 'submetido') {
          this.form.disable();
        }
      },
      error: () => {
        this.loading = false;
        this.errorMessage = 'Solicitação não encontrada.';
      },
    });
  }

  private patchForm(data: {
    titulo: string | null;
    categoria_servico: string | null;
    local: string | null;
    prazo_desejado: string | null;
    termo_referencia: string | null;
    termo_referencia_campos?: Partial<TermoReferenciaCampos>;
    qqp_itens: { descricao: string; quantidade: number; unidade: string }[];
  }): void {
    this.form.patchValue({
      titulo: data.titulo ?? '',
      categoria_servico: data.categoria_servico ?? '',
      local: data.local ?? '',
      prazo_desejado: data.prazo_desejado ?? '',
    });

    const campos = { ...emptyTermoReferenciaCampos(), ...(data.termo_referencia_campos ?? {}) };

    if (!data.termo_referencia_campos && data.termo_referencia) {
      campos.escopo = data.termo_referencia;
    }

    this.trCamposGroup.patchValue(campos);

    this.qqpItens.clear();
    const itens = data.qqp_itens.length > 0 ? data.qqp_itens : [{ descricao: '', quantidade: 1, unidade: 'un' }];

    for (const item of itens) {
      this.qqpItens.push(
        this.formBuilder.group({
          descricao: [item.descricao, Validators.required],
          quantidade: [item.quantidade, [Validators.required, Validators.min(0.0001)]],
          unidade: [item.unidade, Validators.required],
        }),
      );
    }

    this.trAccordionIndex = this.firstIncompleteGroupIndex();
  }

  nextStep(): void {
    if (!this.validateCurrentStep()) {
      return;
    }
    this.activeStep = Math.min(this.activeStep + 1, this.steps.length - 1);
  }

  prevStep(): void {
    this.activeStep = Math.max(this.activeStep - 1, 0);
  }

  validateCurrentStep(): boolean {
    this.errorMessage = '';

    if (this.activeStep === 0) {
      return this.markControls(['titulo', 'categoria_servico']);
    }

    if (this.activeStep === 1) {
      this.trCamposGroup.markAllAsTouched();

      if (this.trCamposGroup.invalid) {
        this.errorMessage = 'Preencha todos os 16 blocos do termo de referência para continuar.';
        this.trAccordionIndex = this.firstIncompleteGroupIndex();
        return false;
      }

      return true;
    }

    if (this.activeStep === 2) {
      this.qqpItens.controls.forEach((group) => group.markAllAsTouched());
      return this.qqpItens.valid;
    }

    return true;
  }

  private markControls(names: string[]): boolean {
    let valid = true;
    for (const name of names) {
      const control = this.form.get(name);
      control?.markAsTouched();
      if (control?.invalid) {
        valid = false;
      }
    }
    return valid;
  }

  isTrFieldFilled(key: TermoReferenciaCampoKey): boolean {
    const value = this.trCamposGroup.get(key)?.value;
    return typeof value === 'string' && value.trim().length > 0;
  }

  groupFilledCount(group: TermoReferenciaGroupDef): number {
    return group.fields.filter((field) => this.isTrFieldFilled(field.key)).length;
  }

  isGroupComplete(group: TermoReferenciaGroupDef): boolean {
    return group.fields.every((field) => this.isTrFieldFilled(field.key));
  }

  firstIncompleteGroupIndex(): number {
    const index = this.trGroups.findIndex((group) => !this.isGroupComplete(group));
    return index >= 0 ? index : 0;
  }

  trFieldControl(field: TermoReferenciaFieldDef) {
    return this.trCamposGroup.get(field.key);
  }

  buildPayload(): ContratacaoPayload {
    const raw = this.form.getRawValue();
    const campos = raw.termo_referencia_campos as TermoReferenciaCampos;

    return {
      titulo: raw.titulo,
      categoria_servico: raw.categoria_servico,
      local: raw.local || null,
      prazo_desejado: raw.prazo_desejado || null,
      termo_referencia_campos: campos,
      qqp_itens: raw.qqp_itens.map((item, index) => ({
        ordem: index,
        descricao: String(item['descricao'] ?? ''),
        quantidade: Number(item['quantidade'] ?? 1),
        unidade: String(item['unidade'] ?? 'un'),
      })),
    };
  }

  salvarRascunho(): void {
    if (this.readOnly) {
      return;
    }

    this.saving = true;
    this.errorMessage = '';
    this.successMessage = '';

    const payload = this.buildPayload();
    const request$ =
      this.uuid === null
        ? this.contratacaoApi.create(payload)
        : this.contratacaoApi.update(this.uuid, payload);

    request$.subscribe({
      next: (data) => {
        this.saving = false;
        this.uuid = data.uuid;
        this.isNova = false;
        this.status = data.status;
        this.successMessage = 'Rascunho salvo com sucesso.';

        if (this.route.snapshot.paramMap.get('uuid') === 'nova') {
          void this.router.navigate(['/contratacao', data.uuid, 'editar'], { replaceUrl: true });
        }
      },
      error: (err) => {
        this.saving = false;
        this.errorMessage = this.extractError(err);
      },
    });
  }

  submeter(): void {
    if (this.readOnly) {
      return;
    }

    this.form.markAllAsTouched();
    if (this.form.invalid) {
      this.errorMessage = 'Preencha todos os campos obrigatórios antes de submeter.';
      if (this.trCamposGroup.invalid) {
        this.activeStep = 1;
        this.trAccordionIndex = this.firstIncompleteGroupIndex();
      }
      return;
    }

    this.saving = true;
    this.errorMessage = '';
    this.successMessage = '';

    const save$ =
      this.uuid === null
        ? this.contratacaoApi.create(this.buildPayload())
        : this.contratacaoApi.update(this.uuid, this.buildPayload());

    save$.subscribe({
      next: (data) => {
        this.uuid = data.uuid;
        this.contratacaoApi.submeter(data.uuid).subscribe({
          next: () => {
            this.saving = false;
            void this.router.navigate(['/contratacao']);
          },
          error: (err) => {
            this.saving = false;
            this.errorMessage = this.extractError(err);
          },
        });
      },
      error: (err) => {
        this.saving = false;
        this.errorMessage = this.extractError(err);
      },
    });
  }

  trCamposForReview(): { label: string; value: string }[] {
    const campos = this.trCamposGroup.getRawValue() as TermoReferenciaCampos;

    return this.trGroups.flatMap((group) =>
      group.fields.map((field) => ({
        label: field.label,
        value: (campos[field.key] ?? '').trim() || '—',
      })),
    );
  }

  private extractError(err: { error?: ApiErrorBody }): string {
    return err.error?.message ?? 'Não foi possível concluir a operação.';
  }
}
