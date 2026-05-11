"use client";

import { useEffect, useMemo, useState } from "react";
import { salesApi } from "@/features/sales/api";
import type { Venda } from "@/features/sales/types";
import { getErrorMessage } from "@/lib/errors";
import { formatDateTime, formatMoney } from "@/lib/formatters";
import { BarChart3, Boxes, CreditCard, TrendingUp } from "lucide-react";

type AggregateRow = {
  name: string;
  quantidade: number;
  total: number;
};

export function SalesReportPage() {
  const [rows, setRows] = useState<Venda[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    salesApi
      .list()
      .then(setRows)
      .catch((reason: unknown) => setError(getErrorMessage(reason, "Nao foi possivel carregar o relatorio de vendas")))
      .finally(() => setLoading(false));
  }, []);

  const analytics = useMemo(() => {
    const totalReceita = rows.reduce((sum, row) => sum + Number(row.total || 0), 0);
    const totalUnidades = rows.reduce((sum, row) => sum + Number(row.quantidade || 0), 0);
    const trocoTotal = rows.reduce((sum, row) => sum + Number(row.troco || 0), 0);

    const byProductMap = new Map<string, AggregateRow>();
    const byCategoryMap = new Map<string, AggregateRow>();

    rows.forEach((row) => {
      const items = row.items?.length
        ? row.items
        : [
            {
              produtoNome: row.produtoNome,
              categoria: row.categoria || "construcao",
              quantidade: row.quantidade,
              subtotal: row.total,
            },
          ];

      items.forEach((item) => {
        const productKey = item.produtoNome;
        const categoryKey = item.categoria || "construcao";

        const currentProduct = byProductMap.get(productKey) ?? { name: productKey, quantidade: 0, total: 0 };
        currentProduct.quantidade += Number(item.quantidade || 0);
        currentProduct.total += Number(item.subtotal || 0);
        byProductMap.set(productKey, currentProduct);

        const currentCategory = byCategoryMap.get(categoryKey) ?? { name: categoryKey, quantidade: 0, total: 0 };
        currentCategory.quantidade += Number(item.quantidade || 0);
        currentCategory.total += Number(item.subtotal || 0);
        byCategoryMap.set(categoryKey, currentCategory);
      });
    });

    return {
      totalReceita,
      totalUnidades,
      trocoTotal,
      ticketMedio: rows.length ? totalReceita / rows.length : 0,
      topProducts: [...byProductMap.values()].sort((left, right) => right.total - left.total).slice(0, 6),
      topCategories: [...byCategoryMap.values()].sort((left, right) => right.total - left.total),
    };
  }, [rows]);

  return (
    <main className="grid gap-6">
      <section className="rounded-[32px] bg-gradient-to-br from-slate-950 via-slate-900 to-orange-600 p-6 text-white shadow-lg shadow-slate-950/10">
        <p className="text-xs font-semibold uppercase tracking-[0.35em] text-orange-200">Relatorio de vendas</p>
        <h1 className="mt-3 text-3xl font-black tracking-tight">Receita, itens e desempenho comercial</h1>
      </section>

      {loading ? <div className="rounded-[28px] border border-slate-200 bg-slate-50 px-6 py-14 text-center text-sm text-slate-500">A carregar relatorio...</div> : null}
      {error ? <div className="rounded-[24px] border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div> : null}

      {!loading && !error ? (
        <>
          <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {[
              { label: "Receita total", value: formatMoney(analytics.totalReceita), icon: TrendingUp },
              { label: "Unidades vendidas", value: analytics.totalUnidades, icon: Boxes },
              { label: "Ticket medio", value: formatMoney(analytics.ticketMedio), icon: BarChart3 },
              { label: "Troco registado", value: formatMoney(analytics.trocoTotal), icon: CreditCard },
            ].map((card) => {
              const Icon = card.icon;
              return (
                <div key={card.label} className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">{card.label}</p>
                      <div className="mt-3 text-3xl font-black text-slate-900">{card.value}</div>
                    </div>
                    <div className="rounded-2xl bg-orange-50 p-3 text-orange-600">
                      <Icon className="h-5 w-5" />
                    </div>
                  </div>
                </div>
              );
            })}
          </section>

          <section className="grid gap-6 xl:grid-cols-2">
            <div className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">Por produto</p>
              <div className="mt-5 grid gap-3">
                {analytics.topProducts.map((item) => (
                  <div key={item.name} className="rounded-[24px] border border-slate-200 bg-slate-50 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-bold text-slate-900">{item.name}</p>
                        <p className="mt-1 text-xs text-slate-500">{item.quantidade} unidade(s)</p>
                      </div>
                      <div className="text-right font-black text-orange-700">{formatMoney(item.total)}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">Por categoria</p>
              <div className="mt-5 grid gap-3">
                {analytics.topCategories.map((item) => (
                  <div key={item.name} className="rounded-[24px] border border-slate-200 bg-slate-50 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-bold capitalize text-slate-900">{item.name}</p>
                        <p className="mt-1 text-xs text-slate-500">{item.quantidade} unidade(s)</p>
                      </div>
                      <div className="text-right font-black text-slate-900">{formatMoney(item.total)}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">Ultimas vendas</p>
            <div className="mt-5 grid gap-3">
              {rows.slice(0, 8).map((row) => (
                <div key={row.id} className="rounded-[24px] border border-slate-200 bg-slate-50 p-4">
                  <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <div>
                      <p className="font-bold text-slate-900">Venda #{row.id} - {row.clienteNome}</p>
                      <p className="mt-1 text-xs text-slate-500">{formatDateTime(row.criadoEm)}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-black text-orange-700">{formatMoney(row.total)}</p>
                      <p className="mt-1 text-xs text-slate-500">{row.totalItens ?? row.items?.length ?? 1} item(ns)</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </>
      ) : null}
    </main>
  );
}
