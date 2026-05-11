"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { categoriesApi } from "@/features/categories/api";
import type { ProductCategory } from "@/features/categories/types";
import { buildProductCategoryOptions, formatProductCategoryLabel } from "@/features/categories/utils";
import { productsApi } from "@/features/products/api";
import type { Product } from "@/features/products/types";
import { purchasesApi } from "@/features/purchases/api";
import type { FacturaCompra } from "@/features/purchases/types";
import type { FormaPagamento } from "@/features/sales/types";
import { printPurchaseDocument } from "@/lib/documents/print";
import { getErrorMessage } from "@/lib/errors";
import { formatDateTime, formatMoney, formatPaymentMethod } from "@/lib/formatters";
import { inferProductCategory } from "@/lib/catalog";
import { Banknote, Boxes, CheckCircle2, ClipboardList, CreditCard, PackagePlus, Search, ShoppingBasket, Wallet, WalletCards } from "lucide-react";

const paymentOptions: Array<{ value: FormaPagamento; label: string; icon: typeof Wallet }> = [
  { value: "DINHEIRO_FISICO", label: "Dinheiro fisico", icon: Banknote },
  { value: "CARTEIRA_MOVEL", label: "Carteira movel", icon: Wallet },
  { value: "CARTAO", label: "Cartao", icon: CreditCard },
];

