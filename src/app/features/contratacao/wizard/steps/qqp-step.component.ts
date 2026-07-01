import { Component, inject } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { InputTextareaModule } from 'primeng/inputtextarea';

import { ContratacaoWizardStore } from '../contratacao-wizard.store';

@Component({
  selector: 'app-qqp-step',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    ButtonModule,
    InputNumberModule,
    InputTextModule,
    InputTextareaModule,
  ],
  templateUrl: './qqp-step.component.html',
})
export class QqpStepComponent {
  readonly store = inject(ContratacaoWizardStore);
}
