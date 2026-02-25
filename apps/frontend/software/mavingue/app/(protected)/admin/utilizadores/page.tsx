"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { listUsers } from "@/features/users/api";
import type { UserResponse } from "@/features/users/types";

export default function AdminUsersPage() {
  const [items, setItems] = useState<UserResponse[]>([]);
  const [err, setErr] = useState("");

  async function load() {
    setErr("");
    try {
      const data = await listUsers();
      setItems(data);
    } catch (e: any) {
      setErr(e?.message ?? "Erro ao carregar utilizadores");
    }
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <div style={{ padding: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center" }}>
        <h2 style={{ margin: 0 }}>Utilizadores</h2>

        <Link href="/admin/utilizadores/novo">
          <Button>Criar utilizador</Button>
        </Link>
      </div>

      {err && (
        <div style={{ marginTop: 12, padding: 10, border: "1px solid #f5b5b5", borderRadius: 10, color: "crimson" }}>
          {err}
        </div>
      )}

      <div style={{ marginTop: 12, border: "1px solid #ddd", borderRadius: 10, overflow: "hidden" }}>
        <div style={{ display: "grid", gridTemplateColumns: "80px 1fr 1fr 160px", padding: 10, background: "#f7f7f7", fontWeight: 600 }}>
          <div>ID</div>
          <div>Nome</div>
          <div>Email</div>
          <div>Role</div>
        </div>

        {items.map((u) => (
          <div key={u.id} style={{ display: "grid", gridTemplateColumns: "80px 1fr 1fr 160px", padding: 10, borderTop: "1px solid #eee" }}>
            <div>{u.id}</div>
            <div>{u.nome}</div>
            <div>{u.email}</div>
            <div>{u.role}</div>
          </div>
        ))}

        {!items.length && !err && <div style={{ padding: 14, color: "#555" }}>Sem utilizadores para mostrar.</div>}
      </div>

      <div style={{ marginTop: 12 }}>
        <Button onClick={load}>Recarregar</Button>
      </div>
    </div>
  );
}