import type { FacturaCompra } from "@/features/purchases/types";
import type { FormaPagamento, Venda } from "@/features/sales/types";
import type { WaterBill } from "@/features/water/types";
import { formatDateTime, formatMoney, formatPaymentMethod, formatPickupStatus } from "@/lib/formatters";

type DocumentSection = {
  title: string;
  rows: Array<{ label: string; value: string }>;
};

type DocumentItem = {
  title: string;
  subtitle?: string;
  quantity: string;
  unitPrice: string;
  total: string;
};

type SummaryRow = {
  label: string;
  value: string;
  highlight?: boolean;
};

type PrintDocumentOptions = {
  autoPrint?: boolean;
};

type ReceiptDefinition = {
  title: string;
  subtitle: string;
  reference: string;
  dateLabel: string;
  accent: string;
  sections: DocumentSection[];
  items?: DocumentItem[];
  totals?: SummaryRow[];
  note?: string;
};

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function buildHtml(document: ReceiptDefinition) {
  const sections = document.sections
    .map(
      (section) => `
        <section class="section">
          <h2>${escapeHtml(section.title)}</h2>
          <div class="info-grid">
            ${section.rows
              .map(
                (row) => `
                  <article class="info-card">
                    <span class="label">${escapeHtml(row.label)}</span>
                    <strong>${escapeHtml(row.value)}</strong>
                  </article>
                `
              )
              .join("")}
          </div>
        </section>
      `
    )
    .join("");

  const items = document.items?.length
    ? `
        <section class="section">
          <h2>Itens do recibo</h2>
          <div class="table-shell">
            <table>
              <thead>
                <tr>
                  <th>Produto / servico</th>
                  <th>Qtd.</th>
                  <th>Preco unitario</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                ${document.items
                  .map(
                    (item) => `
                      <tr>
                        <td>
                          <strong>${escapeHtml(item.title)}</strong>
                          ${item.subtitle ? `<span>${escapeHtml(item.subtitle)}</span>` : ""}
                        </td>
                        <td>${escapeHtml(item.quantity)}</td>
                        <td>${escapeHtml(item.unitPrice)}</td>
                        <td>${escapeHtml(item.total)}</td>
                      </tr>
                    `
                  )
                  .join("")}
              </tbody>
            </table>
          </div>
        </section>
      `
    : "";

  const totals = document.totals?.length
    ? `
        <section class="section totals-section">
          <h2>Resumo financeiro</h2>
          <div class="totals">
            ${document.totals
              .map(
                (row) => `
                  <div class="total-row ${row.highlight ? "highlight" : ""}">
                    <span>${escapeHtml(row.label)}</span>
                    <strong>${escapeHtml(row.value)}</strong>
                  </div>
                `
              )
              .join("")}
          </div>
        </section>
      `
    : "";

  const note = document.note
    ? `
        <section class="section note">
          <h2>Observacao</h2>
          <p>${escapeHtml(document.note)}</p>
        </section>
      `
    : "";

  return `
    <!doctype html>
    <html lang="pt">
      <head>
        <meta charset="utf-8" />
        <title>${escapeHtml(document.title)}</title>
        <style>
          :root {
            --accent: ${document.accent};
            --ink: #0f172a;
            --muted: #64748b;
            --line: #e2e8f0;
            --paper: #ffffff;
            --soft: #f8fafc;
          }

          @page {
            size: A4;
            margin: 14mm;
          }

          * {
            box-sizing: border-box;
          }

          body {
            margin: 0;
            background: #e2e8f0;
            color: var(--ink);
            font-family: "Segoe UI", Arial, sans-serif;
          }

          .sheet {
            max-width: 860px;
            margin: 24px auto;
            background: var(--paper);
            border-radius: 28px;
            box-shadow: 0 28px 60px rgba(15, 23, 42, 0.14);
            overflow: hidden;
          }

          .header {
            display: grid;
            gap: 22px;
            grid-template-columns: 1.2fr 0.8fr;
            padding: 28px;
            background:
              radial-gradient(circle at top right, rgba(255,255,255,.16), transparent 38%),
              linear-gradient(135deg, #0f172a, #1e293b 58%, var(--accent));
            color: white;
          }

          .brand {
            display: flex;
            gap: 18px;
            align-items: center;
          }

          .brand img {
            width: 74px;
            height: 74px;
            border-radius: 20px;
            background: rgba(255,255,255,.9);
            padding: 10px;
          }

          .brand-copy h1 {
            margin: 0;
            font-size: 30px;
            line-height: 1.1;
            font-weight: 900;
          }

          .brand-copy p {
            margin: 8px 0 0;
            color: rgba(255,255,255,.82);
            line-height: 1.6;
          }

          .meta {
            display: grid;
            gap: 12px;
            align-content: start;
          }

          .meta-card {
            border: 1px solid rgba(255,255,255,.18);
            border-radius: 18px;
            background: rgba(255,255,255,.08);
            padding: 14px 16px;
          }

          .meta-card span {
            display: block;
            font-size: 11px;
            text-transform: uppercase;
            letter-spacing: .22em;
            color: rgba(255,255,255,.68);
            margin-bottom: 8px;
          }

          .meta-card strong {
            display: block;
            font-size: 15px;
          }

          .content {
            padding: 26px 28px 10px;
          }

          .section {
            margin-bottom: 18px;
            border: 1px solid var(--line);
            border-radius: 22px;
            padding: 18px;
            background: var(--paper);
          }

          .section h2 {
            margin: 0 0 14px;
            font-size: 15px;
            font-weight: 900;
            letter-spacing: .04em;
            text-transform: uppercase;
          }

          .info-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
            gap: 12px;
          }

          .info-card {
            border-radius: 18px;
            border: 1px solid var(--line);
            background: var(--soft);
            padding: 14px;
          }

          .label {
            display: block;
            color: var(--muted);
            font-size: 11px;
            text-transform: uppercase;
            letter-spacing: .16em;
            margin-bottom: 8px;
          }

          .info-card strong {
            font-size: 15px;
            line-height: 1.5;
          }

          .table-shell {
            overflow: hidden;
            border: 1px solid var(--line);
            border-radius: 18px;
          }

          table {
            width: 100%;
            border-collapse: collapse;
          }

          th, td {
            padding: 14px 16px;
            text-align: left;
            border-bottom: 1px solid var(--line);
            vertical-align: top;
          }

          th {
            background: var(--soft);
            font-size: 11px;
            text-transform: uppercase;
            letter-spacing: .16em;
            color: var(--muted);
          }

          td strong {
            display: block;
            font-size: 14px;
            margin-bottom: 4px;
          }

          td span {
            display: block;
            color: var(--muted);
            font-size: 12px;
          }

          tbody tr:last-child td {
            border-bottom: none;
          }

          .totals {
            display: grid;
            gap: 10px;
          }

          .total-row {
            display: flex;
            justify-content: space-between;
            gap: 20px;
            border-radius: 16px;
            border: 1px solid var(--line);
            background: var(--soft);
            padding: 14px 16px;
          }

          .total-row.highlight {
            border-color: color-mix(in srgb, var(--accent) 30%, white);
            background: color-mix(in srgb, var(--accent) 10%, white);
          }

          .note p {
            margin: 0;
            color: var(--muted);
            line-height: 1.7;
          }

          .footer {
            display: flex;
            justify-content: space-between;
            gap: 16px;
            align-items: center;
            padding: 0 28px 24px;
            color: var(--muted);
            font-size: 12px;
          }

          .actions {
            display: flex;
            justify-content: flex-end;
            gap: 12px;
            padding: 0 28px 28px;
          }

          button {
            appearance: none;
            border: none;
            border-radius: 999px;
            padding: 12px 18px;
            font-weight: 800;
            cursor: pointer;
            font-family: inherit;
          }

          .secondary {
            background: white;
            color: var(--ink);
            border: 1px solid #cbd5e1;
          }

          .primary {
            background: var(--accent);
            color: white;
          }

          @media print {
            body {
              background: white;
            }

            .sheet {
              margin: 0;
              max-width: none;
              box-shadow: none;
              border-radius: 0;
            }

            .actions {
              display: none;
            }
          }

          @media (max-width: 760px) {
            .sheet {
              margin: 0;
              border-radius: 0;
            }

            .header {
              grid-template-columns: 1fr;
            }

            .footer {
              flex-direction: column;
              align-items: flex-start;
            }

            .actions {
              flex-direction: column;
            }
          }
        </style>
      </head>
      <body>
        <main class="sheet">
          <header class="header">
            <div class="brand">
              <img src="/mavingue_logo_v1.svg" alt="Mavingue" />
              <div class="brand-copy">
                <h1>${escapeHtml(document.title)}</h1>
                <p>${escapeHtml(document.subtitle)}</p>
              </div>
            </div>

            <div class="meta">
              <article class="meta-card">
                <span>Referencia</span>
                <strong>${escapeHtml(document.reference)}</strong>
              </article>
              <article class="meta-card">
                <span>Data do registo</span>
                <strong>${escapeHtml(document.dateLabel)}</strong>
              </article>
              <article class="meta-card">
                <span>Emitido por</span>
                <strong>Mavingue</strong>
              </article>
            </div>
          </header>

          <div class="content">
            ${sections}
            ${items}
            ${totals}
            ${note}
          </div>

          <div class="footer">
            <span>Documento emitido pelo sistema Mavingue.</span>
            <span>Guarde este recibo para controlo interno e conferencias futuras.</span>
          </div>

          <div class="actions">
            <button class="secondary" onclick="window.close()">Fechar</button>
            <button class="secondary" onclick="window.print()">Baixar PDF</button>
            <button class="primary" onclick="window.print()">Imprimir recibo</button>
          </div>
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

  frameWindow.onafterprint = cleanup;
  frameWindow.document.open();
  frameWindow.document.write(html);
  frameWindow.document.close();

  iframe.onload = () => {
    window.setTimeout(() => {
      frameWindow.focus();
      frameWindow.print();
      window.setTimeout(cleanup, 15000);
    }, 350);
  };
}

function openReceipt(document: ReceiptDefinition, options?: PrintDocumentOptions) {
  const html = buildHtml(document);
  if (options?.autoPrint) {
    printInHiddenFrame(html);
    return;
  }

  openPopupDocument(html);
}

export function openPrintableDocument(title: string, subtitle: string, sections: DocumentSection[], options?: PrintDocumentOptions) {
  openReceipt(
    {
      title,
      subtitle,
      reference: title,
      dateLabel: formatDateTime(new Date().toISOString()),
      accent: "#f97316",
      sections,
    },
    options
  );
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

  openReceipt(
    {
      title: "Recibo de venda",
      subtitle: "Comprovativo comercial com itens, pagamento e estado do levantamento.",
      reference: `VEN-${sale.id}`,
      dateLabel: formatDateTime(sale.criadoEm),
      accent: "#f97316",
      sections: [
        {
          title: "Participantes",
          rows: [
            { label: "Cliente", value: sale.clienteNome || "Cliente de balcao" },
            { label: "Funcionario", value: sale.funcionarioNome || "Operador nao identificado" },
          ],
        },
        {
          title: "Pagamento e entrega",
          rows: [
            { label: "Metodo", value: formatPaymentMethod(sale.formaPagamento) },
            { label: "Estado", value: formatPickupStatus(sale.estadoLevantamento) },
            { label: "Itens", value: String(sale.totalItens ?? items.length) },
            { label: "Unidades", value: String(sale.quantidade ?? 0) },
          ],
        },
      ],
      items: items.map((item) => ({
        title: item.produtoNome,
        subtitle: item.categoria || undefined,
        quantity: String(item.quantidade),
        unitPrice: formatMoney(item.precoUnitario),
        total: formatMoney(item.subtotal),
      })),
      totals: [
        { label: "Valor total", value: formatMoney(sale.total), highlight: true },
        { label: "Valor pago", value: formatMoney(sale.valorPago ?? sale.total) },
        { label: "Troco", value: formatMoney(sale.troco ?? 0) },
      ],
      note: sale.levantamentoNotas || undefined,
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

  openReceipt(
    {
      title: "Recibo de compra interna",
      subtitle: "Documento de entrada de stock com comprovativo financeiro e detalhe dos itens.",
      reference: `COM-${purchase.id}`,
      dateLabel: formatDateTime(purchase.criadoEm),
      accent: "#10b981",
      sections: [
        {
          title: "Resumo da operacao",
          rows: [
            { label: "Funcionario", value: purchase.funcionarioNome || "Operador nao identificado" },
            { label: "Metodo", value: formatPaymentMethod((purchase.formaPagamento ?? "DINHEIRO_FISICO") as FormaPagamento) },
            { label: "Itens", value: String(purchase.totalItens ?? items.length) },
            { label: "Unidades", value: String(purchase.quantidade ?? 0) },
          ],
        },
      ],
      items: items.map((item) => ({
        title: item.produtoNome,
        subtitle: item.categoria || undefined,
        quantity: String(item.quantidade),
        unitPrice: formatMoney(item.precoUnitario),
        total: formatMoney(item.subtotal),
      })),
      totals: [
        { label: "Total da compra", value: formatMoney(purchase.total), highlight: true },
        { label: "Valor pago", value: formatMoney(purchase.valorPago ?? purchase.total) },
        { label: "Troco", value: formatMoney(purchase.troco ?? 0) },
      ],
    },
    options
  );
}

export function printWaterBillDocument(bill: WaterBill, options?: PrintDocumentOptions) {
  openReceipt(
    {
      title: "Recibo de pagamento de agua",
      subtitle: "Comprovativo da factura de agua com valores cobrados e estado do pagamento.",
      reference: `AG-${bill.id}`,
      dateLabel: formatDateTime(bill.data),
      accent: "#06b6d4",
      sections: [
        {
          title: "Consumidor",
          rows: [
            { label: "Nome", value: bill.consumidorNome },
            { label: "Casa", value: bill.houseNR || "-" },
            { label: "Estado", value: bill.estadoPagamento },
            { label: "Metodo", value: formatPaymentMethod((bill.formaPagamento || "DINHEIRO_FISICO") as FormaPagamento) },
          ],
        },
      ],
      items: [
        {
          title: "Taxa fixa",
          quantity: "1",
          unitPrice: formatMoney(bill.taxaFixa),
          total: formatMoney(bill.taxaFixa),
        },
        {
          title: "Consumo de agua",
          subtitle: `Leitura #${bill.leituraId}`,
          quantity: "1",
          unitPrice: formatMoney(bill.valor),
          total: formatMoney(bill.valor),
        },
      ],
      totals: [
        { label: "Valor total", value: formatMoney(bill.valorTotal), highlight: true },
        { label: "Valor pago", value: formatMoney(bill.valorPago ?? bill.valorTotal) },
        { label: "Troco", value: formatMoney(bill.troco ?? 0) },
      ],
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

  openReceipt(
    {
      title: "Recibo de checkout",
      subtitle: "Comprovativo consolidado das compras realizadas na area do cliente.",
      reference: orders.map((order) => `VEN-${order.id}`).join(", "),
      dateLabel: formatDateTime(orders[0]?.criadoEm ?? new Date().toISOString()),
      accent: "#f97316",
      sections: [
        {
          title: "Resumo do checkout",
          rows: [
            { label: "Pedidos gravados", value: String(orders.length) },
            { label: "Metodo", value: formatPaymentMethod(paymentMethod) },
            { label: "Itens", value: String(flattenedItems.length) },
            { label: "Total de unidades", value: String(flattenedItems.reduce((sum, item) => sum + Number(item.quantidade || 0), 0)) },
          ],
        },
      ],
      items: flattenedItems.map((item) => ({
        title: item.produtoNome,
        subtitle: item.categoria || undefined,
        quantity: String(item.quantidade),
        unitPrice: formatMoney(item.precoUnitario),
        total: formatMoney(item.subtotal),
      })),
      totals: [
        {
          label: "Total consolidado",
          value: formatMoney(orders.reduce((sum, order) => sum + Number(order.total || 0), 0)),
          highlight: true,
        },
      ],
    },
    options
  );
}
