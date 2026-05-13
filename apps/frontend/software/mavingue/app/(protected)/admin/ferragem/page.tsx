"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Empty, ErrorBox, Loading } from "@/components/ui/State";
import { ferragemApi } from "@/features/ferragem/api";
import type { Ferragem } from "@/features/ferragem/types";
import { getSessionUser } from "@/lib/auth/session";
import { CalendarDays, MapPin, Plus, ShieldCheck, Store, Trash2, Warehouse } from "lucide-react";

function formatDateTime(value?: string) {
  if (!value) return "--";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString("pt-PT");
}

export default function AdminFerragem() {
  const [rows, setRows] = useState<Ferragem[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [mounted, setMounted] = useState(false);
  const [form, setForm] = useState({ name: "", bairro: "" });

  const sessionUser = mounted ? getSessionUser() : null;
  const canManage =
    sessionUser?.role === "ADMIN" || Boolean(sessionUser?.permissions.includes("ferragem.manage"));

  useEffect(() => {
    setMounted(true);
  }, []);

  async function load() {
    setErr("");
    setLoading(true);
    try {
      setRows(await ferragemApi.list());
    } catch (error: any) {
      setErr(error?.message ?? "Erro ao carregar ferragens.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!mounted) return;
    void load();
  }, [mounted]);

  const summary = useMemo(
    () => ({
      total: rows.length,
      bairros: new Set(rows.map((row) => row.bairro?.trim()).filter(Boolean)).size,
      owners: new Set(rows.map((row) => row.owner?.trim()).filter(Boolean)).size,
    }),
    [rows]
  );

  async function create() {
    setErr("");
    if (!form.name.trim() || !form.bairro.trim()) {
      setErr("Preencha o nome da ferragem e o bairro.");
      return;
    }

    try {
      await ferragemApi.create({
        name: form.name.trim(),
        bairro: form.bairro.trim(),
      });
      setForm({ name: "", bairro: "" });
      await load();
    } catch (error: any) {
      setErr(error?.message ?? "Nao foi possivel criar a ferragem.");
    }
  }

  async function remove(id: number) {
    if (!confirm("Remover esta ferragem?")) return;
    setErr("");

    try {
      await ferragemApi.remove(id);
      await load();
    } catch (error: any) {
      setErr(error?.message ?? "Nao foi possivel remover a ferragem.");
    }
  }

  return (
    <main className="space-y-6">
      <section className="rounded-[32px] bg-gradient-to-br from-slate-950 via-slate-900 to-orange-600 p-6 text-white shadow-lg shadow-slate-950/10">
        <p className="text-xs font-semibold uppercase tracking-[0.35em] text-orange-200">Ferragem</p>
        <h1 className="mt-3 text-3xl font-black tracking-tight">Gestao das lojas e pontos operacionais</h1>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-200">
          O cadastro de ferragem foi simplificado para combinar com o resto do sistema. Aqui a equipa regista a loja, o bairro e acompanha rapidamente as unidades activas.
        </p>
      </section>

      {err ? <ErrorBox text={err} /> : null}

      <section className="grid gap-4 md:grid-cols-3">
        {[
          { label: "Ferragens registadas", value: summary.total, icon: Warehouse },
          { label: "Bairros cobertos", value: summary.bairros, icon: MapPin },
          { label: "Proprietarios ligados", value: summary.owners, icon: ShieldCheck },
        ].map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.label} className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">{card.label}</p>
                  <div className="mt-3 text-3xl font-black text-slate-900">{card.value}</div>
                </div>
                <div className="rounded-2xl bg-orange-50 p-3 text-orange-600">
                  <Icon className="h-5 w-5" />
                </div>
              </div>
            </div>
          );
        })}
      </section>

      {canManage ? (
        <section className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-orange-50 p-3 text-orange-600">
              <Plus className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">Novo cadastro</p>
              <h2 className="mt-1 text-2xl font-black text-slate-900">Criar ferragem</h2>
            </div>
          </div>

          <div className="mt-5 grid gap-3 md:grid-cols-[1fr_1fr_auto]">
            <Input
              value={form.name}
              onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
              placeholder="Nome da ferragem"
              className="h-12 rounded-2xl"
            />
            <Input
              value={form.bairro}
              onChange={(event) => setForm((current) => ({ ...current, bairro: event.target.value }))}
              placeholder="Bairro"
              className="h-12 rounded-2xl"
            />
            <Button onClick={create} className="h-12 rounded-2xl bg-orange-600 text-white hover:bg-orange-700">
              Criar ferragem
            </Button>
          </div>

          <p className="mt-3 text-sm text-slate-500">
            O proprietario e associado automaticamente ao contexto operacional do sistema.
          </p>
        </section>
      ) : null}

      {loading ? <Loading /> : null}
      {!loading && !err && rows.length === 0 ? <Empty text="Sem ferragens registadas." /> : null}

      {!loading && !err && rows.length > 0 ? (
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {rows.map((row) => (
            <article key={row.id} className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <span className="inline-flex rounded-full bg-orange-50 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.2em] text-orange-700">
                    Ferragem
                  </span>
                  <h3 className="mt-3 text-xl font-black text-slate-900">{row.name}</h3>
                </div>

                {canManage ? (
                  <button
                    type="button"
                    onClick={() => remove(row.id)}
                    className="rounded-2xl bg-rose-50 p-2 text-rose-600 transition hover:bg-rose-100"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                ) : null}
              </div>

              <div className="mt-5 grid gap-3">
                <div className="rounded-[22px] border border-slate-200 bg-slate-50 p-4">
                  <div className="flex items-center gap-2 text-slate-500">
                    <MapPin className="h-4 w-4" />
                    <span className="text-xs font-semibold uppercase tracking-[0.24em]">Bairro</span>
                  </div>
                  <p className="mt-2 font-bold text-slate-900">{row.bairro}</p>
                </div>

                <div className="rounded-[22px] border border-slate-200 bg-slate-50 p-4">
                  <div className="flex items-center gap-2 text-slate-500">
                    <Store className="h-4 w-4" />
                    <span className="text-xs font-semibold uppercase tracking-[0.24em]">Proprietario</span>
                  </div>
                  <p className="mt-2 font-bold text-slate-900">{row.owner || "Sistema"}</p>
                </div>

                <div className="rounded-[22px] border border-slate-200 bg-slate-50 p-4">
                  <div className="flex items-center gap-2 text-slate-500">
                    <CalendarDays className="h-4 w-4" />
                    <span className="text-xs font-semibold uppercase tracking-[0.24em]">Criada em</span>
                  </div>
                  <p className="mt-2 font-bold text-slate-900">{formatDateTime(row.created)}</p>
                </div>
              </div>

              {!canManage ? (
                <div className="mt-4 rounded-[22px] border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-500">
                  Modo de leitura para esta conta.
                </div>
              ) : null}
            </article>
          ))}
        </section>
      ) : null}
    </main>
  );
}
