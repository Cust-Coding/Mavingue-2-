import type { FacturaCompra } from "@/features/purchases/types";
import type { FormaPagamento, Venda } from "@/features/sales/types";
import type { WaterBill } from "@/features/water/types";
import { formatPaymentMethod, formatPickupStatus } from "@/lib/formatters";

type PrintDocumentOptions = {
  autoPrint?: boolean;
};

type SummaryRow = {
  label: string;
  value: string;
  strong?: boolean;
};

type ReceiptItem = {
  description: string;
  note?: string;
  quantity: string;
  unitPrice: string;
  total: string;
};

type WaterInvoiceItem = {
  description: string;
  total: string;
};

type ReceiptDocumentDefinition = {
  kind: "receipt";
  title: string;
  numberLabel: string;
  number: string;
  partyTitle: string;
  partyLines: string[];
  dateLabel: string;
  dateValue: string;
  items: ReceiptItem[];
  summary: SummaryRow[];
  noteTitle: string;
  noteText: string;
};

type WaterDocumentDefinition = {
  kind: "water";
  title: string;
  numberLabel: string;
  number: string;
  statusText?: string;
  referenceNumber?: string;
  partyTitle: string;
  partyLines: string[];
  dateLabel: string;
  dateValue: string;
  reading?: {
    previous: string;
    current: string;
    total: string;
  };
  items: WaterInvoiceItem[];
  summary: SummaryRow[];
  noteTitle: string;
  noteText: string;
};

type DocumentDefinition = ReceiptDocumentDefinition | WaterDocumentDefinition;

type DocumentSection = {
  title: string;
  rows: Array<{ label: string; value: string }>;
};

const COMPANY = {
  name: "MAVINGUE",
  website: "www.estaleiromavingueonline.com",
  email: "mavingue@gmail.com",
  phone: "+258 84 579 0023",
};

const DEFAULT_NOTE = "Tenha um bom dia e obrigado!\n\nMavingue";

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function compactLines(lines: Array<string | null | undefined>) {
  return lines.map((line) => (line ?? "").trim()).filter(Boolean);
}

function formatPrintNumber(value: number | string | null | undefined) {
  const amount = Number(value ?? 0);
  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number.isFinite(amount) ? amount : 0);
}

function formatPrintCurrency(value: number | string | null | undefined, placement: "prefix" | "suffix" = "prefix") {
  const amount = formatPrintNumber(value);
  return placement === "prefix" ? `MZN ${amount}` : `${amount} MZN`;
}

function formatPrintDate(value?: string | null) {
  if (!value) return "-- --- ----";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-- --- ----";

  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  })
    .format(date)
    .replaceAll(",", "")
    .toUpperCase();
}

function buildDocumentNumber(id: number, value?: string | null) {
  const date = value ? new Date(value) : new Date();
  const safeDate = Number.isNaN(date.getTime()) ? new Date() : date;
  const day = String(safeDate.getDate()).padStart(2, "0");
  const month = String(safeDate.getMonth() + 1).padStart(2, "0");
  const year = String(safeDate.getFullYear());
  return `${day}${month}${year}-${String(id).padStart(2, "0")}`;
}

function buildCompanyHeader() {
  return `
    <header class="company-header">
      <div class="company-logo">
        <img src="/mavingue_logo_v1.svg" alt="Mavingue" />
      </div>
      <div class="company-copy">
        <div class="company-name">${escapeHtml(COMPANY.name)}</div>
        <div>${escapeHtml(COMPANY.website)}</div>
        <div>${escapeHtml(COMPANY.email)}</div>
        <div>${escapeHtml(COMPANY.phone)}</div>
      </div>
    </header>
    <div class="rule"></div>
  `;
}

function buildPartyBlock(title: string, lines: string[]) {
  const renderedLines = compactLines(lines)
    .map((line) => `<div class="info-line">${escapeHtml(line)}</div>`)
    .join("");

  return `
    <section class="party-block">
      <div class="small-label">${escapeHtml(title)}</div>
      <div class="info-stack">${renderedLines}</div>
    </section>
  `;
}

