"use client";

import { useEffect, useState } from "react";
import UserCreateForm from "@/components/forms/UserCreateForm";
import type { Role } from "@/features/users/types";

export default function StaffUserCreatePage() {
  const [role, setRole] = useState<Role>("FUNCIONARIO");
  const [err, setErr] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/proxy/api/auth/me", { method: "GET", credentials: "include" });
        if (!res.ok) throw new Error("Não autenticado");
        const me = await res.json();
        setRole(me?.role ?? "FUNCIONARIO");
      } catch (e: any) {
        setErr(e?.message ?? "Erro a obter sessão");
      }
    })();
  }, []);

  return (
    <div style={{ padding: 16, maxWidth: 520 }}>
      <h2 style={{ marginTop: 0 }}>Criar utilizador</h2>
      {err && <div style={{ padding: 10, border: "1px solid #f5b5b5", borderRadius: 10, color: "crimson" }}>{err}</div>}
      <UserCreateForm creatorRole={role} />
    </div>
  );
}