export type ThemePreference = 'light' | 'dark' | 'system';
export type ResolvedTheme = 'light' | 'dark';

export const THEME_STORAGE_KEY = 'pf_theme_preference';

export const THEME_HREF: Record<ResolvedTheme, string> = {
  light: 'assets/themes/lara-light-blue/theme.css',
  dark: 'assets/themes/lara-dark-blue/theme.css',
};
