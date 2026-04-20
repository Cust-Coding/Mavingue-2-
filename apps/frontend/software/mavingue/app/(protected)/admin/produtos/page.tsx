"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Loading, ErrorBox, Empty } from "@/components/ui/State";
import { productsApi } from "@/features/products/api";
import { Product } from "@/features/products/types";
import { Package, Plus, Edit, Trash2 } from "lucide-react";

export default function AdminProdutos() {
  const [rows, setRows] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  async function load() {
    setErr("");
    setLoading(true);
    try {
      setRows(await productsApi.list());
    } catch (e: any) {
      setErr(e?.message ?? "Erro");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (mounted) {
      load();
    }
  }, [mounted]);

  async function del(id: number) {
    if (!confirm("Apagar produto?")) return;
    await productsApi.remove(id);
    await load();
  }

  const formatPrice = (price: number) => {
  return price.toLocaleString('pt-MZ') + ' MT';
};

  if (!mounted) {
    return (
      <div className="p-6">
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-100 rounded-lg">
              <Package className="w-5 h-5 text-orange-600" />
            </div>
            <h2 className="text-xl font-semibold text-slate-800">Produtos</h2>
          </div>
          <p className="text-slate-500 text-sm mt-2">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 space-y-4 md:space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 md:p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-100 rounded-lg">
              <Package className="w-5 h-5 md:w-6 md:h-6 text-orange-600" />
            </div>
            <div>
              <h2 className="text-lg md:text-xl font-semibold text-slate-800">Produtos</h2>
              <p className="text-xs md:text-sm text-slate-500">Gestão de produtos e ferragens</p>
            </div>
          </div>
          <Link href="/admin/produtos/novo">
            <Button className="flex items-center justify-center gap-2 bg-orange-600 hover:bg-orange-700 w-full sm:w-auto">
              <Plus className="w-4 h-4" />
              <span>Novo produto</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Loading */}
      {loading && <Loading />}

      {/* Erro */}
      {err && <ErrorBox text={err} />}

      {/* branco/Vazio */}
      {!loading && !err && rows.length === 0 && <Empty text="Sem produtos cadastrados." />}

      {/* Tela maior*/}
      {!loading && !err && rows.length > 0 && (
        <>
          <div className="hidden lg:block bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="text-left p-4 text-sm font-semibold text-slate-600 w-16">ID</th>
                  <th className="text-left p-4 text-sm font-semibold text-slate-600">Nome</th>
                  <th className="text-left p-4 text-sm font-semibold text-slate-600">Preço</th>
                  <th className="text-right p-4 text-sm font-semibold text-slate-600 w-32">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {rows.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-4 text-sm text-slate-500 font-mono">#{p.id}</td>
                    <td className="p-4 text-sm text-slate-800 font-medium">{p.name}</td>
                    <td className="p-4 text-sm text-orange-600 font-semibold">{formatPrice(p.price)}</td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link href={`/admin/produtos/${p.id}/editar`}>
                          <button className="p-2 text-slate-500 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors">
                            <Edit className="w-4 h-4" />
                          </button>
                        </Link>
                        <button
                          onClick={() => del(p.id)}
                          className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Cards*/}
          <div className="lg:hidden space-y-3">
            {rows.map((p) => (
              <div key={p.id} className="bg-white rounded-xl border border-slate-200 p-4 hover:shadow-sm transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="text-sm font-semibold text-slate-800">{p.name}</p>
                    <p className="text-xs text-slate-400 font-mono mt-1">ID: #{p.id}</p>
                  </div>
                  <p className="text-lg font-bold text-orange-600">{formatPrice(p.price)}</p>
                </div>
                <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                  <Link href={`/admin/produtos/${p.id}/editar`}>
                    <button className="flex items-center gap-1 px-3 py-1.5 text-sm text-slate-600 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors">
                      <Edit className="w-3.5 h-3.5" />
                      Editar
                    </button>
                  </Link>
                  <button
                    onClick={() => del(p.id)}
                    className="flex items-center gap-1 px-3 py-1.5 text-sm text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Apagar
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}