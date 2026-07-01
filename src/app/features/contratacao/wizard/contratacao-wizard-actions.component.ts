import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';

import { ContratacaoWizardStore } from './contratacao-wizard.store';

@Component({
  selector: 'app-contratacao-wizard-actions',
  standalone: true,
  imports: [RouterLink, ButtonModule],
  templateUrl: './contratacao-wizard-actions.component.html',
})
export class ContratacaoWizardActionsComponent {
  readonly store = inject(ContratacaoWizardStore);
}
