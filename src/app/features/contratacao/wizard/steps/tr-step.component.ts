import { Component, inject } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { AccordionModule } from 'primeng/accordion';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { ProgressBarModule } from 'primeng/progressbar';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';

import { ContratacaoWizardStore } from '../contratacao-wizard.store';

@Component({
  selector: 'app-tr-step',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    AccordionModule,
    ButtonModule,
    InputTextModule,
    InputTextareaModule,
    ProgressBarModule,
    TagModule,
    TooltipModule,
  ],
  templateUrl: './tr-step.component.html',
})
export class TrStepComponent {
  readonly store = inject(ContratacaoWizardStore);
}
