/** Conteúdo textual de um campo TR (HTML do editor ou texto puro). */
export function termoCampoPlainText(value: string | null | undefined): string {
  if (!value) {
    return '';
  }

  return value
    .replace(/<br\s*\/?>/gi, ' ')
    .replace(/<\/p>/gi, ' ')
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function termoCampoHasContent(value: string | null | undefined): boolean {
  return termoCampoPlainText(value).length > 0;
}

/** Normaliza HTML vazio do Quill para string vazia antes de enviar à API. */
export function normalizeTermoCampoValue(value: string | null | undefined): string {
  if (!termoCampoHasContent(value)) {
    return '';
  }

  return (value ?? '').trim();
}

export const TR_EDITOR_FONT_SIZES = ['small', '', 'large', 'huge'] as const;

export type TrEditorFontSize = (typeof TR_EDITOR_FONT_SIZES)[number];

export function nextTrEditorFontSize(current: TrEditorFontSize | string | undefined, direction: 1 | -1): TrEditorFontSize {
  const normalized = (current ?? '') as TrEditorFontSize;
  const index = TR_EDITOR_FONT_SIZES.indexOf(normalized);
  const safeIndex = index >= 0 ? index : 1;
  const nextIndex = Math.min(TR_EDITOR_FONT_SIZES.length - 1, Math.max(0, safeIndex + direction));
  return TR_EDITOR_FONT_SIZES[nextIndex];
}
