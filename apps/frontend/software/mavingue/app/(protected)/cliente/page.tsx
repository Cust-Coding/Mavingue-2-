"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { StatusPill } from "@/components/ui/StatusPill";
import { clientApi } from "@/features/client/api";
import type { ClientOrder, ClientProfile } from "@/features/client/types";
import { listClientWaterBills, listClientWaterContracts, listClientWaterReadings } from "@/features/water/api";
import type { WaterBill, WaterContract, WaterReading } from "@/features/water/types";
import { printSaleDocument, printWaterBillDocument } from "@/lib/documents/print";
import { getErrorMessage } from "@/lib/errors";
import {
  formatDateTime,
  formatMoney,
  formatPaymentMethod,
  formatPickupStatus,
  pickupTone,
} from "@/lib/formatters";
import { 
  ShoppingBag, 
  TrendingUp, 
  Package, 
  CheckCircle, 
  Droplets,
  FileText,
  Download,
  ExternalLink
} from "lucide-react";

export default function ClienteHome() {
  const [profile, setProfile] = useState<ClientProfile | null>(null);
  const [orders, setOrders] = useState<ClientOrder[]>([]);
  const [contracts, setContracts] = useState<WaterContract[]>([]);
  const [readings, setReadings] = useState<WaterReading[]>([]);
  const [bills, setBills] = useState<WaterBill[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    
    (async () => {
      setLoading(true);
      setError("");

      try {
        const [profileData, orderData, contractData, readingData, billData] = await Promise.all([
          clientApi.profile(),
          clientApi.listOrders(),
          listClientWaterContracts(),
          listClientWaterReadings(),
          listClientWaterBills(),
        ]);

        setProfile(profileData);
        setOrders(orderData);
        setContracts(contractData);
        setReadings(readingData);
        setBills(billData);
      } catch (reason: unknown) {
        setError(getErrorMessage(reason, "Erro ao carregar a area do cliente"));
      } finally {
        setLoading(false);
      }
    })();
  }, [mounted]);

  const orderTotal = useMemo(
    () => orders.reduce((sum, order) => sum + Number(order.total || 0), 0),
    [orders]
  );

  const pendingOrders = orders.filter((order) => order.estadoLevantamento !== "LEVANTADO");
  const readyOrders = orders.filter((order) => order.estadoLevantamento === "PRONTO_PARA_LEVANTAMENTO");
  const latestReading = readings[0] ?? null;
  const pendingBill = bills.find((bill) => bill.estadoPagamento !== "PAGO") ?? null;
  const waterAccounts = profile?.waterCustomers ?? [];

  if (!mounted) {
    return (
      <div className="p-6">
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-100 rounded-lg">
              <ShoppingBag className="w-5 h-5 text-orange-600" />
            </div>
            <h2 className="text-xl font-semibold text-slate-800">Área do Cliente</h2>
          </div>
          <p className="text-slate-500 text-sm mt-2">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <main className="p-4 md:p-6 space-y-6">
      {/* Header */}
      <section className="rounded-xl bg-gradient-to-r from-slate-800 to-slate-900 p-6 text-white shadow-lg">
        <p className="text-xs font-semibold uppercase tracking-wider text-orange-300">
          Área do cliente
        </p>
        <h1 className="mt-3 text-2xl md:text-3xl font-bold tracking-tight">
          Compras, levantamento, água e histórico
        </h1>
        <p className="mt-2 text-sm text-slate-300 max-w-2xl">
          {profile
            ? `Sessão activa para ${profile.account.nome} (${profile.account.email})`
            : "A carregar dados da sua conta..."}
        </p>
      </section>

      {loading && (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600 mx-auto mb-3"></div>
          <p className="text-slate-500 text-sm">A carregar dados da dashboard...</p>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700 text-sm">
          {error}
        </div>
      )}

      {!loading && !error && (
        <>
          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {[
              { label: "Compras", value: orders.length, icon: ShoppingBag, hint: "Total de compras" },
              { label: "Total gasto", value: formatMoney(orderTotal), icon: TrendingUp, hint: "Acumulado" },
              { label: "Por tratar", value: pendingOrders.length, icon: Package, hint: "Pedidos em andamento" },
              { label: "Prontos", value: readyOrders.length, icon: CheckCircle, hint: "Para levantar" },
              { label: "Contas água", value: waterAccounts.length, icon: Droplets, hint: "Ligações activas" },
            ].map((card) => {
              const Icon = card.icon;
              return (
                <div
                  key={card.label}
                  className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm hover:shadow-md transition"
                >
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs font-medium text-slate-400">{card.label}</p>
                    <Icon className="w-4 h-4 text-orange-500" />
                  </div>
                  <div className="text-2xl font-bold text-slate-800">{card.value}</div>
                  <p className="text-xs text-slate-400 mt-1">{card.hint}</p>
                </div>
              );
            })}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Compras Recentes */}
            <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="p-5 border-b border-slate-100">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div>
                    <h2 className="text-lg font-semibold text-slate-800">Compras recentes</h2>
                    <p className="text-sm text-slate-500">Últimos pedidos realizados</p>
                  </div>
                  <div className="flex gap-2">
                    <Link
                      href="/catalogo"
                      className="px-4 py-2 text-sm font-medium text-orange-600 bg-orange-50 rounded-lg hover:bg-orange-100 transition"
                    >
                      Comprar mais
                    </Link>
                    <Link
                      href="/cliente/compras"
                      className="px-4 py-2 text-sm font-medium text-slate-600 bg-slate-100 rounded-lg hover:bg-slate-200 transition"
                    >
                      Ver tudo
                    </Link>
                  </div>
                </div>
              </div>

              {orders.length === 0 ? (
                <div className="p-12 text-center">
                  <ShoppingBag className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                  <p className="text-slate-500">Ainda não existem compras</p>
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {orders.slice(0, 4).map((order) => (
                    <div key={order.id} className="p-4 hover:bg-slate-50 transition">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-semibold text-slate-800">
                              Pedido #{order.id}
                            </h3>
                            <StatusPill
                              label={formatPickupStatus(order.estadoLevantamento)}
                              tone={pickupTone(order.estadoLevantamento)}
                            />
                          </div>
                          <p className="text-sm text-slate-500 mt-1">
                            {formatDateTime(order.criadoEm)} • {order.quantidade} unidade(s) •{" "}
                            {formatPaymentMethod(order.formaPagamento)}
                          </p>
                          {order.levantamentoNotas && (
                            <p className="text-xs text-slate-400 mt-2">{order.levantamentoNotas}</p>
                          )}
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-orange-600">{formatMoney(order.total)}</p>
                          <div className="flex gap-2 mt-2">
                            <Link
                              href={`/cliente/compras/${order.id}`}
                              className="text-xs text-slate-500 hover:text-orange-600"
                            >
                              Detalhe
                            </Link>
                            <button
                              onClick={() => printSaleDocument(order)}
                              className="text-xs text-slate-500 hover:text-orange-600"
                            >
                              PDF
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Sidebar - Pedidos Prontos + Água */}
            <div className="space-y-6">
              {/* Pedidos Prontos */}
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
                <h2 className="text-lg font-semibold text-slate-800 mb-3">Pedidos prontos</h2>
                {readyOrders.length === 0 ? (
                  <p className="text-sm text-slate-500">Nenhum pedido pronto para levantamento.</p>
                ) : (
                  <div className="space-y-3">
                    {readyOrders.slice(0, 3).map((order) => (
                      <div key={order.id} className="bg-green-50 border border-green-200 rounded-lg p-3">
                        <p className="font-medium text-slate-800 text-sm">Pedido #{order.id}</p>
                        <p className="text-xs text-slate-600">{order.produtoNome}</p>
                        <StatusPill label="Pronto" tone="emerald" />
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Módulo Água */}
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
                <div className="flex items-center gap-2 mb-3">
                  <Droplets className="w-5 h-5 text-cyan-600" />
                  <h2 className="text-lg font-semibold text-slate-800">Módulo de água</h2>
                </div>
                
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="bg-slate-50 rounded-lg p-3 text-center">
                    <p className="text-xs text-slate-500">Contratos</p>
                    <p className="text-xl font-bold text-slate-800">{contracts.length}</p>
                  </div>
                  <div className="bg-slate-50 rounded-lg p-3 text-center">
                    <p className="text-xs text-slate-500">Última leitura</p>
                    <p className="text-sm font-bold text-slate-800">
                      {latestReading ? `${latestReading.consumoM3} m³` : "—"}
                    </p>
                  </div>
                </div>

                {pendingBill && (
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-3">
                    <div className="flex justify-between items-start mb-2">
                      <p className="font-medium text-slate-800 text-sm">Factura #{pendingBill.id}</p>
                      <StatusPill label={pendingBill.estadoPagamento} tone="amber" />
                    </div>
                    <p className="text-lg font-bold text-orange-600">{formatMoney(pendingBill.valorTotal)}</p>
                    <div className="flex gap-2 mt-3">
                      <button
                        onClick={() => printWaterBillDocument(pendingBill)}
                        className="flex items-center gap-1 text-xs text-slate-600 hover:text-orange-600"
                      >
                        <Download className="w-3 h-3" /> PDF
                      </button>
                      <Link
                        href="/cliente/agua"
                        className="flex items-center gap-1 text-xs text-slate-600 hover:text-orange-600"
                      >
                        <ExternalLink className="w-3 h-3" /> Ver
                      </Link>
                    </div>
                  </div>
                )}

                <Link
                  href="/cliente/agua"
                  className="block text-center mt-3 px-4 py-2 text-sm font-medium text-orange-600 bg-orange-50 rounded-lg hover:bg-orange-100 transition"
                >
                  Abrir módulo de água
                </Link>
              </div>
            </div>
          </div>
        </>
      )}
    </main>
  );
}