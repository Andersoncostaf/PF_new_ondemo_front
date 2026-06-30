import { Component, OnDestroy, OnInit } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { MenuItem } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { MessageModule } from 'primeng/message';
import { PasswordModule } from 'primeng/password';
import { StepsModule } from 'primeng/steps';
import {
  EMPTY,
  Subject,
  debounceTime,
  distinctUntilChanged,
  switchMap,
  takeUntil,
  tap,
} from 'rxjs';

import { AuthService } from '../../../core/auth/auth.service';
import { IdentidadeApiService } from '../../../core/identidade/identidade-api.service';
import { TenantService } from '../../../core/tenant/tenant.service';
import { formatCnpj, isValidCnpj, normalizeCnpj, slugify } from './cnpj.util';

type SlugStatus = 'idle' | 'checking' | 'available' | 'unavailable' | 'invalid';

function cnpjValidator(control: AbstractControl): ValidationErrors | null {
  const value = control.value as string;
  if (!value) return null;
  return isValidCnpj(value) ? null : { cnpjInvalid: true };
}

function passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
  const password = control.get('password')?.value;
  const confirmation = control.get('password_confirmation')?.value;
  if (!password || !confirmation) return null;
  return password === confirmation ? null : { passwordMismatch: true };
}

@Component({
  selector: 'app-cadastro',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    ButtonModule,
    InputTextModule,
    PasswordModule,
    MessageModule,
    StepsModule,
  ],
  templateUrl: './cadastro.component.html',
  styleUrl: './cadastro.component.scss',
})
export class CadastroComponent implements OnInit, OnDestroy {
  activeStep = 0;
  loading = false;
  shakeForm = false;
  errorMessage = '';
  slugStatus: SlugStatus = 'idle';
  slugSuggestion: string | null = null;

  readonly steps: MenuItem[] = [
    { label: 'Empresa' },
    { label: 'Administrador' },
    { label: 'Confirmar' },
  ];

  readonly form = this.formBuilder.group(
    {
      razao_social: ['', [Validators.required, Validators.maxLength(255)]],
      cnpj: ['', [Validators.required, cnpjValidator]],
      slug: ['', [Validators.pattern(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)]],
      nome: ['', [Validators.required, Validators.maxLength(255)]],
      email: ['', [Validators.required, Validators.email]],
      cargo: [''],
      password: ['', [Validators.required, Validators.minLength(8)]],
      password_confirmation: ['', [Validators.required]],
    },
    { validators: passwordMatchValidator },
  );

  private readonly slugCheck$ = new Subject<string>();
  private readonly destroy$ = new Subject<void>();
  private slugManuallyEdited = false;

  constructor(
    private readonly formBuilder: FormBuilder,
    private readonly authService: AuthService,
    private readonly identidadeApi: IdentidadeApiService,
    readonly tenantService: TenantService,
  ) {}

