import { Component, EventEmitter, Input, OnDestroy, Output } from '@angular/core';
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
export class CadastrarFornecedorDialogComponent implements OnDestroy {
  @Input({ required: true }) contratacaoUuid = '';
  @Input() cnpjsCadastrados: string[] = [];
  @Input() prefill: CadastrarFornecedorPayload | null = null;
  @Input() visible = false;
  @Output() visibleChange = new EventEmitter<boolean>();
  @Output() saved = new EventEmitter<ContratacaoFornecedorListItem>();

  salvando = false;
  buscandoCnpj = false;
  formError = '';
  lookupMessage = '';
  lookupSeverity: 'info' | 'success' = 'info';
  touchedSubmit = false;

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

  constructor(
    private readonly formBuilder: FormBuilder,
    private readonly api: ContratacaoVendorListApiService,
  ) {
    this.cnpjLookup$
      .pipe(
        debounceTime(500),
        distinctUntilChanged(),
        filter((cnpj) => isValidCnpj(cnpj)),
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

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onVisibleChange(visible: boolean): void {
    if (visible) {
      this.resetForm();
      if (this.prefill) {
        this.aplicarPrefill(this.prefill);
      }
      this.form.controls.cnpj.updateValueAndValidity();
    }
    this.visibleChange.emit(visible);
  }

  onCnpjInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    const formatted = formatCnpj(input.value);
    this.form.controls.cnpj.setValue(formatted, { emitEvent: false });
    input.value = formatted;
    this.lookupMessage = '';

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

  private aplicarPrefill(data: CadastrarFornecedorPayload): void {
    this.form.patchValue({
      cnpj: data.cnpj ? formatCnpj(data.cnpj) : '',
      razao_social: data.razao_social ?? '',
      telefone: data.telefone ? formatTelefone(data.telefone) : '',
      email: data.email ?? '',
      vendedor: data.vendedor ?? '',
    });
    this.lookupSeverity = 'info';
    this.lookupMessage = 'Dados preenchidos a partir da sugestão. Revise antes de cadastrar.';
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
  }

  private preencherDoCadastro(result: {
    razao_social?: string;
    telefone?: string | null;
    email?: string | null;
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
  }

  private mensagemOrigem(origem?: SugestaoFornecedorOrigem): string {
    switch (origem) {
      case 'catalogo_tenant':
        return 'Fornecedor encontrado no catálogo da empresa. Dados preenchidos automaticamente.';
      case 'historico_tenant':
        return 'Fornecedor já utilizado em contratações anteriores. Dados preenchidos automaticamente.';
      default:
        return 'Dados preenchidos automaticamente.';
    }
  }
}
