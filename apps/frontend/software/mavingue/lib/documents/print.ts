import type { FacturaCompra } from "@/features/purchases/types";
import type { Venda } from "@/features/sales/types";
import type { WaterBill } from "@/features/water/types";
import { formatDateTime, formatMoney, formatPaymentMethod, formatPickupStatus } from "@/lib/formatters";

type DocumentSection = {
  title: string;
  rows: Array<{ label: string; value: string }>;
};

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

export function openPrintableDocument(title: string, subtitle: string, sections: DocumentSection[]) {
  if (typeof window === "undefined") return;

  const popup = window.open("", "_blank", "width=960,height=720");
  if (!popup) return;

  const content = sections
    .map(
      (section) => `
        <section class="section">
          <h2>${escapeHtml(section.title)}</h2>
          <div class="grid">
            ${section.rows
              .map(
                (row) => `
                  <div class="row">
                    <span class="label">${escapeHtml(row.label)}</span>
                    <strong>${escapeHtml(row.value)}</strong>
                  </div>
                `
              )
              .join("")}
          </div>
        </section>
      `
    )
    .join("");

  popup.document.write(`
    <!doctype html>
    <html lang="pt">
      <head>
        <meta charset="utf-8" />
        <title>${escapeHtml(title)}</title>
        <style>
          body {
            margin: 0;
            background: #f8fafc;
            color: #0f172a;
            font-family: Arial, sans-serif;
          }
          .sheet {
            max-width: 860px;
            margin: 0 auto;
            padding: 40px 28px 56px;
          }
          .hero {
            border-radius: 24px;
            padding: 28px;
            background: linear-gradient(135deg, #0f172a, #1e293b);
            color: white;
            margin-bottom: 24px;
          }
          .hero h1 {
            margin: 0 0 8px;
            font-size: 28px;
          }
          .hero p {
            margin: 0;
            color: rgba(255,255,255,.75);
          }
          .section {
            background: white;
            border: 1px solid #e2e8f0;
            border-radius: 20px;
            padding: 20px;
            margin-bottom: 18px;
          }
          .section h2 {
            margin: 0 0 16px;
            font-size: 16px;
          }
          .grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
            gap: 12px;
          }
          .row {
            border: 1px solid #e2e8f0;
            border-radius: 16px;
            padding: 14px;
            background: #f8fafc;
          }
          .label {
            display: block;
            color: #64748b;
            font-size: 12px;
            text-transform: uppercase;
            letter-spacing: .08em;
            margin-bottom: 8px;
          }
          .actions {
            display: flex;
            justify-content: flex-end;
            gap: 12px;
            margin-top: 24px;
          }
          button {
            border: none;
            border-radius: 999px;
            padding: 12px 18px;
            font-weight: 700;
            cursor: pointer;
          }
          .primary {
            background: #ea580c;
            color: white;
          }
          .secondary {
            background: white;
            color: #0f172a;
            border: 1px solid #cbd5e1;
          }
          @media print {
            body {
              background: white;
            }
            .actions {
              display: none;
            }
            .sheet {
              padding: 0;
            }
          }
        </style>
      </head>
      <body>
        <main class="sheet">
          <header class="hero">
            <h1>${escapeHtml(title)}</h1>
            <p>${escapeHtml(subtitle)}</p>
          </header>
          ${content}
          <div class="actions">
            <button class="secondary" onclick="window.close()">Fechar</button>
            <button class="primary" onclick="window.print()">Baixar PDF</button>
          </div>
        </main>
      </body>
    </html>
  `);
  popup.document.close();
}

export function printSaleDocument(sale: Venda) {
  openPrintableDocument(`Factura de venda #${sale.id}`, "Documento pronto para impressao ou exportacao em PDF.", [
    {
      title: "Resumo da venda",
      rows: [
        { label: "Referencia", value: `VEN-${sale.id}` },
        { label: "Data", value: formatDateTime(sale.criadoEm) },
        { label: "Estado", value: formatPickupStatus(sale.estadoLevantamento) },
        { label: "Pagamento", value: formatPaymentMethod(sale.formaPagamento) },
      ],
    },
    {
      title: "Participantes",
      rows: [
        { label: "Cliente", value: sale.clienteNome || `Cliente #${sale.clienteId}` },
        { label: "Funcionario", value: sale.funcionarioNome || `Funcionario #${sale.funcionarioId}` },
      ],
    },
    {
      title: "Produto",
      rows: [
        { label: "Produto", value: sale.produtoNome },
        { label: "Quantidade", value: String(sale.quantidade) },
        { label: "Preco unitario", value: formatMoney(sale.precoUnitario) },
        { label: "Total", value: formatMoney(sale.total) },
      ],
    },
  ]);
}

export function printPurchaseDocument(purchase: FacturaCompra) {
  openPrintableDocument(`Factura de compra #${purchase.id}`, "Documento de entrada de stock pronto para exportacao.", [
    {
      title: "Resumo da compra",
      rows: [
        { label: "Referencia", value: `COM-${purchase.id}` },
        { label: "Data", value: formatDateTime(purchase.criadoEm) },
        { label: "Funcionario", value: purchase.funcionarioNome || `Funcionario #${purchase.funcionarioId}` },
      ],
    },
    {
      title: "Produto",
      rows: [
        { label: "Produto", value: purchase.produtoNome || `Produto #${purchase.produtoId}` },
        { label: "Quantidade", value: String(purchase.quantidade) },
        { label: "Preco unitario", value: formatMoney(purchase.precoUnitario) },
        { label: "Total", value: formatMoney(purchase.total) },
      ],
    },
  ]);
}

export function printWaterBillDocument(bill: WaterBill) {
  openPrintableDocument(`Factura de agua #${bill.id}`, "Factura de agua pronta para exportacao.", [
    {
      title: "Resumo",
      rows: [
        { label: "Casa ID", value: `#${bill.consumidorId}` },
        { label: "Consumidor", value: bill.consumidorNome },
        { label: "Casa", value: bill.houseNR || "-" },
        { label: "Data", value: formatDateTime(bill.data) },
        { label: "Estado", value: bill.estadoPagamento },
        { label: "Pagamento", value: formatPaymentMethod(bill.formaPagamento) },
      ],
    },
    {
      title: "Valores",
      rows: [
        { label: "Taxa fixa", value: formatMoney(bill.taxaFixa) },
        { label: "Consumo", value: formatMoney(bill.valor) },
        { label: "Total", value: formatMoney(bill.valorTotal) },
        { label: "Leitura", value: `#${bill.leituraId}` },
      ],
    },
  ]);
}
