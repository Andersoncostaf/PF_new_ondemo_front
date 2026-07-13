/** Limite alinhado ao backend: config/contratacao.php (10240 KB). */
export const CONTRATACAO_ANEXO_MAX_BYTES = 10 * 1024 * 1024;

export function formatAnexoTamanho(bytes: number): string {
  if (bytes < 1024) {
    return `${bytes} B`;
  }

  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1).replace('.', ',')} KB`;
  }

  return `${(bytes / (1024 * 1024)).toFixed(1).replace('.', ',')} MB`;
}

export function anexoArquivoValido(file: File): string | null {
  if (file.size > CONTRATACAO_ANEXO_MAX_BYTES) {
    return `O arquivo excede o limite de ${formatAnexoTamanho(CONTRATACAO_ANEXO_MAX_BYTES)}.`;
  }

  return null;
}
