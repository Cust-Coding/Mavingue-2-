"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { StatusPill } from "@/components/ui/StatusPill";
import { salesApi } from "@/features/sales/api";
import type { EstadoLevantamento, Venda } from "@/features/sales/types";
import { printSaleDocument } from "@/lib/documents/print";
import { getErrorMessage } from "@/lib/errors";
import {
  formatDateTime,
  formatMoney,
  formatPaymentMethod,
  formatPickupStatus,
  pickupTone,
} from "@/lib/formatters";

const nextStatus: Partial<Record<EstadoLevantamento, EstadoLevantamento>> = {
  AGUARDANDO_PREPARACAO: "PRONTO_PARA_LEVANTAMENTO",
  PRONTO_PARA_LEVANTAMENTO: "LEVANTADO",
};

export default function AdminVendas() {
  const [rows, setRows] = useState<Venda[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [savingId, setSavingId] = useState<number | null>(null);
  const [notes, setNotes] = useState<Record<number, string>>({});

  async function load() {
    setLoading(true);
    setError("");

    try {
      setRows(await salesApi.list());
    } catch (reason: unknown) {
      setError(getErrorMessage(reason, "Erro ao carregar vendas"));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const sortedRows = useMemo(
    () =>
      [...rows].sort((left, right) => {
        if (left.criadoEm && right.criadoEm) {
          return new Date(right.criadoEm).getTime() - new Date(left.criadoEm).getTime();
        }

        return right.id - left.id;
      }),
    [rows]
  );

  async function updateStatus(row: Venda, status: EstadoLevantamento) {
    setSavingId(row.id);
    setError("");

    try {
      const updated = await salesApi.updatePickupStatus(row.id, {
        estadoLevantamento: status,
        levantamentoNotas: notes[row.id] || undefined,
      });

      setRows((current) => current.map((item) => (item.id === updated.id ? updated : item)));
    } catch (reason: unknown) {
      setError(getErrorMessage(reason, "Nao foi possivel actualizar o levantamento"));
    } finally {
      setSavingId(null);
    }
  }

  return (
    <main className="grid gap-6">
      <section className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/70">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">Vendas</p>
            <h1 className="mt-3 text-3xl font-black tracking-tight text-slate-900 dark:text-white">
              Gestao completa de vendas e levantamento
            </h1>
            <p className="mt-3 max-w-3xl text-base leading-7 text-slate-500 dark:text-slate-400">
              Aqui a equipa consegue ver o historico, emitir PDF e actualizar o estado de levantamento das compras do
              cliente.
            </p>
          </div>

          <Link
            href="/admin/vendas/nova"
            className="inline-flex h-12 items-center justify-center rounded-2xl bg-orange-600 px-6 text-sm font-bold text-white transition hover:bg-orange-700"
          >
            Nova venda
          </Link>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[
          { label: "Total de vendas", value: rows.length },
          {
            label: "A preparar",
            value: rows.filter((row) => row.estadoLevantamento === "AGUARDANDO_PREPARACAO").length,
          },
          {
            label: "Prontas para levantamento",
            value: rows.filter((row) => row.estadoLevantamento === "PRONTO_PARA_LEVANTAMENTO").length,
          },
          {
            label: "Levantadas",
            value: rows.filter((row) => row.estadoLevantamento === "LEVANTADO").length,
          },
        ].map((card) => (
          <div
            key={card.label}
            className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900/70"
          >
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">{card.label}</p>
            <div className="mt-3 text-3xl font-black text-slate-900 dark:text-white">{card.value}</div>
          </div>
        ))}
      </section>

      {loading && (
        <div className="rounded-[28px] border border-slate-200 bg-slate-50 px-6 py-14 text-center text-slate-500 dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-400">
          A carregar vendas...
        </div>
      )}

      {error && (
        <div className="rounded-[28px] border border-rose-200 bg-rose-50 px-6 py-10 text-rose-700 dark:border-rose-900/40 dark:bg-rose-950/20 dark:text-rose-300">
          {error}
        </div>
      )}

      {!loading && !error && sortedRows.length === 0 && (
        <div className="rounded-[28px] border border-slate-200 bg-slate-50 px-6 py-16 text-center text-slate-500 dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-400">
          Sem vendas registadas.
        </div>
      )}

      {!loading && !error && sortedRows.length > 0 && (
        <section className="grid gap-4">
          {sortedRows.map((row) => {
            const suggestedStatus = nextStatus[row.estadoLevantamento];

            return (
              <article
                key={row.id}
                className="rounded-[32px] border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900/70"
              >
                <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-xl font-black text-slate-900 dark:text-white">
                        Venda #{row.id} - {row.produtoNome}
                      </h2>
                      <StatusPill
                        label={formatPickupStatus(row.estadoLevantamento)}
                        tone={pickupTone(row.estadoLevantamento)}
                      />
                    </div>

                    <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-5">
                      <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950">
                        <div className="text-xs uppercase tracking-[0.2em] text-slate-400">Cliente</div>
                        <div className="mt-2 font-bold text-slate-900 dark:text-white">{row.clienteNome}</div>
                      </div>
                      <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950">
                        <div className="text-xs uppercase tracking-[0.2em] text-slate-400">Funcionario</div>
                        <div className="mt-2 font-bold text-slate-900 dark:text-white">{row.funcionarioNome}</div>
                      </div>
                      <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950">
                        <div className="text-xs uppercase tracking-[0.2em] text-slate-400">Pagamento</div>
                        <div className="mt-2 font-bold text-slate-900 dark:text-white">
                          {formatPaymentMethod(row.formaPagamento)}
                        </div>
                      </div>
                      <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950">
                        <div className="text-xs uppercase tracking-[0.2em] text-slate-400">Data</div>
                        <div className="mt-2 font-bold text-slate-900 dark:text-white">{formatDateTime(row.criadoEm)}</div>
                      </div>
                      <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950">
                        <div className="text-xs uppercase tracking-[0.2em] text-slate-400">Total</div>
                        <div className="mt-2 font-black text-orange-600">{formatMoney(row.total)}</div>
                      </div>
                    </div>

                    <div className="mt-4 grid gap-3 xl:grid-cols-[1fr_auto]">
                      <textarea
                        value={notes[row.id] ?? row.levantamentoNotas ?? ""}
                        onChange={(event) =>
                          setNotes((current) => ({
                            ...current,
                            [row.id]: event.target.value,
                          }))
                        }
                        placeholder="Inserir nota de levantamento para este pedido"
                        className="min-h-24 rounded-[24px] border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-orange-300 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200"
                      />

                      <div className="flex flex-wrap gap-2 xl:flex-col xl:items-end">
                        {suggestedStatus && (
                          <button
                            type="button"
                            onClick={() => updateStatus(row, suggestedStatus)}
                            disabled={savingId === row.id}
                            className="inline-flex h-11 items-center justify-center rounded-2xl bg-orange-600 px-4 text-sm font-bold text-white transition hover:bg-orange-700 disabled:cursor-not-allowed disabled:opacity-70"
                          >
                            {savingId === row.id
                              ? "A guardar..."
                              : suggestedStatus === "PRONTO_PARA_LEVANTAMENTO"
                              ? "Marcar pronto"
                              : "Confirmar levantamento"}
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => printSaleDocument(row)}
                          className="inline-flex h-11 items-center justify-center rounded-2xl border border-slate-200 px-4 text-sm font-bold text-slate-700 transition hover:border-orange-200 hover:bg-orange-50 hover:text-orange-600 dark:border-slate-700 dark:text-slate-200"
                        >
                          Baixar PDF
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </section>
      )}
    </main>
  );
}
