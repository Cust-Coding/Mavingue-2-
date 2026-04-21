"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { clientApi } from "@/features/client/api";
import { productsApi } from "@/features/products/api";
import type { ClientOrder } from "@/features/client/types";
import { formatMoney, formatPaymentMethod } from "@/lib/formatters";
import { getRole } from "@/lib/auth/session";
import { openPrintableDocument } from "@/lib/documents/print";
import { getErrorMessage } from "@/lib/errors";
import { getCartCount, getCartSubtotal, useCartStore } from "@/store/cart.store";
import { ShoppingBag, CreditCard, Wallet, Banknote, FileText, ArrowLeft, CheckCircle, AlertCircle } from "lucide-react";

const paymentOptions = [
  { value: "CARTEIRA_MOVEL", label: "Carteira móvel", icon: Wallet },
  { value: "CARTAO", label: "Cartão", icon: CreditCard },
  { value: "DINHEIRO_FISICO", label: "Dinheiro físico", icon: Banknote },
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
        setError(`Stock insuficiente para ${invalidItem.name}. Disponível agora: ${available}.`);
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
      setError(getErrorMessage(reason, "Não foi possível concluir a compra"));
    } finally {
      setLoading(false);
    }
  }

  const canCheckout = role === "CLIENTE" && items.length > 0;

  if (!mounted) {
    return (
      <div className="min-h-screen bg-white dark:bg-slate-950">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-6 md:py-12 lg:px-8">
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <ShoppingBag className="w-5 h-5 text-orange-600" />
              </div>
              <h2 className="text-xl font-semibold text-slate-800">Checkout</h2>
            </div>
            <p className="text-slate-500 text-sm mt-2">Carregando...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-white dark:bg-slate-950">
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-6 md:py-12 lg:px-8">
        {/* Hero Section */}
        <div className="rounded-2xl bg-gradient-to-r from-slate-800 to-slate-900 p-6 md:p-8 text-white shadow-lg">
          <p className="text-xs font-semibold uppercase tracking-wider text-orange-300">Checkout</p>
          <h1 className="mt-3 text-2xl md:text-3xl font-bold tracking-tight">
            Confirmação de compra
          </h1>
          <p className="mt-2 text-sm text-slate-300 max-w-xl">
            Ao confirmar, os pedidos são gravados na área do cliente e entram no fluxo de levantamento.
          </p>
        </div>

        {/* Empty Cart */}
        {!items.length && completedOrders.length === 0 && (
          <div className="mt-8 bg-slate-50 rounded-xl p-12 text-center dark:bg-slate-900/50">
            <ShoppingBag className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h2 className="text-xl font-semibold text-slate-800 dark:text-white">Carrinho vazio</h2>
            <p className="mt-2 text-slate-500 text-sm">Volte ao catálogo para selecionar os produtos.</p>
            <Link
              href="/catalogo"
              className="inline-block mt-6 px-6 py-2.5 bg-orange-600 text-white rounded-lg text-sm font-medium hover:bg-orange-700 transition"
            >
              Ir ao catálogo
            </Link>
          </div>
        )}

        {/* Order Success */}
        {completedOrders.length > 0 && (
          <div className="mt-8 bg-green-50 border border-green-200 rounded-xl p-6 dark:bg-green-950/20 dark:border-green-900/40">
            <div className="flex items-center gap-3 mb-3">
              <CheckCircle className="w-6 h-6 text-green-600" />
              <p className="text-xs font-semibold uppercase tracking-wider text-green-600">Compra realizada</p>
            </div>
            <h2 className="text-xl font-bold text-slate-800 dark:text-white">
              Pedido registado com sucesso!
            </h2>
            <p className="mt-2 text-slate-600 dark:text-slate-300 text-sm">
              Os pedidos foram registados e ficam disponíveis no histórico para acompanhamento.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href="/cliente"
                className="px-5 py-2 bg-slate-800 text-white rounded-lg text-sm font-medium hover:bg-slate-700 transition"
              >
                Ir para dashboard
              </Link>
              <Link
                href="/cliente/compras"
                className="px-5 py-2 border border-green-300 text-green-700 rounded-lg text-sm font-medium hover:bg-green-100 transition dark:border-green-700 dark:text-green-400"
              >
                Ver histórico
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
                          { label: "Método", value: formatPaymentMethod(paymentMethod) },
                          {
                            label: "Referências",
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
                className="px-5 py-2 border border-green-300 text-green-700 rounded-lg text-sm font-medium hover:bg-green-100 transition"
              >
                <FileText className="w-4 h-4 inline mr-1" /> Baixar PDF
              </button>
            </div>
          </div>
        )}

        {/* Checkout Form */}
        {items.length > 0 && (
          <div className="mt-8 flex flex-col lg:flex-row gap-6">
            {/* Items List */}
            <div className="flex-1 bg-white rounded-xl border border-slate-200 p-5 shadow-sm dark:bg-slate-900/70 dark:border-slate-800">
              <div className="pb-4 border-b border-slate-100 dark:border-slate-800">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Itens</p>
                <h2 className="mt-1 text-lg font-semibold text-slate-800 dark:text-white">
                  {itemCount} unidade(s) para confirmar
                </h2>
              </div>

              <div className="mt-4 space-y-3">
                {items.map((item) => (
                  <div
                    key={item.productId}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 bg-slate-50 rounded-lg dark:bg-slate-800/50"
                  >
                    <div>
                      <h3 className="font-medium text-slate-800 dark:text-white">{item.name}</h3>
                      <p className="text-xs text-slate-400 mt-0.5">{item.description}</p>
                    </div>
                    <div className="text-left sm:text-right">
                      <p className="text-sm text-slate-500">Qtd. {item.quantity}</p>
                      <p className="text-md font-bold text-orange-600">{formatMoney(item.price * item.quantity)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Payment Sidebar */}
            <div className="lg:w-80 bg-slate-50 rounded-xl p-5 shadow-sm dark:bg-slate-900/70">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Pagamento</p>
              <h2 className="mt-2 text-lg font-bold text-slate-800 dark:text-white">Confirmar compra</h2>

              <div className="mt-4 bg-white rounded-lg p-4 border border-slate-200 dark:bg-slate-800 dark:border-slate-700">
                <p className="text-sm text-slate-500">Subtotal</p>
                <p className="text-2xl font-bold text-orange-600">{formatMoney(subtotal)}</p>
              </div>

              <div className="mt-4">
                <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Método de pagamento
                </label>
                <div className="space-y-2">
                  {paymentOptions.map((option) => {
                    const Icon = option.icon;
                    return (
                      <label
                        key={option.value}
                        className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition ${
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
                          className="w-4 h-4 text-orange-600"
                        />
                        <Icon className="w-4 h-4 text-slate-500" />
                        <span className="text-sm text-slate-700 dark:text-slate-300">{option.label}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              {role !== "CLIENTE" && (
                <div className="mt-4 bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm text-amber-700 dark:bg-amber-950/20">
                  <AlertCircle className="w-4 h-4 inline mr-1" />
                  Precisa entrar com uma conta de cliente para concluir a compra.
                </div>
              )}

              {error && (
                <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-600 dark:bg-red-950/20">
                  {error}
                </div>
              )}

              <div className="mt-6 space-y-3">
                {!canCheckout ? (
                  <Link
                    href="/auth/login?next=/checkout"
                    className="block text-center w-full py-2.5 bg-orange-600 text-white rounded-lg text-sm font-medium hover:bg-orange-700 transition"
                  >
                    Entrar para finalizar
                  </Link>
                ) : (
                  <button
                    type="button"
                    onClick={handleCheckout}
                    disabled={loading}
                    className="w-full py-2.5 bg-orange-600 text-white rounded-lg text-sm font-medium hover:bg-orange-700 transition disabled:opacity-50"
                  >
                    {loading ? "A concluir..." : "Confirmar compra"}
                  </button>
                )}

                <Link
                  href="/carrinho"
                  className="flex items-center justify-center gap-1 w-full py-2.5 border border-slate-200 text-slate-600 rounded-lg text-sm font-medium hover:bg-slate-50 transition dark:border-slate-700"
                >
                  <ArrowLeft className="w-4 h-4" />
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