function buildReceiptTable(items: ReceiptItem[]) {
  const rows = items
    .map(
      (item) => `
        <tr>
          <td class="description-cell">
            <div>${escapeHtml(item.description)}</div>
            ${item.note ? `<span class="table-note">${escapeHtml(item.note)}</span>` : ""}
          </td>
          <td class="align-right">${escapeHtml(item.quantity)}</td>
          <td class="align-right">${escapeHtml(item.unitPrice)}</td>
          <td class="align-right">${escapeHtml(item.total)}</td>
        </tr>
      `
    )
    .join("");

  return `
    <table class="document-table">
      <thead>
        <tr>
          <th>NOME DO PRODUTO</th>
          <th class="align-right">QTD</th>
          <th class="align-right">PRECO UNIT.</th>
          <th class="align-right">MONTANTE</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>
  `;
}

function buildWaterTable(items: WaterInvoiceItem[]) {
  const rows = items
    .map(
      (item) => `
        <tr>
          <td class="description-cell">${escapeHtml(item.description)}</td>
          <td class="align-right">${escapeHtml(item.total)}</td>
        </tr>
      `
    )
    .join("");

  return `
    <table class="document-table">
      <thead>
        <tr>
          <th>DESCRICAO</th>
          <th class="align-right">VALOR</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>
  `;
}

function buildSummary(rows: SummaryRow[]) {
  if (!rows.length) return "";

  return `
    <section class="summary-block">
      ${rows
        .map(
          (row) => `
            <div class="summary-row ${row.strong ? "summary-row-strong" : ""}">
              <span>${escapeHtml(row.label)}</span>
              <strong>${escapeHtml(row.value)}</strong>
            </div>
          `
        )
        .join("")}
    </section>
  `;
}

function buildWaterMetaDetails(statusText?: string | null, referenceNumber?: string | null) {
  const rows = compactLines([
    statusText ? `Estado: ${statusText}` : null,
    referenceNumber ? `Referencia: ${referenceNumber}` : null,
  ]);

  if (!rows.length) return "";

  return `
    <div class="water-meta-details">
      ${rows.map((row) => `<div class="water-meta-line">${escapeHtml(row)}</div>`).join("")}
    </div>
  `;
}

function buildWaterReadingBlock(
  reading:
    | {
        previous: string;
        current: string;
        total: string;
      }
    | undefined
) {
  if (!reading) return "";

  return `
    <section class="reading-block">
      <div class="reading-panel left-panel">
        <div class="reading-heading">Leitura</div>
        <div class="reading-columns">
          <div>
            <div class="reading-label">Anterior</div>
            <div class="reading-value">${escapeHtml(reading.previous)}</div>
          </div>
          <div>
            <div class="reading-label">Atual</div>
            <div class="reading-value">${escapeHtml(reading.current)}</div>
          </div>
        </div>
      </div>
      <div class="reading-panel right-panel">
        <div class="reading-heading">Consumo</div>
        <div class="reading-label centered">Total</div>
        <div class="reading-value">${escapeHtml(reading.total)}</div>
      </div>
    </section>
  `;
}

function buildToolbar() {
  return `
    <div class="screen-actions">
      <button class="screen-button secondary" onclick="window.close()">Fechar</button>
      <button class="screen-button secondary" onclick="window.print()">Guardar PDF</button>
      <button class="screen-button primary" onclick="window.print()">Imprimir</button>
    </div>
  `;
}

