"use client";

import PermissionGate from "@/components/layout/PermissionGate";
import UserCreateForm from "@/components/forms/UserCreateForm";
import { getSessionUser } from "@/lib/auth/session";

export default function AdminUserCreatePage() {
  const creatorRole = getSessionUser()?.role ?? "ADMIN";

  return (
    <PermissionGate permissions={["users.manage"]}>
      <main className="space-y-6">
        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-orange-600">Novo utilizador</p>
          <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-900">Criar conta com regras claras</h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500">
            Esta tela cria contas internas ou de cliente. O cadastro de pessoas continua separado na area de cadastros.
          </p>
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <UserCreateForm creatorRole={creatorRole === "STAFF" ? "FUNCIONARIO" : creatorRole} />
        </section>
      </main>
    </PermissionGate>
  );
}
