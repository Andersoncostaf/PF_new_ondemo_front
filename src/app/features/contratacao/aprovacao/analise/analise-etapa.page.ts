import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AnaliseContratacaoStore } from './analise-contratacao.store';

@Component({
  selector: 'app-analise-etapa-page',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './analise-etapa.page.html',
  styleUrl: './analise-etapa.page.scss',
})
export class AnaliseEtapaPageComponent {
  readonly store = inject(AnaliseContratacaoStore);
}