function buildDocumentHtml(document: DocumentDefinition) {
  const companyHeader = buildCompanyHeader();
  const partyBlock = buildPartyBlock(document.partyTitle, document.partyLines);
  const noteText = document.noteText.trim() || DEFAULT_NOTE;

  const body =
    document.kind === "receipt"
      ? `
        <article class="print-sheet">
          ${companyHeader}

          <section class="top-grid">
            <div>
              ${partyBlock}
            </div>
            <div class="doc-meta">
              <h1 class="doc-title">${escapeHtml(document.title)}</h1>
              <div class="small-label tight">${escapeHtml(document.numberLabel)}</div>
              <div class="doc-number">${escapeHtml(document.number)}</div>
            </div>
          </section>

          <section class="date-row">
            <div class="date-block">
              <div class="small-label">${escapeHtml(document.dateLabel)}</div>
              <div class="date-value">${escapeHtml(document.dateValue)}</div>
            </div>
          </section>

          <section class="table-section">
            ${buildReceiptTable(document.items)}
            ${buildSummary(document.summary)}
          </section>

          <section class="note-block">
            <div class="small-label">${escapeHtml(document.noteTitle)}</div>
            <div class="note-text">${escapeHtml(noteText).replaceAll("\n", "<br />")}</div>
          </section>
        </article>
      `
      : `
        <article class="print-sheet">
          ${companyHeader}

          <section class="top-grid">
            <div>
              ${partyBlock}
            </div>
            <div class="doc-meta">
              <h1 class="doc-title">${escapeHtml(document.title)}</h1>
              <div class="small-label tight">${escapeHtml(document.numberLabel)}</div>
              <div class="doc-number">${escapeHtml(document.number)}</div>
              ${buildWaterMetaDetails(document.statusText, document.referenceNumber)}
            </div>
          </section>

          <section class="water-layout">
            <div>
              ${buildWaterReadingBlock(document.reading)}
            </div>
            <div class="date-block water-date-block">
              <div class="small-label">${escapeHtml(document.dateLabel)}</div>
              <div class="date-value">${escapeHtml(document.dateValue)}</div>
            </div>
          </section>

          <section class="table-section water-table-section">
            ${buildWaterTable(document.items)}
            ${buildSummary(document.summary)}
          </section>

          <section class="note-block water-note-block">
            <div class="small-label">${escapeHtml(document.noteTitle)}</div>
            <div class="note-text">${escapeHtml(noteText).replaceAll("\n", "<br />")}</div>
          </section>
        </article>
      `;

  return `
    <!doctype html>
    <html lang="pt">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>${escapeHtml(document.title)}</title>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
        <link href="https://fonts.googleapis.com/css2?family=Courier+Prime:wght@400;700&family=Special+Elite&display=swap" rel="stylesheet" />
        <style>
          :root {
            --ink: #262626;
            --muted: #707070;
            --line: #d8d8d8;
            --line-soft: #ededed;
            --paper: #ffffff;
            --screen: #e7e5e4;
          }

          * {
            box-sizing: border-box;
          }

          html,
          body {
            margin: 0;
            padding: 0;
            background: var(--screen);
            color: var(--ink);
            font-family: "Courier Prime", "Courier New", monospace;
          }

          @page {
            size: A4;
            margin: 0;
          }

          .screen-shell {
            padding: 24px 12px 36px;
          }

          .print-sheet {
            position: relative;
            width: min(794px, 100%);
            min-height: 1123px;
            margin: 0 auto;
            background: var(--paper);
            box-shadow: 0 16px 42px rgba(38, 38, 38, 0.14);
            padding: 72px 68px 92px;
          }

          .company-header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            gap: 24px;
          }

          .company-logo img {
            width: 58px;
            height: auto;
            display: block;
          }

          .company-copy {
            text-align: right;
            color: var(--muted);
            font-size: 13px;
            line-height: 1.7;
          }

          .company-name {
            margin-bottom: 6px;
            color: #111111;
            font-size: 16px;
            font-weight: 700;
            letter-spacing: 0.28em;
          }

          .rule {
            margin: 32px 0 28px;
            border-top: 1px solid var(--line);
          }

          .top-grid {
            display: grid;
            grid-template-columns: minmax(0, 1fr) 248px;
            gap: 36px;
            align-items: start;
          }

          .doc-meta {
            text-align: left;
            padding-top: 4px;
          }

          .doc-title {
            margin: 0 0 10px;
            color: #1a1a1a;
            font-family: "Special Elite", "Courier New", monospace;
            font-size: 30px;
            line-height: 1.1;
            letter-spacing: 0.18em;
          }

          .small-label {
            color: #111111;
            font-size: 12px;
            font-weight: 700;
            letter-spacing: 0.34em;
            text-transform: uppercase;
          }

          .small-label.tight {
            letter-spacing: 0.28em;
          }

          .party-block,
          .date-block,
          .note-block {
            max-width: 330px;
          }

          .info-stack {
            margin-top: 12px;
          }

          .info-line {
            margin: 0 0 10px;
            color: var(--muted);
            font-size: 15px;
            line-height: 1.35;
          }

          .doc-number {
            margin-top: 6px;
            color: var(--muted);
            font-size: 14px;
            line-height: 1.35;
          }

          .water-meta-details {
            margin-top: 16px;
            display: grid;
            gap: 6px;
          }

          .water-meta-line {
            color: #14532d;
            font-size: 13px;
            font-weight: 700;
            letter-spacing: 0.08em;
            text-transform: uppercase;
          }

          .date-row {
            margin-top: 34px;
          }

          .date-value {
            margin-top: 10px;
            color: var(--muted);
            font-size: 16px;
            line-height: 1.35;
          }

          .water-layout {
            display: grid;
            grid-template-columns: minmax(0, 1fr) 248px;
            gap: 36px;
            align-items: start;
            margin-top: 34px;
          }

          .water-date-block {
            margin-left: auto;
          }

          .reading-block {
            display: grid;
            grid-template-columns: 2.3fr 0.95fr;
            width: 100%;
            max-width: 324px;
            border: 1px solid #cbcbcb;
          }

          .reading-panel {
            padding: 10px 10px 12px;
          }

          .left-panel {
            border-right: 1px solid #cbcbcb;
          }

          .reading-heading {
            margin: 0 0 12px;
            padding-bottom: 8px;
            border-bottom: 1px solid var(--line);
            color: #111111;
            font-size: 12px;
            font-weight: 700;
            letter-spacing: 0.24em;
            text-align: center;
          }

          .reading-columns {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 18px;
          }

          .reading-label {
            margin-bottom: 8px;
            color: #111111;
            font-size: 12px;
            font-weight: 700;
            letter-spacing: 0.24em;
            text-transform: uppercase;
          }

          .reading-label.centered {
            text-align: center;
          }

          .reading-value {
            color: var(--muted);
            font-size: 15px;
            line-height: 1.3;
            text-align: center;
          }

          .table-section {
            margin-top: 34px;
          }

          .water-table-section {
            margin-top: 48px;
          }

          .document-table {
            width: 100%;
            border-collapse: collapse;
          }

          .document-table thead th {
            padding: 0 0 8px;
            border-bottom: 3px solid #2b2b2b;
            color: #111111;
            font-size: 12px;
            font-weight: 700;
            letter-spacing: 0.28em;
            text-transform: uppercase;
            text-align: left;
          }

          .document-table tbody td {
            padding: 10px 0 9px;
            border-bottom: 1px solid var(--line-soft);
            color: var(--muted);
            font-size: 15px;
            line-height: 1.35;
            vertical-align: top;
          }

          .description-cell {
            padding-right: 18px;
          }

          .table-note {
            display: block;
            margin-top: 3px;
            color: #9a9a9a;
            font-size: 12px;
          }

          .align-right {
            text-align: right !important;
            padding-left: 12px !important;
            white-space: nowrap;
          }

          .summary-block {
            width: min(300px, 100%);
            margin: 18px 0 0 auto;
          }

          .summary-row {
            display: flex;
            align-items: baseline;
            justify-content: space-between;
            gap: 24px;
            padding: 5px 0;
            color: var(--muted);
            font-size: 15px;
            line-height: 1.35;
          }

          .summary-row strong {
            color: inherit;
            font-size: inherit;
          }

          .summary-row-strong {
            margin-top: 2px;
            padding-top: 12px;
            border-top: 3px solid #2b2b2b;
            color: #161616;
            font-size: 18px;
            font-weight: 700;
          }

          .summary-row-strong strong {
            font-size: 18px;
          }

          .note-block {
            margin-top: 108px;
          }

          .water-note-block {
            margin-top: 128px;
          }

          .note-text {
            margin-top: 12px;
            color: var(--muted);
            font-size: 15px;
            line-height: 1.8;
          }

          .screen-actions {
            width: min(794px, 100%);
            margin: 18px auto 0;
            display: flex;
            justify-content: center;
            gap: 12px;
            flex-wrap: wrap;
          }

          .screen-button {
            appearance: none;
            border: 1px solid #cfcfcf;
            background: white;
            color: #111111;
            border-radius: 999px;
            padding: 11px 18px;
            font: inherit;
            font-size: 13px;
            font-weight: 700;
            cursor: pointer;
          }

          .screen-button.primary {
            background: #111111;
            border-color: #111111;
            color: white;
          }

          @media (max-width: 860px) {
            .screen-shell {
              padding: 0;
            }

            .print-sheet {
              min-height: auto;
              padding: 42px 24px 56px;
              box-shadow: none;
            }

            .top-grid,
            .water-layout {
              grid-template-columns: 1fr;
            }

            .doc-meta,
            .water-date-block {
              margin-left: 0;
            }

            .summary-block {
              margin-left: 0;
            }

            .reading-block {
              max-width: none;
            }

            .screen-actions {
              padding: 12px;
            }
          }

          @media print {
            html,
            body {
              background: white;
            }

            .screen-shell {
              padding: 0;
            }

            .print-sheet {
              width: auto;
              min-height: 0;
              box-shadow: none;
            }

            .screen-actions {
              display: none;
            }
          }
        </style>
      </head>
      <body>
        <main class="screen-shell">
          ${body}
          ${buildToolbar()}
        </main>
      </body>
    </html>
  `;
}

