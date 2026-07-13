/** Normaliza CNPJ para 14 dígitos. */
export function normalizeCnpj(value: string): string {
  return value.replace(/\D/g, '').slice(0, 14);
}

/** Formata CNPJ enquanto digita: 00.000.000/0000-00 */
export function formatCnpj(value: string): string {
  const digits = normalizeCnpj(value);
  if (digits.length <= 2) return digits;
  if (digits.length <= 5) return `${digits.slice(0, 2)}.${digits.slice(2)}`;
  if (digits.length <= 8) return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5)}`;
  if (digits.length <= 12) {
    return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5, 8)}/${digits.slice(8)}`;
  }
  return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5, 8)}/${digits.slice(8, 12)}-${digits.slice(12)}`;
}

/** Validação de CNPJ (dígitos verificadores). */
export function isValidCnpj(value: string): boolean {
  const cnpj = normalizeCnpj(value);
  if (cnpj.length !== 14 || /^(\d)\1+$/.test(cnpj)) return false;

  const calcDigit = (base: string, factors: number[]): number => {
    const sum = base.split('').reduce((acc, digit, i) => acc + Number(digit) * factors[i], 0);
    const mod = sum % 11;
    return mod < 2 ? 0 : 11 - mod;
  };

  const d1 = calcDigit(cnpj.slice(0, 12), [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]);
  const d2 = calcDigit(cnpj.slice(0, 12) + d1, [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]);

  return cnpj.endsWith(`${d1}${d2}`);
}

/** Normaliza telefone brasileiro (10 ou 11 dígitos). */
export function normalizeTelefone(value: string): string {
  return value.replace(/\D/g, '').slice(0, 11);
}

/** Formata telefone enquanto digita: (00) 00000-0000 ou (00) 0000-0000 */
export function formatTelefone(value: string): string {
  const digits = normalizeTelefone(value);
  if (digits.length === 0) return '';
  if (digits.length <= 2) return `(${digits}`;
  if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  if (digits.length <= 10) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  }
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
}

/** Valida telefone quando informado (opcional no formulário). */
export function isValidTelefone(value: string): boolean {
  const digits = normalizeTelefone(value);
  if (digits.length === 0) return true;
  return digits.length === 10 || digits.length === 11;
}

export function slugify(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-{2,}/g, '-');
}
