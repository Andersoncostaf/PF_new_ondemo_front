import { Component } from '@angular/core';
import { CardModule } from 'primeng/card';

@Component({
  selector: 'app-contratacao-placeholder',
  standalone: true,
  imports: [CardModule],
  templateUrl: './contratacao-placeholder.component.html',
  styleUrl: './contratacao-placeholder.component.scss',
})
export class ContratacaoPlaceholderComponent {}