function openPopupDocument(html: string) {
  if (typeof window === "undefined") return;

  const popup = window.open("", "_blank", "width=980,height=760");
  if (!popup) return;

  popup.document.open();
  popup.document.write(html);
  popup.document.close();
}

function printInHiddenFrame(html: string) {
  if (typeof window === "undefined" || typeof document === "undefined") return;

  const iframe = document.createElement("iframe");
  iframe.style.position = "fixed";
  iframe.style.right = "0";
  iframe.style.bottom = "0";
  iframe.style.width = "0";
  iframe.style.height = "0";
  iframe.style.border = "0";
  iframe.setAttribute("aria-hidden", "true");
  document.body.appendChild(iframe);

  const frameWindow = iframe.contentWindow;
  if (!frameWindow) {
    iframe.remove();
    return;
  }

  const cleanup = () => {
    window.setTimeout(() => iframe.remove(), 1500);
  };

  const triggerPrint = () => {
    const perform = () => {
      frameWindow.focus();
      frameWindow.print();
      window.setTimeout(cleanup, 15000);
    };

    const fontsReady = frameWindow.document.fonts?.ready;
    if (fontsReady) {
      fontsReady.finally(() => window.setTimeout(perform, 120));
      return;
    }

    window.setTimeout(perform, 350);
  };

  frameWindow.onafterprint = cleanup;
  frameWindow.document.open();
  frameWindow.document.write(html);
  frameWindow.document.close();

  iframe.onload = () => {
    triggerPrint();
  };
}

