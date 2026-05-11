"use client";

import { useEffect, useMemo, useState } from "react";
import { stockApi } from "@/features/stock/api";
import type { StockItem, StockMovement } from "@/features/stock/types";
import { getErrorMessage } from "@/lib/errors";
import { formatDateTime, formatMoney } from "@/lib/formatters";
import { AlertTriangle, Boxes, Layers3, PackageSearch } from "lucide-react";

export function StockReportPage() {
  const [rows, setRows] = useState<StockItem[]>([]);
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([stockApi.list(), stockApi.movements()])
      .then(([stockRows, movementRows]) => {
        setRows(stockRows);
        setMovements(movementRows);
      })
      .catch((reason: unknown) => setError(getErrorMessage(reason, "Nao foi possivel carregar o relatorio de stock")))
      .finally(() => setLoading(false));
  }, []);

  const analytics = useMemo(
    () => ({
      valorTotal: rows.reduce((sum, row) => sum + Number(row.valorEmStock || 0), 0),
      unidades: rows.reduce((sum, row) => sum + Number(row.quantidade || 0), 0),
      alertas: rows.filter((row) => Number(row.quantidade || 0) <= Number(row.stockMinimo || 0)).length,
      topValue: [...rows].sort((left, right) => Number(right.valorEmStock || 0) - Number(left.valorEmStock || 0)).slice(0, 8),
    }),
    [rows]
  );

  return (
    <main className="grid gap-6">
      <section className="rounded-[32px] bg-gradient-to-br from-slate-950 via-slate-900 to-cyan-600 p-6 text-white shadow-lg shadow-slate-950/10">
        <p className="text-xs font-semibold uppercase tracking-[0.35em] text-cyan-200">Relatorio de stock</p>
        <h1 className="mt-3 text-3xl font-black tracking-tight">Valor restante e detalhe do inventario</h1>
      </section>

      {loading ? <div className="rounded-[28px] border border-slate-200 bg-slate-50 px-6 py-14 text-center text-sm text-slate-500">A carregar relatorio...</div> : null}
      {error ? <div className="rounded-[24px] border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div> : null}

      {!loading && !error ? (
        <>
          <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {[
              { label: "Valor total em stock", value: formatMoney(analytics.valorTotal), icon: Layers3 },
              { label: "Unidades restantes", value: analytics.unidades, icon: Boxes },
              { label: "Produtos monitorados", value: rows.length, icon: PackageSearch },
              { label: "Alertas de minimo", value: analytics.alertas, icon: AlertTriangle },
            ].map((card) => {
              const Icon = card.icon;
              return (
                <div key={card.label} className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">{card.label}</p>
                      <div className="mt-3 text-3xl font-black text-slate-900">{card.value}</div>
                    </div>
                    <div className="rounded-2xl bg-cyan-50 p-3 text-cyan-700">
                      <Icon className="h-5 w-5" />
                    </div>
                  </div>
                </div>
              );
            })}
          </section>

          <section className="grid gap-6 xl:grid-cols-2">
            <div className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">Produtos com maior valor</p>
              <div className="mt-5 grid gap-3">
                {analytics.topValue.map((row) => (
                  <div key={row.produtoId} className="rounded-[24px] border border-slate-200 bg-slate-50 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-bold text-slate-900">{row.produtoNome}</p>
                        <p className="mt-1 text-xs text-slate-500">
                          {row.quantidade} un. | minimo {row.stockMinimo}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-black text-cyan-700">{formatMoney(row.valorEmStock)}</p>
                        <p className="mt-1 text-xs text-slate-500">{formatMoney(row.precoUnitario)}/un</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">Ultimos movimentos</p>
              <div className="mt-5 grid gap-3">
                {movements.slice(0, 8).map((movement) => (
                  <div key={movement.id} className="rounded-[24px] border border-slate-200 bg-slate-50 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-bold text-slate-900">{movement.produtoNome}</p>
                        <p className="mt-1 text-xs text-slate-500">{formatDateTime(movement.criadoEm)}</p>
                      </div>
                      <div className="text-right">
                        <p className={`font-black ${movement.tipo === "ENTRADA" ? "text-emerald-700" : "text-rose-700"}`}>
                          {movement.tipo === "ENTRADA" ? "+" : "-"}
                          {movement.quantidade}
                        </p>
                        <p className="mt-1 text-xs text-slate-500">{movement.tipo}</p>
                      </div>
                    </div>
                    {movement.motivo ? <p className="mt-3 text-sm text-slate-600">{movement.motivo}</p> : null}
                  </div>
                ))}
              </div>
            </div>
          </section>
        </>
      ) : null}
    </main>
  );
}
