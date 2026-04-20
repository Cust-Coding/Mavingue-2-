"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { stockApi } from "@/features/stock/api";
import type { StockItem, StockMovement } from "@/features/stock/types";
import { productsApi } from "@/features/products/api";
import type { Product } from "@/features/products/types";
import { getErrorMessage } from "@/lib/errors";
import { formatDateTime } from "@/lib/formatters";

export default function AdminStock() {
  const [rows, setRows] = useState<StockItem[]>([]);
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [form, setForm] = useState({ produtoId: "", quantidade: "", tipo: "ENTRADA" as "ENTRADA" | "SAIDA", motivo: "" });

  async function load() {
    setErr("");
    setLoading(true);

    try {
      const [stockRows, movementRows, productRows] = await Promise.all([
        stockApi.list(),
        stockApi.movements(),
        productsApi.list(),
      ]);
      setRows(stockRows);
      setMovements(movementRows);
      setProducts(productRows);
    } catch (reason: unknown) {
      setErr(getErrorMessage(reason, "Erro ao carregar stock"));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function adjust() {
    setErr("");

    if (!form.produtoId || !form.quantidade) {
      setErr("Seleccione o produto e informe a quantidade.");
      return;
    }

    try {
      await stockApi.adjust({
        produtoId: Number(form.produtoId),
        quantidade: Number(form.quantidade),
        tipo: form.tipo,
        motivo: form.motivo || undefined,
      });
      setForm({ produtoId: "", quantidade: "", tipo: "ENTRADA", motivo: "" });
      await load();
    } catch (reason: unknown) {
      setErr(getErrorMessage(reason, "Erro no ajuste de stock"));
    }
  }

  return (
    <main className="grid gap-6">
      <section className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/70">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">Stock</p>
        <h1 className="mt-3 text-3xl font-black tracking-tight text-slate-900 dark:text-white">Gestao de stock e movimentos</h1>
      </section>

      {err && <div className="rounded-[24px] border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{err}</div>}

      <section className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/70">
        <div className="grid gap-3 xl:grid-cols-[1.5fr_1fr_1fr_1.5fr_auto]">
          <select
            value={form.produtoId}
            onChange={(event) => setForm({ ...form, produtoId: event.target.value })}
            className="h-11 rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
          >
            <option value="">Seleccionar produto</option>
            {products.map((product) => (
              <option key={product.id} value={product.id}>
                {product.name}
              </option>
            ))}
          </select>
          <Input placeholder="quantidade" value={form.quantidade} onChange={(e) => setForm({ ...form, quantidade: e.target.value })} />
          <select
            value={form.tipo}
            onChange={(e) => setForm({ ...form, tipo: e.target.value as "ENTRADA" | "SAIDA" })}
            className="h-11 rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
          >
            <option value="ENTRADA">ENTRADA</option>
            <option value="SAIDA">SAIDA</option>
          </select>
          <Input placeholder="motivo (opcional)" value={form.motivo} onChange={(e) => setForm({ ...form, motivo: e.target.value })} />
          <Button onClick={adjust}>Aplicar</Button>
        </div>
      </section>

      <section className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/70">
        <h2 className="text-2xl font-black text-slate-900 dark:text-white">Stock actual</h2>
        {loading ? <div className="mt-4 text-sm text-slate-500">A carregar stock...</div> : null}
        {!loading && rows.length === 0 ? <div className="mt-4 text-sm text-slate-500">Sem stock registado.</div> : null}

        {!loading && rows.length > 0 && (
          <div className="mt-5 overflow-x-auto rounded-[24px] border border-slate-200 dark:border-slate-800">
            <table className="min-w-full border-collapse">
              <thead className="bg-slate-50 dark:bg-slate-950">
                <tr>
                  <th className="px-4 py-3 text-left text-xs uppercase tracking-[0.2em] text-slate-400">Produto</th>
                  <th className="px-4 py-3 text-left text-xs uppercase tracking-[0.2em] text-slate-400">Quantidade</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((stock) => (
                  <tr key={stock.produtoId} className="border-t border-slate-200 dark:border-slate-800">
                    <td className="px-4 py-3 text-sm font-semibold text-slate-900 dark:text-white">{stock.produtoNome}</td>
                    <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-300">{stock.quantidade}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/70">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-2xl font-black text-slate-900 dark:text-white">Ultimos movimentos</h2>
          <a href="/admin/stock/movimentos" className="text-sm font-bold text-orange-600">
            Ver historico completo
          </a>
        </div>

        {movements.length === 0 ? <div className="mt-4 text-sm text-slate-500">Sem movimentos ainda.</div> : null}

        {movements.length > 0 && (
          <div className="mt-5 grid gap-3">
            {movements.slice(0, 6).map((movement) => (
              <article key={movement.id} className="rounded-[24px] border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950">
                <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                  <div>
                    <div className="text-base font-bold text-slate-900 dark:text-white">{movement.produtoNome}</div>
                    <div className="text-sm text-slate-500 dark:text-slate-400">
                      {movement.tipo} • {movement.quantidade} unidades • {movement.ferragemNome}
                    </div>
                  </div>
                  <div className="text-sm text-slate-500 dark:text-slate-400">{formatDateTime(movement.criadoEm)}</div>
                </div>
                {movement.motivo ? <div className="mt-2 text-sm text-slate-600 dark:text-slate-300">{movement.motivo}</div> : null}
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
