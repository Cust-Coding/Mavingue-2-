"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { clientApi } from "@/features/client/api";
import { productsApi } from "@/features/products/api";
import type { ClientOrder } from "@/features/client/types";
import { formatMoney } from "@/lib/formatters";
import { getRole } from "@/lib/auth/session";
import { printCheckoutDocument } from "@/lib/documents/print";
import { getErrorMessage } from "@/lib/errors";
import { getCartCount, getCartSubtotal, useCartStore } from "@/store/cart.store";
import { ShoppingBag, CreditCard, Wallet, Banknote, FileText, ArrowLeft, CheckCircle, AlertCircle } from "lucide-react";

const paymentOptions = [
  { value: "CARTEIRA_MOVEL", label: "Carteira movel", icon: Wallet },
  { value: "CARTAO", label: "Cartao", icon: CreditCard },
  { value: "DINHEIRO_FISICO", label: "Dinheiro fisico", icon: Banknote },
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
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

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
      printCheckoutDocument(orders, paymentMethod, { autoPrint: true });
    } catch (reason: unknown) {
      setError(getErrorMessage(reason, "Nao foi possivel concluir a compra"));
    } finally {
      setLoading(false);
    }
  }

  const canCheckout = role === "CLIENTE" && items.length > 0;

  if (!mounted) {
    return (
      <div className="min-h-screen bg-white dark:bg-slate-950">
        <div className="mx-auto max-w-7xl px-4 py-6 md:px-6 md:py-12 lg:px-8">
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-orange-100 p-2">
                <ShoppingBag className="h-5 w-5 text-orange-600" />
              </div>
              <h2 className="text-xl font-semibold text-slate-800">Checkout</h2>
            </div>
            <p className="mt-2 text-sm text-slate-500">Carregando...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-white dark:bg-slate-950">
      <div className="mx-auto max-w-7xl px-4 py-6 md:px-6 md:py-12 lg:px-8">
        <div className="rounded-2xl bg-gradient-to-r from-slate-800 to-slate-900 p-6 text-white shadow-lg md:p-8">
          <p className="text-xs font-semibold uppercase tracking-wider text-orange-300">Checkout</p>
          <h1 className="mt-3 text-2xl font-bold tracking-tight md:text-3xl">Confirmacao de compra</h1>
          <p className="mt-2 max-w-xl text-sm text-slate-300">
            Ao confirmar, os pedidos sao gravados na area do cliente e entram no fluxo de levantamento.
          </p>
        </div>

        {!items.length && completedOrders.length === 0 && (
          <div className="mt-8 rounded-xl bg-slate-50 p-12 text-center dark:bg-slate-900/50">
            <ShoppingBag className="mx-auto mb-3 h-12 w-12 text-slate-300" />
            <h2 className="text-xl font-semibold text-slate-800 dark:text-white">Carrinho vazio</h2>
            <p className="mt-2 text-sm text-slate-500">Volte ao catalogo para selecionar os produtos.</p>
            <Link
              href="/catalogo"
              className="mt-6 inline-block rounded-lg bg-orange-600 px-6 py-2.5 text-sm font-medium text-white transition hover:bg-orange-700"
            >
              Ir ao catalogo
            </Link>
          </div>
        )}

        {completedOrders.length > 0 && (
          <div className="mt-8 rounded-xl border border-green-200 bg-green-50 p-6 dark:border-green-900/40 dark:bg-green-950/20">
            <div className="mb-3 flex items-center gap-3">
              <CheckCircle className="h-6 w-6 text-green-600" />
              <p className="text-xs font-semibold uppercase tracking-wider text-green-600">Compra realizada</p>
            </div>
            <h2 className="text-xl font-bold text-slate-800 dark:text-white">Pedido registado com sucesso!</h2>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
              Os pedidos foram registados, o recibo foi preparado para impressao e o historico ja esta disponivel.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href="/cliente"
                className="rounded-lg bg-slate-800 px-5 py-2 text-sm font-medium text-white transition hover:bg-slate-700"
              >
                Ir para dashboard
              </Link>
              <Link
                href="/cliente/compras"
                className="rounded-lg border border-green-300 px-5 py-2 text-sm font-medium text-green-700 transition hover:bg-green-100 dark:border-green-700 dark:text-green-400"
              >
                Ver historico
              </Link>
              <button
                type="button"
                onClick={() => printCheckoutDocument(completedOrders, paymentMethod)}
                className="rounded-lg border border-green-300 px-5 py-2 text-sm font-medium text-green-700 transition hover:bg-green-100"
              >
                <FileText className="mr-1 inline h-4 w-4" /> Imprimir recibo
              </button>
            </div>
          </div>
        )}

        {items.length > 0 && (
          <div className="mt-8 flex flex-col gap-6 lg:flex-row">
            <div className="flex-1 rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900/70">
              <div className="border-b border-slate-100 pb-4 dark:border-slate-800">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Itens</p>
                <h2 className="mt-1 text-lg font-semibold text-slate-800 dark:text-white">
                  {itemCount} unidade(s) para confirmar
                </h2>
              </div>

              <div className="mt-4 space-y-3">
                {items.map((item) => (
                  <div
                    key={item.productId}
                    className="flex flex-col justify-between gap-3 rounded-lg bg-slate-50 p-3 sm:flex-row sm:items-center dark:bg-slate-800/50"
                  >
                    <div>
                      <h3 className="font-medium text-slate-800 dark:text-white">{item.name}</h3>
                      <p className="mt-0.5 text-xs text-slate-400">{item.description}</p>
                    </div>
                    <div className="text-left sm:text-right">
                      <p className="text-sm text-slate-500">Qtd. {item.quantity}</p>
                      <p className="text-md font-bold text-orange-600">{formatMoney(item.price * item.quantity)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-xl bg-slate-50 p-5 shadow-sm dark:bg-slate-900/70 lg:w-80">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Pagamento</p>
              <h2 className="mt-2 text-lg font-bold text-slate-800 dark:text-white">Confirmar compra</h2>

              <div className="mt-4 rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800">
                <p className="text-sm text-slate-500">Subtotal</p>
                <p className="text-2xl font-bold text-orange-600">{formatMoney(subtotal)}</p>
              </div>

              <div className="mt-4">
                <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Metodo de pagamento
                </label>
                <div className="space-y-2">
                  {paymentOptions.map((option) => {
                    const Icon = option.icon;
                    return (
                      <label
                        key={option.value}
                        className={`flex cursor-pointer items-center gap-3 rounded-lg border p-3 transition ${
                          paymentMethod === option.value
                            ? "border-orange-400 bg-orange-50 dark:bg-orange-950/30"
                            : "border-slate-200 hover:bg-slate-100 dark:border-slate-700"
                        }`}
                      >
                        <input
                          type="radio"
                          name="paymentMethod"
                          value={option.value}
                          checked={paymentMethod === option.value}
                          onChange={() => setPaymentMethod(option.value)}
                          className="h-4 w-4 text-orange-600"
                        />
                        <Icon className="h-4 w-4 text-slate-500" />
                        <span className="text-sm text-slate-700 dark:text-slate-300">{option.label}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              {role !== "CLIENTE" && (
                <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-700 dark:bg-amber-950/20">
                  <AlertCircle className="mr-1 inline h-4 w-4" />
                  Precisa entrar com uma conta de cliente para concluir a compra.
                </div>
              )}

              {error && (
                <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-600 dark:bg-red-950/20">
                  {error}
                </div>
              )}

              <div className="mt-6 space-y-3">
                {!canCheckout ? (
                  <Link
                    href="/auth/login?next=/checkout"
                    className="block w-full rounded-lg bg-orange-600 py-2.5 text-center text-sm font-medium text-white transition hover:bg-orange-700"
                  >
                    Entrar para finalizar
                  </Link>
                ) : (
                  <button
                    type="button"
                    onClick={handleCheckout}
                    disabled={loading}
                    className="w-full rounded-lg bg-orange-600 py-2.5 text-sm font-medium text-white transition hover:bg-orange-700 disabled:opacity-50"
                  >
                    {loading ? "A concluir..." : "Confirmar compra"}
                  </button>
                )}

                <Link
                  href="/carrinho"
                  className="flex w-full items-center justify-center gap-1 rounded-lg border border-slate-200 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50 dark:border-slate-700"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Voltar ao carrinho
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
