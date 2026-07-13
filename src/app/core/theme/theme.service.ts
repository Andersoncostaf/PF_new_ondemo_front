import { Injectable, Injector, OnDestroy, inject, signal } from '@angular/core';

import { AuthService } from '../auth/auth.service';
import { IdentidadeApiService } from '../identidade/identidade-api.service';
import { UsuarioPreferencias } from '../identidade/identidade.models';
import {
  applyThemeToDom,
  readThemePreference,
  resolveTheme,
} from './theme-init';
import {
  ResolvedTheme,
  THEME_STORAGE_KEY,
  ThemePreference,
} from './theme.types';

const THEME_VALUES: ReadonlySet<ThemePreference> = new Set(['light', 'dark', 'system']);

@Injectable({ providedIn: 'root' })
export class ThemeService implements OnDestroy {
  private readonly identidadeApi = inject(IdentidadeApiService);
  private readonly injector = inject(Injector);

  private readonly preferenceSignal = signal<ThemePreference>(
    readThemePreference(),
  );
  private readonly resolvedSignal = signal<ResolvedTheme>(
    resolveTheme(readThemePreference()),
  );

  readonly preference = this.preferenceSignal.asReadonly();
  readonly resolved = this.resolvedSignal.asReadonly();

  private mediaQuery: MediaQueryList | null = null;
  private readonly onSystemChange = (): void => {
    if (this.preferenceSignal() === 'system') {
      this.applyResolved(resolveTheme('system'));
    }
  };

  constructor() {
    this.syncFromStorage();
    if (typeof window !== 'undefined' && window.matchMedia) {
      this.mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      this.mediaQuery.addEventListener('change', this.onSystemChange);
    }
  }

  ngOnDestroy(): void {
    this.mediaQuery?.removeEventListener('change', this.onSystemChange);
  }

  setPreference(preference: ThemePreference, options?: { persist?: boolean }): void {
    this.preferenceSignal.set(preference);
    try {
      localStorage.setItem(THEME_STORAGE_KEY, preference);
    } catch {
      // ignore quota / private mode errors
    }
    this.applyResolved(resolveTheme(preference));

    if (options?.persist !== false) {
      this.persistToServer(preference);
    }
  }

  /** Apply theme from authenticated user preferencias (login / me). Does not PATCH back. */
  applyFromUsuario(preferencias?: UsuarioPreferencias | null): void {
    const theme = preferencias?.theme;
    if (theme && THEME_VALUES.has(theme)) {
      this.setPreference(theme, { persist: false });
    }
  }

  /** Re-read storage (e.g. after login sync from server). */
  syncFromStorage(): void {
    const preference = readThemePreference();
    this.preferenceSignal.set(preference);
    this.applyResolved(resolveTheme(preference));
  }

  logoHorizontalSrc(): string {
    return this.resolvedSignal() === 'dark'
      ? 'assets/branding/logo-inverted.png'
      : 'assets/branding/logo-horizontal.png';
  }

  private persistToServer(preference: ThemePreference): void {
    const auth = this.injector.get(AuthService);
    if (!auth.isAuthenticated()) {
      return;
    }

    this.identidadeApi.patchPreferencias({ theme: preference }).subscribe({
      error: () => {
        // fire-and-forget: local preference already applied
      },
    });
  }

  private applyResolved(resolved: ResolvedTheme): void {
    this.resolvedSignal.set(resolved);
    applyThemeToDom(resolved);
  }
}
