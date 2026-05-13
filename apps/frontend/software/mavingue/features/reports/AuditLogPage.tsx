"use client";

import { useEffect, useState } from "react";
import { auditApi } from "@/features/audit/api";
import type { AuditLog } from "@/features/audit/types";
import { Input } from "@/components/ui/Input";
import { getErrorMessage } from "@/lib/errors";
import { formatDateTime } from "@/lib/formatters";
import { Search, Shield } from "lucide-react";

const actionOptions = [
  { value: "", label: "Todas as accoes" },
  { value: "LOGIN", label: "Login" },
  { value: "PRODUCT_CREATE", label: "Criar produto" },
  { value: "PRODUCT_UPDATE", label: "Editar produto" },
  { value: "PRODUCT_DELETE", label: "Desativar produto" },
  { value: "PURCHASE_CREATE", label: "Registar compra" },
  { value: "SALE_CREATE", label: "Registar venda" },
  { value: "SALE_PICKUP_UPDATE", label: "Actualizar levantamento" },
  { value: "STOCK_ADJUST", label: "Ajuste de stock" },
];

const scopeOptions = [
  { value: "", label: "Todos os actores" },
  { value: "EQUIPA", label: "Funcionarios e admins" },
  { value: "CLIENTE", label: "Clientes" },
];

const roleOptions = [
  { value: "", label: "Todos os perfis" },
  { value: "ADMIN", label: "Admin" },
  { value: "FUNCIONARIO", label: "Funcionario" },
  { value: "CLIENTE", label: "Cliente" },
];

export function AuditLogPage() {
  const [rows, setRows] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [action, setAction] = useState("");
  const [actorScope, setActorScope] = useState("");
  const [actorRole, setActorRole] = useState("");

  useEffect(() => {
    setLoading(true);
    auditApi
      .list({ action, actorScope, actorRole, query })
      .then(setRows)
      .catch((reason: unknown) => setError(getErrorMessage(reason, "Nao foi possivel carregar os logs de auditoria")))
      .finally(() => setLoading(false));
  }, [action, actorRole, actorScope, query]);

  return (
    <main className="grid gap-6">
      <section className="rounded-[32px] bg-gradient-to-br from-slate-950 via-slate-900 to-slate-700 p-6 text-white shadow-lg shadow-slate-950/10">
        <p className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-300">Auditoria</p>
        <h1 className="mt-3 text-3xl font-black tracking-tight">Logs operacionais e de login</h1>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-200">
          Filtre eventos de login, equipa interna ou clientes, e acompanhe as accoes mais sensiveis do sistema.
        </p>
      </section>

      <section className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm">
        <div className="grid gap-4 xl:grid-cols-[1.3fr_repeat(3,1fr)]">
          <label className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Pesquisar por nome, descricao ou entidade..."
              className="h-12 rounded-2xl pl-9"
            />
          </label>

          <select
            value={action}
            onChange={(event) => setAction(event.target.value)}
            className="h-12 rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition focus:border-slate-400 focus:ring-4 focus:ring-slate-100"
          >
            {actionOptions.map((option) => (
              <option key={option.value || "all"} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          <select
            value={actorScope}
            onChange={(event) => setActorScope(event.target.value)}
            className="h-12 rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition focus:border-slate-400 focus:ring-4 focus:ring-slate-100"
          >
            {scopeOptions.map((option) => (
              <option key={option.value || "all"} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          <select
            value={actorRole}
            onChange={(event) => setActorRole(event.target.value)}
            className="h-12 rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition focus:border-slate-400 focus:ring-4 focus:ring-slate-100"
          >
            {roleOptions.map((option) => (
              <option key={option.value || "all"} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </section>

      {loading ? <div className="rounded-[28px] border border-slate-200 bg-slate-50 px-6 py-14 text-center text-sm text-slate-500">A carregar auditoria...</div> : null}
      {error ? <div className="rounded-[24px] border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div> : null}

      {!loading && !error && rows.length === 0 ? (
        <div className="rounded-[28px] border border-slate-200 bg-slate-50 px-6 py-16 text-center text-sm text-slate-500">
          Nenhum log encontrado para os filtros actuais.
        </div>
      ) : null}

      {!loading && !error && rows.length > 0 ? (
        <section className="grid gap-4">
          {rows.map((row) => (
            <article key={row.id} className="rounded-[32px] border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                <div className="flex items-start gap-3">
                  <div className="rounded-2xl bg-slate-100 p-3 text-slate-700">
                    <Shield className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-lg font-black text-slate-900">{row.actorNome || "Sistema"}</h2>
                      <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold uppercase text-slate-600">
                        {row.action}
                      </span>
                      <span className="rounded-full bg-white px-3 py-1 text-xs font-bold uppercase text-slate-600 ring-1 ring-slate-200">
                        {row.actorRole || row.actorScope || "SISTEMA"}
                      </span>
                    </div>
                    <p className="mt-2 text-sm text-slate-600">{row.description}</p>
                    <p className="mt-2 text-xs text-slate-500">
                      {row.entityType ? `${row.entityType}${row.entityId ? ` #${row.entityId}` : ""}` : "Sem entidade"} • {formatDateTime(row.createdAt)}
                    </p>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </section>
      ) : null}
    </main>
  );
}
