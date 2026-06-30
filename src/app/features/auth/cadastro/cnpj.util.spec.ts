import { normalizeCnpj, isValidCnpj, slugify } from './cnpj.util';

describe('cnpj.util', () => {
  it('formata e normaliza cnpj', () => {
    expect(normalizeCnpj('11.222.333/0001-81')).toBe('11222333000181');
  });

  it('valida cnpj conhecido de teste', () => {
    expect(isValidCnpj('11222333000181')).toBe(true);
  });

  it('rejeita cnpj invalido', () => {
    expect(isValidCnpj('11111111111111')).toBe(false);
  });

  it('slugify remove acentos e espacos', () => {
    expect(slugify('Minha PME Ltda')).toBe('minha-pme-ltda');
  });
});
