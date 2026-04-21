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
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    
    productsApi
      .list()
      .then(setProducts)
      .catch((reason: unknown) => setError(getErrorMessage(reason, "Erro ao carregar o catalogo")))
      .finally(() => setLoading(false));
  }, [mounted]);

  const filtered = useMemo(
    () => filterCatalogProducts(products, { query, category, sort }),
    [products, query, category, sort]
  );

  if (!mounted) {
    return (
      <div className="min-h-screen bg-white dark:bg-slate-950">
        <div className="max-w-7xl mx-auto px-6 py-12 lg:px-20">
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <SlidersHorizontal className="w-5 h-5 text-orange-600" />
              </div>
              <h2 className="text-xl font-semibold text-slate-800">Catálogo</h2>
            </div>
            <p className="text-slate-500 text-sm mt-2">Carregando produtos...</p>
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
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <p className="text-xs font-semibold uppercase tracking-wider text-orange-300">Catálogo Mavingue</p>
              <h1 className="mt-3 text-2xl md:text-3xl font-bold tracking-tight">
                Materiais de construção e ferragem
              </h1>
              <p className="mt-2 text-sm text-slate-300 max-w-xl">
                Explore nossos produtos, filtre por categoria e encontre o que precisa para sua obra.
              </p>
            </div>
            <div className="flex gap-3">
              <div className="bg-white/10 rounded-xl px-4 py-3 text-center">
                <p className="text-xs uppercase tracking-wider text-slate-300">Produtos</p>
                <p className="text-2xl font-bold">{products.length}</p>
              </div>
              <div className="bg-white/10 rounded-xl px-4 py-3 text-center">
                <p className="text-xs uppercase tracking-wider text-slate-300">Visíveis</p>
                <p className="text-2xl font-bold">{filtered.length}</p>
              </div>
            </div>
          </div>
        </div>

        
        <div className="mt-6 flex flex-col lg:flex-row gap-4">
          {/* Search Bar */}
          <div className="flex-1 bg-white rounded-xl border border-slate-200 p-3 shadow-sm dark:bg-slate-900/70 dark:border-slate-800">
            <div className="flex gap-3">
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Pesquisar por nome, descrição ou categoria..."
                className="flex-1 h-11 rounded-lg border border-slate-200 bg-slate-50 px-4 text-sm text-slate-800 focus:outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-400 dark:bg-slate-800 dark:border-slate-700 dark:text-white"
              />
              <button
                type="button"
                onClick={() => setFiltersOpen((current) => !current)}
                className="inline-flex items-center gap-2 px-4 h-11 rounded-lg border border-slate-200 text-slate-600 text-sm font-medium hover:border-orange-300 hover:bg-orange-50 hover:text-orange-600 transition dark:border-slate-700 dark:text-slate-300"
              >
                <SlidersHorizontal size={16} />
                Filtrar
              </button>
            </div>

          
            {filtersOpen && (
              <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Filtros</p>
                    <h2 className="text-md font-semibold text-slate-800 dark:text-white">Ajuste sua busca</h2>
                  </div>
                  <button
                    type="button"
                    onClick={() => setFiltersOpen(false)}
                    className="h-8 w-8 rounded-lg flex items-center justify-center text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    <X size={16} />
                  </button>
                </div>

                <div className="flex flex-col md:flex-row gap-5">
                  <div className="flex-1">
                    <p className="mb-2 text-sm font-medium text-slate-700 dark:text-slate-300">Categoria</p>
                    <div className="flex flex-wrap gap-2">
                      {catalogCategories.map((option) => (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() => setCategory(option.value)}
                          className={`px-3 py-1.5 rounded-full text-sm font-medium transition ${
                            category === option.value
                              ? "bg-orange-600 text-white"
                              : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300"
                          }`}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="w-full md:w-48">
                    <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
                      Ordenar por
                    </label>
                    <select
                      value={sort}
                      onChange={(event) => setSort(event.target.value as CatalogSort)}
                      className="w-full h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 focus:outline-none focus:border-orange-400 dark:bg-slate-800 dark:border-slate-700 dark:text-white"
                    >
                      {catalogSortOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap items-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setQuery("");
                      setCategory("todos");
                      setSort("relevancia");
                    }}
                    className="px-4 py-1.5 rounded-full text-sm text-slate-500 hover:text-orange-600 transition"
                  >
                    Limpar filtros
                  </button>
                  <span className="text-sm text-slate-500 bg-slate-100 px-3 py-1.5 rounded-full dark:bg-slate-800">
                    {filtered.length} produto(s) encontrado(s)
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Active Filters Summary */}
          <div className="lg:w-64 bg-white rounded-xl border border-slate-200 p-3 shadow-sm dark:bg-slate-900/70 dark:border-slate-800">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">Filtros activos</p>
            <div className="flex flex-wrap gap-2">
              <span className="px-2 py-1 bg-slate-100 rounded-full text-xs text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                Categoria: {catalogCategories.find((item) => item.value === category)?.label}
              </span>
              <span className="px-2 py-1 bg-slate-100 rounded-full text-xs text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                Ordenar: {catalogSortOptions.find((item) => item.value === sort)?.label}
              </span>
            </div>
          </div>
        </div>

        {/* Products Grid */}
        {loading && (
          <div className="mt-8 bg-slate-50 rounded-xl p-12 text-center text-slate-500 dark:bg-slate-900/50">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600 mx-auto mb-3"></div>
            A carregar produtos do catálogo...
          </div>
        )}

        {!loading && error && (
          <div className="mt-8 bg-red-50 border border-red-200 rounded-xl p-8 text-center text-red-600 dark:bg-red-950/20">
            {error}
          </div>
        )}

        {!loading && !error && filtered.length === 0 && (
          <div className="mt-8 bg-slate-50 rounded-xl p-12 text-center dark:bg-slate-900/50">
            <h2 className="text-xl font-semibold text-slate-800 dark:text-white">Nenhum produto encontrado</h2>
            <p className="mt-2 text-slate-500 text-sm">Ajuste a pesquisa ou limpe os filtros para ver mais resultados.</p>
          </div>
        )}

        {!loading && !error && filtered.length > 0 && (
          <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
            {filtered.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}