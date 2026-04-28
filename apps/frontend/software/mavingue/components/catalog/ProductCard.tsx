"use client";

import { useEffect, useState } from "react";
import type { Product } from "@/features/products/types";
import { inferProductCategory } from "@/lib/catalog";
import { formatMoney } from "@/lib/formatters";
import { useCartStore } from "@/store/cart.store";

export function ProductCard({ product }: { product: Product }) {
  const addItem = useCartStore((state) => state.addItem);
  const [justAdded, setJustAdded] = useState(false);
  const soldOut = Number(product.stockDisponivel || 0) <= 0;

  useEffect(() => {
    if (!justAdded) return;

    const timer = window.setTimeout(() => setJustAdded(false), 1400);
    return () => window.clearTimeout(timer);
  }, [justAdded]);

  const category = inferProductCategory(product);

  return (
    <article className="group flex h-full flex-col justify-between rounded-[28px]
      border border-slate-200 bg-white p-5 shadow-sm transition duration-300
      hover:-translate-y-1 hover:shadow-xl
      dark:border-slate-800 dark:bg-slate-900 dark:shadow-none"
    >
      <div>
        <div className="relative mb-5 overflow-hidden rounded-[24px]
          border border-slate-100 bg-slate-100
          dark:border-slate-800 dark:bg-slate-800"
        >
          {product.urlImg ? (
            <img
              src={product.urlImg}
              alt={product.name}
              className="h-52 w-full object-cover transition duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-52 items-center justify-center
              bg-gradient-to-br from-slate-100 to-slate-200
              text-xs font-semibold uppercase tracking-[0.3em] text-slate-500
              dark:from-slate-800 dark:to-slate-700 dark:text-slate-400"
            >
              Sem imagem
            </div>
          )}

          <span className="absolute left-4 top-4 rounded-full
            bg-white/90 px-3 py-1 text-[11px] font-bold uppercase
            tracking-[0.2em] text-slate-700 shadow-sm
            dark:bg-slate-900/80 dark:text-slate-200"
          >
            {category}
          </span>
        </div>

        <h3 className="text-lg font-black tracking-tight text-slate-900 dark:text-white">
          {product.name}
        </h3>

        <p className="mt-2 line-clamp-3 text-sm leading-6 text-slate-500 dark:text-slate-400">
          {product.description}
        </p>
      </div>

      <div className="mt-6 space-y-4">
        <div className="flex items-end justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-400">
              Preco
            </p>
            <p className="text-2xl font-black tracking-tight text-orange-600">
              {formatMoney(product.price)}
            </p>
          </div>

          <div className="text-right">
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-400">
              Stock
            </p>
            <p className={`text-sm font-black ${
              soldOut
                ? "text-rose-600"
                : "text-emerald-600"
            }`}>
              {soldOut ? "Esgotado" : `${product.stockDisponivel} disponivel`}
            </p>
          </div>
        </div>

        <button
          type="button"
          disabled={soldOut}
          onClick={() => {
            addItem(
              {
                productId: product.id,
                name: product.name,
                description: product.description,
                price: Number(product.price),
                imageUrl: product.urlImg,
              },
              1
            );
            setJustAdded(true);
          }}
          className="flex h-12 w-full items-center justify-center rounded-2xl
            bg-slate-950 px-4 text-sm font-bold text-white transition
            hover:bg-orange-600
            disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-500
            dark:bg-white dark:text-slate-900 dark:hover:bg-orange-500
            dark:disabled:bg-slate-700 dark:disabled:text-slate-400"
        >
          {soldOut
            ? "Sem stock"
            : justAdded
            ? "Adicionado ao carrinho"
            : "Adicionar ao carrinho"}
        </button>
      </div>
    </article>
  );
}