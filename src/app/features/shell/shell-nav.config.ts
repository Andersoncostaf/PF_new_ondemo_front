/** Ícones PrimeIcons por código de módulo (API não expõe ícone ainda). */
export const SHELL_NAV_ICONS: Record<string, string> = {
  contratacao: 'pi pi-file-edit',
};

/** Contadores mock — TODO: substituir por API quando existir. */
export const SHELL_NAV_BADGE_PLACEHOLDERS: Record<string, number> = {
  contratacao: 3,
};

export const SHELL_HOME_ICON = 'pi pi-home';

export function shellNavIcon(codigo: string): string {
  return SHELL_NAV_ICONS[codigo] ?? 'pi pi-box';
}

export function shellNavBadge(codigo: string): number | null {
  return SHELL_NAV_BADGE_PLACEHOLDERS[codigo] ?? null;
}
