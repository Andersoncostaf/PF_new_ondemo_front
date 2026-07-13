import { Component, ElementRef, inject, ViewChild } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';

import {
  CONTRATACAO_ANEXO_MAX_BYTES,
  formatAnexoTamanho,
} from '../../contratacao-anexo.constants';
import { ContratacaoWizardStore } from '../contratacao-wizard.store';

@Component({
  selector: 'app-anexos-step',
  standalone: true,
  imports: [ReactiveFormsModule, ButtonModule, InputTextModule],
  templateUrl: './anexos-step.component.html',
  styleUrl: './anexos-step.component.scss',
})
export class AnexosStepComponent {
  readonly store = inject(ContratacaoWizardStore);
  readonly anexoLimiteLabel = formatAnexoTamanho(CONTRATACAO_ANEXO_MAX_BYTES);

  @ViewChild('anexoFileInput') private anexoFileInput?: ElementRef<HTMLInputElement>;

  arrastando = false;

  abrirSeletorArquivo(): void {
    if (this.store.readOnly) {
      return;
    }

    this.anexoFileInput?.nativeElement.click();
  }

  onArquivoInputChange(event: Event): void {
    this.store.onAnexoFileSelected(event);
    const input = event.target as HTMLInputElement;
    input.value = '';
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    if (!this.store.readOnly) {
      this.arrastando = true;
    }
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.arrastando = false;
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.arrastando = false;

    if (this.store.readOnly) {
      return;
    }

    const file = event.dataTransfer?.files?.[0] ?? null;
    this.store.definirAnexoArquivo(file);
  }
}
