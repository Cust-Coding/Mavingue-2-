"use client";

import Link from "next/link";
import { useState } from "react";
import { clientApi } from "@/features/client/api";
import { productsApi } from "@/features/products/api";
import type { ClientOrder } from "@/features/client/types";
import { formatMoney, formatPaymentMethod } from "@/lib/formatters";
import { getRole } from "@/lib/auth/session";
import { openPrintableDocument } from "@/lib/documents/print";
import { getErrorMessage } from "@/lib/errors";
import { getCartCount, getCartSubtotal, useCartStore } from "@/store/cart.store";

const paymentOptions = [
  { value: "CARTEIRA_MOVEL", label: "Carteira movel" },
  { value: "CARTAO", label: "Cartao" },
  { value: "DINHEIRO_FISICO", label: "Dinheiro fisico" },
] as const;

export default function CheckoutPage() {
  const role = getRole();
  const items = useCartStore((state) => state.items);
  const clear = useCartStore((state) => state.clear);
  const [paymentMethod, setPaymentMethod] =
    useState<(typeof paymentOptions)[number]["value"]>("CARTEIRA_MOVEL");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [completedOrders, setCompletedOrders] = useState<ClientOrder[]>([]);

  const itemCount = getCartCount(items);
  const subtotal = getCartSubtotal(items);

  async function handleCheckout() {
    if (!items.length) return;

    setLoading(true);
    setError("");

    try {
      const latestProducts = await productsApi.list();
      const stockByProduct = new Map(latestProducts.map((product) => [product.id, Number(product.stockDisponivel || 0)]));
      const invalidItem = items.find((item) => {
        const available = stockByProduct.get(item.productId) ?? 0;
        return available < item.quantity;
      });

      if (invalidItem) {
        const available = stockByProduct.get(invalidItem.productId) ?? 0;
        setError(`Stock insuficiente para ${invalidItem.name}. Disponivel agora: ${available}.`);
        return;
      }

      const orders = await clientApi.checkout({
        items: items.map((item) => ({
          produtoId: item.productId,
            quantidade: item.quantity,
        })),
        formaPagamento: paymentMethod,
      });

      setCompletedOrders(orders);
      clear();
    } catch (reason: unknown) {
      setError(getErrorMessage(reason, "Nao foi possivel concluir a compra"));
    } finally {
      setLoading(false);
    }
  }

  const canCheckout = role === "CLIENTE" && items.length > 0;

  return (
    <main className="bg-white px-6 py-12 lg:px-20 dark:bg-slate-950">
      <div className="mx-auto max-w-7xl">
        <div className="rounded-[36px] border border-slate-200 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 px-8 py-10 text-white shadow-2xl shadow-slate-900/10">
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-orange-300">Checkout</p>
          <h1 className="mt-4 text-4xl font-black tracking-tight lg:text-5xl">
            Confirmacao de compra com registo directo no sistema.
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-slate-300">
            Ao confirmar, os pedidos sao gravados na area do cliente e entram no fluxo de levantamento para a equipa.
          </p>
        </div>

        {!items.length && completedOrders.length === 0 && (
          <div className="mt-8 rounded-[32px] border border-slate-200 bg-slate-50 px-6 py-16 text-center dark:border-slate-800 dark:bg-slate-900/70">
            <h2 className="text-2xl font-black text-slate-900 dark:text-white">Nada para finalizar</h2>
            <p className="mt-3 text-slate-500 dark:text-slate-400">
              O carrinho esta vazio. Volte ao catalogo para selecionar os produtos.
            </p>
            <Link
              href="/catalogo"
              className="mt-6 inline-flex h-12 items-center justify-center rounded-2xl bg-orange-600 px-6 text-sm font-bold text-white transition hover:bg-orange-700"
            >
              Ir ao catalogo
            </Link>
          </div>
        )}

        {completedOrders.length > 0 && (
          <div className="mt-8 rounded-[32px] border border-emerald-200 bg-emerald-50 p-6 dark:border-emerald-900/40 dark:bg-emerald-950/20">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-emerald-600 dark:text-emerald-300">
              Compra realizada
            </p>
            <h2 className="mt-3 text-3xl font-black text-slate-900 dark:text-white">
              O pedido ja aparece na dashboard do cliente.
            </h2>
            <p className="mt-3 max-w-3xl text-slate-600 dark:text-slate-300">
              Os pedidos foram registados com sucesso e ficam disponiveis no historico para acompanhamento do
              levantamento.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href="/cliente"
                className="inline-flex h-12 items-center justify-center rounded-2xl bg-slate-950 px-6 text-sm font-bold text-white transition hover:bg-slate-800 dark:bg-white dark:text-slate-950"
              >
                Abrir dashboard
              </Link>
              <Link
                href="/cliente/compras"
                className="inline-flex h-12 items-center justify-center rounded-2xl border border-emerald-200 px-6 text-sm font-bold text-emerald-700 transition hover:bg-white dark:border-emerald-900/40 dark:text-emerald-300 dark:hover:bg-emerald-950/30"
              >
                Ver historico
              </Link>
              <button
                type="button"
                onClick={() =>
                  openPrintableDocument(
                    "Comprovativo de checkout",
                    "Documento consolidado do checkout do cliente.",
                    [
                      {
                        title: "Resumo do pagamento",
                        rows: [
                          { label: "Pedidos gravados", value: String(completedOrders.length) },
                          { label: "Metodo", value: formatPaymentMethod(paymentMethod) },
                          {
                            label: "Referencias",
                            value: completedOrders.map((order) => `#${order.id}`).join(", "),
                          },
                          {
                            label: "Total",
                            value: formatMoney(
                              completedOrders.reduce((sum, order) => sum + Number(order.total || 0), 0)
                            ),
                          },
                        ],
                      },
                    ]
                  )
                }
                className="inline-flex h-12 items-center justify-center rounded-2xl border border-emerald-200 px-6 text-sm font-bold text-emerald-700 transition hover:bg-white dark:border-emerald-900/40 dark:text-emerald-300 dark:hover:bg-emerald-950/30"
              >
                Baixar PDF
              </button>
            </div>
          </div>
        )}

        {items.length > 0 && (
          <div className="mt-8 grid gap-6 xl:grid-cols-[1.45fr_420px]">
            <div className="rounded-[32px] border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900/70">
              <div className="border-b border-slate-200 pb-4 dark:border-slate-800">
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">Resumo dos itens</p>
                <h2 className="mt-2 text-2xl font-black text-slate-900 dark:text-white">
                  {itemCount} unidade(s) prontas para confirmar
                </h2>
              </div>

              <div className="mt-4 grid gap-4">
                {items.map((item) => (
                  <div
                    key={item.productId}
                    className="flex flex-col justify-between gap-4 rounded-[28px] border border-slate-200 bg-slate-50 p-4 sm:flex-row sm:items-center dark:border-slate-800 dark:bg-slate-950"
                  >
                    <div>
                      <h3 className="text-lg font-black text-slate-900 dark:text-white">{item.name}</h3>
                      <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">{item.description}</p>
                    </div>
                    <div className="text-left sm:text-right">
                      <p className="text-sm font-bold text-slate-900 dark:text-white">Qtd. {item.quantity}</p>
                      <p className="mt-1 text-lg font-black text-orange-600">
                        {formatMoney(item.price * item.quantity)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <aside className="rounded-[32px] border border-slate-200 bg-slate-50 p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/70">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">Pagamento</p>
              <h2 className="mt-3 text-3xl font-black text-slate-900 dark:text-white">Confirmar checkout</h2>

              <div className="mt-6 grid gap-4">
                <div className="rounded-[24px] border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-950">
                  <div className="text-sm text-slate-500 dark:text-slate-400">Subtotal</div>
                  <div className="mt-2 text-3xl font-black text-orange-600">{formatMoney(subtotal)}</div>
                </div>

                <div>
                  <label className="mb-3 block text-sm font-bold text-slate-700 dark:text-slate-200">
                    Metodo de pagamento
                  </label>
                  <select
                    value={paymentMethod}
                    onChange={(event) =>
                      setPaymentMethod(event.target.value as (typeof paymentOptions)[number]["value"])
                    }
                    className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-900 outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                  >
                    {paymentOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {role !== "CLIENTE" && (
                <div className="mt-6 rounded-[24px] border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800 dark:border-amber-900/40 dark:bg-amber-950/20 dark:text-amber-200">
                  Precisa entrar com uma conta de cliente para concluir a compra e gravar o historico na dashboard.
                </div>
              )}

              {error && (
                <div className="mt-6 rounded-[24px] border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700 dark:border-rose-900/40 dark:bg-rose-950/20 dark:text-rose-300">
                  {error}
                </div>
              )}

              <div className="mt-6 grid gap-3">
                {!canCheckout ? (
                  <Link
                    href="/auth/login?next=/checkout"
                    className="inline-flex h-12 items-center justify-center rounded-2xl bg-orange-600 px-6 text-sm font-bold text-white transition hover:bg-orange-700"
                  >
                    Entrar para finalizar
                  </Link>
                ) : (
                  <button
                    type="button"
                    onClick={handleCheckout}
                    disabled={loading}
                    className="inline-flex h-12 items-center justify-center rounded-2xl bg-orange-600 px-6 text-sm font-bold text-white transition hover:bg-orange-700 disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    {loading ? "A concluir compra..." : "Confirmar compra"}
                  </button>
                )}

                <Link
                  href="/carrinho"
                  className="inline-flex h-12 items-center justify-center rounded-2xl border border-slate-200 px-6 text-sm font-bold text-slate-700 transition hover:bg-white dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-950"
                >
                  Voltar ao carrinho
                </Link>
              </div>
            </aside>
          </div>
        )}
      </div>
    </main>
  );
}