function openDocument(document: DocumentDefinition, options?: PrintDocumentOptions) {
  const html = buildDocumentHtml(document);

  if (options?.autoPrint) {
    printInHiddenFrame(html);
    return;
  }

  openPopupDocument(html);
}

function fallbackNote(custom?: string | null) {
  return custom?.trim() || DEFAULT_NOTE;
}

function buildReceiptSummary(total: number, valorPago?: number | null, troco?: number | null) {
  const rows: SummaryRow[] = [];

  if (valorPago != null) {
    rows.push({ label: "Subtotal", value: formatPrintCurrency(total) });
    rows.push({ label: "Valor pago", value: formatPrintCurrency(valorPago) });
    rows.push({ label: "Troco", value: formatPrintCurrency(troco ?? 0) });
  }

  rows.push({ label: "TOTAL", value: formatPrintCurrency(total), strong: true });
  return rows;
}

function buildWaterSummary(bill: WaterBill) {
  const rows: SummaryRow[] = [];

  if (bill.valorPago != null) {
    rows.push({
      label: "Valor pago",
      value: formatPrintCurrency(bill.valorPago, "suffix"),
    });
  }

  if (bill.troco != null && Number(bill.troco) > 0) {
    rows.push({
      label: "Troco",
      value: formatPrintCurrency(bill.troco, "suffix"),
    });
  }

  return rows;
}

function buildOpenPrintableFallback(title: string, subtitle: string, sections: DocumentSection[]) {
  const primarySection = sections[0];
  const otherRows = sections.slice(1).flatMap((section) =>
    section.rows.map((row) => ({
      description: `${section.title}: ${row.label}`,
      quantity: "1",
      unitPrice: "—",
      total: row.value,
    }))
  );

  return {
    kind: "receipt" as const,
    title,
    numberLabel: "NUMERO DO DOCUMENTO",
    number: subtitle,
    partyTitle: primarySection?.title || "DETALHES",
    partyLines: primarySection?.rows.map((row) => `${row.label}: ${row.value}`) || [subtitle],
    dateLabel: "DATA DO DOCUMENTO",
    dateValue: formatPrintDate(new Date().toISOString()),
    items: otherRows.length
      ? otherRows
      : [
          {
            description: subtitle,
            quantity: "1",
            unitPrice: "—",
            total: "—",
          },
        ],
    summary: [{ label: "TOTAL", value: "—", strong: true }],
    noteTitle: "NOTA",
    noteText: DEFAULT_NOTE,
  };
}

