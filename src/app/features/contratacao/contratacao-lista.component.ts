import { Component, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { MessageModule } from 'primeng/message';

import { ContratacaoApiService } from './contratacao-api.service';
import { ContratacaoListItem } from './contratacao.models';

@Component({
  selector: 'app-contratacao-lista',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    ButtonModule,
    CardModule,
    TableModule,
    TagModule,
    MessageModule,
  ],
  templateUrl: './contratacao-lista.component.html',
  styleUrl: './contratacao-lista.component.scss',
})
export class ContratacaoListaComponent implements OnInit {
  contratacoes: ContratacaoListItem[] = [];
  loading = false;
  errorMessage = '';

  constructor(
    private readonly contratacaoApi: ContratacaoApiService,
    private readonly router: Router,
  ) {}

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading = true;
    this.errorMessage = '';

    this.contratacaoApi.list().subscribe({
      next: (response) => {
        this.contratacoes = response.data;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.errorMessage = 'Não foi possível carregar as solicitações.';
      },
    });
  }

  statusLabel(status: string): string {
    return status === 'submetido' ? 'Submetido' : 'Rascunho';
  }

  statusSeverity(status: string): 'success' | 'warning' {
    return status === 'submetido' ? 'success' : 'warning';
  }

  abrir(contratacao: ContratacaoListItem): void {
    void this.router.navigate(['/contratacao', contratacao.uuid, 'editar']);
  }

  nova(): void {
    void this.router.navigate(['/contratacao', 'nova']);
  }
}
