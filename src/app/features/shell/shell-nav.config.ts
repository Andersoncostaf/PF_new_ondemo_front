/** Ícones PrimeIcons por código de módulo (API não expõe ícone ainda). */
export const SHELL_NAV_ICONS: Record<string, string> = {
  contratacao: 'pi pi-file-edit',
  contratacao_aprovacao: 'pi pi-check-square',
  admin_usuarios: 'pi pi-users',
  nota_fiscal: 'pi pi-file',
  auditoria: 'pi pi-shield',
};

export const SHELL_HOME_ICON = 'pi pi-home';

export function shellNavIcon(codigo: string): string {
  return SHELL_NAV_ICONS[codigo] ?? 'pi pi-box';
}

export function shellNavBadge(_codigo: string): number | null {
  return null;
}
