"use client";

import { useEffect, useState } from "react";
import { stockApi } from "@/features/stock/api";
import type { StockMovement } from "@/features/stock/types";
import { getErrorMessage } from "@/lib/errors";
import { formatDateTime } from "@/lib/formatters";

export default function MovimentosStockPage() {
  const [rows, setRows] = useState<StockMovement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    stockApi
      .movements()
      .then(setRows)
      .catch((reason: unknown) => setError(getErrorMessage(reason, "Nao foi possivel carregar os movimentos")))
      .finally(() => setLoading(false));
  }, []);

  return (
    <main className="grid gap-6">
      <section className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/70">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">Stock</p>
        <h1 className="mt-3 text-3xl font-black tracking-tight text-slate-900 dark:text-white">Historico de movimentos</h1>
      </section>

      {loading ? <div className="text-sm text-slate-500">A carregar movimentos...</div> : null}
      {error ? <div className="rounded-[24px] border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div> : null}

      {!loading && !error && rows.length === 0 ? (
        <div className="rounded-[24px] border border-slate-200 bg-white px-6 py-12 text-center text-slate-500 dark:border-slate-800 dark:bg-slate-900/70">
          Sem movimentos registados.
        </div>
      ) : null}

      {!loading && !error && rows.length > 0 ? (
        <section className="grid gap-4">
          {rows.map((movement) => (
            <article key={movement.id} className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900/70">
              <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
                <div>
                  <h2 className="text-lg font-black text-slate-900 dark:text-white">{movement.produtoNome}</h2>
                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                    {movement.tipo} de {movement.quantidade} unidades em {movement.ferragemNome}
                  </p>
                </div>
                <div className="text-sm text-slate-500 dark:text-slate-400">{formatDateTime(movement.criadoEm)}</div>
              </div>
              {movement.motivo ? <div className="mt-3 text-sm text-slate-600 dark:text-slate-300">{movement.motivo}</div> : null}
            </article>
          ))}
        </section>
      ) : null}
    </main>
  );
}
