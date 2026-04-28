"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { StatusPill } from "@/components/ui/StatusPill";
import { clientApi } from "@/features/client/api";
import type { ClientOrder, ClientProfile } from "@/features/client/types";
import {
  listClientWaterBills,
  listClientWaterContracts,
  listClientWaterReadings,
} from "@/features/water/api";
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
  Download,
  ExternalLink,
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
        const [profileData, orderData, contractData, readingData, billData] =
          await Promise.all([
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
  const readyOrders = orders.filter(
    (order) => order.estadoLevantamento === "PRONTO_PARA_LEVANTAMENTO"
  );
  const latestReading = readings[0] ?? null;
  const pendingBill = bills.find((bill) => bill.estadoPagamento !== "PAGO") ?? null;
  const waterAccounts = profile?.waterCustomers ?? [];

  if (!mounted) {
    return (
      <div className="min-h-screen bg-slate-100 px-4 py-6 dark:bg-slate-950">
        <div className="mx-auto max-w-7xl">
          <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/60">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-orange-100 p-2 text-orange-600 dark:bg-orange-500/15 dark:text-orange-400">
                <ShoppingBag className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-slate-800 dark:text-white">
                  Área do Cliente
                </h2>
                <p className="text-sm text-slate-500 dark:text-slate-400">A preparar interface...</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-slate-100 dark:bg-slate-950">
      <div className="mx-auto max-w-7xl space-y-6 px-4 py-6 md:px-6">
        <section className="rounded-[28px] bg-gradient-to-br from-slate-950 to-slate-800 p-6 text-white shadow-lg shadow-slate-950/10 dark:from-slate-950 dark:to-slate-900">
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-orange-300">
            Área do cliente
          </p>
          <h1 className="mt-3 text-3xl font-black tracking-tight md:text-4xl">
            Compras, levantamento, água e histórico
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-300">
            {profile
              ? `Sessão activa para ${profile.account.nome} (${profile.account.email})`
              : "A carregar dados da sua conta..."}
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/catalogo"
              className="inline-flex h-11 items-center justify-center rounded-2xl bg-orange-600 px-5 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-orange-700"
            >
              Comprar mais
            </Link>
            <Link
              href="/cliente/compras"
              className="inline-flex h-11 items-center justify-center rounded-2xl border border-white/15 bg-white/5 px-5 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-white/10"
            >
              Ver compras
            </Link>
          </div>
        </section>

        {loading && (
          <div className="rounded-[28px] border border-slate-200 bg-white p-12 text-center shadow-sm dark:border-slate-800 dark:bg-slate-900/60">
            <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-2 border-slate-200 border-b-orange-600 dark:border-slate-700 dark:border-b-orange-500" />
            <p className="text-sm text-slate-500 dark:text-slate-400">
              A carregar dados da dashboard...
            </p>
          </div>
        )}

        {error && !loading && (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/60 dark:bg-red-950/30 dark:text-red-300">
            {error}
          </div>
        )}

        {!loading && !error && (
          <>
            <section className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-5">
              {[
                { label: "Compras", value: orders.length, icon: ShoppingBag },
                { label: "Total", value: formatMoney(orderTotal), icon: TrendingUp },
                { label: "Pendentes", value: pendingOrders.length, icon: Package },
                { label: "Prontos", value: readyOrders.length, icon: CheckCircle },
                { label: "Água", value: waterAccounts.length, icon: Droplets },
              ].map((item) => {
                const Icon = item.icon;

                return (
                  <div
                    key={item.label}
                    className="group rounded-[24px] border border-slate-200/70 bg-white/80 p-4 shadow-sm backdrop-blur transition hover:-translate-y-0.5 hover:shadow-md dark:border-slate-800 dark:bg-slate-900/50"
                  >
                    <div className="mb-3 flex items-center justify-between">
                      <span className="text-xs font-medium uppercase tracking-[0.25em] text-slate-400">
                        {item.label}
                      </span>
                      <Icon className="h-5 w-5 text-orange-500 transition group-hover:scale-110" />
                    </div>
                    <div className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
                      {item.value}
                    </div>
                  </div>
                );
              })}
            </section>

            <section className="grid gap-6 lg:grid-cols-3">
              <div className="lg:col-span-2 rounded-[28px] border border-slate-200/70 bg-white/80 shadow-sm backdrop-blur dark:border-slate-800 dark:bg-slate-900/50">
                <div className="border-b border-slate-100 px-5 py-5 dark:border-slate-800">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                        Compras recentes
                      </h2>
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        Últimos pedidos realizados
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <Link
                        href="/catalogo"
                        className="rounded-2xl bg-orange-50 px-4 py-2 text-sm font-semibold text-orange-600 transition hover:bg-orange-100 dark:bg-orange-500/10 dark:text-orange-300 dark:hover:bg-orange-500/15"
                      >
                        Comprar mais
                      </Link>
                      <Link
                        href="/cliente/compras"
                        className="rounded-2xl bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
                      >
                        Ver tudo
                      </Link>
                    </div>
                  </div>
                </div>

                {orders.length === 0 ? (
                  <div className="px-5 py-14 text-center">
                    <ShoppingBag className="mx-auto mb-3 h-12 w-12 text-slate-300 dark:text-slate-600" />
                    <p className="text-slate-500 dark:text-slate-400">
                      Ainda não existem compras
                    </p>
                  </div>
                ) : (
                  <div className="divide-y divide-slate-100 dark:divide-slate-800">
                    {orders.slice(0, 4).map((order) => (
                      <div
                        key={order.id}
                        className="rounded-xl p-4 transition hover:bg-slate-50/70 dark:hover:bg-slate-800/40"
                      >
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <h3 className="font-semibold text-slate-900 dark:text-white">
                                Pedido #{order.id}
                              </h3>
                              <StatusPill
                                label={formatPickupStatus(order.estadoLevantamento)}
                                tone={pickupTone(order.estadoLevantamento)}
                              />
                            </div>

                            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                              {formatDateTime(order.criadoEm)} • {order.quantidade} unidade(s) •{" "}
                              {formatPaymentMethod(order.formaPagamento)}
                            </p>

                            {order.levantamentoNotas && (
                              <p className="mt-2 text-xs text-slate-400 dark:text-slate-500">
                                {order.levantamentoNotas}
                              </p>
                            )}
                          </div>

                          <div className="text-right">
                            <p className="text-lg font-black text-orange-600 dark:text-orange-400">
                              {formatMoney(order.total)}
                            </p>
                            <div className="mt-2 flex justify-end gap-3">
                              <Link
                                href={`/cliente/compras/${order.id}`}
                                className="text-xs font-medium text-slate-500 transition hover:text-orange-600 dark:text-slate-400 dark:hover:text-orange-400"
                              >
                                Detalhe
                              </Link>
                              <button
                                type="button"
                                onClick={() => printSaleDocument(order)}
                                className="text-xs font-medium text-slate-500 transition hover:text-orange-600 dark:text-slate-400 dark:hover:text-orange-400"
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

              <aside className="space-y-6">
                <section className="rounded-[28px] border border-slate-200/70 bg-white/80 p-5 shadow-sm backdrop-blur dark:border-slate-800 dark:bg-slate-900/50">
                  <h2 className="mb-4 text-lg font-semibold text-slate-900 dark:text-white">
                    Pedidos prontos
                  </h2>

                  {readyOrders.length === 0 ? (
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      Nenhum pedido pronto para levantamento.
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {readyOrders.slice(0, 3).map((order) => (
                        <div
                          key={order.id}
                          className="rounded-2xl border border-emerald-200 bg-emerald-50/80 p-3 dark:border-emerald-900/40 dark:bg-emerald-950/20"
                        >
                          <p className="text-sm font-semibold text-slate-900 dark:text-white">
                            Pedido #{order.id}
                          </p>
                          <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">
                            {order.produtoNome}
                          </p>
                          <div className="mt-2">
                            <StatusPill label="Pronto" tone="emerald" />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </section>

                <section className="rounded-[28px] border border-slate-200/70 bg-white/80 p-5 shadow-sm backdrop-blur dark:border-slate-800 dark:bg-slate-900/50">
                  <div className="mb-4 flex items-center gap-2">
                    <Droplets className="h-5 w-5 text-cyan-600 dark:text-cyan-400" />
                    <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                      Módulo de água
                    </h2>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-2xl bg-slate-50 p-3 text-center dark:bg-slate-800/60">
                      <p className="text-xs text-slate-500 dark:text-slate-400">Contratos</p>
                      <p className="text-xl font-black text-slate-900 dark:text-white">
                        {contracts.length}
                      </p>
                    </div>
                    <div className="rounded-2xl bg-slate-50 p-3 text-center dark:bg-slate-800/60">
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Última leitura
                      </p>
                      <p className="text-sm font-black text-slate-900 dark:text-white">
                        {latestReading ? `${latestReading.consumoM3} m³` : "—"}
                      </p>
                    </div>
                  </div>

                  {pendingBill && (
                    <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50/80 p-4 dark:border-amber-900/40 dark:bg-amber-950/20">
                      <div className="mb-2 flex items-start justify-between gap-2">
                        <p className="text-sm font-semibold text-slate-900 dark:text-white">
                          Factura #{pendingBill.id}
                        </p>
                        <StatusPill label={pendingBill.estadoPagamento} tone="amber" />
                      </div>
                      <p className="text-lg font-black text-orange-600 dark:text-orange-400">
                        {formatMoney(pendingBill.valorTotal)}
                      </p>
                      <div className="mt-3 flex flex-wrap gap-3">
                        <button
                          type="button"
                          onClick={() => printWaterBillDocument(pendingBill)}
                          className="inline-flex items-center gap-1 text-xs font-medium text-slate-600 transition hover:text-orange-600 dark:text-slate-400 dark:hover:text-orange-400"
                        >
                          <Download className="h-3 w-3" /> PDF
                        </button>
                        <Link
                          href="/cliente/agua"
                          className="inline-flex items-center gap-1 text-xs font-medium text-slate-600 transition hover:text-orange-600 dark:text-slate-400 dark:hover:text-orange-400"
                        >
                          <ExternalLink className="h-3 w-3" /> Ver
                        </Link>
                      </div>
                    </div>
                  )}

                  <Link
                    href="/cliente/agua"
                    className="mt-4 inline-flex h-11 w-full items-center justify-center rounded-2xl bg-cyan-50 px-4 text-sm font-semibold text-cyan-700 transition hover:bg-cyan-100 dark:bg-cyan-500/10 dark:text-cyan-300 dark:hover:bg-cyan-500/15"
                  >
                    Abrir módulo de água
                  </Link>
                </section>
              </aside>
            </section>
          </>
        )}
      </div>
    </main>
  );
}