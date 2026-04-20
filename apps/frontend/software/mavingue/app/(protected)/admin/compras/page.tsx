"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { productsApi } from "@/features/products/api";
import type { Product } from "@/features/products/types";
import { purchasesApi } from "@/features/purchases/api";
import type { FacturaCompra } from "@/features/purchases/types";
import { printPurchaseDocument } from "@/lib/documents/print";
import { getErrorMessage } from "@/lib/errors";
import { formatDateTime, formatMoney } from "@/lib/formatters";

export default function AdminCompras() {
  const [rows, setRows] = useState<FacturaCompra[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [form, setForm] = useState({ produtoId: "", quantidade: "1" });

  async function load() {
    setLoading(true);
    setError("");

    try {
      const [purchaseRows, productRows] = await Promise.all([purchasesApi.list(), productsApi.list()]);
      setRows(purchaseRows);
      setProducts(productRows);
    } catch (reason: unknown) {
      setError(getErrorMessage(reason, "Erro ao carregar compras"));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const totalComprado = useMemo(() => rows.reduce((sum, row) => sum + Number(row.total || 0), 0), [rows]);

  async function submit() {
    setError("");
    setSuccess("");

    if (!form.produtoId || !form.quantidade) {
      setError("Seleccione o produto e a quantidade.");
      return;
    }

    try {
      await purchasesApi.create({
        produtoId: Number(form.produtoId),
        quantidade: Number(form.quantidade),
      });

      setSuccess("Compra registada e stock actualizado.");
      setForm({ produtoId: "", quantidade: "1" });
      await load();
    } catch (reason: unknown) {
      setError(getErrorMessage(reason, "Nao foi possivel registar a compra"));
    }
  }

  return (
    <main className="grid gap-6">
      <section className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/70">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">Compras</p>
        <h1 className="mt-3 text-3xl font-black tracking-tight text-orange-600 dark:text-white">
          Compras, facturas e entrada de stock
        </h1>
        <p className="mt-3 max-w-3xl text-base leading-7 text-slate-500 dark:text-slate-400">
          O operador autenticado e associado automaticamente a compra e cada registo fica pronto para emissao em PDF.
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900/70">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">Registos</p>
          <div className="mt-3 text-3xl font-black text-slate-900 dark:text-white">{rows.length}</div>
        </div>
        <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900/70">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">Valor total</p>
          <div className="mt-3 text-3xl font-black text-orange-600">{formatMoney(totalComprado)}</div>
        </div>
        <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900/70">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">Ultimo estado</p>
          <div className="mt-3 text-base font-black text-slate-900 dark:text-white">
            {rows[0] ? `Compra #${rows[0].id}` : "Sem compras"}
          </div>
        </div>
      </section>

      <section className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/70">
        <h2 className="text-2xl font-black text-slate-900 dark:text-white">Registar nova compra</h2>
        <div className="mt-5 grid gap-3 xl:grid-cols-[1.5fr_1fr_auto]">
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
          <Input
            placeholder="quantidade"
            value={form.quantidade}
            onChange={(event) => setForm({ ...form, quantidade: event.target.value })}
          />
          <Button onClick={submit}>Registar compra</Button>
        </div>

        {success && (
          <div className="mt-4 rounded-[24px] border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 dark:border-emerald-900/40 dark:bg-emerald-950/20 dark:text-emerald-300">
            {success}
          </div>
        )}
      </section>

      {loading && (
        <div className="rounded-[28px] border border-slate-200 bg-slate-50 px-6 py-14 text-center text-slate-500 dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-400">
          A carregar compras...
        </div>
      )}

      {error && (
        <div className="rounded-[28px] border border-rose-200 bg-rose-50 px-6 py-10 text-rose-700 dark:border-rose-900/40 dark:bg-rose-950/20 dark:text-rose-300">
          {error}
        </div>
      )}

      {!loading && !error && rows.length === 0 && (
        <div className="rounded-[28px] border border-slate-200 bg-slate-50 px-6 py-16 text-center text-slate-500 dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-400">
          Sem compras registadas.
        </div>
      )}

      {!loading && !error && rows.length > 0 && (
        <section className="grid gap-4">
          {rows
            .slice()
            .sort((left, right) => right.id - left.id)
            .map((row) => (
              <article
                key={row.id}
                className="rounded-[32px] border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900/70"
              >
                <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
                  <div className="flex-1">
                    <h2 className="text-xl font-black text-slate-900 dark:text-white">
                      Compra #{row.id} - {row.produtoNome || `Produto #${row.produtoId}`}
                    </h2>

                    <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-5">
                      <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950">
                        <div className="text-xs uppercase tracking-[0.2em] text-slate-400">Data</div>
                        <div className="mt-2 font-bold text-slate-900 dark:text-white">{formatDateTime(row.criadoEm)}</div>
                      </div>
                      <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950">
                        <div className="text-xs uppercase tracking-[0.2em] text-slate-400">Funcionario</div>
                        <div className="mt-2 font-bold text-slate-900 dark:text-white">{row.funcionarioNome}</div>
                      </div>
                      <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950">
                        <div className="text-xs uppercase tracking-[0.2em] text-slate-400">Quantidade</div>
                        <div className="mt-2 font-bold text-slate-900 dark:text-white">{row.quantidade}</div>
                      </div>
                      <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950">
                        <div className="text-xs uppercase tracking-[0.2em] text-slate-400">Preco unitario</div>
                        <div className="mt-2 font-bold text-slate-900 dark:text-white">{formatMoney(row.precoUnitario)}</div>
                      </div>
                      <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950">
                        <div className="text-xs uppercase tracking-[0.2em] text-slate-400">Total</div>
                        <div className="mt-2 font-black text-orange-600">{formatMoney(row.total)}</div>
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => printPurchaseDocument(row)}
                    className="inline-flex h-11 items-center justify-center rounded-2xl bg-slate-950 px-4 text-sm font-bold text-white transition hover:bg-orange-600 dark:bg-white dark:text-slate-950"
                  >
                    Baixar PDF
                  </button>
                </div>
              </article>
            ))}
        </section>
      )}
    </main>
  );
}
