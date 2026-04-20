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

export default function ClienteHome() {
  const [profile, setProfile] = useState<ClientProfile | null>(null);
  const [orders, setOrders] = useState<ClientOrder[]>([]);
  const [contracts, setContracts] = useState<WaterContract[]>([]);
  const [readings, setReadings] = useState<WaterReading[]>([]);
  const [bills, setBills] = useState<WaterBill[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
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
  }, []);

  const orderTotal = useMemo(
    () => orders.reduce((sum, order) => sum + Number(order.total || 0), 0),
    [orders]
  );

  const pendingOrders = orders.filter((order) => order.estadoLevantamento !== "LEVANTADO");
  const readyOrders = orders.filter((order) => order.estadoLevantamento === "PRONTO_PARA_LEVANTAMENTO");
  const latestReading = readings[0] ?? null;
  const pendingBill = bills.find((bill) => bill.estadoPagamento !== "PAGO") ?? null;
  const waterAccounts = profile?.waterCustomers ?? [];

  return (
    <main className="grid gap-6">
      <section className="rounded-[32px] border border-slate-200 bg-gradient-to-br from-slate-950 via-slate-900 to-orange-950 px-8 py-10 text-white shadow-2xl shadow-slate-900/10">
        <p className="text-xs font-semibold uppercase tracking-[0.35em] text-orange-300">Area do cliente</p>
        <h1 className="mt-4 text-4xl font-black tracking-tight lg:text-5xl">
          Compras, levantamento, agua e historico no mesmo painel.
        </h1>
        <p className="mt-4 max-w-3xl text-base leading-7 text-slate-300">
          {profile
            ? `Sessao activa para ${profile.account.nome} (${profile.account.email}).`
            : "A ligar a conta autenticada ao historico de compras e ao modulo de agua."}
        </p>
      </section>

      {loading && (
        <div className="rounded-[28px] border border-slate-200 bg-slate-50 px-6 py-14 text-center text-slate-500 dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-400">
          A carregar dados da dashboard...
        </div>
      )}

      {error && (
        <div className="rounded-[28px] border border-rose-200 bg-rose-50 px-6 py-10 text-rose-700 dark:border-rose-900/40 dark:bg-rose-950/20 dark:text-rose-300">
          {error}
        </div>
      )}

      {!loading && !error && (
        <>
          <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
            {[
              { label: "Compras registadas", value: orders.length, hint: "Historico total do cliente" },
              { label: "Total comprado", value: formatMoney(orderTotal), hint: "Acumulado das compras" },
              { label: "Levantamentos por tratar", value: pendingOrders.length, hint: "Pedidos ainda em fluxo" },
              { label: "Pedidos prontos", value: readyOrders.length, hint: "Ja pode levantar na loja" },
              { label: "Contas de agua", value: waterAccounts.length, hint: "Pedidos e casas associados a conta" },
            ].map((card) => (
              <div
                key={card.label}
                className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900/70"
              >
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">{card.label}</p>
                <div className="mt-3 text-3xl font-black tracking-tight text-slate-900 dark:text-white">
                  {card.value}
                </div>
                <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{card.hint}</p>
              </div>
            ))}
          </section>

          <section className="grid gap-6 xl:grid-cols-[1.3fr_420px]">
            <div className="rounded-[32px] border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900/70">
              <div className="flex flex-col gap-3 border-b border-slate-200 pb-4 sm:flex-row sm:items-center sm:justify-between dark:border-slate-800">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">Compras recentes</p>
                  <h2 className="mt-2 text-2xl font-black text-slate-900 dark:text-white">Historico de pedidos</h2>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Link
                    href="/catalogo"
                    className="inline-flex h-11 items-center justify-center rounded-2xl border border-slate-200 px-4 text-sm font-bold text-slate-700 transition hover:border-orange-200 hover:bg-orange-50 hover:text-orange-600 dark:border-slate-700 dark:text-slate-200"
                  >
                    Comprar mais
                  </Link>
                  <Link
                    href="/cliente/compras"
                    className="inline-flex h-11 items-center justify-center rounded-2xl bg-slate-950 px-4 text-sm font-bold text-white transition hover:bg-orange-600 dark:bg-white dark:text-slate-950"
                  >
                    Ver historico completo
                  </Link>
                </div>
              </div>

              {orders.length === 0 ? (
                <div className="mt-4 rounded-[24px] border border-dashed border-slate-200 bg-slate-50 px-6 py-14 text-center text-slate-500 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-400">
                  Ainda nao existem compras associadas a esta conta.
                </div>
              ) : (
                <div className="mt-4 grid gap-4">
                  {orders.slice(0, 4).map((order) => (
                    <article
                      key={order.id}
                      className="rounded-[28px] border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950"
                    >
                      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="text-lg font-black text-slate-900 dark:text-white">
                              #{order.id} {order.produtoNome}
                            </h3>
                            <StatusPill
                              label={formatPickupStatus(order.estadoLevantamento)}
                              tone={pickupTone(order.estadoLevantamento)}
                            />
                          </div>
                          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                            {formatDateTime(order.criadoEm)} | {order.quantidade} unidade(s) |{" "}
                            {formatPaymentMethod(order.formaPagamento)}
                          </p>
                          {order.levantamentoNotas && (
                            <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">
                              Nota da equipa: {order.levantamentoNotas}
                            </p>
                          )}
                        </div>

                        <div className="flex flex-col items-start gap-3 lg:items-end">
                          <p className="text-2xl font-black text-orange-600">{formatMoney(order.total)}</p>
                          <div className="flex flex-wrap gap-2">
                            <Link
                              href={`/cliente/compras/${order.id}`}
                              className="inline-flex h-10 items-center justify-center rounded-2xl border border-slate-200 px-4 text-sm font-bold text-slate-700 transition hover:border-orange-200 hover:bg-orange-50 hover:text-orange-600 dark:border-slate-700 dark:text-slate-200"
                            >
                              Detalhe
                            </Link>
                            <button
                              type="button"
                              onClick={() => printSaleDocument(order)}
                              className="inline-flex h-10 items-center justify-center rounded-2xl bg-slate-950 px-4 text-sm font-bold text-white transition hover:bg-orange-600 dark:bg-white dark:text-slate-950"
                            >
                              Baixar PDF
                            </button>
                          </div>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </div>

            <div className="grid gap-6">
              <section className="rounded-[32px] border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900/70">
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">Levantamento</p>
                <h2 className="mt-2 text-2xl font-black text-slate-900 dark:text-white">Estado dos pedidos</h2>

                {readyOrders.length === 0 ? (
                  <p className="mt-4 text-sm leading-6 text-slate-500 dark:text-slate-400">
                    Ainda nao existem pedidos prontos para levantamento.
                  </p>
                ) : (
                  <div className="mt-4 grid gap-3">
                    {readyOrders.slice(0, 3).map((order) => (
                      <div
                        key={order.id}
                        className="rounded-[24px] border border-amber-200 bg-amber-50 p-4 dark:border-amber-900/40 dark:bg-amber-950/20"
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div>
                            <p className="font-black text-slate-900 dark:text-white">Pedido #{order.id}</p>
                            <p className="text-sm text-slate-600 dark:text-slate-300">{order.produtoNome}</p>
                          </div>
                          <StatusPill
                            label={formatPickupStatus(order.estadoLevantamento)}
                            tone={pickupTone(order.estadoLevantamento)}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </section>

              <section className="rounded-[32px] border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900/70">
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">Modulo de agua</p>
                <h2 className="mt-2 text-2xl font-black text-slate-900 dark:text-white">Agua e facturacao</h2>

                <div className="mt-4 grid gap-3">
                  <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950">
                    <div className="text-sm text-slate-500 dark:text-slate-400">Contratos</div>
                    <div className="mt-2 text-2xl font-black text-slate-900 dark:text-white">{contracts.length}</div>
                  </div>
                  <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950">
                    <div className="text-sm text-slate-500 dark:text-slate-400">Ultima leitura</div>
                    <div className="mt-2 text-base font-black text-slate-900 dark:text-white">
                      {latestReading
                        ? `${latestReading.consumoM3} m3 | ${formatMoney(latestReading.valorPagar)}`
                        : "Sem leituras"}
                    </div>
                  </div>
                </div>

                {!pendingBill ? (
                  <p className="mt-4 text-sm leading-6 text-slate-500 dark:text-slate-400">
                    Nao ha facturas pendentes neste momento.
                  </p>
                ) : (
                  <div className="mt-5 rounded-[24px] border border-amber-200 bg-amber-50 p-4 dark:border-amber-900/40 dark:bg-amber-950/20">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <p className="text-sm font-black text-slate-900 dark:text-white">
                          Factura #{pendingBill.id}
                        </p>
                        <p className="text-sm text-slate-600 dark:text-slate-300">
                          {formatMoney(pendingBill.valorTotal)} | {formatDateTime(pendingBill.data)}
                        </p>
                      </div>
                      <StatusPill label={pendingBill.estadoPagamento} tone="amber" />
                    </div>

                    <div className="mt-4 grid gap-3">
                      <p className="text-sm leading-6 text-slate-600 dark:text-slate-300">
                        O pagamento desta factura e confirmado pela equipa no sistema. Depois disso, o estado muda para
                        pago e pode imprimir o documento actualizado.
                      </p>

                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => printWaterBillDocument(pendingBill)}
                          className="inline-flex h-9 items-center justify-center rounded-md border border-slate-200 px-4 text-sm font-bold text-slate-700 transition hover:bg-white dark:border-slate-700 dark:text-slate-200"
                        >
                          Baixar PDF
                        </button>
                        <Link
                          href="/cliente/agua"
                          className="inline-flex h-9 items-center justify-center rounded-md border border-slate-200 px-4 text-sm font-bold text-slate-700 transition hover:bg-white dark:border-slate-700 dark:text-slate-200"
                        >
                          Abrir modulo de agua
                        </Link>
                      </div>
                    </div>
                  </div>
                )}
              </section>
            </div>
          </section>
        </>
      )}
    </main>
  );
}