export default function AdminCompras() {
  const [rows, setRows] = useState<FacturaCompra[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<string>("todos");
  const [formaPagamento, setFormaPagamento] = useState<FormaPagamento>("DINHEIRO_FISICO");
  const [valorPago, setValorPago] = useState("");
  const [quantities, setQuantities] = useState<Record<number, number>>({});

  async function load() {
    setLoading(true);
    setError("");

    try {
      const [purchaseRows, productRows, categoryRows] = await Promise.all([
        purchasesApi.list(),
        productsApi.list(),
        categoriesApi.list(),
      ]);
      setRows(purchaseRows);
      setProducts(productRows);
      setCategories(categoryRows);
    } catch (reason: unknown) {
      setError(getErrorMessage(reason, "Erro ao carregar compras"));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  const categoryOptions = useMemo(() => buildProductCategoryOptions(categories, true), [categories]);

  const filteredProducts = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return products.filter((product) => {
      const productCategory = product.category?.trim().toLowerCase() || inferProductCategory(product);
      const matchesCategory = category === "todos" || productCategory === category;
      const matchesQuery =
        !normalizedQuery ||
        product.name.toLowerCase().includes(normalizedQuery) ||
        product.description.toLowerCase().includes(normalizedQuery);

      return matchesCategory && matchesQuery;
    });
  }, [category, products, query]);

  const selectedItems = useMemo(
    () =>
      products
        .filter((product) => (quantities[product.id] ?? 0) > 0)
        .map((product) => {
          const quantidade = quantities[product.id];
          return {
            product,
            quantidade,
            subtotal: Number(product.price) * quantidade,
          };
        }),
    [products, quantities]
  );

  const selectedUnits = selectedItems.reduce((sum, item) => sum + item.quantidade, 0);
  const selectedTotal = selectedItems.reduce((sum, item) => sum + item.subtotal, 0);
  const totalComprado = rows.reduce((sum, row) => sum + Number(row.total || 0), 0);
  const troco = formaPagamento === "DINHEIRO_FISICO" ? Math.max(0, Number(valorPago || 0) - selectedTotal) : 0;

  async function submit() {
    if (!selectedItems.length) {
      setError("Adicione pelo menos um produto para registar a compra.");
      return;
    }

    if (formaPagamento === "DINHEIRO_FISICO" && Number(valorPago || 0) < selectedTotal) {
      setError("O valor fisico recebido nao pode ser inferior ao total da compra.");
      return;
    }

    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const created = await purchasesApi.create({
        formaPagamento,
        valorPago: formaPagamento === "DINHEIRO_FISICO" ? Number(valorPago || 0) : undefined,
        items: selectedItems.map((item) => ({
          produtoId: item.product.id,
          quantidade: item.quantidade,
        })),
      });

      setQuantities({});
      setValorPago("");
      setSuccess("Compra registada com sucesso, stock actualizado e recibo preparado.");
      printPurchaseDocument(created, { autoPrint: true });
      await load();
    } catch (reason: unknown) {
      setError(getErrorMessage(reason, "Nao foi possivel registar a compra"));
    } finally {
      setSaving(false);
    }
  }

  function updateQuantity(productId: number, nextValue: number) {
    setQuantities((current) => {
      const safeValue = Math.max(0, Math.floor(nextValue));
      if (safeValue <= 0) {
        const next = { ...current };
        delete next[productId];
        return next;
      }
      return { ...current, [productId]: safeValue };
    });
  }

  return (
    <main className="grid gap-6">
      <section className="rounded-[32px] bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-700 p-6 text-white shadow-lg shadow-slate-950/10">
        <p className="text-xs font-semibold uppercase tracking-[0.35em] text-emerald-200">Compras internas</p>
        <h1 className="mt-3 text-3xl font-black tracking-tight">Entrada de stock com varios produtos</h1>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-200">
          A equipa pode montar uma compra completa por categorias, adicionar quantidades em cards pequenos, fechar com pagamento e registar troco quando necessario.
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[
          { label: "Compras registadas", value: rows.length, icon: ClipboardList },
          { label: "Valor total comprado", value: formatMoney(totalComprado), icon: WalletCards },
          { label: "Produtos no carrinho", value: selectedItems.length, icon: ShoppingBasket },
          { label: "Unidades na compra actual", value: selectedUnits, icon: Boxes },
        ].map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.label} className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">{card.label}</p>
                  <div className="mt-3 text-3xl font-black text-slate-900">{card.value}</div>
                </div>
                <div className="rounded-2xl bg-emerald-50 p-3 text-emerald-700">
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

      {success ? (
        <div className="flex items-center gap-2 rounded-[24px] border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          <CheckCircle2 className="h-4 w-4" />
          <span>{success}</span>
        </div>
      ) : null}

      <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">Seleccao de produtos</p>
              <h2 className="mt-2 text-2xl font-black text-slate-900">Monte a compra</h2>
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
                className="h-12 rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100"
              >
                {categoryOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {filteredProducts.map((product) => {
              const selectedQuantity = quantities[product.id] ?? 0;
              const productCategory = product.category?.trim().toLowerCase() || inferProductCategory(product);

              return (
                <article
                  key={product.id}
                  className={`rounded-[28px] border p-4 transition ${
                    selectedQuantity > 0
                      ? "border-emerald-300 bg-emerald-50/70 shadow-sm"
                      : "border-slate-200 bg-slate-50 hover:border-emerald-200 hover:bg-white"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <span className="rounded-full bg-white px-3 py-1 text-[11px] font-bold uppercase tracking-[0.24em] text-slate-600">
                        {formatProductCategoryLabel(productCategory, categories)}
                      </span>
                      <h3 className="mt-3 text-base font-black text-slate-900">{product.name}</h3>
                      <p className="mt-2 line-clamp-2 text-sm text-slate-500">{product.description}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">Preco</p>
                      <p className="mt-1 text-lg font-black text-emerald-700">{formatMoney(product.price)}</p>
                    </div>
                  </div>

                  <div className="mt-4 flex items-center justify-between gap-3">
                    <div className="rounded-2xl bg-white px-3 py-2">
                      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">Subtotal</p>
                      <p className="mt-1 text-sm font-bold text-slate-900">{formatMoney(product.price * selectedQuantity)}</p>
                    </div>

                    <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-2 py-2">
                      <button
                        type="button"
                        onClick={() => updateQuantity(product.id, selectedQuantity - 1)}
                        className="h-8 w-8 rounded-xl bg-slate-100 text-sm font-black text-slate-700 transition hover:bg-slate-200"
                      >
                        -
                      </button>
                      <input
                        type="number"
                        min={0}
                        value={selectedQuantity}
                        onChange={(event) => updateQuantity(product.id, Number(event.target.value))}
                        className="h-8 w-16 rounded-xl border border-slate-200 text-center text-sm font-bold text-slate-900 outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => updateQuantity(product.id, selectedQuantity + 1)}
                        className="h-8 w-8 rounded-xl bg-emerald-100 text-sm font-black text-emerald-700 transition hover:bg-emerald-200"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </div>

        <aside className="grid gap-6">
          <section className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-emerald-50 p-3 text-emerald-700">
                <PackagePlus className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">Resumo</p>
                <h2 className="mt-1 text-2xl font-black text-slate-900">Compra actual</h2>
              </div>
            </div>

            <div className="mt-5 grid gap-3">
              {selectedItems.length === 0 ? (
                <div className="rounded-[24px] border border-dashed border-slate-200 bg-slate-50 px-4 py-10 text-center text-sm text-slate-500">
                  Adicione produtos para montar a compra.
                </div>
              ) : (
                selectedItems.map((item) => (
                  <div key={item.product.id} className="rounded-[24px] border border-slate-200 bg-slate-50 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-bold text-slate-900">{item.product.name}</p>
                        <p className="mt-1 text-xs text-slate-500">Qtd. {item.quantidade}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">Subtotal</p>
                        <p className="mt-1 font-black text-emerald-700">{formatMoney(item.subtotal)}</p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="mt-5 grid gap-3">
              {paymentOptions.map((option) => {
                const Icon = option.icon;
                const active = formaPagamento === option.value;

                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setFormaPagamento(option.value)}
                    className={`flex items-center justify-between rounded-[24px] border px-4 py-3 text-left transition ${
                      active
                        ? "border-emerald-300 bg-emerald-50 text-emerald-700"
                        : "border-slate-200 bg-slate-50 text-slate-700 hover:border-emerald-200 hover:bg-white"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`rounded-2xl p-2 ${active ? "bg-emerald-100" : "bg-white"}`}>
                        <Icon className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="font-semibold">{option.label}</p>
                        <p className="text-xs opacity-70">{formatPaymentMethod(option.value)}</p>
                      </div>
                    </div>
                    <div className={`h-3.5 w-3.5 rounded-full ${active ? "bg-emerald-600" : "bg-slate-300"}`} />
                  </button>
                );
              })}
            </div>

            {formaPagamento === "DINHEIRO_FISICO" ? (
              <label className="mt-5 grid gap-2 text-sm font-semibold text-slate-700">
                Valor recebido
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={valorPago}
                  onChange={(event) => setValorPago(event.target.value)}
                  placeholder="Ex.: 12000"
                  className="h-12 rounded-2xl"
                />
              </label>
            ) : null}

            <div className="mt-5 grid gap-3">
              <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-4">
                <div className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">Total de produtos</div>
                <div className="mt-2 text-2xl font-black text-slate-900">{selectedItems.length}</div>
              </div>
              <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-4">
                <div className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">Total de unidades</div>
                <div className="mt-2 text-2xl font-black text-slate-900">{selectedUnits}</div>
              </div>
              <div className="rounded-[24px] border border-emerald-200 bg-emerald-50 p-4">
                <div className="text-xs font-semibold uppercase tracking-[0.24em] text-emerald-700">Total da compra</div>
                <div className="mt-2 text-3xl font-black text-emerald-700">{formatMoney(selectedTotal)}</div>
              </div>
              <div className="rounded-[24px] border border-cyan-200 bg-cyan-50 p-4">
                <div className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-700">Troco</div>
                <div className="mt-2 text-3xl font-black text-cyan-700">{formatMoney(troco)}</div>
              </div>
            </div>

            <Button onClick={submit} disabled={saving || selectedItems.length === 0} className="mt-5 w-full bg-emerald-600 text-white hover:bg-emerald-700">
              {saving ? "A registar compra..." : "Concluir compra"}
            </Button>
          </section>
        </aside>
      </section>

      <section className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">Historico recente</p>
            <h2 className="mt-2 text-2xl font-black text-slate-900">Ultimas compras registadas</h2>
          </div>
        </div>

        {loading ? (
          <div className="mt-5 rounded-[24px] border border-slate-200 bg-slate-50 px-6 py-14 text-center text-sm text-slate-500">
            A carregar compras...
          </div>
        ) : rows.length === 0 ? (
          <div className="mt-5 rounded-[24px] border border-dashed border-slate-200 bg-slate-50 px-6 py-14 text-center text-sm text-slate-500">
            Sem compras registadas.
          </div>
        ) : (
          <div className="mt-5 grid gap-4">
            {rows
              .slice()
              .sort((left, right) => right.id - left.id)
              .map((row) => (
                <article key={row.id} className="rounded-[28px] border border-slate-200 bg-slate-50 p-5">
                  <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <h3 className="text-xl font-black text-slate-900">Compra #{row.id}</h3>
                        <span className="rounded-full bg-white px-3 py-1 text-xs font-bold text-slate-600">
                          {row.totalItens ?? row.items?.length ?? 1} item(ns)
                        </span>
                      </div>

                      <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-5">
                        <div className="rounded-[20px] border border-slate-200 bg-white p-4">
                          <div className="text-xs uppercase tracking-[0.2em] text-slate-400">Data</div>
                          <div className="mt-2 font-bold text-slate-900">{formatDateTime(row.criadoEm)}</div>
                        </div>
                        <div className="rounded-[20px] border border-slate-200 bg-white p-4">
                          <div className="text-xs uppercase tracking-[0.2em] text-slate-400">Funcionario</div>
                          <div className="mt-2 font-bold text-slate-900">{row.funcionarioNome}</div>
                        </div>
                        <div className="rounded-[20px] border border-slate-200 bg-white p-4">
                          <div className="text-xs uppercase tracking-[0.2em] text-slate-400">Unidades</div>
                          <div className="mt-2 font-bold text-slate-900">{row.quantidade}</div>
                        </div>
                        <div className="rounded-[20px] border border-slate-200 bg-white p-4">
                          <div className="text-xs uppercase tracking-[0.2em] text-slate-400">Pagamento</div>
                          <div className="mt-2 font-bold text-slate-900">{formatPaymentMethod(row.formaPagamento ?? "DINHEIRO_FISICO")}</div>
                        </div>
                        <div className="rounded-[20px] border border-emerald-200 bg-emerald-50 p-4">
                          <div className="text-xs uppercase tracking-[0.2em] text-emerald-700">Total</div>
                          <div className="mt-2 font-black text-emerald-700">{formatMoney(row.total)}</div>
                        </div>
                      </div>

                      <div className="mt-4 grid gap-3 md:grid-cols-2">
                        {(row.items ?? []).map((item) => (
                          <div key={`${row.id}-${item.produtoId}`} className="rounded-[20px] border border-slate-200 bg-white p-4">
                            <div className="flex items-start justify-between gap-3">
                              <div>
                                <p className="font-bold text-slate-900">{item.produtoNome}</p>
                                <p className="mt-1 text-xs text-slate-500">Qtd. {item.quantidade}</p>
                              </div>
                              <div className="text-right">
                                <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Subtotal</p>
                                <p className="mt-1 font-bold text-slate-900">{formatMoney(item.subtotal)}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => printPurchaseDocument(row)}
                      className="inline-flex h-11 items-center justify-center rounded-2xl bg-slate-950 px-4 text-sm font-bold text-white transition hover:bg-emerald-700"
                    >
                      Imprimir recibo
                    </button>
                  </div>
                </article>
              ))}
          </div>
        )}
      </section>
    </main>
  );
}
