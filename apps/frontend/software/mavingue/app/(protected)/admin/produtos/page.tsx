"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Loading, ErrorBox, Empty } from "@/components/ui/State";
import { productsApi } from "@/features/products/api";
import { Product } from "@/features/products/types";
import { getSessionUser } from "@/lib/auth/session";
import { AlertTriangle, Edit, Loader2, Package, Plus, Trash2, Warehouse, X } from "lucide-react";

function ConfirmDeactivateModal({
  isOpen,
  productName,
  onConfirm,
  onCancel,
  isProcessing = false,
}: {
  isOpen: boolean;
  productName: string;
  onConfirm: () => void;
  onCancel: () => void;
  isProcessing?: boolean;
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-xl">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2 text-rose-600">
            <AlertTriangle className="h-5 w-5" />
            <h3 className="text-lg font-semibold">Desativar produto</h3>
          </div>
          <button
            type="button"
            onClick={onCancel}
            disabled={isProcessing}
            className="rounded-xl p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <p className="mt-4 text-sm leading-6 text-slate-600">
          O produto <span className="font-semibold text-slate-900">&quot;{productName}&quot;</span> vai sumir das listas activas, mas o historico de vendas e compras sera mantido.
        </p>
        <p className="mt-2 text-xs text-slate-500">
          Use esta opcao quando quiser retirar o produto do sistema sem apagar os registos antigos.
        </p>

        <div className="mt-6 flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={onCancel} disabled={isProcessing}>
            Cancelar
          </Button>
          <Button type="button" onClick={onConfirm} disabled={isProcessing} className="bg-rose-600 text-white hover:bg-rose-700">
            {isProcessing ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            {isProcessing ? "A desativar..." : "Desativar"}
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function AdminProdutos() {
  const [rows, setRows] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [mounted, setMounted] = useState(false);
  const [deactivatingId, setDeactivatingId] = useState<number | null>(null);
  const [deactivateConfirm, setDeactivateConfirm] = useState<{ isOpen: boolean; id: number; name: string }>({
    isOpen: false,
    id: 0,
    name: "",
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  async function load() {
    setErr("");
    setLoading(true);
    try {
      setRows(await productsApi.list());
    } catch (error: unknown) {
      setErr(error instanceof Error ? error.message : "Erro ao carregar produtos.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!mounted) return;
    void load();
  }, [mounted]);

  async function deactivate(id: number) {
    setErr("");
    setDeactivatingId(id);
    try {
      await productsApi.remove(id);
      setDeactivateConfirm({ isOpen: false, id: 0, name: "" });
      await load();
    } catch (error: unknown) {
      setErr(error instanceof Error ? error.message : "Nao foi possivel desativar o produto.");
    } finally {
      setDeactivatingId(null);
    }
  }

  const sessionUser = mounted ? getSessionUser() : null;
  const basePath = sessionUser?.role === "ADMIN" ? "/admin" : "/staff";
  const canDelete =
    sessionUser?.role === "ADMIN" || Boolean(sessionUser?.permissions.includes("products.delete"));
  const canViewFerragem =
    sessionUser?.role === "ADMIN" || Boolean(sessionUser?.permissions.includes("ferragem.view"));

  const formatPrice = (price: number) => `${price.toLocaleString("pt-MZ")} MT`;

  if (!mounted) {
    return (
      <div className="p-6">
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-orange-100 p-2">
              <Package className="h-5 w-5 text-orange-600" />
            </div>
            <h2 className="text-xl font-semibold text-slate-800">Produtos</h2>
          </div>
          <p className="mt-2 text-sm text-slate-500">A preparar lista...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 md:p-6">
      <ConfirmDeactivateModal
        isOpen={deactivateConfirm.isOpen}
        productName={deactivateConfirm.name}
        onConfirm={() => deactivate(deactivateConfirm.id)}
        onCancel={() => setDeactivateConfirm({ isOpen: false, id: 0, name: "" })}
        isProcessing={deactivatingId === deactivateConfirm.id}
      />

      <section className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-orange-100 p-3 text-orange-600">
              <Package className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-slate-900">Produtos</h1>
              <p className="text-sm text-slate-500">Gestao de produtos activos e acesso rapido a ferragem.</p>
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            {canViewFerragem ? (
              <Link href={`${basePath}/ferragem`}>
                <Button variant="outline" className="flex w-full items-center justify-center gap-2 sm:w-auto">
                  <Warehouse className="h-4 w-4" />
                  Ferragem
                </Button>
              </Link>
            ) : null}

            <Link href={`${basePath}/produtos/novo`}>
              <Button className="flex w-full items-center justify-center gap-2 bg-orange-600 text-white hover:bg-orange-700 sm:w-auto">
                <Plus className="h-4 w-4" />
                Novo produto
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {loading ? <Loading /> : null}
      {err ? <ErrorBox text={err} /> : null}
      {!loading && !err && rows.length === 0 ? <Empty text="Sem produtos cadastrados." /> : null}

      {!loading && !err && rows.length > 0 ? (
        <>
          <div className="hidden overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm lg:block">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <th className="w-20 p-4 text-left text-sm font-semibold text-slate-500">ID</th>
                  <th className="p-4 text-left text-sm font-semibold text-slate-500">Nome</th>
                  <th className="p-4 text-left text-sm font-semibold text-slate-500">Preco</th>
                  <th className="w-40 p-4 text-right text-sm font-semibold text-slate-500">Accoes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {rows.map((product) => (
                  <tr key={product.id} className="transition hover:bg-slate-50">
                    <td className="p-4 font-mono text-sm text-slate-500">#{product.id}</td>
                    <td className="p-4 text-sm font-medium text-slate-900">{product.name}</td>
                    <td className="p-4 text-sm font-semibold text-orange-600">{formatPrice(product.price)}</td>
                    <td className="p-4">
                      <div className="flex items-center justify-end gap-2">
                        <Link href={`${basePath}/produtos/${product.id}/editar`}>
                          <button className="rounded-xl p-2 text-slate-500 transition hover:bg-orange-50 hover:text-orange-600">
                            <Edit className="h-4 w-4" />
                          </button>
                        </Link>
                        {canDelete ? (
                          <button
                            type="button"
                            onClick={() => setDeactivateConfirm({ isOpen: true, id: product.id, name: product.name })}
                            className="rounded-xl p-2 text-slate-500 transition hover:bg-rose-50 hover:text-rose-600"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        ) : null}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="grid gap-3 lg:hidden">
            {rows.map((product) => (
              <article key={product.id} className="rounded-[24px] border border-slate-200 bg-white p-4 shadow-sm">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-slate-900">{product.name}</p>
                    <p className="mt-1 text-xs font-mono text-slate-400">ID #{product.id}</p>
                  </div>
                  <p className="text-lg font-black text-orange-600">{formatPrice(product.price)}</p>
                </div>

                <div className="mt-4 flex flex-wrap justify-end gap-2 border-t border-slate-100 pt-3">
                  <Link href={`${basePath}/produtos/${product.id}/editar`}>
                    <button className="flex items-center gap-1 rounded-xl px-3 py-2 text-sm text-slate-600 transition hover:bg-orange-50 hover:text-orange-600">
                      <Edit className="h-3.5 w-3.5" />
                      Editar
                    </button>
                  </Link>
                  {canDelete ? (
                    <button
                      type="button"
                      onClick={() => setDeactivateConfirm({ isOpen: true, id: product.id, name: product.name })}
                      className="flex items-center gap-1 rounded-xl px-3 py-2 text-sm text-slate-600 transition hover:bg-rose-50 hover:text-rose-600"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      Desativar
                    </button>
                  ) : null}
                </div>
              </article>
            ))}
          </div>
        </>
      ) : null}
    </div>
  );
}
