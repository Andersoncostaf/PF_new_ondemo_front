import { Component, Input } from '@angular/core';

import { AUTH_HERO_CONFIG, AuthHeroVariant } from '../auth-hero.config';

@Component({
  selector: 'app-auth-hero-panel',
  standalone: true,
  templateUrl: './auth-hero-panel.component.html',
  styleUrl: './auth-hero-panel.component.scss',
})
export class AuthHeroPanelComponent {
  @Input({ required: true }) variant!: AuthHeroVariant;

  get config() {
    return AUTH_HERO_CONFIG[this.variant];
  }
}
