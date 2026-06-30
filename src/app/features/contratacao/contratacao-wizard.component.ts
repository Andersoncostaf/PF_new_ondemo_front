import { Component, OnInit } from '@angular/core';

import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

import { ActivatedRoute, Router, RouterLink } from '@angular/router';

import { CommonModule } from '@angular/common';

import { AccordionModule } from 'primeng/accordion';

import { ButtonModule } from 'primeng/button';

import { CardModule } from 'primeng/card';

import { EditorModule } from 'primeng/editor';

import { InputNumberModule } from 'primeng/inputnumber';

import { InputTextModule } from 'primeng/inputtext';

import { InputTextareaModule } from 'primeng/inputtextarea';

import { StepsModule } from 'primeng/steps';

import { MessageModule } from 'primeng/message';

import { ProgressBarModule } from 'primeng/progressbar';

import { TableModule } from 'primeng/table';

import { TagModule } from 'primeng/tag';

import { TooltipModule } from 'primeng/tooltip';

import { MenuItem } from 'primeng/api';

import { Observable, firstValueFrom } from 'rxjs';



import { IdentidadeApiService } from '../../core/identidade/identidade-api.service';

import { ContratacaoApiService } from './contratacao-api.service';

import {

  ApiErrorBody,

  Contratacao,

  ContratacaoAnexo,

  ContratacaoPayload,

  SOLICITACAO_SERVICO_LABELS,

  SolicitacaoServico,

} from './contratacao.models';

import {

  countFilledTermoCampos,

  emptyTermoReferenciaCampos,

  generateTrCampoId,

  TERMO_REFERENCIA_GROUPS,

  TERMO_REFERENCIA_KEYS,

  TermoReferenciaCampoKey,

  TermoReferenciaCampos,

  TermoReferenciaCampoPersonalizado,

  TermoReferenciaCamposPayload,

  TermoReferenciaFieldDef,

  TermoReferenciaGroupDef,

} from './termo-referencia.constants';



interface SalvarRascunhoOptions {

  advanceOnSuccess?: boolean;

