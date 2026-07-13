import { Component, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { DialogModule } from 'primeng/dialog';
import { DropdownModule } from 'primeng/dropdown';
import { InputTextModule } from 'primeng/inputtext';
import { MessageModule } from 'primeng/message';
import { PasswordModule } from 'primeng/password';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';

import {
  AdminUsuariosApiService,
  ColaboradorItem,
  PERFIS_OPERACIONAIS,
} from '../../../core/identidade/admin-usuarios-api.service';

@Component({
  selector: 'app-admin-usuarios-page',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    ButtonModule,
    CardModule,
    DialogModule,
    DropdownModule,
    InputTextModule,
    MessageModule,
    PasswordModule,
    TableModule,
    TagModule,
  ],
  templateUrl: './admin-usuarios.page.html',
  styleUrl: './admin-usuarios.page.scss',
})
export class AdminUsuariosPageComponent implements OnInit {
  colaboradores: ColaboradorItem[] = [];
  loading = false;
  errorMessage = '';
  successMessage = '';

  dialogVisible = false;
  saving = false;
  editando: ColaboradorItem | null = null;

  readonly perfis = PERFIS_OPERACIONAIS;

  readonly form = this.fb.group({
    nome: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    password: [''],
    perfil: ['area', Validators.required],
    cargo: [''],
    status: ['ativo'],
  });

  constructor(
    private readonly fb: FormBuilder,
    private readonly adminApi: AdminUsuariosApiService,
  ) {}

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading = true;
    this.errorMessage = '';
    this.adminApi.listar().subscribe({
      next: (response) => {
        this.colaboradores = response.data.filter((c) => c.perfil !== 'admin_tenant');
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.errorMessage = 'Não foi possível carregar os colaboradores.';
      },
    });
  }

  abrirNovo(): void {
    this.editando = null;
    this.form.reset({
      nome: '',
      email: '',
      password: '',
      perfil: 'area',
      cargo: '',
      status: 'ativo',
    });
    this.form.controls.password.setValidators([Validators.required, Validators.minLength(8)]);
    this.dialogVisible = true;
  }

  abrirEditar(colaborador: ColaboradorItem): void {
    this.editando = colaborador;
    this.form.reset({
      nome: colaborador.nome,
      email: colaborador.email,
      password: '',
      perfil: colaborador.perfil,
      cargo: colaborador.cargo ?? '',
      status: colaborador.status,
    });
    this.form.controls.password.clearValidators();
    this.form.controls.password.updateValueAndValidity();
    this.dialogVisible = true;
  }

  salvar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.saving = true;
    this.errorMessage = '';
    this.successMessage = '';
    const value = this.form.getRawValue();

    if (this.editando) {
      this.adminApi
        .atualizar(this.editando.id, {
          nome: value.nome ?? undefined,
          perfil: value.perfil ?? undefined,
          cargo: value.cargo || null,
          status: value.status ?? undefined,
        })
        .subscribe({
          next: () => this.onSalvo('Colaborador atualizado.'),
          error: (err) => this.onErro(err),
        });
      return;
    }

    this.adminApi
      .convidar({
        nome: value.nome!,
        email: value.email!,
        password: value.password!,
        perfil: value.perfil!,
        cargo: value.cargo || null,
      })
      .subscribe({
        next: () => this.onSalvo('Colaborador convidado com sucesso.'),
        error: (err) => this.onErro(err),
      });
  }

  perfilLabel(perfil: string): string {
    return PERFIS_OPERACIONAIS.find((p) => p.value === perfil)?.label ?? perfil;
  }

  private onSalvo(message: string): void {
    this.saving = false;
    this.dialogVisible = false;
    this.successMessage = message;
    this.load();
  }

  private onErro(err: HttpErrorResponse): void {
    this.saving = false;
    this.errorMessage =
      (err.error as { message?: string })?.message ?? 'Não foi possível salvar o colaborador.';
  }
}
