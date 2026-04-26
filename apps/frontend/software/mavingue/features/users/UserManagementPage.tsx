"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { CheckCircle2, KeyRound, RefreshCw, ShieldCheck, UserCheck, Users } from "lucide-react";
import { Button } from "@/components/ui/Button";
import {
  listPendingUsers,
  listUsers,
  resetUserPassword,
  updateUserStatus,
} from "@/features/users/api";
import type { Role, UserResponse, UserStatus } from "@/features/users/types";
import { getErrorMessage } from "@/lib/errors";
import { getSessionUser } from "@/lib/auth/session";

type Scope = "admin" | "staff";

const roleLabels: Record<Role, string> = {
  ADMIN: "Administrador",
  FUNCIONARIO: "Funcionario",
  CLIENTE: "Cliente",
};

const statusStyles: Record<UserStatus, string> = {
  ATIVO: "bg-emerald-100 text-emerald-700",
  INATIVO: "bg-slate-200 text-slate-700",
  PENDENTE_REVISAO: "bg-amber-100 text-amber-700",
  PENDENTE_VERIFICACAO: "bg-blue-100 text-blue-700",
};

function statusLabel(status: UserStatus) {
  switch (status) {
    case "ATIVO":
      return "Activo";
    case "INATIVO":
      return "Inactivo";
    case "PENDENTE_REVISAO":
      return "Pendente da equipa";
    case "PENDENTE_VERIFICACAO":
      return "Pendente por email";
    default:
      return status;
  }
}

