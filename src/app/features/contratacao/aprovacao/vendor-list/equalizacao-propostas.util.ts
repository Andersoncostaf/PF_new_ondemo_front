import { ContratacaoFornecedorListItem, QqpItem } from '../../contratacao.models';

export interface EqualizacaoPrecoFornecedor {
  fornecedor_uuid: string;
  descricao: string;
  preco_unitario: number | null;
  preco_total: number | null;
}

export interface EqualizacaoLinha {
  item: number;
  descricao: string;
  unidade: string;
  quantidade: number;
  precos: EqualizacaoPrecoFornecedor[];
  media_precos: number | null;
  percentual_diferenca: number | null;
}

export interface EqualizacaoTabela {
  linhas: EqualizacaoLinha[];
  total: EqualizacaoLinha | null;
  fornecedores: { uuid: string; descricao: string }[];
}

function parseNumero(valor: number | string | null | undefined): number | null {
  if (valor == null || valor === '') {
    return null;
  }
  const n = Number(valor);
  return Number.isFinite(n) ? n : null;
}

/** Valor usado na equalização: equalizada (base comum), senão inicial, senão final. */
export function valorPropostaEqualizacao(fornecedor: ContratacaoFornecedorListItem): number | null {
  return (
    parseNumero(fornecedor.proposta_equalizada) ??
    parseNumero(fornecedor.proposta_inicial) ??
    parseNumero(fornecedor.proposta_final)
  );
}

export function calcularMediaPrecos(precos: Array<number | null>): number | null {
  const validos = precos.filter((p): p is number => p != null && p >= 0);
  if (validos.length === 0) {
    return null;
  }
  const soma = validos.reduce((acc, p) => acc + p, 0);
  return Math.round((soma / validos.length) * 100) / 100;
}

/** % de diferença (spread): (menor − maior) / maior × 100 */
export function calcularPercentualDiferenca(precos: Array<number | null>): number | null {
  const validos = precos.filter((p): p is number => p != null && p >= 0);
  if (validos.length < 2) {
    return validos.length === 1 ? 0 : null;
  }
  const min = Math.min(...validos);
  const max = Math.max(...validos);
  if (max === 0) {
    return null;
  }
  return Math.round(((min - max) / max) * 10000) / 100;
}

function linhasBaseQqp(qqp: QqpItem[] | null | undefined, tituloFallback: string): QqpItem[] {
  if (Array.isArray(qqp) && qqp.length > 0) {
    return qqp;
  }
  return [{ ordem: 0, descricao: tituloFallback, unidade: 'Und', quantidade: 1, valor_unitario: 1 }];
}

function pesoLinhaQqp(item: QqpItem, somaReferencia: number): number {
  if (somaReferencia <= 0) {
    return 1;
  }
  const qtd = parseNumero(item.quantidade) ?? 1;
  const unit = parseNumero(item.valor_unitario) ?? 0;
  const ref = qtd * unit;
  if (ref <= 0) {
    return 1 / somaReferencia;
  }
  return ref / somaReferencia;
}

export function montarTabelaEqualizacao(
  qqp: QqpItem[] | null | undefined,
  propostas: ContratacaoFornecedorListItem[],
  tituloFallback = 'Serviço contratado',
): EqualizacaoTabela {
  const fornecedores = propostas.map((p) => ({ uuid: p.uuid, descricao: p.razao_social }));
  const itens = linhasBaseQqp(qqp, tituloFallback);

  const somaReferencia = itens.reduce((acc, item) => {
    const qtd = parseNumero(item.quantidade) ?? 1;
    const unit = parseNumero(item.valor_unitario) ?? 0;
    return acc + qtd * (unit > 0 ? unit : 1);
  }, 0);

  const linhas: EqualizacaoLinha[] = itens.map((item, index) => {
    const qtd = parseNumero(item.quantidade) ?? 1;
    const peso =
      itens.length === 1
        ? 1
        : pesoLinhaQqp(item, somaReferencia > 0 ? somaReferencia : itens.length);
    const precos: EqualizacaoPrecoFornecedor[] = propostas.map((p) => {
      const base = valorPropostaEqualizacao(p);
      const total = base != null ? Math.round(base * peso * 100) / 100 : null;
      const unitario =
        total != null && qtd > 0 ? Math.round((total / qtd) * 100) / 100 : null;
      return {
        fornecedor_uuid: p.uuid,
        descricao: p.razao_social,
        preco_unitario: unitario,
        preco_total: total,
      };
    });

    const totais = precos.map((x) => x.preco_total);
    return {
      item: index + 1,
      descricao: item.descricao ?? `Item ${index + 1}`,
      unidade: item.unidade ?? 'Und',
      quantidade: qtd,
      precos,
      media_precos: calcularMediaPrecos(totais),
      percentual_diferenca: calcularPercentualDiferenca(totais),
    };
  });

  const totalPrecos: EqualizacaoPrecoFornecedor[] = propostas.map((p) => {
    let total: number | null;
    let unitario: number | null = null;

    if (linhas.length === 1) {
      total = valorPropostaEqualizacao(p);
      const qtd = linhas[0].quantidade;
      unitario =
        total != null && qtd > 0 ? Math.round((total / qtd) * 100) / 100 : null;
    } else {
      const soma = linhas.reduce((acc, linha) => {
        const cel = linha.precos.find((x) => x.fornecedor_uuid === p.uuid);
        return acc + (cel?.preco_total ?? 0);
      }, 0);
      total = soma > 0 ? Math.round(soma * 100) / 100 : null;
    }

    return {
      fornecedor_uuid: p.uuid,
      descricao: p.razao_social,
      preco_unitario: unitario,
      preco_total: total,
    };
  });
  const totaisGerais = totalPrecos.map((x) => x.preco_total);
  const total: EqualizacaoLinha = {
    item: 0,
    descricao: 'TOTAL',
    unidade: '',
    quantidade: 0,
    precos: totalPrecos,
    media_precos: calcularMediaPrecos(totaisGerais),
    percentual_diferenca: calcularPercentualDiferenca(totaisGerais),
  };

  return {
    linhas,
    total,
    fornecedores,
  };
}
