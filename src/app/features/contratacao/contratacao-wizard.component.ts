import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { StepsModule } from 'primeng/steps';
import { MessageModule } from 'primeng/message';
import { MenuItem } from 'primeng/api';

import { ContratacaoApiService } from './contratacao-api.service';
import { ApiErrorBody, ContratacaoPayload } from './contratacao.models';

@Component({
  selector: 'app-contratacao-wizard',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    ButtonModule,
    CardModule,
    InputTextModule,
    InputTextareaModule,
    StepsModule,
    MessageModule,
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

  readonly steps: MenuItem[] = [
    { label: 'Dados gerais' },
    { label: 'TR / escopo' },
    { label: 'QQP' },
    { label: 'Revisão' },
  ];

  readonly form = this.formBuilder.group({
    titulo: ['', Validators.required],
    categoria_servico: ['', Validators.required],
    local: [''],
    prazo_desejado: [''],
    termo_referencia: ['', Validators.required],
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

  get readOnly(): boolean {
    return this.status === 'submetido';
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
    qqp_itens: { descricao: string; quantidade: number; unidade: string }[];
  }): void {
    this.form.patchValue({
      titulo: data.titulo ?? '',
      categoria_servico: data.categoria_servico ?? '',
      local: data.local ?? '',
      prazo_desejado: data.prazo_desejado ?? '',
      termo_referencia: data.termo_referencia ?? '',
    });

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
      const controls = ['titulo', 'categoria_servico'];
      return this.markControls(controls);
    }

    if (this.activeStep === 1) {
      return this.markControls(['termo_referencia']);
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

  buildPayload(): ContratacaoPayload {
    const raw = this.form.getRawValue();
    return {
      titulo: raw.titulo,
      categoria_servico: raw.categoria_servico,
      local: raw.local || null,
      prazo_desejado: raw.prazo_desejado || null,
      termo_referencia: raw.termo_referencia,
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

  private extractError(err: { error?: ApiErrorBody }): string {
    return err.error?.message ?? 'Não foi possível concluir a operação.';
  }
}
