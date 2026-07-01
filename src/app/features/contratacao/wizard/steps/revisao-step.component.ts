import { Component, inject } from '@angular/core';

import { ContratacaoWizardStore } from '../contratacao-wizard.store';

@Component({
  selector: 'app-revisao-step',
  standalone: true,
  templateUrl: './revisao-step.component.html',
  styleUrl: '../contratacao-wizard.shared.scss',
})
export class RevisaoStepComponent {
  readonly store = inject(ContratacaoWizardStore);
}
