import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  Output,
  SimpleChanges,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  AbstractControl,
  FormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { DividerModule } from 'primeng/divider';
import { InputTextModule } from 'primeng/inputtext';
import { MessageModule } from 'primeng/message';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import {
  Subject,
  debounceTime,
  distinctUntilChanged,
  filter,
  merge,
  switchMap,
  takeUntil,
  tap,
} from 'rxjs';

import {
  formatCnpj,
  formatTelefone,
  isValidCnpj,
  isValidTelefone,
  normalizeCnpj,
  normalizeTelefone,
} from '../../../../core/utils/br/br-document.util';
import { ContratacaoVendorListApiService } from './contratacao-vendor-list-api.service';
import {
  CadastrarFornecedorPayload,
  ContratacaoFornecedorListItem,
  FornecedorEnrichmentResponse,
  SugestaoFornecedorOrigem,
} from '../../contratacao.models';

function cnpjValidator(control: AbstractControl): ValidationErrors | null {
  const value = control.value as string;
  if (!value) return null;
  return isValidCnpj(value) ? null : { cnpjInvalid: true };
}

function telefoneValidator(control: AbstractControl): ValidationErrors | null {
  const value = control.value as string;
  if (!value) return null;
  return isValidTelefone(value) ? null : { telefoneInvalid: true };
}

function cnpjDuplicadoValidator(cnpjsExistentes: () => string[]): (control: AbstractControl) => ValidationErrors | null {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = normalizeCnpj(control.value as string);
    if (!value) return null;
    const duplicado = cnpjsExistentes().some((c) => normalizeCnpj(c) === value);
    return duplicado ? { cnpjDuplicado: true } : null;
  };
}

@Component({
  selector: 'app-cadastrar-fornecedor-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ButtonModule,
    DialogModule,
    DividerModule,
    InputTextModule,
    MessageModule,
    ProgressSpinnerModule,
  ],
  templateUrl: './cadastrar-fornecedor-dialog.component.html',
  styleUrl: './cadastrar-fornecedor-dialog.component.scss',
})
export class CadastrarFornecedorDialogComponent implements OnChanges, OnDestroy {
  @Input({ required: true }) contratacaoUuid = '';
  @Input() cnpjsCadastrados: string[] = [];
  @Input() prefill: CadastrarFornecedorPayload | null = null;
  @Input() enriquecerAoAbrir = false;
  @Input() visible = false;
  @Output() visibleChange = new EventEmitter<boolean>();
  @Output() saved = new EventEmitter<ContratacaoFornecedorListItem>();

  salvando = false;
  buscandoCnpj = false;
  enriquecendo = false;
  formError = '';
  lookupMessage = '';
  lookupSeverity: 'info' | 'success' | 'warn' = 'info';
  touchedSubmit = false;
  redes: {
    site?: string | null;
    instagram?: string | null;
    linkedin?: string | null;
    facebook?: string | null;
  } = {};

  readonly form = this.formBuilder.group({
    cnpj: [
      '',
      [Validators.required, cnpjValidator, cnpjDuplicadoValidator(() => this.cnpjsCadastrados)],
    ],
    razao_social: ['', [Validators.required, Validators.maxLength(255)]],
    telefone: ['', [telefoneValidator, Validators.maxLength(32)]],
    email: ['', [Validators.email, Validators.maxLength(255)]],
    vendedor: ['', [Validators.required, Validators.maxLength(255)]],
  });

  private readonly cnpjLookup$ = new Subject<string>();
  private readonly destroy$ = new Subject<void>();
  private readonly enrichCancel$ = new Subject<void>();
  private skipNextCnpjLookup = false;