export function openPrintableDocument(title: string, subtitle: string, sections: DocumentSection[], options?: PrintDocumentOptions) {
  openDocument(buildOpenPrintableFallback(title, subtitle, sections), options);
}

export function printSaleDocument(sale: Venda, options?: PrintDocumentOptions) {
  const items = sale.items?.length
    ? sale.items
    : [
        {
          produtoNome: sale.produtoNome,
          categoria: sale.categoria,
          quantidade: sale.quantidade,
          precoUnitario: sale.precoUnitario,
          subtotal: sale.total,
        },
      ];

  const partyLines = compactLines([
    sale.clienteNome || "Cliente de balcao",
    sale.clienteId ? `Cliente #${sale.clienteId}` : "Venda presencial",
    sale.funcionarioNome ? `Atendido por ${sale.funcionarioNome}` : null,
    sale.formaPagamento ? `Pagamento: ${formatPaymentMethod(sale.formaPagamento)}` : null,
    sale.estadoLevantamento ? `Estado: ${formatPickupStatus(sale.estadoLevantamento)}` : null,
  ]);

  openDocument(
    {
      kind: "receipt",
      title: "RECIBO",
      numberLabel: "NUMERO DO RECIBO",
      number: buildDocumentNumber(sale.id, sale.criadoEm),
      partyTitle: sale.clienteNome ? "CLIENTE" : "OPERADOR",
      partyLines,
      dateLabel: "DATA DO RECIBO",
      dateValue: formatPrintDate(sale.criadoEm),
      items: items.map((item) => ({
        description: item.produtoNome,
        note: item.categoria || undefined,
        quantity: String(item.quantidade),
        unitPrice: formatPrintCurrency(item.precoUnitario),
        total: formatPrintCurrency(item.subtotal),
      })),
      summary: buildReceiptSummary(sale.total, sale.valorPago, sale.troco),
      noteTitle: "NOTA",
      noteText: fallbackNote(sale.levantamentoNotas),
    },
    options
  );
}

export function printPurchaseDocument(purchase: FacturaCompra, options?: PrintDocumentOptions) {
  const items = purchase.items?.length
    ? purchase.items
    : [
        {
          produtoNome: purchase.produtoNome || `Produto #${purchase.produtoId}`,
          categoria: purchase.categoria,
          quantidade: purchase.quantidade,
          precoUnitario: purchase.precoUnitario,
          subtotal: purchase.total,
        },
      ];

  openDocument(
    {
      kind: "receipt",
      title: "RECIBO",
      numberLabel: "NUMERO DO RECIBO",
      number: buildDocumentNumber(purchase.id, purchase.criadoEm),
      partyTitle: "RESPONSAVEL",
      partyLines: compactLines([
        purchase.funcionarioNome || "Operador nao identificado",
        `Compra interna de stock`,
        `Pagamento: ${formatPaymentMethod((purchase.formaPagamento ?? "DINHEIRO_FISICO") as FormaPagamento)}`,
        `Itens: ${String(purchase.totalItens ?? items.length)}`,
        `Unidades: ${String(purchase.quantidade ?? 0)}`,
      ]),
      dateLabel: "DATA DO RECIBO",
      dateValue: formatPrintDate(purchase.criadoEm),
      items: items.map((item) => ({
        description: item.produtoNome,
        note: item.categoria || undefined,
        quantity: String(item.quantidade),
        unitPrice: formatPrintCurrency(item.precoUnitario),
        total: formatPrintCurrency(item.subtotal),
      })),
      summary: buildReceiptSummary(purchase.total, purchase.valorPago, purchase.troco),
      noteTitle: "NOTA",
      noteText: DEFAULT_NOTE,
    },
    options
  );
}

