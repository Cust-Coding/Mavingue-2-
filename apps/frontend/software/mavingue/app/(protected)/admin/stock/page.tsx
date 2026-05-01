"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { stockApi } from "@/features/stock/api";
import type { StockItem, StockMovement } from "@/features/stock/types";
import { productsApi } from "@/features/products/api";
import type { Product } from "@/features/products/types";
import { getErrorMessage } from "@/lib/errors";
import { formatDateTime } from "@/lib/formatters";
import { Package, TrendingUp, TrendingDown, History, Plus, Minus, AlertCircle, Check, Search } from "lucide-react";

export default function AdminStock() {
  const [rows, setRows] = useState<StockItem[]>([]);
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [mounted, setMounted] = useState(false);
  const [form, setForm] = useState({ produtoId: "", quantidade: "", tipo: "ENTRADA" as "ENTRADA" | "SAIDA", motivo: "" });
  const [selectedProducts, setSelectedProducts] = useState<number[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    setMounted(true);
  }, []);

  async function load() {
    setErr("");
    setLoading(true);

    try {
      const [stockRows, movementRows, productRows] = await Promise.all([
        stockApi.list(),
        stockApi.movements(),
        productsApi.list(),
      ]);
      setRows(stockRows);
      setMovements(movementRows);
      setProducts(productRows);
    } catch (reason: unknown) {
      setErr(getErrorMessage(reason, "Erro ao carregar stock"));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (mounted) {
      load();
    }
  }, [mounted]);

  async function adjust() {
    setErr("");

    if (!form.produtoId || !form.quantidade) {
      setErr("Selecione o produto e informe a quantidade.");
      return;
    }

    try {
      await stockApi.adjust({
        produtoId: Number(form.produtoId),
        quantidade: Number(form.quantidade),
        tipo: form.tipo,
        motivo: form.motivo || undefined,
      });
      setForm({ produtoId: "", quantidade: "", tipo: "ENTRADA", motivo: "" });
      await load();
    } catch (reason: unknown) {
      setErr(getErrorMessage(reason, "Erro no ajuste de stock"));
    }
  }

  const toggleProductSelection = (productId: number) => {
    setSelectedProducts(prev => 
      prev.includes(productId) 
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  const selectAllProducts = () => {
    if (selectedProducts.length === filteredProducts.length) {
      setSelectedProducts([]);
    } else {
      setSelectedProducts(filteredProducts.map(p => p.id));
    }
  };

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!mounted) {
    return (
      <div className="p-6">
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-100 rounded-lg">
              <Package className="w-5 h-5 text-orange-600" />
            </div>
            <h2 className="text-xl font-semibold text-slate-800">Gestão de Stock</h2>
          </div>
          <p className="text-slate-500 text-sm mt-2">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <main className="p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-orange-100 rounded-lg">
            <Package className="w-5 h-5 text-orange-600" />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-slate-800">Gestão de Stock</h1>
            <p className="text-sm text-slate-500">Controlo de entradas e saídas</p>
          </div>
        </div>
      </div>

      {/* Erro*/}
      {err && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-3 flex items-center gap-2 text-red-700">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <p className="text-sm">{err}</p>
        </div>
      )}

      {/* Ajustar Stock */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
        <h2 className="text-md font-semibold text-slate-800 mb-4 flex items-center gap-2">
          <History className="w-4 h-4 text-orange-500" />
          Ajustar stock
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          <select
            value={form.produtoId}
            onChange={(event) => setForm({ ...form, produtoId: event.target.value })}
            className="h-11 rounded-lg border border-slate-200 bg-white px-4 text-sm text-slate-900 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
          >
            <option value="">Selecionar produto</option>
            {products.map((product) => (
              <option key={product.id} value={product.id}>
                {product.name}
              </option>
            ))}
          </select>
          <Input 
            placeholder="Quantidade" 
            value={form.quantidade} 
            onChange={(e) => setForm({ ...form, quantidade: e.target.value })}
            className="rounded-lg"
          />
          <select
            value={form.tipo}
            onChange={(e) => setForm({ ...form, tipo: e.target.value as "ENTRADA" | "SAIDA" })}
            className="h-11 rounded-lg border border-slate-200 bg-white px-4 text-sm text-slate-900 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
          >
            <option value="ENTRADA" className="text-green-400">ENTRADA</option>
            <option value="SAIDA" className="text-red-400"> SAÍDA</option>
          </select>
          <Input 
            placeholder="Motivo (opcional)" 
            value={form.motivo} 
            onChange={(e) => setForm({ ...form, motivo: e.target.value })}
            className="rounded-lg"
          />
          <Button onClick={adjust} className="bg-orange-600 hover:bg-orange-700">
            Aplicar
          </Button>
        </div>
      </div>

      {/* Stock actual */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
        <h2 className="text-md font-semibold text-slate-800 mb-4 flex items-center gap-2">
          <Package className="w-4 h-4 text-orange-500" />
          Stock actual
        </h2>
        
        {loading && (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-orange-600 mx-auto"></div>
            <p className="text-slate-500 text-sm mt-2">A carregar stock...</p>
          </div>
        )}

        {!loading && rows.length === 0 && (
          <div className="text-center py-8 text-slate-500 text-sm">
            Sem stock registado.
          </div>
        )}

        {!loading && rows.length > 0 && (
          <div className="overflow-x-auto rounded-lg border border-slate-200">
            <table className="w-full">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Produto</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-slate-500 uppercase">Quantidade</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {rows.map((stock) => (
                  <tr key={stock.produtoId} className="hover:bg-slate-50">
                    <td className="px-4 py-3 text-sm font-medium text-slate-800">{stock.produtoNome}</td>
                    <td className="px-4 py-3 text-right text-sm text-slate-600">{stock.quantidade}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Seleção de Produtos com Checkbox */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
          <h2 className="text-md font-semibold text-slate-800 flex items-center gap-2">
            <Check className="w-4 h-4 text-orange-500" />
            Seleção múltipla de produtos
          </h2>
          <Button 
            variant="outline" 
            onClick={selectAllProducts}
            className="text-sm"
          >
            {selectedProducts.length === filteredProducts.length && filteredProducts.length > 0 
              ? "Desmarcar todos" 
              : "Selecionar todos"}
          </Button>
        </div>

        {/* Barra de pesquisa */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            placeholder="Pesquisar produtos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 rounded-lg"
          />
        </div>

        {/* Lista de produtos com checkbox */}
        <div className="border border-slate-200 rounded-lg overflow-hidden">
          <div className="max-h-64 overflow-y-auto">
            {filteredProducts.length === 0 ? (
              <div className="p-8 text-center text-slate-500">
                Nenhum produto encontrado
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {filteredProducts.map((product) => {
                  const stockItem = rows.find(s => s.produtoId === product.id);
                  const isSelected = selectedProducts.includes(product.id);
                  
                  return (
                    <label
                      key={product.id}
                      className={`flex items-center justify-between p-3 hover:bg-slate-50 cursor-pointer transition ${
                        isSelected ? 'bg-orange-50' : ''
                      }`}
                    >
                      <div className="flex items-center gap-3 flex-1">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleProductSelection(product.id)}
                          className="w-4 h-4 text-orange-600 rounded border-slate-300 focus:ring-orange-500"
                        />
                        <div className="flex-1">
                          <p className="text-sm font-medium text-slate-800">{product.name}</p>
                          <p className="text-xs text-slate-500">
                            Stock: {stockItem?.quantidade || 0} unidades
                          </p>
                        </div>
                      </div>
                      {isSelected && (
                        <Check className="w-4 h-4 text-orange-600" />
                      )}
                    </label>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Resumo da seleção */}
        {selectedProducts.length > 0 && (
          <div className="mt-4 p-3 bg-slate-50 rounded-lg">
            <p className="text-sm text-slate-600">
              <span className="font-semibold">{selectedProducts.length}</span> produto(s) selecionado(s)
            </p>
            <div className="flex flex-wrap gap-2 mt-2">
              {selectedProducts.slice(0, 5).map(id => {
                const product = products.find(p => p.id === id);
                return product && (
                  <span key={id} className="text-xs bg-white px-2 py-1 rounded border border-slate-200">
                    {product.name}
                  </span>
                );
              })}
              {selectedProducts.length > 5 && (
                <span className="text-xs text-slate-500">
                  +{selectedProducts.length - 5} outros
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Movimentos */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
          <h2 className="text-md font-semibold text-slate-800 flex items-center gap-2">
            <History className="w-4 h-4 text-orange-500" />
            Últimos movimentos
          </h2>
          <a href="/admin/stock/movimentos" className="text-sm font-medium text-orange-600 hover:text-orange-700">
            Ver histórico completo →
          </a>
        </div>

        {movements.length === 0 && (
          <div className="text-center py-8 text-slate-500 text-sm">
            Sem movimentos registados.
          </div>
        )}

        {movements.length > 0 && (
          <div className="space-y-3">
            {movements.slice(0, 6).map((movement) => (
              <div key={movement.id} className="bg-slate-50 rounded-lg p-4 hover:bg-slate-100 transition">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-slate-800">{movement.produtoNome}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        movement.tipo === "ENTRADA" 
                          ? "bg-emerald-100 text-emerald-700" 
                          : "bg-rose-100 text-rose-700"
                      }`}>
                        {movement.tipo === "ENTRADA" ? "+" : "-"}{movement.quantidade} un
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">
                      {movement.ferragemNome} • {formatDateTime(movement.criadoEm)}
                    </p>
                    {movement.motivo && (
                      <p className="text-xs text-slate-400 mt-2">Motivo: {movement.motivo}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    {movement.tipo === "ENTRADA" ? (
                      <TrendingUp className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <TrendingDown className="w-4 h-4 text-rose-600" />
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}