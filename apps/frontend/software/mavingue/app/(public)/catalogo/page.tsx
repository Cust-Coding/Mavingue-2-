"use client";

import { SlidersHorizontal, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { ProductCard } from "@/components/catalog/ProductCard";
import { productsApi } from "@/features/products/api";
import type { Product } from "@/features/products/types";
import {
  catalogCategories,
  catalogSortOptions,
  filterCatalogProducts,
  type CatalogCategory,
  type CatalogSort,
} from "@/lib/catalog";
import { getErrorMessage } from "@/lib/errors";

function parseCategory(value: string | null): CatalogCategory {
  if (catalogCategories.some((item) => item.value === value)) {
    return value as CatalogCategory;
  }

  return "todos";
}

export default function CatalogoProdutos() {
  const searchParams = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [query, setQuery] = useState(() => searchParams.get("search") ?? searchParams.get("q") ?? "");
  const [category, setCategory] = useState<CatalogCategory>(() => parseCategory(searchParams.get("cat")));
  const [sort, setSort] = useState<CatalogSort>("relevancia");

  useEffect(() => {
    productsApi
      .list()
      .then(setProducts)
      .catch((reason: unknown) => setError(getErrorMessage(reason, "Erro ao carregar o catalogo")))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(
    () => filterCatalogProducts(products, { query, category, sort }),
    [products, query, category, sort]
  );

  return (
    <main className="bg-white px-6 py-12 lg:px-20 dark:bg-slate-950">
      <div className="mx-auto max-w-7xl">
        <div className="rounded-[36px] border border-slate-200 bg-gradient-to-br from-slate-950 via-slate-900 to-orange-950 px-8 py-10 text-white shadow-2xl shadow-slate-900/10">
          <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <p className="text-xs font-semibold uppercase tracking-[0.4em] text-orange-300">Catalogo Mavingue</p>
              <h1 className="mt-4 text-4xl font-black tracking-tight lg:text-5xl">
                Filtrar produtos, montar carrinho e seguir para checkout real.
              </h1>
              <p className="mt-4 max-w-2xl text-base leading-7 text-slate-300">
                O catalogo agora permite pesquisa por produto, filtro por categoria e ordenacao para facilitar a
                compra.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <div className="rounded-2xl border border-white/10 bg-white/10 px-5 py-4">
                <div className="text-xs uppercase tracking-[0.3em] text-slate-300">Produtos</div>
                <div className="mt-2 text-3xl font-black">{products.length}</div>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/10 px-5 py-4">
                <div className="text-xs uppercase tracking-[0.3em] text-slate-300">Visiveis</div>
                <div className="mt-2 text-3xl font-black">{filtered.length}</div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-[1.2fr_220px]">
          <div className="rounded-[28px] border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900/70">
            <div className="flex flex-col gap-3 lg:flex-row">
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Pesquisar por nome, descricao ou categoria"
                className="h-12 flex-1 rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm font-medium text-slate-900 outline-none transition focus:border-orange-300 focus:bg-white dark:border-slate-700 dark:bg-slate-950 dark:text-white"
              />

              <button
                type="button"
                onClick={() => setFiltersOpen((current) => !current)}
                className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl border border-slate-200 px-4 text-sm font-bold text-slate-700 transition hover:border-orange-200 hover:bg-orange-50 hover:text-orange-600 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-950"
              >
                <SlidersHorizontal size={16} />
                Filtrar produtos
              </button>
            </div>

            {filtersOpen && (
              <div className="mt-4 rounded-[24px] border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">Filtros</p>
                    <h2 className="mt-2 text-lg font-black text-slate-900 dark:text-white">Ajuste o catalogo</h2>
                  </div>
                  <button
                    type="button"
                    onClick={() => setFiltersOpen(false)}
                    className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-200 text-slate-500 dark:border-slate-700 dark:text-slate-300"
                  >
                    <X size={16} />
                  </button>
                </div>

                <div className="mt-5 grid gap-5 lg:grid-cols-[1fr_260px]">
                  <div>
                    <p className="mb-3 text-sm font-bold text-slate-700 dark:text-slate-200">Categoria</p>
                    <div className="flex flex-wrap gap-2">
                      {catalogCategories.map((option) => (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() => setCategory(option.value)}
                          className={`rounded-full px-4 py-2 text-sm font-bold transition ${
                            category === option.value
                              ? "bg-orange-600 text-white"
                              : "border border-slate-200 bg-white text-slate-600 hover:border-orange-200 hover:text-orange-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
                          }`}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="mb-3 block text-sm font-bold text-slate-700 dark:text-slate-200">
                      Ordenacao
                    </label>
                    <select
                      value={sort}
                      onChange={(event) => setSort(event.target.value as CatalogSort)}
                      className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-900 outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                    >
                      {catalogSortOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="mt-5 flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setQuery("");
                      setCategory("todos");
                      setSort("relevancia");
                    }}
                    className="rounded-full border border-slate-200 px-4 py-2 text-sm font-bold text-slate-600 transition hover:border-orange-200 hover:text-orange-600 dark:border-slate-700 dark:text-slate-300"
                  >
                    Limpar filtros
                  </button>
                  <div className="rounded-full bg-orange-50 px-4 py-2 text-sm font-semibold text-orange-700 dark:bg-orange-950/40 dark:text-orange-300">
                    {filtered.length} produto(s) encontrados
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="rounded-[28px] border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900/70">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">Filtros activos</p>
            <div className="mt-4 flex flex-wrap gap-2">
              <span className="rounded-full bg-slate-100 px-3 py-2 text-sm font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-200">
                Categoria: {catalogCategories.find((item) => item.value === category)?.label}
              </span>
              <span className="rounded-full bg-slate-100 px-3 py-2 text-sm font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-200">
                Ordenacao: {catalogSortOptions.find((item) => item.value === sort)?.label}
              </span>
            </div>
          </div>
        </div>

        {loading && (
          <div className="mt-8 rounded-[28px] border border-slate-200 bg-slate-50 px-6 py-16 text-center text-slate-500 dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-400">
            A carregar produtos do catalogo...
          </div>
        )}

        {!loading && error && (
          <div className="mt-8 rounded-[28px] border border-rose-200 bg-rose-50 px-6 py-12 text-center text-rose-600 dark:border-rose-900/40 dark:bg-rose-950/20 dark:text-rose-300">
            {error}
          </div>
        )}

        {!loading && !error && filtered.length === 0 && (
          <div className="mt-8 rounded-[28px] border border-slate-200 bg-slate-50 px-6 py-16 text-center dark:border-slate-800 dark:bg-slate-900/60">
            <h2 className="text-2xl font-black text-slate-900 dark:text-white">Nenhum produto encontrado</h2>
            <p className="mt-3 text-slate-500 dark:text-slate-400">
              Ajuste a pesquisa ou limpe os filtros para ver mais resultados.
            </p>
          </div>
        )}

        {!loading && !error && filtered.length > 0 && (
          <div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            {filtered.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
