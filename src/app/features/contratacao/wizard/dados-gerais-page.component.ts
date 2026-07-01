import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { CardModule } from 'primeng/card';
import { MessageModule } from 'primeng/message';

import { ContratacaoWizardActionsComponent } from './contratacao-wizard-actions.component';
import { ContratacaoWizardStore } from './contratacao-wizard.store';
import { DadosGeraisStepComponent } from './steps/dados-gerais-step.component';
import { FIRST_STEP_SLUG } from './contratacao-wizard.steps';

@Component({
  selector: 'app-dados-gerais-page',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    CardModule,
    MessageModule,
    DadosGeraisStepComponent,
    ContratacaoWizardActionsComponent,
  ],
  templateUrl: './dados-gerais-page.component.html',
  styleUrl: './contratacao-wizard.shared.scss',
})
export class DadosGeraisPageComponent implements OnInit {
  readonly store = inject(ContratacaoWizardStore);

  ngOnInit(): void {
    this.store.setCurrentSlug(FIRST_STEP_SLUG);
    this.store.initStandalone();
  }
}
