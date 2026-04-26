"use client";

import PermissionGate from "@/components/layout/PermissionGate";
import UserCreateForm from "@/components/forms/UserCreateForm";
import { getSessionUser } from "@/lib/auth/session";

export default function StaffUserCreatePage() {
  const creatorRole = getSessionUser()?.role ?? "FUNCIONARIO";

  return (
    <PermissionGate permissions={["users.manage"]}>
      <main className="space-y-6">
        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-orange-600">Nova conta</p>
          <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-900">Criar conta operacional ou de cliente</h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500">
            Usa esta tela para registar clientes com senha padrao 1234, ou para criar contas de equipa quando tiveres permissao.
          </p>
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <UserCreateForm creatorRole={creatorRole === "ADMIN" ? "ADMIN" : "FUNCIONARIO"} />
        </section>
      </main>
    </PermissionGate>
  );
}
