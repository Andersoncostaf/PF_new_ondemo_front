import { Injectable } from '@angular/core';
import { jsPDF } from 'jspdf';

export interface RevisaoPdfDadosGerais {
  label: string;
  value: string;
}

export interface RevisaoPdfTrCampo {
  label: string;
  value: string;
  custom?: boolean;
}

export interface RevisaoPdfQqpItem {
  descricao: string;
  quantidade: number;
  unidade: string;
  valorUnitario: string;
  total: string;
}

export interface RevisaoPdfData {
  titulo: string;
  statusLabel: string;
  solicitanteNome: string;
  numeroSolicitacao?: string | null;
  dadosGerais: RevisaoPdfDadosGerais[];
  trCampos: RevisaoPdfTrCampo[];
  qqpItens: RevisaoPdfQqpItem[];
  qqpPrecoTotal: string;
  anexos: string[];
  ssCampos: RevisaoPdfDadosGerais[];
}

@Injectable({ providedIn: 'root' })
export class ContratacaoRevisaoPdfService {
  private readonly marginX = 14;
  private readonly marginTop = 18;
  private readonly marginBottom = 16;
  private readonly lineHeight = 4.8;

  gerar(data: RevisaoPdfData): void {
    const doc = new jsPDF({ unit: 'mm', format: 'a4' });
    const contentWidth = doc.internal.pageSize.getWidth() - this.marginX * 2;
    let y = this.marginTop;

    y = this.writeTitle(doc, y, contentWidth, 'Portal Fornecedor On Demand');
    y = this.writeSubtitle(doc, y, 'Revisão da solicitação de contratação');
    y += 2;

    y = this.writeMeta(doc, y, contentWidth, [
      ['Título', data.titulo],
      ['Status', data.statusLabel],
      ['Solicitante', data.solicitanteNome || '—'],
      ['Nº solicitação', data.numeroSolicitacao?.trim() || '—'],
      ['Gerado em', this.formatDateTime(new Date())],
    ]);

    y = this.writeSection(doc, y, contentWidth, 'Dados gerais', (startY) => {
      let sectionY = startY;
      for (const item of data.dadosGerais) {
        sectionY = this.writeField(doc, sectionY, contentWidth, item.label, item.value);
      }
      return sectionY;
    });

    y = this.writeSection(doc, y, contentWidth, 'Termo de Referência', (startY) => {
      let sectionY = startY;
      for (const item of data.trCampos) {
        const prefix = item.custom ? `${item.label} (personalizado)` : item.label;
        sectionY = this.writeField(doc, sectionY, contentWidth, prefix, item.value);
      }
      return sectionY;
    });

    y = this.writeSection(doc, y, contentWidth, 'Itens QQP', (startY) => {
      let sectionY = startY;
      if (data.qqpItens.length === 0) {
        return this.writeParagraph(doc, sectionY, contentWidth, 'Nenhum item informado.');
      }

      data.qqpItens.forEach((item, index) => {
        const linha = `${index + 1}. ${item.descricao} — ${item.quantidade} ${item.unidade} — ${item.valorUnitario} (total: ${item.total})`;
        sectionY = this.writeParagraph(doc, sectionY, contentWidth, linha);
      });

      return this.writeParagraph(doc, sectionY + 1, contentWidth, `Preço total: ${data.qqpPrecoTotal}`, {
        bold: true,
      });
    });

    y = this.writeSection(doc, y, contentWidth, 'Anexos', (startY) => {
      if (data.anexos.length === 0) {
        return this.writeParagraph(doc, startY, contentWidth, 'Nenhum anexo.');
      }

      let sectionY = startY;
      for (const nome of data.anexos) {
        sectionY = this.writeParagraph(doc, sectionY, contentWidth, `• ${nome}`);
      }
      return sectionY;
    });

    if (data.ssCampos.length > 0) {
      this.writeSection(doc, y, contentWidth, 'Solicitação de serviço', (startY) => {
        let sectionY = startY;
        for (const item of data.ssCampos) {
          sectionY = this.writeField(doc, sectionY, contentWidth, item.label, item.value);
        }
        return sectionY;
      });
    }

    doc.save(this.buildFilename(data.titulo));
  }

  private writeSection(
    doc: jsPDF,
    y: number,
    contentWidth: number,
    title: string,
    writeBody: (startY: number) => number,
  ): number {
    y = this.ensureSpace(doc, y, 12);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(51, 65, 85);
    doc.text(title.toUpperCase(), this.marginX, y);
    y += 6;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9.5);
    doc.setTextColor(15, 23, 42);

    const bodyEnd = writeBody(y);
    return bodyEnd + 4;
  }

  private writeTitle(doc: jsPDF, y: number, contentWidth: number, text: string): number {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.setTextColor(15, 23, 42);
    const lines = doc.splitTextToSize(text, contentWidth) as string[];
    doc.text(lines, this.marginX, y);
    return y + lines.length * 6;
  }

  private writeSubtitle(doc: jsPDF, y: number, text: string): number {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(11);
    doc.setTextColor(100, 116, 139);
    doc.text(text, this.marginX, y);
    return y + 5;
  }

  private writeMeta(doc: jsPDF, y: number, contentWidth: number, rows: [string, string][]): number {
    for (const [label, value] of rows) {
      y = this.ensureSpace(doc, y, this.lineHeight * 2);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(100, 116, 139);
      doc.text(`${label}:`, this.marginX, y);

      doc.setFont('helvetica', 'normal');
      doc.setTextColor(15, 23, 42);
      const valueLines = doc.splitTextToSize(value || '—', contentWidth - 28) as string[];
      doc.text(valueLines, this.marginX + 28, y);
      y += Math.max(1, valueLines.length) * this.lineHeight + 1;
    }

    return y + 2;
  }

  private writeField(doc: jsPDF, y: number, contentWidth: number, label: string, value: string): number {
    y = this.ensureSpace(doc, y, this.lineHeight * 2);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(100, 116, 139);
    doc.text(label, this.marginX, y);

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(15, 23, 42);
    const valueLines = doc.splitTextToSize(value || '—', contentWidth) as string[];
    y += 4;
    for (const line of valueLines) {
      y = this.ensureSpace(doc, y, this.lineHeight);
      doc.text(line, this.marginX, y);
      y += this.lineHeight;
    }

    return y + 1.5;
  }

  private writeParagraph(
    doc: jsPDF,
    y: number,
    contentWidth: number,
    text: string,
    options?: { bold?: boolean },
  ): number {
    doc.setFont('helvetica', options?.bold ? 'bold' : 'normal');
    const lines = doc.splitTextToSize(text, contentWidth) as string[];
    for (const line of lines) {
      y = this.ensureSpace(doc, y, this.lineHeight);
      doc.text(line, this.marginX, y);
      y += this.lineHeight;
    }
    return y;
  }

  private ensureSpace(doc: jsPDF, y: number, needed: number): number {
    const pageHeight = doc.internal.pageSize.getHeight();
    if (y + needed > pageHeight - this.marginBottom) {
      doc.addPage();
      return this.marginTop;
    }
    return y;
  }

  private buildFilename(titulo: string): string {
    const slug =
      titulo
        .trim()
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '') || 'solicitacao';
    const date = new Date().toISOString().slice(0, 10);
    return `revisao-contratacao-${slug}-${date}.pdf`;
  }

  private formatDateTime(date: Date): string {
    return new Intl.DateTimeFormat('pt-BR', {
      dateStyle: 'short',
      timeStyle: 'short',
    }).format(date);
  }
}