export function printWaterBillDocument(bill: WaterBill, options?: PrintDocumentOptions) {
  const valorFactura = Number(bill.valorFactura ?? Number(bill.valor ?? 0) + Number(bill.taxaFixa ?? 0));
  const multa = Number(bill.multaValor ?? 0);
  const divida = Number(bill.dividaValor ?? 0);
  const total = Number(bill.valorTotal ?? valorFactura + multa + divida);

  openDocument(
    {
      kind: "water",
      title: bill.estadoPagamento === "PAGO" ? "Recibo de pagamento" : "Fatura",
      numberLabel: bill.estadoPagamento === "PAGO" ? "Numero do Recibo" : "Numero da Fatura",
      number: buildDocumentNumber(bill.id, bill.data),
      statusText: bill.estadoPagamento === "PAGO" ? "Pago" : undefined,
      referenceNumber: "843892980",
      partyTitle: "CLIENTE",
      partyLines: compactLines([
        bill.consumidorNome,
        bill.ligacaoId ? `Contrato #${bill.ligacaoId}` : null,
        bill.houseNR ? `Casa ${bill.houseNR}` : null,
        bill.formaPagamento ? `Pagamento: ${formatPaymentMethod(bill.formaPagamento)}` : null,
        bill.estadoPagamento === "PAGO" ? "Estado: Pago" : bill.estadoPagamento ? `Estado: ${bill.estadoPagamento}` : null,
      ]),
      dateLabel: bill.estadoPagamento === "PAGO" ? "DATA DO RECIBO" : "DATA DA FATURA",
      dateValue: formatPrintDate(bill.data),
      reading:
        bill.leituraAnterior != null && bill.leituraActual != null && bill.consumoM3 != null
          ? {
              previous: formatPrintNumber(bill.leituraAnterior),
              current: formatPrintNumber(bill.leituraActual),
              total: formatPrintNumber(bill.consumoM3),
            }
          : undefined,
      items: [
        {
          description: "Valor a pagar",
          total: formatPrintCurrency(valorFactura, "suffix"),
        },
        {
          description: `Multa (${formatPrintNumber(bill.percentualMulta ?? 0)}%)`,
          total: formatPrintCurrency(multa, "suffix"),
        },
        {
          description: "Divida",
          total: formatPrintCurrency(divida, "suffix"),
        },
        {
          description: "Total",
          total: formatPrintCurrency(total, "suffix"),
        },
      ],
      summary: buildWaterSummary(bill),
      noteTitle: "NOTAS",
      noteText: DEFAULT_NOTE,
    },
    options
  );
}

export function printCheckoutDocument(orders: Venda[], paymentMethod: FormaPagamento, options?: PrintDocumentOptions) {
  const flattenedItems = orders.flatMap((order) =>
    order.items?.length
      ? order.items
      : [
          {
            produtoId: order.produtoId,
            produtoNome: order.produtoNome,
            quantidade: order.quantidade,
            precoUnitario: order.precoUnitario,
            subtotal: order.total,
            categoria: order.categoria,
          },
        ]
  );

  const total = orders.reduce((sum, order) => sum + Number(order.total || 0), 0);

  openDocument(
    {
      kind: "receipt",
      title: "RECIBO",
      numberLabel: "NUMERO DO RECIBO",
      number: orders.length ? orders.map((order) => buildDocumentNumber(order.id, order.criadoEm)).join(", ") : "CHECKOUT",
      partyTitle: "CLIENTE",
      partyLines: compactLines([
        "Checkout de cliente",
        `${orders.length} pedido(s) registado(s)`,
        `Pagamento: ${formatPaymentMethod(paymentMethod)}`,
        `${flattenedItems.reduce((sum, item) => sum + Number(item.quantidade || 0), 0)} unidade(s)`,
      ]),
      dateLabel: "DATA DO RECIBO",
      dateValue: formatPrintDate(orders[0]?.criadoEm ?? new Date().toISOString()),
      items: flattenedItems.map((item) => ({
        description: item.produtoNome,
        note: item.categoria || undefined,
        quantity: String(item.quantidade),
        unitPrice: formatPrintCurrency(item.precoUnitario),
        total: formatPrintCurrency(item.subtotal),
      })),
      summary: [{ label: "TOTAL", value: formatPrintCurrency(total), strong: true }],
      noteTitle: "NOTA",
      noteText: DEFAULT_NOTE,
    },
    options
  );
}