  silent?: boolean;

}



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

    EditorModule,

    InputNumberModule,

    InputTextModule,

    InputTextareaModule,

    StepsModule,

    MessageModule,

    ProgressBarModule,

    TableModule,

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

  uploadingAnexo = false;

  errorMessage = '';

  successMessage = '';

  uuid: string | null = null;

  status: 'rascunho' | 'submetido' = 'rascunho';

  isNova = true;

  trAccordionIndex: number | number[] = [0];

  anexos: ContratacaoAnexo[] = [];

  solicitanteNome = '';

  anexoArquivo: File | null = null;



  readonly steps: MenuItem[] = [

    { label: 'Dados gerais' },

    { label: 'TR / escopo' },

    { label: 'QQP' },

    { label: 'Anexos' },

    { label: 'Solicitação de serviço' },

    { label: 'Revisão' },

  ];



  readonly trGroups = TERMO_REFERENCIA_GROUPS;

  readonly trTotalFields = TERMO_REFERENCIA_KEYS.length;

  readonly ssLabels = SOLICITACAO_SERVICO_LABELS;

  readonly qqpDescricaoMax = 800;



  readonly form = this.formBuilder.group({

    empresa: ['', Validators.required],

    empresa_cnpj: [''],

    empresa_endereco: [''],

    departamento: [''],

    titulo: ['', Validators.required],

    categoria_servico: ['', Validators.required],

    local: [''],

    prazo_desejado: [''],

    termo_referencia_campos: this.buildTermoReferenciaGroup(),

    tr_campos_personalizados: this.formBuilder.array([]),

    qqp_itens: this.formBuilder.array([]),

    solicitacao_servico: this.buildSolicitacaoServicoGroup(),

  });



  readonly qqpDraftForm = this.formBuilder.group({

    unidade: ['un', Validators.required],

    quantidade: [1, [Validators.required, Validators.min(0.0001)]],

    valor_unitario: [0, [Validators.required, Validators.min(0)]],

    descricao: ['', Validators.required],

  });



  readonly anexoDraftForm = this.formBuilder.group({

    descricao: [''],

  });



  constructor(

    private readonly formBuilder: FormBuilder,

    private readonly route: ActivatedRoute,

    private readonly router: Router,

    private readonly contratacaoApi: ContratacaoApiService,

    private readonly identidadeApi: IdentidadeApiService,

  ) {}



  ngOnInit(): void {

    this.loadPerfil();



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



  get trCamposPersonalizados(): FormArray {

    return this.form.controls.tr_campos_personalizados;

  }



  get ssGroup(): FormGroup {

    return this.form.controls.solicitacao_servico;

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



  get qqpDescricaoPlainLength(): number {

    return this.plainTextLength(this.qqpDraftForm.controls.descricao.value ?? '');

  }



  get qqpPrecoTotal(): number {

    return this.qqpItens.controls.reduce((total, group) => {

      const qty = Number(group.get('quantidade')?.value ?? 0);

      const unit = Number(group.get('valor_unitario')?.value ?? 0);

      return total + qty * unit;

    }, 0);

  }



  formatCurrency(value: number): string {

    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value ?? 0);

  }



  qqpItemTotal(index: number): number {

    const group = this.qqpItens.at(index);

    const qty = Number(group.get('quantidade')?.value ?? 0);

    const unit = Number(group.get('valor_unitario')?.value ?? 0);

    return qty * unit;

  }



  stripHtml(html: string): string {

    return html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();

  }



  private plainTextLength(html: string): number {

    return this.stripHtml(html).length;

  }



  private buildTermoReferenciaGroup(): FormGroup {

    const controls: Record<string, ReturnType<FormBuilder['control']>> = {};



    for (const key of TERMO_REFERENCIA_KEYS) {

      controls[key] = this.formBuilder.control('', Validators.required);

    }



    return this.formBuilder.group(controls);

  }



  private buildSolicitacaoServicoGroup(): FormGroup {

    return this.formBuilder.group({

      codigo_servico: [''],

      centro_custo: [''],

      projeto: [''],

      fase: [''],

      conta_financeira: [''],

      conta_contabil: [''],

      transacao: [''],

      valor_servico: [''],

      observacao_ss: [''],

    });

  }



  createCustomTrFieldGroup(

    value?: Partial<TermoReferenciaCampoPersonalizado>,

  ): ReturnType<FormBuilder['group']> {

    return this.formBuilder.group({

      id: [value?.id ?? generateTrCampoId()],

      titulo: [value?.titulo ?? '', Validators.required],

      conteudo: [value?.conteudo ?? '', Validators.required],

    });

  }



  addCustomTrField(): void {

    this.trCamposPersonalizados.push(this.createCustomTrFieldGroup());

  }



  removeCustomTrField(index: number): void {

    this.trCamposPersonalizados.removeAt(index);

  }



  isCustomTrFieldFilled(index: number): boolean {

    const group = this.trCamposPersonalizados.at(index);

    const titulo = String(group.get('titulo')?.value ?? '').trim();

    const conteudo = String(group.get('conteudo')?.value ?? '').trim();

    return titulo.length > 0 && conteudo.length > 0;

  }



  createQqpItemGroup(item?: {

    descricao: string;

    quantidade: number;

    unidade: string;

    valor_unitario?: number;

  }): ReturnType<FormBuilder['group']> {

    return this.formBuilder.group({

      descricao: [item?.descricao ?? '', Validators.required],

      quantidade: [item?.quantidade ?? 1, [Validators.required, Validators.min(0.0001)]],

      unidade: [item?.unidade ?? 'un', Validators.required],

      valor_unitario: [item?.valor_unitario ?? 0, [Validators.required, Validators.min(0)]],

    });

  }



  salvarQqpItem(): void {

    if (this.qqpDescricaoPlainLength > this.qqpDescricaoMax) {

      this.errorMessage = `A descrição do QQP deve ter no máximo ${this.qqpDescricaoMax} caracteres.`;

      return;

    }



    this.qqpDraftForm.markAllAsTouched();

    if (this.qqpDraftForm.invalid) {

      return;

    }



    const draft = this.qqpDraftForm.getRawValue();

    this.qqpItens.push(

      this.createQqpItemGroup({

        descricao: String(draft.descricao ?? ''),

        quantidade: Number(draft.quantidade ?? 1),

        unidade: String(draft.unidade ?? 'un'),

        valor_unitario: Number(draft.valor_unitario ?? 0),

      }),

    );

    this.limparQqpDraft();

    this.errorMessage = '';

  }



  limparQqpDraft(): void {

    this.qqpDraftForm.reset({

      unidade: 'un',

      quantidade: 1,

      valor_unitario: 0,

      descricao: '',

    });

  }



  removeQqpItem(index: number): void {

    this.qqpItens.removeAt(index);

  }



  onAnexoFileSelected(event: Event): void {

    const input = event.target as HTMLInputElement;

    this.anexoArquivo = input.files?.[0] ?? null;

  }



  limparAnexoDraft(): void {

    this.anexoDraftForm.reset({ descricao: '' });

    this.anexoArquivo = null;

  }



  async anexarArquivo(): Promise<void> {

    if (!this.anexoArquivo) {

      this.errorMessage = 'Selecione um arquivo para anexar.';

      return;

    }



    this.uploadingAnexo = true;

    this.errorMessage = '';



    try {

      const uuid = await this.ensureContratacaoUuid();

      const descricao = String(this.anexoDraftForm.value.descricao ?? '');

      const anexo = await firstValueFrom(

        this.contratacaoApi.uploadAnexo(uuid, descricao, this.anexoArquivo),

      );

      this.anexos = [...this.anexos, anexo];

      this.limparAnexoDraft();

      this.successMessage = 'Anexo adicionado com sucesso.';

    } catch (err) {

      this.errorMessage = this.extractError(err as { error?: ApiErrorBody });

    } finally {

      this.uploadingAnexo = false;

    }

  }



  removerAnexo(anexoId: string): void {

    if (!this.uuid) {

      return;

    }



    this.contratacaoApi.deleteAnexo(this.uuid, anexoId).subscribe({

      next: () => {

        this.anexos = this.anexos.filter((a) => a.id !== anexoId);

      },

      error: (err) => {

        this.errorMessage = this.extractError(err);

      },

    });

  }



  private loadPerfil(): void {

    this.identidadeApi.getPerfil().subscribe({

      next: (perfil) => {

        this.solicitanteNome = perfil.usuario.nome;

      },

    });

  }



  loadContratacao(uuid: string): void {

    this.loading = true;

    this.errorMessage = '';



    this.contratacaoApi.get(uuid).subscribe({

      next: (data) => {

        this.status = data.status;

        this.patchForm(data);

        this.anexos = data.anexos ?? [];

        this.loading = false;



        if (data.status === 'submetido') {

          this.form.disable();

          this.qqpDraftForm.disable();

          this.anexoDraftForm.disable();

        }

      },

      error: () => {

        this.loading = false;

        this.errorMessage = 'Solicitação não encontrada.';

      },

    });

  }



  private patchForm(data: Contratacao): void {

    this.form.patchValue({

      empresa: data.empresa ?? '',

      empresa_cnpj: data.empresa_cnpj ?? '',

      empresa_endereco: data.empresa_endereco ?? '',

      departamento: data.departamento ?? '',

      titulo: data.titulo ?? '',

      categoria_servico: data.categoria_servico ?? '',

      local: data.local ?? '',

      prazo_desejado: data.prazo_desejado ?? '',

    });



    const payload = data.termo_referencia_campos ?? {};

    const campos = { ...emptyTermoReferenciaCampos(), ...payload };



    if (!data.termo_referencia_campos && data.termo_referencia) {

      campos.escopo = data.termo_referencia;

    }



    this.trCamposGroup.patchValue(campos);



    this.trCamposPersonalizados.clear();

    const personalizados = payload.campos_personalizados ?? [];

    for (const item of personalizados) {

      this.trCamposPersonalizados.push(this.createCustomTrFieldGroup(item));

    }



    this.qqpItens.clear();

    for (const item of data.qqp_itens) {

      this.qqpItens.push(

        this.createQqpItemGroup({

          descricao: item.descricao,

          quantidade: item.quantidade,

          unidade: item.unidade,

          valor_unitario: item.valor_unitario ?? 0,

        }),

      );

    }



    const ss = data.solicitacao_servico ?? {};

    this.ssGroup.patchValue({

      codigo_servico: ss.codigo_servico ?? '',

      centro_custo: ss.centro_custo ?? '',

      projeto: ss.projeto ?? '',

      fase: ss.fase ?? '',

      conta_financeira: ss.conta_financeira ?? '',

      conta_contabil: ss.conta_contabil ?? '',

      transacao: ss.transacao ?? '',

      valor_servico: ss.valor_servico ?? '',

      observacao_ss: ss.observacao_ss ?? '',

    });



    this.trAccordionIndex = this.firstIncompleteGroupIndex();

  }



  nextStep(): void {

    if (!this.validateCurrentStep()) {

      return;

    }

    this.salvarRascunho({ advanceOnSuccess: true });

  }



  prevStep(): void {

    this.activeStep = Math.max(this.activeStep - 1, 0);

  }



  validateCurrentStep(): boolean {

    this.errorMessage = '';



    if (this.activeStep === 0) {

      return this.markControls(['empresa', 'titulo', 'categoria_servico']);

    }



    if (this.activeStep === 1) {

      this.trCamposGroup.markAllAsTouched();

      this.trCamposPersonalizados.controls.forEach((group) => group.markAllAsTouched());



      if (this.trCamposGroup.invalid || this.trCamposPersonalizados.invalid) {

        this.errorMessage = 'Preencha todos os 16 blocos do termo de referência e os campos personalizados iniciados.';

        this.trAccordionIndex = this.firstIncompleteGroupIndex();

        return false;

      }



      return true;

    }



    if (this.activeStep === 2) {

      if (this.qqpItens.length < 1) {

        this.errorMessage = 'Adicione pelo menos um item ao QQP antes de avançar.';

        return false;

      }

      return true;

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



  private buildSolicitacaoServicoPayload(): SolicitacaoServico | null {

    const raw = this.ssGroup.getRawValue() as SolicitacaoServico;

    const normalized: SolicitacaoServico = {};

    let hasValue = false;



    for (const key of Object.keys(this.ssLabels) as (keyof SolicitacaoServico)[]) {

      const value = String(raw[key] ?? '').trim();

      if (value) {

        normalized[key] = value;

        hasValue = true;

      }

    }



    return hasValue ? normalized : null;

  }



  buildPayload(): ContratacaoPayload {

    const raw = this.form.getRawValue();

    const campos = raw.termo_referencia_campos as TermoReferenciaCampos;

    const personalizados = (raw.tr_campos_personalizados as TermoReferenciaCampoPersonalizado[])

      .filter((item) => item.titulo.trim() && item.conteudo.trim())

      .map((item, index) => ({

        id: item.id,

        titulo: item.titulo.trim(),

        conteudo: item.conteudo.trim(),

        ordem: index,

      }));



    const termoReferenciaCampos: TermoReferenciaCamposPayload = { ...campos };



    if (personalizados.length > 0) {

      termoReferenciaCampos.campos_personalizados = personalizados;

    }



    const qqpItens = (raw.qqp_itens as Array<Record<string, unknown>>)

      .map((item, index) => ({

        ordem: index,

        descricao: String(item['descricao'] ?? '').trim(),

        quantidade: Number(item['quantidade'] ?? 1),

        unidade: String(item['unidade'] ?? 'un'),

        valor_unitario: Number(item['valor_unitario'] ?? 0),

      }))

      .filter((item) => item.descricao.length > 0);



    const payload: ContratacaoPayload = {

      titulo: raw.titulo,

      categoria_servico: raw.categoria_servico,

      local: raw.local || null,

      prazo_desejado: raw.prazo_desejado || null,

      empresa: raw.empresa || null,

      empresa_cnpj: raw.empresa_cnpj || null,

      empresa_endereco: raw.empresa_endereco || null,

      departamento: raw.departamento || null,

      termo_referencia_campos: termoReferenciaCampos,

      solicitacao_servico: this.buildSolicitacaoServicoPayload(),

    };



    if (qqpItens.length > 0) {

      payload.qqp_itens = qqpItens;

    }



    return payload;

  }



  salvarRascunho(options: SalvarRascunhoOptions = {}): void {

    if (this.readOnly) {

      return;

    }



    this.saving = true;

    if (!options.silent) {

      this.errorMessage = '';

      this.successMessage = '';

    }



    const payload = this.buildPayload();

    const request$: Observable<Contratacao> =

      this.uuid === null

        ? this.contratacaoApi.create(payload)

        : this.contratacaoApi.update(this.uuid, payload);



    request$.subscribe({

      next: (data) => {

        this.saving = false;

        this.uuid = data.uuid;

        this.isNova = false;

        this.status = data.status;

        this.anexos = data.anexos ?? this.anexos;



        if (!options.silent) {

          this.successMessage = 'Rascunho salvo com sucesso.';

        }



        if (this.route.snapshot.paramMap.get('uuid') === 'nova') {

          void this.router.navigate(['/contratacao', data.uuid, 'editar'], { replaceUrl: true });

        }



        if (options.advanceOnSuccess) {

          this.activeStep = Math.min(this.activeStep + 1, this.steps.length - 1);

        }

      },

      error: (err) => {

        this.saving = false;

        this.errorMessage = this.extractError(err);

      },

    });

  }



  private ensureContratacaoUuid(): Promise<string> {

    if (this.uuid) {

      return Promise.resolve(this.uuid);

    }



    return new Promise((resolve, reject) => {

      this.contratacaoApi.create(this.buildPayload()).subscribe({

        next: (data) => {

          this.uuid = data.uuid;

          this.isNova = false;

          this.status = data.status;



          if (this.route.snapshot.paramMap.get('uuid') === 'nova') {

            void this.router.navigate(['/contratacao', data.uuid, 'editar'], { replaceUrl: true });

          }



          resolve(data.uuid);

        },

        error: (err) => reject(err),

      });

    });

  }



  submeter(): void {

    if (this.readOnly) {

      return;

    }



    this.form.markAllAsTouched();

    if (this.form.controls.empresa.invalid || this.qqpItens.length < 1) {

      this.errorMessage = 'Preencha todos os campos obrigatórios antes de submeter.';

      if (this.form.controls.empresa.invalid) {

        this.activeStep = 0;

      } else if (this.qqpItens.length < 1) {

        this.activeStep = 2;

      }

      return;

    }



    if (this.trCamposGroup.invalid || this.trCamposPersonalizados.invalid) {

      this.errorMessage = 'Preencha todos os campos obrigatórios antes de submeter.';

      this.activeStep = 1;

      this.trAccordionIndex = this.firstIncompleteGroupIndex();

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



  trCamposForReview(): { label: string; value: string; custom?: boolean }[] {

    const campos = this.trCamposGroup.getRawValue() as TermoReferenciaCampos;

    const standard = this.trGroups.flatMap((group) =>

      group.fields.map((field) => ({

        label: field.label,

        value: (campos[field.key] ?? '').trim() || '—',

      })),

    );



    const personalizados = (this.trCamposPersonalizados.getRawValue() as TermoReferenciaCampoPersonalizado[])

      .filter((item) => item.titulo.trim() || item.conteudo.trim())

      .map((item) => ({

        label: item.titulo.trim() || 'Campo personalizado',

        value: item.conteudo.trim() || '—',

        custom: true,

      }));



    return [...standard, ...personalizados];

  }



  ssCamposForReview(): { label: string; value: string }[] {

    const raw = this.ssGroup.getRawValue() as SolicitacaoServico;

    return (Object.keys(this.ssLabels) as (keyof SolicitacaoServico)[])

      .filter((key) => String(raw[key] ?? '').trim())

      .map((key) => ({

        label: this.ssLabels[key],

        value: String(raw[key]),

      }));

  }



  qqpItensForReview(): Array<{
    descricao: string;
    quantidade: number;
    unidade: string;
    valor_unitario: number;
  }> {
    return this.qqpItens.getRawValue() as Array<{
      descricao: string;
      quantidade: number;
      unidade: string;
      valor_unitario: number;
    }>;
  }

  statusLabel(): string {

    return this.status === 'submetido' ? 'Submetido' : 'Em elaboração';

  }



  private extractError(err: { error?: ApiErrorBody }): string {

    return err.error?.message ?? 'Não foi possível concluir a operação.';

  }

}