export function UserManagementPage({ scope }: { scope: Scope }) {
  const [users, setUsers] = useState<UserResponse[]>([]);
  const [pendingUsers, setPendingUsers] = useState<UserResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [workingId, setWorkingId] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const sessionUser = useMemo(() => getSessionUser(), []);
  const canVerify = sessionUser?.role === "ADMIN" || sessionUser?.permissions.includes("users.verify");
  const canReset = sessionUser?.role === "ADMIN" || sessionUser?.permissions.includes("users.reset-password");
  const canManagePermissions =
    sessionUser?.role === "ADMIN" || sessionUser?.permissions.includes("users.permissions.manage");

  const basePath = scope === "admin" ? "/admin/utilizadores" : "/staff/utilizadores";

  const summary = useMemo(
    () => ({
      total: users.length,
      pending: users.filter((user) => user.status !== "ATIVO").length,
      staff: users.filter((user) => user.role === "FUNCIONARIO").length,
      clients: users.filter((user) => user.role === "CLIENTE").length,
    }),
    [users]
  );

  async function load() {
    setError("");
    setLoading(true);
    try {
      const [userRows, pendingRows] = await Promise.all([
        listUsers(),
        canVerify ? listPendingUsers() : Promise.resolve([]),
      ]);
      setUsers(userRows);
      setPendingUsers(pendingRows);
    } catch (reason) {
      setError(getErrorMessage(reason, "Nao foi possivel carregar os utilizadores."));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function refresh() {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }

  async function handleStatus(userId: number, status: UserStatus) {
    setWorkingId(userId);
    setError("");
    setSuccess("");
    try {
      await updateUserStatus(userId, status);
      setSuccess(
        status === "ATIVO"
          ? "Conta activada com sucesso."
          : status === "INATIVO"
          ? "Conta marcada como inactiva."
          : "Estado actualizado com sucesso."
      );
      await load();
    } catch (reason) {
      setError(getErrorMessage(reason, "Nao foi possivel actualizar o estado."));
    } finally {
      setWorkingId(null);
    }
  }

  async function handleResetPassword(userId: number) {
    setWorkingId(userId);
    setError("");
    setSuccess("");
    try {
      await resetUserPassword(userId);
      setSuccess("Senha redefinida com sucesso. A nova senha e 1234.");
    } catch (reason) {
      setError(getErrorMessage(reason, "Nao foi possivel redefinir a senha."));
    } finally {
      setWorkingId(null);
    }
  }

  return (
    <main className="space-y-6">
      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-orange-600">Utilizadores</p>
            <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-900">Contas, verificacao e acesso</h1>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500">
              Aqui acompanhas contas pendentes, activacao, redefinicao de senha e o acesso de cada pessoa no sistema.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              href={`${basePath}/novo`}
              className="inline-flex items-center gap-2 rounded-2xl bg-orange-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-orange-700"
            >
              <Users className="h-4 w-4" />
              Novo utilizador
            </Link>
            <Button type="button" variant="outline" onClick={refresh} disabled={refreshing}>
              <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
              Recarregar
            </Button>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-4">
        {[
          { label: "Total", value: summary.total },
          { label: "Pendentes", value: summary.pending },
          { label: "Funcionarios", value: summary.staff },
          { label: "Clientes", value: summary.clients },
        ].map((card) => (
          <div key={card.label} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-slate-400">{card.label}</p>
            <p className="mt-3 text-3xl font-bold text-slate-900">{card.value}</p>
          </div>
        ))}
      </section>

      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {success && (
        <div className="flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{success}</span>
        </div>
      )}

      {canVerify && pendingUsers.length > 0 && (
        <section className="rounded-3xl border border-amber-200 bg-amber-50 p-6 shadow-sm">
          <div className="mb-4 flex items-center gap-2">
            <UserCheck className="h-5 w-5 text-amber-700" />
            <h2 className="text-lg font-semibold text-slate-900">Contas pendentes</h2>
          </div>
          <div className="space-y-3">
            {pendingUsers.map((user) => (
              <div key={user.id} className="rounded-2xl border border-amber-200 bg-white px-4 py-4">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <p className="font-semibold text-slate-900">{user.nome}</p>
                    <p className="mt-1 text-sm text-slate-500">
                      {user.email || "Sem email"} | {user.phone}
                    </p>
                    <p className="mt-2 text-xs text-slate-500">{statusLabel(user.status)}</p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <Button
                      type="button"
                      disabled={workingId === user.id}
                      onClick={() => handleStatus(user.id, "ATIVO")}
                      className="bg-emerald-600 text-white hover:bg-emerald-700"
                    >
                      Activar
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      disabled={workingId === user.id}
                      onClick={() => handleStatus(user.id, "INATIVO")}
                    >
                      Inactivar
                    </Button>
                    <Link
                      href={`${basePath}/${user.id}/editar`}
                      className="inline-flex items-center gap-2 rounded-md border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                    >
                      Rever detalhes
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Utilizadores registados</h2>
            <p className="text-sm text-slate-500">
              {canManagePermissions
                ? "Abre um utilizador para gerir perfil, estado, senha e permissoes."
                : "Abre um utilizador para rever os dados e acompanhar o estado da conta."}
            </p>
          </div>
          {canManagePermissions && (
            <div className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
              <ShieldCheck className="h-3.5 w-3.5" />
              Permissoes activas por colaborador
            </div>
          )}
        </div>

        {loading ? (
          <div className="px-6 py-10 text-sm text-slate-500">A carregar utilizadores...</div>
        ) : users.length === 0 ? (
          <div className="px-6 py-10 text-sm text-slate-500">Ainda nao existem utilizadores registados.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-slate-50 text-left text-slate-500">
                <tr>
                  <th className="px-6 py-3 font-medium">Utilizador</th>
                  <th className="px-6 py-3 font-medium">Telefone</th>
                  <th className="px-6 py-3 font-medium">Tipo</th>
                  <th className="px-6 py-3 font-medium">Estado</th>
                  <th className="px-6 py-3 font-medium">Permissoes</th>
                  <th className="px-6 py-3 font-medium">Accoes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.map((user) => (
                  <tr key={user.id}>
                    <td className="px-6 py-4">
                      <div className="font-semibold text-slate-900">{user.nome}</div>
                      <div className="mt-1 text-xs text-slate-500">{user.email || "Sem email"}</div>
                    </td>
                    <td className="px-6 py-4 text-slate-600">{user.phone}</td>
                    <td className="px-6 py-4 text-slate-600">{roleLabels[user.role]}</td>
                    <td className="px-6 py-4">
                      <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${statusStyles[user.status]}`}>
                        {statusLabel(user.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-600">
                      {user.role === "ADMIN" ? "Total" : user.permissions.length}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-2">
                        <Link
                          href={`${basePath}/${user.id}/editar`}
                          className="inline-flex items-center gap-2 rounded-md border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                        >
                          Gerir
                        </Link>

                        {canVerify && user.status !== "ATIVO" && (
                          <Button
                            type="button"
                            size="sm"
                            disabled={workingId === user.id}
                            onClick={() => handleStatus(user.id, "ATIVO")}
                            className="bg-emerald-600 text-white hover:bg-emerald-700"
                          >
                            Activar
                          </Button>
                        )}

                        {canReset && (
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            disabled={workingId === user.id}
                            onClick={() => handleResetPassword(user.id)}
                          >
                            <KeyRound className="h-4 w-4" />
                            Reset 1234
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
}
