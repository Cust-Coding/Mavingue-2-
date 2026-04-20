"use client";

import Link from "next/link";
import { Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import { formatMoney } from "@/lib/formatters";
import { getCartCount, getCartSubtotal, useCartStore } from "@/store/cart.store";

export default function CarrinhoPage() {
  const items = useCartStore((state) => state.items);
  const setQuantity = useCartStore((state) => state.setQuantity);
  const removeItem = useCartStore((state) => state.removeItem);
  const clear = useCartStore((state) => state.clear);

  const itemCount = getCartCount(items);
  const subtotal = getCartSubtotal(items);

  return (
    <main className="bg-white px-6 py-12 lg:px-20 dark:bg-slate-950">
      <div className="mx-auto max-w-7xl">
        <div className="rounded-[36px] border border-slate-200 bg-gradient-to-br from-orange-500 via-orange-600 to-orange-700 px-8 py-10 text-white shadow-2xl shadow-orange-500/15">
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-orange-100">Carrinho</p>
          <h1 className="mt-4 text-4xl font-black tracking-tight lg:text-5xl">
            Carrinho dinamico com resumo real da compra.
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-orange-50">
            Aqui ficam todos os produtos adicionados, com ajuste de quantidade, subtotal e acesso directo ao checkout.
          </p>
        </div>

        {items.length === 0 ? (
          <div className="mt-8 rounded-[32px] border border-slate-200 bg-slate-50 px-6 py-20 text-center dark:border-slate-800 dark:bg-slate-900/70">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-white shadow-sm dark:bg-slate-950">
              <ShoppingBag className="text-orange-600" size={34} />
            </div>
            <h2 className="mt-6 text-2xl font-black text-slate-900 dark:text-white">O carrinho esta vazio</h2>
            <p className="mt-3 text-slate-500 dark:text-slate-400">
              Volte ao catalogo, filtre os produtos e adicione os itens que pretende comprar.
            </p>
            <Link
              href="/catalogo"
              className="mt-6 inline-flex h-12 items-center justify-center rounded-2xl bg-slate-950 px-6 text-sm font-bold text-white transition hover:bg-orange-600 dark:bg-white dark:text-slate-950"
            >
              Ir ao catalogo
            </Link>
          </div>
        ) : (
          <div className="mt-8 grid gap-6 xl:grid-cols-[1.5fr_420px]">
            <div className="rounded-[32px] border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900/70">
              <div className="flex flex-col gap-3 border-b border-slate-200 pb-4 sm:flex-row sm:items-center sm:justify-between dark:border-slate-800">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">Itens</p>
                  <h2 className="mt-2 text-2xl font-black text-slate-900 dark:text-white">
                    {itemCount} unidade(s) no carrinho
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={clear}
                  className="inline-flex h-11 items-center justify-center rounded-2xl border border-rose-200 px-4 text-sm font-bold text-rose-600 transition hover:bg-rose-50 dark:border-rose-900/40 dark:hover:bg-rose-950/20"
                >
                  Limpar carrinho
                </button>
              </div>

              <div className="mt-4 grid gap-4">
                {items.map((item) => (
                  <article
                    key={item.productId}
                    className="grid gap-4 rounded-[28px] border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950"
                  >
                    <div className="flex flex-col gap-4 sm:flex-row">
                      <div className="h-28 w-full overflow-hidden rounded-[24px] bg-white sm:w-36 dark:bg-slate-900">
                        {item.imageUrl ? (
                          <img src={item.imageUrl} alt={item.name} className="h-full w-full object-cover" />
                        ) : (
                          <div className="flex h-full items-center justify-center text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">
                            Sem imagem
                          </div>
                        )}
                      </div>

                      <div className="flex flex-1 flex-col justify-between gap-3">
                        <div>
                          <h3 className="text-lg font-black text-slate-900 dark:text-white">{item.name}</h3>
                          <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">{item.description}</p>
                        </div>

                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => setQuantity(item.productId, item.quantity - 1)}
                              className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-200 text-slate-700 dark:border-slate-700 dark:text-slate-200"
                            >
                              <Minus size={16} />
                            </button>
                            <span className="min-w-10 text-center text-lg font-black text-slate-900 dark:text-white">
                              {item.quantity}
                            </span>
                            <button
                              type="button"
                              onClick={() => setQuantity(item.productId, item.quantity + 1)}
                              className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-200 text-slate-700 dark:border-slate-700 dark:text-slate-200"
                            >
                              <Plus size={16} />
                            </button>
                          </div>

                          <div className="flex items-center gap-3">
                            <div className="text-right">
                              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-400">Subtotal</p>
                              <p className="mt-1 text-xl font-black text-orange-600">
                                {formatMoney(item.price * item.quantity)}
                              </p>
                            </div>

                            <button
                              type="button"
                              onClick={() => removeItem(item.productId)}
                              className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-rose-200 text-rose-600 transition hover:bg-rose-50 dark:border-rose-900/40 dark:hover:bg-rose-950/20"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </div>

            <aside className="rounded-[32px] border border-slate-200 bg-slate-950 p-6 text-white shadow-2xl shadow-slate-900/10 dark:border-slate-800">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-orange-200">Resumo</p>
              <h2 className="mt-3 text-3xl font-black tracking-tight">Pronto para checkout</h2>
              <div className="mt-8 grid gap-4">
                <div className="rounded-[24px] border border-white/10 bg-white/5 p-4">
                  <div className="text-sm text-slate-300">Total de unidades</div>
                  <div className="mt-2 text-3xl font-black">{itemCount}</div>
                </div>
                <div className="rounded-[24px] border border-white/10 bg-white/5 p-4">
                  <div className="text-sm text-slate-300">Subtotal</div>
                  <div className="mt-2 text-3xl font-black text-orange-300">{formatMoney(subtotal)}</div>
                </div>
              </div>

              <div className="mt-8 grid gap-3">
                <Link
                  href="/checkout"
                  className="inline-flex h-12 items-center justify-center rounded-2xl bg-orange-600 px-6 text-sm font-bold text-white transition hover:bg-orange-700"
                >
                  Avancar para checkout
                </Link>
                <Link
                  href="/catalogo"
                  className="inline-flex h-12 items-center justify-center rounded-2xl border border-white/10 px-6 text-sm font-bold text-white transition hover:bg-white/10"
                >
                  Continuar a comprar
                </Link>
              </div>
            </aside>
          </div>
        )}
      </div>
    </main>
  );
}
