"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { categoriesApi } from "@/features/categories/api";
import type { ProductCategory } from "@/features/categories/types";
import { buildProductCategoryOptions, formatProductCategoryLabel } from "@/features/categories/utils";
import { customersApi } from "@/features/customers/api";
import type { Customer } from "@/features/customers/types";
import { productsApi } from "@/features/products/api";
import type { Product } from "@/features/products/types";
import { salesApi } from "@/features/sales/api";
import type { FormaPagamento } from "@/features/sales/types";
import { printSaleDocument } from "@/lib/documents/print";
import { inferProductCategory } from "@/lib/catalog";
import { getErrorMessage } from "@/lib/errors";
import { formatMoney, formatPaymentMethod } from "@/lib/formatters";
import { Banknote, CheckCircle2, CreditCard, Search, ShoppingCart, UserRound, Wallet } from "lucide-react";

const paymentOptions: Array<{ value: FormaPagamento; label: string; icon: typeof Wallet }> = [
  { value: "DINHEIRO_FISICO", label: "Dinheiro fisico", icon: Banknote },
  { value: "CARTEIRA_MOVEL", label: "Carteira movel", icon: Wallet },
  { value: "CARTAO", label: "Cartao", icon: CreditCard },
];

export default function NovaVenda() {
  const [products, setProducts] = useState<Product[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("todos");
  const [customerMode, setCustomerMode] = useState<"BALCAO" | "CADASTRADO">("BALCAO");
  const [clienteId, setClienteId] = useState("");
  const [formaPagamento, setFormaPagamento] = useState<FormaPagamento>("DINHEIRO_FISICO");
  const [valorPago, setValorPago] = useState("");
  const [quantities, setQuantities] = useState<Record<number, number>>({});
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [stockWarning, setStockWarning] = useState("");

  async function load() {
    setLoading(true);
    setError("");
    try {
      const [productRows, customerRows, categoryRows] = await Promise.all([
        productsApi.list(),
        customersApi.list(),
        categoriesApi.list(),
      ]);
      setProducts(productRows);
      setCustomers(customerRows);
      setCategories(categoryRows);
    } catch (reason: unknown) {
      setError(getErrorMessage(reason, "Nao foi possivel carregar produtos, clientes e categorias"));
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
          const subtotal = Number(product.price) * quantidade;
          return { product, quantidade, subtotal };
        }),
    [products, quantities]
  );

  const total = selectedItems.reduce((sum, item) => sum + item.subtotal, 0);
  const totalUnidades = selectedItems.reduce((sum, item) => sum + item.quantidade, 0);
  const troco = formaPagamento === "DINHEIRO_FISICO" ? Math.max(0, Number(valorPago || 0) - total) : 0;

  function updateQuantity(productId: number, nextValue: number) {
    const product = products.find((entry) => entry.id === productId);
    if (!product) return;

    const available = Math.max(0, Number(product.stockDisponivel || 0));
    const normalized = Number.isFinite(nextValue) ? Math.max(0, Math.floor(nextValue)) : 0;
    const cappedValue = Math.min(available, normalized);

    if (normalized > available) {
      setStockWarning(`O produto ${product.name} atingiu o limite de compra. Restam apenas ${available} unidade(s).`);
    } else {
      setStockWarning("");
    }

    setQuantities((current) => {
      if (cappedValue <= 0) {
        const next = { ...current };
        delete next[productId];
        return next;
      }
      return { ...current, [productId]: cappedValue };
    });
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setError("");
    setSuccess("");
    setStockWarning("");

    if (customerMode === "CADASTRADO" && !clienteId) {
      setError("Seleccione o cliente para concluir a venda.");
      return;
    }

    if (!selectedItems.length) {
      setError("Seleccione pelo menos um produto.");
      return;
    }

    const invalidStock = selectedItems.find((item) => item.quantidade > Number(item.product.stockDisponivel || 0));
    if (invalidStock) {
      setError(`Stock insuficiente para ${invalidStock.product.name}. Disponivel: ${invalidStock.product.stockDisponivel}.`);
      return;
    }

    if (formaPagamento === "DINHEIRO_FISICO" && Number(valorPago || 0) < total) {
      setError("O valor fisico recebido nao pode ser inferior ao total da venda.");
      return;
    }

    setSaving(true);

    try {
      const created = await salesApi.create({
        clienteId: customerMode === "CADASTRADO" && clienteId ? Number(clienteId) : undefined,
        formaPagamento,
        valorPago: formaPagamento === "DINHEIRO_FISICO" ? Number(valorPago || 0) : undefined,
        items: selectedItems.map((item) => ({
          produtoId: item.product.id,
          quantidade: item.quantidade,
        })),
      });

      setQuantities({});
      setValorPago("");
      if (customerMode === "BALCAO") {
        setClienteId("");
      }
      setSuccess("Venda registada com sucesso. O recibo foi enviado para impressao.");
      printSaleDocument(created, { autoPrint: true });
      await load();
    } catch (reason: unknown) {
      setError(getErrorMessage(reason, "Nao foi possivel registar a venda"));
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="grid gap-6">
      <section className="rounded-[32px] bg-gradient-to-br from-slate-950 via-slate-900 to-orange-600 p-6 text-white shadow-lg shadow-slate-950/10">
        <p className="text-xs font-semibold uppercase tracking-[0.35em] text-orange-200">Vendas</p>
        <h1 className="mt-3 text-3xl font-black tracking-tight">Registar venda com varios produtos</h1>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-200">
          A equipa agora vende por cards pequenos, filtrando por categoria, ajustando quantidades, confirmando total, troco e venda de balcao sem exigir cliente cadastrado.
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[
          { label: "Produtos no pedido", value: selectedItems.length, icon: ShoppingCart },
          { label: "Unidades seleccionadas", value: totalUnidades, icon: ShoppingCart },
          { label: "Total da venda", value: formatMoney(total), icon: Banknote },
          { label: "Troco previsto", value: formatMoney(troco), icon: Wallet },
        ].map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.label} className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">{card.label}</p>
                  <div className="mt-3 break-words text-2xl font-black leading-tight text-slate-900 sm:text-3xl">{card.value}</div>
                </div>
                <div className="rounded-2xl bg-orange-50 p-3 text-orange-600">
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

      {stockWarning ? (
        <div className="rounded-[24px] border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
          {stockWarning}
        </div>
      ) : null}

      {loading ? (
        <div className="rounded-[28px] border border-slate-200 bg-slate-50 px-6 py-14 text-center text-sm text-slate-500">
          A carregar dados da venda...
        </div>
      ) : (
        <form onSubmit={submit} className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
          <section className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">Produtos</p>
                <h2 className="mt-2 text-2xl font-black text-slate-900">Escolha e quantidade</h2>
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
                  className="h-12 rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition focus:border-orange-400 focus:ring-4 focus:ring-orange-100"
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
                const available = Number(product.stockDisponivel || 0);
                const productCategory = product.category?.trim().toLowerCase() || inferProductCategory(product);

                return (
                  <article
                    key={product.id}
                    className={`overflow-hidden rounded-[28px] border p-4 transition ${
                      selectedQuantity > 0
                        ? "border-orange-300 bg-orange-50/70 shadow-sm"
                        : "border-slate-200 bg-slate-50 hover:border-orange-200 hover:bg-white"
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
                        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">Stock</p>
                        <p className={`mt-1 text-sm font-black ${available > 0 ? "text-emerald-600" : "text-rose-600"}`}>
                          {available}
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                      <div className="min-w-0">
                        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">Preco</p>
                        <p className="mt-1 text-lg font-black text-orange-700">{formatMoney(product.price)}</p>
                      </div>

                      <div className="flex w-full items-center justify-between gap-2 rounded-2xl border border-slate-200 bg-white px-2 py-2 sm:w-auto sm:justify-start">
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
                          max={available}
                          value={selectedQuantity}
                          onChange={(event) => updateQuantity(product.id, Number(event.target.value))}
                          className="h-8 min-w-0 flex-1 rounded-xl border border-slate-200 text-center text-sm font-bold text-slate-900 outline-none sm:w-16 sm:flex-none"
                        />
                        <button
                          type="button"
                          onClick={() => updateQuantity(product.id, Math.min(available, selectedQuantity + 1))}
                          className="h-8 w-8 rounded-xl bg-orange-100 text-sm font-black text-orange-700 transition hover:bg-orange-200"
                        >
                          +
                        </button>
                      </div>
                    </div>

                    <div className="mt-4 rounded-2xl bg-white px-3 py-3">
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                        <div className="min-w-0">
                          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">Subtotal seleccionado</p>
                          <p className="mt-1 text-sm font-bold text-slate-900">{formatMoney(product.price * selectedQuantity)}</p>
                        </div>
                        <span
                          className={`inline-flex w-fit rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-[0.2em] ${
                            available <= 0
                              ? "bg-rose-100 text-rose-700"
                              : selectedQuantity >= available && selectedQuantity > 0
                              ? "bg-amber-100 text-amber-700"
                              : "bg-emerald-100 text-emerald-700"
                          }`}
                        >
                          {available <= 0
                            ? "Sem stock"
                            : selectedQuantity >= available && selectedQuantity > 0
                            ? "Limite atingido"
                            : `Restam ${Math.max(available - selectedQuantity, 0)}`}
                        </span>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </section>

          <aside className="grid gap-6">
            <section className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="rounded-2xl bg-orange-50 p-3 text-orange-600">
                  <UserRound className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">Cliente e pagamento</p>
                  <h2 className="mt-1 text-2xl font-black text-slate-900">Fecho da venda</h2>
                </div>
              </div>

              <div className="mt-5 grid gap-4">
                <div className="grid gap-3 sm:grid-cols-2">
                  {[
                    {
                      value: "BALCAO" as const,
                      title: "Venda de balcao",
                      text: "Concluir rapidamente sem exigir cliente registado.",
                    },
                    {
                      value: "CADASTRADO" as const,
                      title: "Cliente cadastrado",
                      text: "Associar a venda a um cliente existente.",
                    },
                  ].map((option) => {
                    const active = customerMode === option.value;

                    return (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => {
                          setCustomerMode(option.value);
                          if (option.value === "BALCAO") {
                            setClienteId("");
                          }
                        }}
                        className={`rounded-[24px] border px-4 py-4 text-left transition ${
                          active
                            ? "border-orange-300 bg-orange-50 text-orange-700"
                            : "border-slate-200 bg-slate-50 text-slate-700 hover:border-orange-200 hover:bg-white"
                        }`}
                      >
                        <p className="font-semibold">{option.title}</p>
                        <p className="mt-1 text-xs opacity-70">{option.text}</p>
                      </button>
                    );
                  })}
                </div>

                {customerMode === "CADASTRADO" ? (
                  <label className="grid gap-2 text-sm font-semibold text-slate-700">
                    Cliente
                    <select
                      value={clienteId}
                      onChange={(event) => setClienteId(event.target.value)}
                      className="h-12 rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition focus:border-orange-400 focus:ring-4 focus:ring-orange-100"
                    >
                      <option value="">Seleccionar cliente</option>
                      {customers.map((customer) => (
                        <option key={customer.id} value={customer.id}>
                          {customer.name}
                        </option>
                      ))}
                    </select>
                  </label>
                ) : (
                  <div className="rounded-[24px] border border-orange-200 bg-orange-50 p-4 text-sm text-orange-700">
                    Esta venda sera registada como atendimento interno de balcao.
                  </div>
                )}

                <div className="grid gap-3">
                  {paymentOptions.map((option) => {
                    const Icon = option.icon;
                    const active = formaPagamento === option.value;

                    return (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => setFormaPagamento(option.value)}
                        className={`flex items-start justify-between gap-3 rounded-[24px] border px-4 py-3 text-left transition sm:items-center ${
                          active
                            ? "border-orange-300 bg-orange-50 text-orange-700"
                            : "border-slate-200 bg-slate-50 text-slate-700 hover:border-orange-200 hover:bg-white"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`rounded-2xl p-2 ${active ? "bg-orange-100" : "bg-white"}`}>
                            <Icon className="h-4 w-4" />
                          </div>
                          <div>
                            <p className="font-semibold">{option.label}</p>
                            <p className="text-xs opacity-70">{formatPaymentMethod(option.value)}</p>
                          </div>
                        </div>
                        <div className={`h-3.5 w-3.5 rounded-full ${active ? "bg-orange-600" : "bg-slate-300"}`} />
                      </button>
                    );
                  })}
                </div>

                {formaPagamento === "DINHEIRO_FISICO" ? (
                  <label className="grid gap-2 text-sm font-semibold text-slate-700">
                    Valor recebido
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      value={valorPago}
                      onChange={(event) => setValorPago(event.target.value)}
                      placeholder="Ex.: 400"
                      className="h-12 rounded-2xl"
                    />
                  </label>
                ) : null}
              </div>

              <div className="mt-5 grid gap-3">
                <div className="min-w-0 rounded-[24px] border border-slate-200 bg-slate-50 p-4">
                  <div className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">Itens seleccionados</div>
                  <div className="mt-2 text-2xl font-black text-slate-900">{selectedItems.length}</div>
                </div>
                <div className="min-w-0 rounded-[24px] border border-slate-200 bg-slate-50 p-4">
                  <div className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">Total a pagar</div>
                  <div className="mt-2 break-words text-2xl font-black leading-tight text-orange-700 sm:text-3xl">{formatMoney(total)}</div>
                </div>
                <div className="min-w-0 rounded-[24px] border border-emerald-200 bg-emerald-50 p-4">
                  <div className="text-xs font-semibold uppercase tracking-[0.24em] text-emerald-700">Troco</div>
                  <div className="mt-2 break-words text-2xl font-black leading-tight text-emerald-700 sm:text-3xl">{formatMoney(troco)}</div>
                </div>
              </div>

              <div className="mt-5 grid gap-3">
                {selectedItems.length === 0 ? (
                  <div className="rounded-[24px] border border-dashed border-slate-200 bg-slate-50 px-4 py-10 text-center text-sm text-slate-500">
                    Nenhum produto foi adicionado.
                  </div>
                ) : (
                  selectedItems.map((item) => (
                    <div key={item.product.id} className="rounded-[24px] border border-slate-200 bg-slate-50 p-4">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                          <p className="font-bold text-slate-900">{item.product.name}</p>
                          <p className="mt-1 text-xs text-slate-500">Qtd. {item.quantidade}</p>
                          <p className="mt-1 text-xs text-slate-400">
                            Restam {Math.max(Number(item.product.stockDisponivel || 0) - item.quantidade, 0)} depois desta venda
                          </p>
                        </div>
                        <div className="text-left sm:text-right">
                          <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Subtotal</p>
                          <p className="mt-1 font-bold text-slate-900">{formatMoney(item.subtotal)}</p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <Button type="submit" disabled={saving || selectedItems.length === 0} className="mt-5 w-full bg-orange-600 text-white hover:bg-orange-700">
                {saving ? "A registar venda..." : "Concluir venda"}
              </Button>
            </section>
          </aside>
        </form>
      )}
    </main>
  );
}
