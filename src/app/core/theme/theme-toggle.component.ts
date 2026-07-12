import { Component, inject, input } from '@angular/core';
import { TooltipModule } from 'primeng/tooltip';

import { ThemeService } from './theme.service';
import { ThemePreference } from './theme.types';

@Component({
  selector: 'app-theme-toggle',
  standalone: true,
  imports: [TooltipModule],
  template: `
    <div
      class="theme-toggle"
      [class.theme-toggle--compact]="compact()"
      role="group"
      aria-label="Tema da interface"
    >
      @for (option of options; track option.value) {
        <button
          type="button"
          class="theme-toggle__btn"
          [class.theme-toggle__btn--active]="preference() === option.value"
          [attr.aria-pressed]="preference() === option.value"
          [attr.aria-label]="option.label"
          [pTooltip]="option.label"
          tooltipPosition="top"
          (click)="select(option.value)"
        >
          <i [class]="option.icon" aria-hidden="true"></i>
          @if (!compact()) {
            <span class="theme-toggle__label">{{ option.label }}</span>
          }
        </button>
      }
    </div>
  `,
  styles: [
    `
      .theme-toggle {
        display: flex;
        gap: 0.25rem;
        padding: 0.25rem;
        border-radius: 0.5rem;
        background: var(--surface-ground, #f4f6f8);
        border: 1px solid var(--surface-border, #dfe7ef);
      }

      .theme-toggle__btn {
        flex: 1;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 0.35rem;
        min-height: 2rem;
        padding: 0.35rem 0.5rem;
        border: none;
        border-radius: 0.375rem;
        background: transparent;
        color: var(--text-color-secondary, #64748b);
        font-family: inherit;
        font-size: 0.75rem;
        font-weight: 500;
        cursor: pointer;
        transition:
          background 0.15s ease,
          color 0.15s ease;
      }

      .theme-toggle__btn:hover {
        color: var(--text-color, #334155);
        background: var(--surface-hover, rgba(0, 0, 0, 0.04));
      }

      .theme-toggle__btn--active {
        background: var(--surface-card, #fff);
        color: var(--primary-color, #3b82f6);
        box-shadow: 0 1px 2px rgba(15, 23, 42, 0.08);
      }

      .theme-toggle__btn i {
        font-size: 0.875rem;
      }

      .theme-toggle--compact .theme-toggle__btn {
        flex: 0 0 auto;
        min-width: 2rem;
        padding: 0.35rem;
      }

      @media (prefers-reduced-motion: reduce) {
        .theme-toggle__btn {
          transition: none;
        }
      }
    `,
  ],
})
export class ThemeToggleComponent {
  private readonly themeService = inject(ThemeService);

  /** Compact = icons only (auth pages). */
  readonly compact = input(false);

  readonly preference = this.themeService.preference;

  readonly options: ReadonlyArray<{
    value: ThemePreference;
    label: string;
    icon: string;
  }> = [
    { value: 'light', label: 'Claro', icon: 'pi pi-sun' },
    { value: 'dark', label: 'Escuro', icon: 'pi pi-moon' },
    { value: 'system', label: 'Sistema', icon: 'pi pi-desktop' },
  ];

  select(preference: ThemePreference): void {
    this.themeService.setPreference(preference);
  }
}
