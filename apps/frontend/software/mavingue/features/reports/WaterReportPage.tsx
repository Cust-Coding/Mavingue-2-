"use client";

import { useEffect, useMemo, useState } from "react";
import { listWaterBills, listWaterContracts, listWaterCustomers, listWaterReadings } from "@/features/water/api";
import type { WaterBill, WaterContract, WaterCustomer, WaterReading } from "@/features/water/types";
import { getErrorMessage } from "@/lib/errors";
import { formatDateTime, formatMoney } from "@/lib/formatters";
import { CreditCard, Droplets, FileText, Waves } from "lucide-react";

export function WaterReportPage() {
  const [customers, setCustomers] = useState<WaterCustomer[]>([]);
  const [contracts, setContracts] = useState<WaterContract[]>([]);
  const [readings, setReadings] = useState<WaterReading[]>([]);
  const [bills, setBills] = useState<WaterBill[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([listWaterCustomers(), listWaterContracts(), listWaterReadings(), listWaterBills()])
      .then(([customerRows, contractRows, readingRows, billRows]) => {
        setCustomers(customerRows);
        setContracts(contractRows);
        setReadings(readingRows);
        setBills(billRows);
      })
      .catch((reason: unknown) => setError(getErrorMessage(reason, "Nao foi possivel carregar o relatorio de agua")))
      .finally(() => setLoading(false));
  }, []);

  const analytics = useMemo(() => {
    const pendingBills = bills.filter((bill) => bill.estadoPagamento !== "PAGO");
    const overdueBills = bills.filter((bill) => bill.estadoPagamento === "ATRASADO");
    const activeContracts = contracts.filter((contract) => contract.estado === "ATIVA");

    return {
      customers: customers.length,
      activeContracts: activeContracts.length,
      readings: readings.length,
      bills: bills.length,
      pendingBills: pendingBills.length,
      overdueBills: overdueBills.length,
      pendingAmount: pendingBills.reduce((sum, bill) => sum + Number(bill.valorTotal || 0), 0),
      overdueAmount: overdueBills.reduce((sum, bill) => sum + Number(bill.valorTotal || 0), 0),
      lastReadings: readings.slice(0, 8),
      priorityBills: [...pendingBills]
        .sort((left, right) => Number(right.valorTotal || 0) - Number(left.valorTotal || 0))
        .slice(0, 8),
    };
  }, [bills, contracts, customers.length, readings]);

  const contractMap = useMemo(() => new Map(contracts.map((contract) => [contract.id, contract])), [contracts]);

  return (
    <main className="grid gap-6">
      <section className="rounded-[32px] bg-gradient-to-br from-slate-950 via-cyan-950 to-sky-700 p-6 text-white shadow-lg shadow-slate-950/10">
        <p className="text-xs font-semibold uppercase tracking-[0.35em] text-cyan-200">Relatorio de agua</p>
        <h1 className="mt-3 text-3xl font-black tracking-tight">Clientes, consumo, cobranca e caixa do modulo</h1>
      </section>

      {loading ? <div className="rounded-[28px] border border-slate-200 bg-slate-50 px-6 py-14 text-center text-sm text-slate-500">A carregar relatorio...</div> : null}
      {error ? <div className="rounded-[24px] border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div> : null}

      {!loading && !error ? (
        <>
          <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {[
              { label: "Clientes de agua", value: analytics.customers, icon: Droplets, tone: "bg-cyan-50 text-cyan-700" },
              { label: "Contratos activos", value: analytics.activeContracts, icon: Waves, tone: "bg-emerald-50 text-emerald-700" },
              { label: "Facturas pendentes", value: analytics.pendingBills, icon: FileText, tone: "bg-amber-50 text-amber-700" },
              { label: "Em atraso", value: analytics.overdueBills, icon: CreditCard, tone: "bg-rose-50 text-rose-700" },
            ].map((card) => {
              const Icon = card.icon;
              return (
                <div key={card.label} className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">{card.label}</p>
                      <div className="mt-3 text-3xl font-black text-slate-900">{card.value}</div>
                    </div>
                    <div className={`rounded-2xl p-3 ${card.tone}`}>
                      <Icon className="h-5 w-5" />
                    </div>
                  </div>
                </div>
              );
            })}
          </section>

          <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {[
              { label: "Leituras registadas", value: analytics.readings, helper: "Historico consolidado de consumo" },
              { label: "Facturas emitidas", value: analytics.bills, helper: "Todos os ciclos facturados ate agora" },
              { label: "Valor pendente", value: formatMoney(analytics.pendingAmount), helper: "Tudo o que ainda esta por regularizar" },
              { label: "Valor em atraso", value: formatMoney(analytics.overdueAmount), helper: "Cobranca critica com atraso activo" },
            ].map((card) => (
              <div key={card.label} className="rounded-[28px] border border-slate-200 bg-slate-50 p-5 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">{card.label}</p>
                <div className="mt-3 text-3xl font-black text-slate-900">{card.value}</div>
                <p className="mt-2 text-sm leading-6 text-slate-500">{card.helper}</p>
              </div>
            ))}
          </section>

          <section className="grid gap-6 xl:grid-cols-2">
            <div className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">Maiores valores por cobrar</p>
              <div className="mt-5 grid gap-3">
                {analytics.priorityBills.length === 0 ? (
                  <div className="rounded-[24px] border border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-sm text-slate-500">
                    Nao existe nenhuma factura pendente neste momento.
                  </div>
                ) : (
                  analytics.priorityBills.map((bill) => {
                    const contract = bill.ligacaoId ? contractMap.get(bill.ligacaoId) : null;
                    return (
                      <div key={bill.id} className="rounded-[24px] border border-slate-200 bg-slate-50 p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="font-bold text-slate-900">Factura #{bill.id} - {bill.consumidorNome}</p>
                            <p className="mt-1 text-xs text-slate-500">
                              Contrato #{bill.ligacaoId ?? "--"} | {contract?.referenciaLocal || "Sem referencia"}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-black text-slate-900">{formatMoney(bill.valorTotal)}</p>
                            <p className="mt-1 text-xs text-slate-500">{bill.estadoPagamento}</p>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            <div className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">Ultimas leituras</p>
              <div className="mt-5 grid gap-3">
                {analytics.lastReadings.length === 0 ? (
                  <div className="rounded-[24px] border border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-sm text-slate-500">
                    Ainda nao existem leituras registadas.
                  </div>
                ) : (
                  analytics.lastReadings.map((reading) => {
                    const contract = contractMap.get(reading.ligacaoId);
                    return (
                      <div key={reading.id} className="rounded-[24px] border border-slate-200 bg-slate-50 p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="font-bold text-slate-900">{contract?.consumidorNome || `Contrato #${reading.ligacaoId}`}</p>
                            <p className="mt-1 text-xs text-slate-500">{formatDateTime(reading.data)}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-black text-cyan-700">{reading.consumoM3} m3</p>
                            <p className="mt-1 text-xs text-slate-500">{formatMoney(reading.valorPagar)}</p>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </section>
        </>
      ) : null}
    </main>
  );
}