  ngOnInit(): void {
    this.form.controls.razao_social.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe((value) => {
        if (this.slugManuallyEdited) return;
        const slug = slugify(value ?? '');
        this.form.controls.slug.setValue(slug, { emitEvent: true });
      });

    this.form.controls.slug.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe((value) => {
        if ((value ?? '').trim() !== '') {
          this.slugManuallyEdited = true;
        }
        this.slugCheck$.next(value ?? '');
      });

    this.slugCheck$
      .pipe(
        debounceTime(400),
        distinctUntilChanged(),
        tap(() => {
          this.slugStatus = 'checking';
          this.slugSuggestion = null;
        }),
        switchMap((raw) => {
          const slug = slugify(raw);
          if (!slug || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
            this.slugStatus = slug ? 'invalid' : 'idle';
            return EMPTY;
          }
          return this.identidadeApi.verificarSlugDisponivel(slug);
        }),
        takeUntil(this.destroy$),
      )
      .subscribe({
        next: (result) => {
          this.form.controls.slug.setValue(result.slug, { emitEvent: false });
          this.slugSuggestion = result.sugestao;
          this.slugStatus = result.disponivel ? 'available' : 'unavailable';
        },
        error: () => {
          this.slugStatus = 'idle';
        },
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  get isCadastroHost(): boolean {
    return this.tenantService.isCadastroHost();
  }

  get loginUrl(): string | null {
    const slug = this.form.controls.slug.value?.trim();
    if (!slug || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
      return null;
    }
    return `${this.tenantService.getTenantPortalUrl(slug)}/auth/login`;
  }

  get portalPreview(): string {
    const slug = this.form.controls.slug.value || 'sua-empresa';
    return `portalfornecedor.${slug}.local`;
  }

  onCnpjInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    const formatted = formatCnpj(input.value);
    this.form.controls.cnpj.setValue(formatted, { emitEvent: false });
    input.value = formatted;
  }

  applySlugSuggestion(): void {
    if (!this.slugSuggestion) return;
    this.form.controls.slug.setValue(this.slugSuggestion);
    this.slugManuallyEdited = true;
  }

  nextStep(): void {
    if (this.activeStep === 0 && !this.validateStep0()) return;
    if (this.activeStep === 1 && !this.validateStep1()) return;
    if (this.activeStep < 2) {
      this.activeStep += 1;
      this.errorMessage = '';
    }
  }

  prevStep(): void {
    if (this.activeStep > 0) {
      this.activeStep -= 1;
      this.errorMessage = '';
    }
  }

  submit(): void {
    if (!this.validateStep0() || !this.validateStep1()) {
      this.activeStep = this.form.controls.razao_social.invalid ? 0 : 1;
      this.triggerShake();
      return;
    }

    if (this.slugStatus === 'unavailable' || this.slugStatus === 'invalid') {
      this.activeStep = 0;
      this.errorMessage = 'Escolha um endereço de portal disponível.';
      this.triggerShake();
      return;
    }

    this.loading = true;
    this.errorMessage = '';
    const raw = this.form.getRawValue();

    const payload = {
      razao_social: raw.razao_social ?? '',
      cnpj: normalizeCnpj(raw.cnpj ?? ''),
      slug: raw.slug?.trim() || null,
      nome: raw.nome ?? '',
      email: raw.email ?? '',
      password: raw.password ?? '',
      password_confirmation: raw.password_confirmation ?? '',
      cargo: raw.cargo?.trim() || null,
    };

    this.authService
      .cadastro(payload)
      .subscribe({
        next: (response) => {
          this.loading = false;
          window.location.href = this.tenantService.buildPostCadastroRedirectUrl(response);
        },
        error: (err) => {
          this.loading = false;
          this.errorMessage = this.extractErrorMessage(err);
          this.triggerShake();
        },
      });
  }

  invalid(controlName: keyof typeof this.form.controls): boolean {
    const control = this.form.controls[controlName];
    return control.invalid && (control.dirty || control.touched);
  }

  private validateStep0(): boolean {
    const fields = ['razao_social', 'cnpj'] as const;
    fields.forEach((name) => this.form.controls[name].markAsTouched());
    this.form.controls.slug.markAsTouched();

    const slug = this.form.controls.slug.value?.trim() ?? '';
    if (slug && (this.slugStatus === 'unavailable' || this.slugStatus === 'checking' || this.slugStatus === 'invalid')) {
      return false;
    }

    return fields.every((name) => this.form.controls[name].valid);
  }

  private validateStep1(): boolean {
    const fields = ['nome', 'email', 'password', 'password_confirmation'] as const;
    fields.forEach((name) => this.form.controls[name].markAsTouched());
    return fields.every((name) => this.form.controls[name].valid) && !this.form.hasError('passwordMismatch');
  }

  private extractErrorMessage(err: unknown): string {
    if (err instanceof HttpErrorResponse) {
      if (err.status === 0) {
        return 'Não foi possível conectar à API. Inicie o backend: php artisan serve --port=8000 em PF_ondemo_Back.';
      }
      const body = err.error as { message?: string } | null;
      if (body?.message) {
        return body.message;
      }
    }
    return 'Não foi possível concluir o cadastro. Tente novamente.';
  }

  private triggerShake(): void {
    this.shakeForm = false;
    requestAnimationFrame(() => {
      this.shakeForm = true;
      window.setTimeout(() => {
        this.shakeForm = false;
      }, 450);
    });
  }
}
