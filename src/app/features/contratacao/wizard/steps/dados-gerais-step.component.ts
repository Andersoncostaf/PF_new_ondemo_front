import { Component, inject } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';

import { ContratacaoWizardStore } from '../contratacao-wizard.store';

@Component({
  selector: 'app-dados-gerais-step',
  standalone: true,
  imports: [ReactiveFormsModule, InputTextModule],
  templateUrl: './dados-gerais-step.component.html',
})
export class DadosGeraisStepComponent {
  readonly store = inject(ContratacaoWizardStore);
}
