"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
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

type Filter = "todos" | "pendentes" | "prontos" | "levantados";

const filters: { value: Filter; label: string }[] = [
  { value: "todos", label: "Todos" },
  { value: "pendentes", label: "Pendentes" },
  { value: "prontos", label: "Prontos" },
  { value: "levantados", label: "Levantados" },
];

export default function ClienteCompras() {
  const [orders, setOrders] = useState<ClientOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState<Filter>("todos");

  useEffect(() => {
    (async () => {
      setLoading(true);
      setError("");

      try {
        setOrders(await clientApi.listOrders());
      } catch (reason: unknown) {
        setError(getErrorMessage(reason, "Erro ao carregar compras"));
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const filtered = useMemo(() => {
    switch (filter) {
      case "pendentes":
        return orders.filter((order) => order.estadoLevantamento === "AGUARDANDO_PREPARACAO");
      case "prontos":
        return orders.filter((order) => order.estadoLevantamento === "PRONTO_PARA_LEVANTAMENTO");
      case "levantados":
        return orders.filter((order) => order.estadoLevantamento === "LEVANTADO");
      default:
        return orders;
    }
  }, [orders, filter]);

  return (
    <main className="grid gap-6">
      <section className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/70">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">Historico</p>
        <h1 className="mt-3 text-3xl font-black tracking-tight text-slate-900 dark:text-white">
          Todas as compras do cliente
        </h1>
        <p className="mt-3 max-w-3xl text-base leading-7 text-slate-500 dark:text-slate-400">
          Esta tabela mostra todas as compras, o estado de levantamento e o acesso ao PDF de cada documento.
        </p>

        <div className="mt-5 flex flex-wrap gap-2">
          {filters.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => setFilter(option.value)}
              className={`rounded-full px-4 py-2 text-sm font-bold transition ${
                filter === option.value
                  ? "bg-orange-600 text-white"
                  : "border border-slate-200 bg-white text-slate-600 hover:border-orange-200 hover:text-orange-600 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </section>

      {loading && (
        <div className="rounded-[28px] border border-slate-200 bg-slate-50 px-6 py-14 text-center text-slate-500 dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-400">
          A carregar compras...
        </div>
      )}

      {error && (
        <div className="rounded-[28px] border border-rose-200 bg-rose-50 px-6 py-10 text-rose-700 dark:border-rose-900/40 dark:bg-rose-950/20 dark:text-rose-300">
          {error}
        </div>
      )}

      {!loading && !error && filtered.length === 0 && (
        <div className="rounded-[28px] border border-slate-200 bg-slate-50 px-6 py-16 text-center text-slate-500 dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-400">
          Ainda nao existem compras para este filtro.
        </div>
      )}

      {!loading && !error && filtered.length > 0 && (
        <section className="grid gap-4">
          {filtered.map((order) => (
            <article
              key={order.id}
              className="rounded-[32px] border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900/70"
            >
              <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-xl font-black text-slate-900 dark:text-white">
                      Pedido #{order.id} - {order.produtoNome}
                    </h2>
                    <StatusPill
                      label={formatPickupStatus(order.estadoLevantamento)}
                      tone={pickupTone(order.estadoLevantamento)}
                    />
                  </div>

                  <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                    <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950">
                      <div className="text-xs uppercase tracking-[0.2em] text-slate-400">Data</div>
                      <div className="mt-2 font-bold text-slate-900 dark:text-white">{formatDateTime(order.criadoEm)}</div>
                    </div>
                    <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950">
                      <div className="text-xs uppercase tracking-[0.2em] text-slate-400">Pagamento</div>
                      <div className="mt-2 font-bold text-slate-900 dark:text-white">
                        {formatPaymentMethod(order.formaPagamento)}
                      </div>
                    </div>
                    <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950">
                      <div className="text-xs uppercase tracking-[0.2em] text-slate-400">Quantidade</div>
                      <div className="mt-2 font-bold text-slate-900 dark:text-white">{order.quantidade}</div>
                    </div>
                    <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950">
                      <div className="text-xs uppercase tracking-[0.2em] text-slate-400">Total</div>
                      <div className="mt-2 font-black text-orange-600">{formatMoney(order.total)}</div>
                    </div>
                  </div>

                  {order.levantamentoNotas && (
                    <p className="mt-4 text-sm leading-6 text-slate-600 dark:text-slate-300">
                      Nota da equipa: {order.levantamentoNotas}
                    </p>
                  )}
                </div>

                <div className="flex flex-wrap gap-2 xl:flex-col xl:items-end">
                  <Link
                    href={`/cliente/compras/${order.id}`}
                    className="inline-flex h-11 items-center justify-center rounded-2xl border border-slate-200 px-4 text-sm font-bold text-slate-700 transition hover:border-orange-200 hover:bg-orange-50 hover:text-orange-600 dark:border-slate-700 dark:text-slate-200"
                  >
                    Ver detalhe
                  </Link>
                  <button
                    type="button"
                    onClick={() => printSaleDocument(order)}
                    className="inline-flex h-11 items-center justify-center rounded-2xl bg-slate-950 px-4 text-sm font-bold text-white transition hover:bg-orange-600 dark:bg-white dark:text-slate-950"
                  >
                    Baixar PDF
                  </button>
                </div>
              </div>
            </article>
          ))}
        </section>
      )}
    </main>
  );
}
