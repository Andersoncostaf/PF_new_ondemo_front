import { DatePipe } from '@angular/common';
import { Component } from '@angular/core';
import { CardModule } from 'primeng/card';

import { AuthService } from '../../core/auth/auth.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CardModule, DatePipe],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent {
  constructor(private readonly authService: AuthService) {}

  get usuario() {
    return this.authService.getUsuario();
  }

  get tenant() {
    return this.authService.getTenant();
  }
}
