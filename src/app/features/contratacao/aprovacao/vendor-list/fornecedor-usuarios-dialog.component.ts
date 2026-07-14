import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { DropdownModule } from 'primeng/dropdown';
import { InputTextModule } from 'primeng/inputtext';
import { MessageModule } from 'primeng/message';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';

import {
  formatTelefone,
  isValidTelefone,
  normalizeTelefone,
} from '../../../../core/utils/br/br-document.util';
import { ContratacaoVendorListApiService } from './contratacao-vendor-list-api.service';
import {
  ContratacaoFornecedorListItem,
  FornecedorUsuario,
  FornecedorUsuarioPerfil,
} from '../../contratacao.models';

@Component({
  selector: 'app-fornecedor-usuarios-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ButtonModule,
    DialogModule,
    DropdownModule,
    InputTextModule,
    MessageModule,
    ProgressSpinnerModule,
    TableModule,
    TagModule,
  ],
  templateUrl: './fornecedor-usuarios-dialog.component.html',
  styleUrl: './fornecedor-usuarios-dialog.component.scss',
})
export class FornecedorUsuariosDialogComponent implements OnChanges {
  @Input() visible = false;
  @Input({ required: true }) contratacaoUuid = '';
  @Input() fornecedor: ContratacaoFornecedorListItem | null = null;
  @Input() readonly = false;
  @Output() visibleChange = new EventEmitter<boolean>();
  @Output() error = new EventEmitter<string>();
  @Output() success = new EventEmitter<string>();

  loading = false;
  salvando = false;
  inativandoUuid: string | null = null;
  usuarios: FornecedorUsuario[] = [];
  formError = '';

  readonly perfis: { label: string; value: FornecedorUsuarioPerfil }[] = [
    { label: 'Padrão', value: 'PADRAO' },
    { label: 'Admin', value: 'ADMIN' },
  ];

  readonly form = this.fb.group({
    nome: ['', [Validators.required, Validators.maxLength(255)]],
    email: ['', [Validators.required, Validators.email, Validators.maxLength(255)]],
    telefone: ['', [Validators.maxLength(32)]],
    perfil: ['PADRAO' as FornecedorUsuarioPerfil, Validators.required],
  });

  constructor(
    private readonly fb: FormBuilder,
    private readonly api: ContratacaoVendorListApiService,
  ) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['visible']?.currentValue === true && this.fornecedor) {
      this.resetForm();
      this.carregar();
    }
  }

  onVisibleChange(visible: boolean): void {
    this.visibleChange.emit(visible);
    if (!visible) {
      this.formError = '';
      this.usuarios = [];
    }
  }

  get titulo(): string {
    return this.fornecedor
      ? `Usuários — ${this.fornecedor.razao_social}`
      : 'Usuários do fornecedor';
  }

  get ativos(): FornecedorUsuario[] {
    return this.usuarios.filter((u) => u.ativo);
  }

  carregar(): void {
    if (!this.fornecedor) return;
    this.loading = true;
    this.formError = '';
    this.api.listarUsuariosFornecedor(this.contratacaoUuid, this.fornecedor.uuid).subscribe({
      next: (res) => {
        this.usuarios = res.data ?? [];
        this.loading = false;
      },
      error: (err) => {
        this.loading = false;
        this.formError =
          (err.error as { message?: string })?.message ??
          'Não foi possível carregar os usuários do fornecedor.';
      },
    });
  }

  onTelefoneInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    const formatted = formatTelefone(input.value);
    this.form.controls.telefone.setValue(formatted, { emitEvent: false });
    input.value = formatted;
  }

  cadastrar(): void {
    if (this.readonly || !this.fornecedor || this.salvando) return;
    this.form.markAllAsTouched();
    this.formError = '';

    const telefone = this.form.controls.telefone.value?.trim() ?? '';
    if (telefone && !isValidTelefone(telefone)) {
      this.formError = 'Telefone inválido. Use DDD + número.';
      return;
    }

    if (this.form.invalid) return;

    const raw = this.form.getRawValue();
    this.salvando = true;
    this.api
      .cadastrarUsuarioFornecedor(this.contratacaoUuid, this.fornecedor.uuid, {
        nome: (raw.nome ?? '').trim(),
        email: (raw.email ?? '').trim(),
        telefone: normalizeTelefone(raw.telefone ?? '') || null,
        perfil: raw.perfil as FornecedorUsuarioPerfil,
      })
      .subscribe({
        next: (usuario) => {
          this.salvando = false;
          this.usuarios = [...this.usuarios, usuario];
          this.resetForm();
          this.success.emit(`Usuário ${usuario.nome} cadastrado.`);
        },
        error: (err) => {
          this.salvando = false;
          this.formError =
            (err.error as { message?: string })?.message ??
            'Não foi possível cadastrar o usuário.';
        },
      });
  }

  inativar(usuario: FornecedorUsuario): void {
    if (this.readonly || !this.fornecedor || this.inativandoUuid || !usuario.ativo) return;

    this.inativandoUuid = usuario.uuid;
    this.formError = '';
    this.api
      .inativarUsuarioFornecedor(this.contratacaoUuid, this.fornecedor.uuid, usuario.uuid)
      .subscribe({
        next: (atualizado) => {
          this.inativandoUuid = null;
          this.usuarios = this.usuarios.map((u) =>
            u.uuid === atualizado.uuid ? atualizado : u,
          );
          this.success.emit(`Usuário ${atualizado.nome} inativado.`);
        },
        error: (err) => {
          this.inativandoUuid = null;
          this.formError =
            (err.error as { message?: string })?.message ??
            'Não foi possível inativar o usuário.';
        },
      });
  }

  formatarTelefone(value?: string | null): string {
    if (!value) return '—';
    return formatTelefone(value);
  }

  labelPerfil(perfil: string): string {
    return perfil === 'ADMIN' ? 'Admin' : 'Padrão';
  }

  private resetForm(): void {
    this.form.reset({
      nome: '',
      email: '',
      telefone: '',
      perfil: 'PADRAO',
    });
    this.formError = '';
  }
}
