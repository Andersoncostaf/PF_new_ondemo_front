import {
  ResolvedTheme,
  THEME_HREF,
  THEME_STORAGE_KEY,
  ThemePreference,
} from './theme.types';

function isThemePreference(value: string | null): value is ThemePreference {
  return value === 'light' || value === 'dark' || value === 'system';
}

export function readThemePreference(): ThemePreference {
  try {
    const stored = localStorage.getItem(THEME_STORAGE_KEY);
    if (isThemePreference(stored)) {
      return stored;
    }
  } catch {
    // localStorage may be unavailable (private mode / SSR edge cases)
  }
  return 'system';
}

export function resolveTheme(preference: ThemePreference): ResolvedTheme {
  if (preference === 'light' || preference === 'dark') {
    return preference;
  }
  if (typeof window !== 'undefined' && window.matchMedia) {
    return window.matchMedia('(prefers-color-scheme: dark)').matches
      ? 'dark'
      : 'light';
  }
  return 'light';
}

/** Apply theme to DOM before Angular bootstrap to avoid FOUC. */
export function applyThemeToDom(resolved: ResolvedTheme): void {
  const root = document.documentElement;
  root.dataset['theme'] = resolved;
  root.style.colorScheme = resolved;

  let link = document.getElementById('app-theme') as HTMLLinkElement | null;
  if (!link) {
    link = document.createElement('link');
    link.id = 'app-theme';
    link.rel = 'stylesheet';
    document.head.appendChild(link);
  }
  const href = THEME_HREF[resolved];
  if (link.getAttribute('href') !== href) {
    link.setAttribute('href', href);
  }
}

export function initThemeBeforeBootstrap(): ResolvedTheme {
  const preference = readThemePreference();
  const resolved = resolveTheme(preference);
  applyThemeToDom(resolved);
  return resolved;
}
