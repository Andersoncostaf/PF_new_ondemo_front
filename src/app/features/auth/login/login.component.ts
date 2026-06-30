import { Component, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { MessageModule } from 'primeng/message';

import { AuthService } from '../../../core/auth/auth.service';
import { TenantService } from '../../../core/tenant/tenant.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    ButtonModule,
    InputTextModule,
    PasswordModule,
    MessageModule,
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent implements OnInit {
  errorMessage = '';
  loading = false;
  shakeForm = false;

  readonly form = this.formBuilder.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]],
  });

  constructor(
    private readonly formBuilder: FormBuilder,
    private readonly authService: AuthService,
    private readonly tenantService: TenantService,
    private readonly router: Router,
  ) {}

  ngOnInit(): void {
    if (this.tenantService.isCadastroHost()) {
      void this.router.navigate(['/auth/cadastro']);
    }
  }

  get cadastroUrl(): string {
    return this.tenantService.getCadastroPortalUrl();
  }

  get showCadastroLink(): boolean {
    if (this.tenantService.isCadastroHost()) {
      return false;
    }
    return !!this.tenantSlug || this.tenantService.isLocalDevHost();
  }

  get tenantSlug(): string | null {
    return this.tenantService.getSlug();
  }

  get emailInvalid(): boolean {
    const control = this.form.controls.email;
    return control.invalid && (control.dirty || control.touched);
  }

  get passwordInvalid(): boolean {
    const control = this.form.controls.password;
    return control.invalid && (control.dirty || control.touched);
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.triggerShake();
      return;
    }

    this.loading = true;
    this.errorMessage = '';

    const { email, password } = this.form.getRawValue();

    this.authService.login(email, password).subscribe({
      next: () => {
        this.loading = false;
        void this.router.navigate(['/home']);
      },
      error: () => {
        this.loading = false;
        this.errorMessage = 'Credenciais inválidas. Verifique e-mail e senha.';
        this.triggerShake();
      },
    });
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
