import {
  SHELL_NAV_BADGE_PLACEHOLDERS,
  SHELL_NAV_ICONS,
  shellNavBadge,
  shellNavIcon,
} from './shell-nav.config';

describe('shell-nav.config', () => {
  it('define icone para contratacao', () => {
    expect(SHELL_NAV_ICONS['contratacao']).toBe('pi pi-file-edit');
    expect(shellNavIcon('contratacao')).toBe('pi pi-file-edit');
  });

  it('retorna fallback para modulo desconhecido', () => {
    expect(shellNavIcon('inexistente')).toBe('pi pi-box');
  });

  it('expoe badge placeholder para contratacao', () => {
    expect(SHELL_NAV_BADGE_PLACEHOLDERS['contratacao']).toBe(3);
    expect(shellNavBadge('contratacao')).toBe(3);
  });

  it('retorna null quando nao ha badge placeholder', () => {
    expect(shellNavBadge('inexistente')).toBeNull();
  });
});
