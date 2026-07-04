import { Component, inject } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { AccordionModule } from 'primeng/accordion';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { ProgressBarModule } from 'primeng/progressbar';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';

import { ContratacaoWizardStore } from '../contratacao-wizard.store';
import { TrCampoEditorComponent } from './tr-campo-editor.component';

@Component({
  selector: 'app-tr-step',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    AccordionModule,
    ButtonModule,
    InputTextModule,
    ProgressBarModule,
    TagModule,
    TooltipModule,
    TrCampoEditorComponent,
  ],
  templateUrl: './tr-step.component.html',
  styleUrl: '../contratacao-wizard.shared.scss',
})
export class TrStepComponent {
  readonly store = inject(ContratacaoWizardStore);
}
