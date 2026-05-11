"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { StatusPill } from "@/components/ui/StatusPill";
import { salesApi } from "@/features/sales/api";
import type { EstadoLevantamento, Venda } from "@/features/sales/types";
import { printSaleDocument } from "@/lib/documents/print";
import { getErrorMessage } from "@/lib/errors";
import { formatDateTime, formatMoney, formatPaymentMethod, formatPickupStatus, pickupTone } from "@/lib/formatters";

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
    void load();
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

  const metrics = useMemo(
    () => ({
      total: rows.length,
      receita: rows.reduce((sum, row) => sum + Number(row.total || 0), 0),
      pendentes: rows.filter((row) => row.estadoLevantamento === "AGUARDANDO_PREPARACAO").length,
      prontas: rows.filter((row) => row.estadoLevantamento === "PRONTO_PARA_LEVANTAMENTO").length,
      levantadas: rows.filter((row) => row.estadoLevantamento === "LEVANTADO").length,
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
      <section className="rounded-[32px] bg-gradient-to-br from-slate-950 via-slate-900 to-orange-600 p-6 text-white shadow-lg shadow-slate-950/10">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-orange-200">Vendas</p>
            <h1 className="mt-3 text-3xl font-black tracking-tight">Gestao profissional de vendas e levantamento</h1>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-200">
              Veja pedidos com varios produtos, pagamento, troco, estado do levantamento e detalhe de cada item da venda.
            </p>
          </div>

          <Link
            href="/admin/vendas/nova"
            className="inline-flex h-12 items-center justify-center rounded-2xl bg-white px-6 text-sm font-bold text-slate-950 transition hover:bg-orange-50"
          >
            Nova venda
          </Link>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        {[
          { label: "Total de vendas", value: metrics.total },
          { label: "Receita", value: formatMoney(metrics.receita) },
          { label: "A preparar", value: metrics.pendentes },
          { label: "Prontas", value: metrics.prontas },
          { label: "Levantadas", value: metrics.levantadas },
        ].map((card) => (
          <div key={card.label} className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">{card.label}</p>
            <div className="mt-3 text-3xl font-black text-slate-900">{card.value}</div>
          </div>
        ))}
      </section>

      {loading ? (
        <div className="rounded-[28px] border border-slate-200 bg-slate-50 px-6 py-14 text-center text-sm text-slate-500">
          A carregar vendas...
        </div>
      ) : null}

      {error ? (
        <div className="rounded-[28px] border border-rose-200 bg-rose-50 px-6 py-10 text-sm text-rose-700">{error}</div>
      ) : null}

      {!loading && !error && sortedRows.length === 0 ? (
        <div className="rounded-[28px] border border-slate-200 bg-slate-50 px-6 py-16 text-center text-sm text-slate-500">
          Sem vendas registadas.
        </div>
      ) : null}

      {!loading && !error && sortedRows.length > 0 ? (
        <section className="grid gap-4">
          {sortedRows.map((row) => {
            const suggestedStatus = nextStatus[row.estadoLevantamento];

            return (
              <article key={row.id} className="rounded-[32px] border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-xl font-black text-slate-900">Venda #{row.id}</h2>
                      <StatusPill label={formatPickupStatus(row.estadoLevantamento)} tone={pickupTone(row.estadoLevantamento)} />
                      <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">
                        {row.totalItens ?? row.items?.length ?? 1} item(ns)
                      </span>
                    </div>

                    <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-6">
                      <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-4">
                        <div className="text-xs uppercase tracking-[0.2em] text-slate-400">Cliente</div>
                        <div className="mt-2 font-bold text-slate-900">{row.clienteNome}</div>
                      </div>
                      <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-4">
                        <div className="text-xs uppercase tracking-[0.2em] text-slate-400">Funcionario</div>
                        <div className="mt-2 font-bold text-slate-900">{row.funcionarioNome}</div>
                      </div>
                      <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-4">
                        <div className="text-xs uppercase tracking-[0.2em] text-slate-400">Pagamento</div>
                        <div className="mt-2 font-bold text-slate-900">{formatPaymentMethod(row.formaPagamento)}</div>
                      </div>
                      <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-4">
                        <div className="text-xs uppercase tracking-[0.2em] text-slate-400">Valor pago</div>
                        <div className="mt-2 font-bold text-slate-900">{formatMoney(row.valorPago ?? row.total)}</div>
                      </div>
                      <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-4">
                        <div className="text-xs uppercase tracking-[0.2em] text-slate-400">Troco</div>
                        <div className="mt-2 font-bold text-emerald-700">{formatMoney(row.troco ?? 0)}</div>
                      </div>
                      <div className="rounded-[24px] border border-orange-200 bg-orange-50 p-4">
                        <div className="text-xs uppercase tracking-[0.2em] text-orange-700">Total</div>
                        <div className="mt-2 font-black text-orange-700">{formatMoney(row.total)}</div>
                      </div>
                    </div>

                    <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                      {(row.items ?? []).map((item) => (
                        <div key={`${row.id}-${item.produtoId}`} className="rounded-[24px] border border-slate-200 bg-slate-50 p-4">
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <p className="font-bold text-slate-900">{item.produtoNome}</p>
                              <p className="mt-1 text-xs text-slate-500">Qtd. {item.quantidade}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Subtotal</p>
                              <p className="mt-1 font-bold text-slate-900">{formatMoney(item.subtotal)}</p>
                            </div>
                          </div>
                        </div>
                      ))}
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
                        className="min-h-24 rounded-[24px] border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-orange-300"
                      />

                      <div className="flex flex-wrap gap-2 xl:flex-col xl:items-end">
                        {suggestedStatus ? (
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
                        ) : null}

                        <button
                          type="button"
                          onClick={() => printSaleDocument(row)}
                          className="inline-flex h-11 items-center justify-center rounded-2xl border border-slate-200 px-4 text-sm font-bold text-slate-700 transition hover:border-orange-200 hover:bg-orange-50 hover:text-orange-600"
                        >
                          Imprimir recibo
                        </button>
                      </div>
                    </div>

                    <div className="mt-4 text-sm text-slate-500">Registada em {formatDateTime(row.criadoEm)}</div>
                  </div>
                </div>
              </article>
            );
          })}
        </section>
      ) : null}
    </main>
  );
}
