import { Component, inject } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { InputTextareaModule } from 'primeng/inputtextarea';

import { ContratacaoWizardStore } from '../contratacao-wizard.store';

@Component({
  selector: 'app-solicitacao-servico-step',
  standalone: true,
  imports: [ReactiveFormsModule, InputTextModule, InputTextareaModule],
  templateUrl: './solicitacao-servico-step.component.html',
})
export class SolicitacaoServicoStepComponent {
  readonly store = inject(ContratacaoWizardStore);
}
