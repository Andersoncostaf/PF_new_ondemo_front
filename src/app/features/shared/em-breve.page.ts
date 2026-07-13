import { Component } from '@angular/core';
import { CardModule } from 'primeng/card';

@Component({
  selector: 'app-em-breve-page',
  standalone: true,
  imports: [CardModule],
  template: `
    <p-card>
      <div class="em-breve">
        <i class="pi pi-clock em-breve__icon" aria-hidden="true"></i>
        <h2>Em breve</h2>
        <p>Este módulo estará disponível em uma próxima versão do Portal Fornecedor On Demand.</p>
      </div>
    </p-card>
  `,
  styles: `
    .em-breve {
      text-align: center;
      padding: 3rem 1rem;
      color: var(--text-color-secondary);
    }
    .em-breve__icon {
      font-size: 2.5rem;
      margin-bottom: 1rem;
      display: block;
    }
    h2 {
      margin: 0 0 0.5rem;
      color: var(--text-color);
    }
  `,
})
export class EmBrevePageComponent {}