  constructor(
    private readonly formBuilder: FormBuilder,
    private readonly api: ContratacaoVendorListApiService,
  ) {
    this.cnpjLookup$
      .pipe(
        debounceTime(500),
        distinctUntilChanged(),
        filter((cnpj) => isValidCnpj(cnpj)),
        filter(() => !this.skipNextCnpjLookup),
        tap(() => {
          this.buscandoCnpj = true;
          this.lookupMessage = '';
        }),
        switchMap((cnpj) => this.api.buscarFornecedorPorCnpj(this.contratacaoUuid, normalizeCnpj(cnpj))),
        takeUntil(this.destroy$),
      )
      .subscribe({
        next: (result) => {
          this.buscandoCnpj = false;
          if (!result.encontrado) {
            this.lookupMessage = '';
            return;
          }

          this.preencherDoCadastro(result);
          this.lookupSeverity = 'success';
          this.lookupMessage = this.mensagemOrigem(result.origem);
        },
        error: () => {
          this.buscandoCnpj = false;
          this.lookupMessage = '';
        },
      });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['visible']?.currentValue === true) {
      this.abrirComPrefill();
    }
  }

  ngOnDestroy(): void {
    this.enrichCancel$.next();
    this.enrichCancel$.complete();
    this.destroy$.next();
    this.destroy$.complete();
  }

  onVisibleChange(visible: boolean): void {
    if (!visible) {
      this.enrichCancel$.next();
      this.enriquecendo = false;
      this.skipNextCnpjLookup = false;
    }
    this.visibleChange.emit(visible);
  }

  onCnpjInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    const formatted = formatCnpj(input.value);
    this.form.controls.cnpj.setValue(formatted, { emitEvent: false });
    input.value = formatted;
    this.lookupMessage = '';
    this.skipNextCnpjLookup = false;

    if (isValidCnpj(formatted)) {
      this.cnpjLookup$.next(formatted);
    }
  }

  onTelefoneInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    const formatted = formatTelefone(input.value);
    this.form.controls.telefone.setValue(formatted, { emitEvent: false });
    input.value = formatted;
  }

  invalid(field: keyof typeof this.form.controls): boolean {
    const control = this.form.controls[field];
    return (control.invalid && (control.touched || this.touchedSubmit)) || false;
  }

  errorMessage(field: keyof typeof this.form.controls): string {
    const control = this.form.controls[field];
    if (!control.errors) return '';

    if (field === 'cnpj') {
      if (control.errors['required']) return 'Informe o CNPJ.';
      if (control.errors['cnpjInvalid']) return 'CNPJ inválido. Verifique os dígitos.';
      if (control.errors['cnpjDuplicado']) return 'Este CNPJ já está na lista desta contratação.';
    }

    if (field === 'razao_social' && control.errors['required']) {
      return 'Informe a razão social.';
    }

    if (field === 'vendedor' && control.errors['required']) {
      return 'Informe o vendedor ou representante comercial.';
    }

    if (field === 'telefone' && control.errors['telefoneInvalid']) {
      return 'Telefone inválido. Use DDD + número (10 ou 11 dígitos).';
    }

    if (field === 'email' && control.errors['email']) {
      return 'Informe um e-mail válido.';
    }

    return 'Campo inválido.';
  }

  get temRedes(): boolean {
    return !!(this.redes.site || this.redes.instagram || this.redes.linkedin || this.redes.facebook);
  }

  salvar(): void {
    this.touchedSubmit = true;
    this.form.markAllAsTouched();
    this.formError = '';

    if (this.form.invalid || this.salvando) {
      return;
    }

    const raw = this.form.getRawValue();
    const payload: CadastrarFornecedorPayload = {
      cnpj: normalizeCnpj(raw.cnpj ?? ''),
      razao_social: (raw.razao_social ?? '').trim(),
      telefone: normalizeTelefone(raw.telefone ?? '') || undefined,
      email: (raw.email ?? '').trim() || undefined,
      vendedor: (raw.vendedor ?? '').trim(),
    };

    this.salvando = true;
    this.api.cadastrarFornecedor(this.contratacaoUuid, payload).subscribe({
      next: (fornecedor) => {
        this.salvando = false;
        this.saved.emit(fornecedor);
        this.onVisibleChange(false);
      },
      error: (err: HttpErrorResponse) => {
        this.salvando = false;
        this.formError =
          (err.error as { message?: string })?.message ?? 'Não foi possível cadastrar o fornecedor.';
      },
    });
  }

  private abrirComPrefill(): void {
    this.resetForm();
    if (this.prefill) {
      this.aplicarPrefill(this.prefill);
      if (this.enriquecerAoAbrir) {
        this.buscarEnriquecimento(this.prefill);
      }
    }
    this.form.controls.cnpj.updateValueAndValidity({ emitEvent: false });
  }

  private aplicarPrefill(data: CadastrarFornecedorPayload): void {
    this.skipNextCnpjLookup = true;
    this.form.patchValue({
      cnpj: data.cnpj ? formatCnpj(data.cnpj) : '',
      razao_social: data.razao_social ?? '',
      telefone: data.telefone ? formatTelefone(data.telefone) : '',
      email: data.email ?? '',
      vendedor: data.vendedor ?? '',
    });
    this.redes = {
      site: data.site ?? null,
      instagram: data.instagram ?? null,
      linkedin: data.linkedin ?? null,
      facebook: data.facebook ?? null,
    };
    this.lookupSeverity = 'info';
    this.lookupMessage = this.enriquecerAoAbrir
      ? 'Dados da sugestão aplicados. Buscando CNPJ e contatos públicos…'
      : 'Dados preenchidos a partir da sugestão. Revise antes de cadastrar.';
  }

  private buscarEnriquecimento(base: CadastrarFornecedorPayload): void {
    this.enrichCancel$.next();
    this.enriquecendo = true;
    this.api
      .enriquecerFornecedor(this.contratacaoUuid, {
        cnpj: base.cnpj || undefined,
        razao_social: base.razao_social || undefined,
        telefone: base.telefone || undefined,
        email: base.email || undefined,
        vendedor: base.vendedor || undefined,
        cidade: base.cidade ?? undefined,
        uf: base.uf ?? undefined,
      })
      .pipe(takeUntil(merge(this.destroy$, this.enrichCancel$)))
      .subscribe({
        next: (result) => {
          this.enriquecendo = false;
          this.aplicarEnriquecimento(result);
        },
        error: () => {
          this.enriquecendo = false;
          this.lookupSeverity = 'warn';
          this.lookupMessage =
            'Não foi possível buscar dados públicos agora. Revise e complete o cadastro manualmente.';
        },
      });
  }

  private aplicarEnriquecimento(result: FornecedorEnrichmentResponse): void {
    this.skipNextCnpjLookup = true;

    if (result.cnpj && !this.form.controls.cnpj.value?.trim()) {
      this.form.controls.cnpj.setValue(formatCnpj(result.cnpj));
    } else if (result.cnpj && !isValidCnpj(this.form.controls.cnpj.value ?? '')) {
      this.form.controls.cnpj.setValue(formatCnpj(result.cnpj));
    }

    if (result.razao_social) {
      const atual = this.form.controls.razao_social.value?.trim() ?? '';
      if (!atual || atual.length < 8 || !atual.includes(' ')) {
        this.form.controls.razao_social.setValue(result.razao_social);
      }
    }

    if (result.telefone && !this.form.controls.telefone.value?.trim()) {
      this.form.controls.telefone.setValue(formatTelefone(result.telefone));
    }
    if (result.email && !this.form.controls.email.value?.trim()) {
      this.form.controls.email.setValue(result.email);
    }
    if (result.vendedor && !this.form.controls.vendedor.value?.trim()) {
      this.form.controls.vendedor.setValue(result.vendedor);
    }

    this.redes = {
      site: result.site ?? this.redes.site ?? null,
      instagram: result.instagram ?? this.redes.instagram ?? null,
      linkedin: result.linkedin ?? this.redes.linkedin ?? null,
      facebook: result.facebook ?? this.redes.facebook ?? null,
    };

    this.form.controls.cnpj.updateValueAndValidity({ emitEvent: false });

    if (result.encontrado) {
      this.lookupSeverity = 'success';
      this.lookupMessage = result.aviso;
    } else {
      this.lookupSeverity = 'warn';
      this.lookupMessage = result.aviso;
    }
  }

  private resetForm(): void {
    this.form.reset({
      cnpj: '',
      razao_social: '',
      telefone: '',
      email: '',
      vendedor: '',
    });
    this.touchedSubmit = false;
    this.formError = '';
    this.lookupMessage = '';
    this.buscandoCnpj = false;
    this.enriquecendo = false;
    this.redes = {};
    this.skipNextCnpjLookup = false;
  }

  private preencherDoCadastro(result: {
    razao_social?: string;
    telefone?: string | null;
    email?: string | null;
    vendedor?: string | null;
  }): void {
    if (result.razao_social && !this.form.controls.razao_social.value?.trim()) {
      this.form.controls.razao_social.setValue(result.razao_social);
    }
    if (result.telefone && !this.form.controls.telefone.value?.trim()) {
      this.form.controls.telefone.setValue(formatTelefone(result.telefone));
    }
    if (result.email && !this.form.controls.email.value?.trim()) {
      this.form.controls.email.setValue(result.email);
    }
    if (result.vendedor && !this.form.controls.vendedor.value?.trim()) {
      this.form.controls.vendedor.setValue(result.vendedor);
    }
  }

  private mensagemOrigem(origem?: SugestaoFornecedorOrigem | 'brasil_api'): string {
    switch (origem) {
      case 'catalogo_tenant':
        return 'Fornecedor encontrado no catálogo da empresa. Dados preenchidos automaticamente.';
      case 'historico_tenant':
        return 'Fornecedor já utilizado em contratações anteriores. Dados preenchidos automaticamente.';
      case 'brasil_api':
        return 'Dados oficiais do CNPJ encontrados. Contatos e razão social preenchidos automaticamente.';
      default:
        return 'Dados preenchidos automaticamente.';
    }
  }
}
