"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { StatusPill } from "@/components/ui/StatusPill";
import { clientApi } from "@/features/client/api";
import type { ClientOrder } from "@/features/client/types";
import { printSaleDocument } from "@/lib/documents/print";
import { getErrorMessage } from "@/lib/errors";
import {
  formatDateTime,
  formatMoney,
  formatPaymentMethod,
  formatPickupStatus,
  pickupTone,
} from "@/lib/formatters";

export default function ClienteCompraDetalhe() {
  const params = useParams();
  const id = Number(params.id);

  const [order, setOrder] = useState<ClientOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!Number.isFinite(id)) return;

    (async () => {
      setLoading(true);
      setError("");

      try {
        setOrder(await clientApi.getOrder(id));
      } catch (reason: unknown) {
        setError(getErrorMessage(reason, "Erro ao carregar o detalhe da compra"));
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  return (
    <main className="grid gap-6">
      <section className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/70">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">Detalhe da compra</p>
            <h1 className="mt-3 text-3xl font-black tracking-tight text-slate-900 dark:text-white">Pedido #{id}</h1>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link
              href="/cliente/compras"
              className="inline-flex h-11 items-center justify-center rounded-2xl border border-slate-200 px-4 text-sm font-bold text-slate-700 transition hover:border-orange-200 hover:bg-orange-50 hover:text-orange-600 dark:border-slate-700 dark:text-slate-200"
            >
              Voltar ao historico
            </Link>
            {order && (
              <button
                type="button"
                onClick={() => printSaleDocument(order)}
                className="inline-flex h-11 items-center justify-center rounded-2xl bg-slate-950 px-4 text-sm font-bold text-white transition hover:bg-orange-600 dark:bg-white dark:text-slate-950"
              >
                Baixar PDF
              </button>
            )}
          </div>
        </div>
      </section>

      {loading && (
        <div className="rounded-[28px] border border-slate-200 bg-slate-50 px-6 py-14 text-center text-slate-500 dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-400">
          A carregar detalhe da compra...
        </div>
      )}

      {error && (
        <div className="rounded-[28px] border border-rose-200 bg-rose-50 px-6 py-10 text-rose-700 dark:border-rose-900/40 dark:bg-rose-950/20 dark:text-rose-300">
          {error}
        </div>
      )}

      {!loading && !error && order && (
        <>
          <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900/70">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">Produto</p>
              <div className="mt-3 text-xl font-black text-slate-900 dark:text-white">{order.produtoNome}</div>
            </div>
            <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900/70">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">Quantidade</p>
              <div className="mt-3 text-xl font-black text-slate-900 dark:text-white">{order.quantidade}</div>
            </div>
            <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900/70">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">Pagamento</p>
              <div className="mt-3 text-xl font-black text-slate-900 dark:text-white">
                {formatPaymentMethod(order.formaPagamento)}
              </div>
            </div>
            <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900/70">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">Total</p>
              <div className="mt-3 text-xl font-black text-orange-600">{formatMoney(order.total)}</div>
            </div>
          </section>

          <section className="grid gap-6 xl:grid-cols-[1.25fr_420px]">
            <div className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/70">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">Linha temporal</p>
              <h2 className="mt-3 text-2xl font-black text-slate-900 dark:text-white">
                Estado do levantamento
              </h2>

              <div className="mt-6 grid gap-4">
                <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="font-black text-slate-900 dark:text-white">Pedido registado</p>
                      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{formatDateTime(order.criadoEm)}</p>
                    </div>
                    <StatusPill label="Registado" tone="blue" />
                  </div>
                </div>

                <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="font-black text-slate-900 dark:text-white">Estado actual</p>
                      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                        Actualizado em {formatDateTime(order.atualizadoEm || order.criadoEm)}
                      </p>
                    </div>
                    <StatusPill
                      label={formatPickupStatus(order.estadoLevantamento)}
                      tone={pickupTone(order.estadoLevantamento)}
                    />
                  </div>
                </div>

                <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="font-black text-slate-900 dark:text-white">Levantamento</p>
                      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                        {order.levantadoEm ? formatDateTime(order.levantadoEm) : "Ainda nao levantado"}
                      </p>
                    </div>
                    <StatusPill
                      label={order.levantadoEm ? "Concluido" : "Em curso"}
                      tone={order.levantadoEm ? "emerald" : "amber"}
                    />
                  </div>
                </div>
              </div>

              {order.levantamentoNotas && (
                <div className="mt-6 rounded-[24px] border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-800 dark:border-amber-900/40 dark:bg-amber-950/20 dark:text-amber-200">
                  Nota da equipa: {order.levantamentoNotas}
                </div>
              )}
            </div>

            <aside className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/70">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">Factura</p>
              <h2 className="mt-3 text-2xl font-black text-slate-900 dark:text-white">Dados do documento</h2>

              <div className="mt-6 grid gap-4">
                {[
                  { label: "Referencia", value: `VEN-${order.id}` },
                  { label: "Produto ID", value: String(order.produtoId) },
                  { label: "Cliente ID", value: String(order.clienteId) },
                  { label: "Funcionario", value: order.funcionarioNome || `#${order.funcionarioId}` },
                  { label: "Preco unitario", value: formatMoney(order.precoUnitario) },
                  { label: "Total", value: formatMoney(order.total) },
                ].map((field) => (
                  <div
                    key={field.label}
                    className="rounded-[24px] border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950"
                  >
                    <div className="text-xs uppercase tracking-[0.2em] text-slate-400">{field.label}</div>
                    <div className="mt-2 font-bold text-slate-900 dark:text-white">{field.value}</div>
                  </div>
                ))}
              </div>
            </aside>
          </section>
        </>
      )}
    </main>
  );
}
