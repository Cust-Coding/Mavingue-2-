"use client";

import Link from "next/link";
import { Button } from "@/components/ui/Button";

export default function StaffUsersPage() {
  return (
    <div style={{ padding: 16 }}>
      <h2 style={{ marginTop: 0 }}>Criar contas</h2>
      <p style={{ color: "#555" }}>Aqui o funcionário pode criar contas de FUNCIONARIO e CLIENTE.</p>

      <Link href="/staff/utilizadores/novo">
        <Button>Criar utilizador</Button>
      </Link>
    </div>
  );
}