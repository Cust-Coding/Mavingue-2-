"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { categoriesApi } from "@/features/categories/api";
import type { ProductCategory } from "@/features/categories/types";
import { buildProductCategoryOptions, formatProductCategoryLabel } from "@/features/categories/utils";
import { stockApi } from "@/features/stock/api";
import type { StockAdjust, StockItem, StockMovement } from "@/features/stock/types";
import { getErrorMessage } from "@/lib/errors";
import { formatDateTime, formatMoney } from "@/lib/formatters";
import { AlertTriangle, ArrowDown, ArrowUp, Boxes, Package2, Search, ShieldCheck, TrendingUp } from "lucide-react";

export default function AdminStock() {
  const [rows, setRows] = useState<StockItem[]>([]);
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("todos");
  const [selectedProductId, setSelectedProductId] = useState<number | null>(null);
  const [form, setForm] = useState<StockAdjust>({
    produtoId: 0,
    quantidade: 1,
    tipo: "ENTRADA",
    motivo: "",
    stockMinimo: 0,
  });

  async function load() {
    setLoading(true);
    setError("");

    try {
      const [stockRows, movementRows, categoryRows] = await Promise.all([stockApi.list(), stockApi.movements(), categoriesApi.list()]);
      setRows(stockRows);
      setMovements(movementRows);
      setCategories(categoryRows);

      const defaultProduct = stockRows[0];
      if (defaultProduct && !selectedProductId) {
        setSelectedProductId(defaultProduct.produtoId);
        setForm((current) => ({
          ...current,
          produtoId: defaultProduct.produtoId,
          stockMinimo: defaultProduct.stockMinimo,
        }));
      }
    } catch (reason: unknown) {
      setError(getErrorMessage(reason, "Erro ao carregar stock"));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  const filteredRows = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return rows.filter((row) => {
      const rowCategory = row.categoria || "construcao";
      const matchesCategory = category === "todos" || rowCategory === category;
      const matchesQuery = !normalizedQuery || row.produtoNome.toLowerCase().includes(normalizedQuery);
      return matchesCategory && matchesQuery;
    });
  }, [category, query, rows]);

  const selectedRow = useMemo(
    () => rows.find((row) => row.produtoId === selectedProductId) ?? null,
    [rows, selectedProductId]
  );

  const summary = useMemo(
    () => ({
      produtos: rows.length,
      unidades: rows.reduce((sum, row) => sum + Number(row.quantidade || 0), 0),
      valor: rows.reduce((sum, row) => sum + Number(row.valorEmStock || 0), 0),
      alertas: rows.filter((row) => Number(row.quantidade || 0) <= Number(row.stockMinimo || 0)).length,
    }),
    [rows]
  );
  const categoryOptions = useMemo(() => buildProductCategoryOptions(categories, true), [categories]);

  function selectProduct(row: StockItem) {
    setSelectedProductId(row.produtoId);
    setForm((current) => ({
      ...current,
      produtoId: row.produtoId,
      stockMinimo: row.stockMinimo,
    }));
  }

  async function applyAdjustment() {
    if (!form.produtoId || form.quantidade <= 0) {
      setError("Seleccione um produto e informe uma quantidade valida.");
      return;
    }

    setSaving(true);
    setError("");

    try {
      await stockApi.adjust(form);
      setForm((current) => ({
        ...current,
        quantidade: 1,
        motivo: "",
      }));
      await load();
    } catch (reason: unknown) {
      setError(getErrorMessage(reason, "Erro no ajuste de stock"));
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="grid gap-6">
      <section className="rounded-[32px] bg-gradient-to-br from-slate-950 via-slate-900 to-cyan-600 p-6 text-white shadow-lg shadow-slate-950/10">
        <p className="text-xs font-semibold uppercase tracking-[0.35em] text-cyan-200">Stock</p>
        <h1 className="mt-3 text-3xl font-black tracking-tight">Controlo profissional de stock</h1>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-200">
          Visualize valor restante em stock, niveis minimos, movimentos e ajustes operacionais com uma experiencia mais limpa e confiavel.
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[
          { label: "Produtos activos", value: summary.produtos, icon: Package2 },
          { label: "Unidades em stock", value: summary.unidades, icon: Boxes },
          { label: "Valor em stock", value: formatMoney(summary.valor), icon: TrendingUp },
          { label: "Abaixo do minimo", value: summary.alertas, icon: AlertTriangle },
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

      {error ? (
        <div className="rounded-[24px] border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div>
      ) : null}

      <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">Visao do stock</p>
              <h2 className="mt-2 text-2xl font-black text-slate-900">Produtos e valor restante</h2>
            </div>
            <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
              <label className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Pesquisar produto..."
                  className="h-12 min-w-[240px] rounded-2xl pl-9"
                />
              </label>
              <select
                value={category}
                onChange={(event) => setCategory(event.target.value)}
                className="h-12 rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition focus:border-cyan-400 focus:ring-4 focus:ring-cyan-100"
              >
                {categoryOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {loading ? (
            <div className="mt-5 rounded-[24px] border border-slate-200 bg-slate-50 px-6 py-14 text-center text-sm text-slate-500">
              A carregar stock...
            </div>
          ) : (
            <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {filteredRows.map((row) => {
                const isActive = row.produtoId === selectedProductId;
                const lowStock = Number(row.quantidade || 0) <= Number(row.stockMinimo || 0);

                return (
                  <button
                    key={row.produtoId}
                    type="button"
                    onClick={() => selectProduct(row)}
                    className={`rounded-[28px] border p-4 text-left transition ${
                      isActive
                        ? "border-cyan-300 bg-cyan-50/70 shadow-sm"
                        : "border-slate-200 bg-slate-50 hover:border-cyan-200 hover:bg-white"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <span className="rounded-full bg-white px-3 py-1 text-[11px] font-bold uppercase tracking-[0.24em] text-slate-600">
                          {formatProductCategoryLabel(row.categoria, categories)}
                        </span>
                        <h3 className="mt-3 text-base font-black text-slate-900">{row.produtoNome}</h3>
                      </div>
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-bold ${
                          lowStock ? "bg-rose-100 text-rose-700" : "bg-emerald-100 text-emerald-700"
                        }`}
                      >
                        {lowStock ? "Baixo" : "Estavel"}
                      </span>
                    </div>

                    <div className="mt-4 grid gap-3">
                      <div className="rounded-2xl bg-white px-3 py-3">
                        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">Quantidade</p>
                        <p className="mt-1 text-2xl font-black text-slate-900">{row.quantidade}</p>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="rounded-2xl bg-white px-3 py-3">
                          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">Minimo</p>
                          <p className="mt-1 font-bold text-slate-900">{row.stockMinimo}</p>
                        </div>
                        <div className="rounded-2xl bg-white px-3 py-3">
                          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">Valor</p>
                          <p className="mt-1 font-bold text-cyan-700">{formatMoney(row.valorEmStock)}</p>
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <aside className="grid gap-6">
          <section className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-cyan-50 p-3 text-cyan-700">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">Ajuste manual</p>
                <h2 className="mt-1 text-2xl font-black text-slate-900">Aplicar movimento</h2>
              </div>
            </div>

            {selectedRow ? (
              <div className="mt-5 grid gap-4">
                <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">Produto seleccionado</p>
                  <p className="mt-2 text-lg font-black text-slate-900">{selectedRow.produtoNome}</p>
                  <p className="mt-2 text-sm text-slate-500">
                    Actual: {selectedRow.quantidade} un. | Valor: {formatMoney(selectedRow.valorEmStock)}
                  </p>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <label className="grid gap-2 text-sm font-semibold text-slate-700">
                    Tipo
                    <select
                      value={form.tipo}
                      onChange={(event) => setForm((current) => ({ ...current, tipo: event.target.value as StockAdjust["tipo"] }))}
                      className="h-12 rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition focus:border-cyan-400 focus:ring-4 focus:ring-cyan-100"
                    >
                      <option value="ENTRADA">Entrada</option>
                      <option value="SAIDA">Saida</option>
                    </select>
                  </label>

                  <label className="grid gap-2 text-sm font-semibold text-slate-700">
                    Quantidade
                    <Input
                      type="number"
                      min="1"
                      value={form.quantidade}
                      onChange={(event) => setForm((current) => ({ ...current, quantidade: Number(event.target.value) }))}
                      className="h-12 rounded-2xl"
                    />
                  </label>
                </div>

                <label className="grid gap-2 text-sm font-semibold text-slate-700">
                  Stock minimo
                  <Input
                    type="number"
                    min="0"
                    value={form.stockMinimo ?? 0}
                    onChange={(event) => setForm((current) => ({ ...current, stockMinimo: Number(event.target.value) }))}
                    className="h-12 rounded-2xl"
                  />
                </label>

                <label className="grid gap-2 text-sm font-semibold text-slate-700">
                  Motivo
                  <textarea
                    value={form.motivo || ""}
                    onChange={(event) => setForm((current) => ({ ...current, motivo: event.target.value }))}
                    placeholder="Ex.: correcao de inventario, chegada de fornecedor, dano, saida interna..."
                    className="min-h-28 rounded-[24px] border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-cyan-400 focus:ring-4 focus:ring-cyan-100"
                  />
                </label>

                <Button onClick={applyAdjustment} disabled={saving} className="w-full bg-cyan-600 text-white hover:bg-cyan-700">
                  {saving ? "A aplicar..." : "Aplicar movimento"}
                </Button>
              </div>
            ) : (
              <div className="mt-5 rounded-[24px] border border-dashed border-slate-200 bg-slate-50 px-4 py-10 text-center text-sm text-slate-500">
                Seleccione um produto para ajustar o stock.
              </div>
            )}
          </section>

          <section className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">Movimentos recentes</p>
            <div className="mt-4 grid gap-3">
              {movements.slice(0, 6).map((movement) => (
                <div key={movement.id} className="rounded-[24px] border border-slate-200 bg-slate-50 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-bold text-slate-900">{movement.produtoNome}</p>
                      <p className="mt-1 text-xs text-slate-500">{formatDateTime(movement.criadoEm)}</p>
                    </div>
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-bold ${
                        movement.tipo === "ENTRADA" ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"
                      }`}
                    >
                      {movement.tipo === "ENTRADA" ? <ArrowUp className="h-3.5 w-3.5" /> : <ArrowDown className="h-3.5 w-3.5" />}
                      {movement.quantidade}
                    </span>
                  </div>
                  {movement.motivo ? <p className="mt-3 text-sm text-slate-600">{movement.motivo}</p> : null}
                </div>
              ))}
            </div>
          </section>
        </aside>
      </section>
    </main>
  );
}
