import { Component, inject } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';

import { ContratacaoWizardStore } from '../contratacao-wizard.store';

@Component({
  selector: 'app-anexos-step',
  standalone: true,
  imports: [ReactiveFormsModule, ButtonModule, InputTextModule],
  templateUrl: './anexos-step.component.html',
})
export class AnexosStepComponent {
  readonly store = inject(ContratacaoWizardStore);
}
