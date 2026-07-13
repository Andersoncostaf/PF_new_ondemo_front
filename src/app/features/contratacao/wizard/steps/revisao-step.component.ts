import { Component, inject } from '@angular/core';
import { ButtonModule } from 'primeng/button';

import { ContratacaoRevisaoPdfService } from '../contratacao-revisao-pdf.service';
import { ContratacaoWizardStore } from '../contratacao-wizard.store';

@Component({
  selector: 'app-revisao-step',
  standalone: true,
  imports: [ButtonModule],
  templateUrl: './revisao-step.component.html',
  styleUrl: '../contratacao-wizard.shared.scss',
})
export class RevisaoStepComponent {
  readonly store = inject(ContratacaoWizardStore);
  private readonly revisaoPdf = inject(ContratacaoRevisaoPdfService);

  gerandoPdf = false;

  baixarPdfRevisao(): void {
    this.gerandoPdf = true;

    try {
      this.revisaoPdf.gerar(this.store.buildRevisaoPdfData());
    } finally {
      this.gerandoPdf = false;
    }
  }
}
