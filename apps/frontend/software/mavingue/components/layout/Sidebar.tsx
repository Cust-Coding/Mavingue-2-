// ------------------------------------------------------
"use client";

import Link from "next/link";
import { getRole, type Role } from "@/lib/auth/session";

type Item = { label: string; href: string; roles: Role[] };

const items: Item[] = [
  { label: "Admin", href: "/admin", roles: ["ADMIN"] },
  { label: "Produtos", href: "/admin/produtos", roles: ["ADMIN"] },
  { label: "Ferragem", href: "/admin/ferragem", roles: ["ADMIN"] },
  { label: "Clientes", href: "/admin/clientes", roles: ["ADMIN"] },
  { label: "Utilizadores", href: "/admin/utilizadores", roles: ["ADMIN"] },
  { label: "Stock", href: "/admin/stock", roles: ["ADMIN"] },
  { label: "Movimentos", href: "/admin/stock/movimentos", roles: ["ADMIN"] },
  { label: "Compras", href: "/admin/compras", roles: ["ADMIN"] },
  { label: "Vendas", href: "/admin/vendas", roles: ["ADMIN"] },
  { label: "Nova Venda", href: "/admin/vendas/nova", roles: ["ADMIN"] },
  { label: "Água", href: "/admin/agua", roles: ["ADMIN"] },

  // ✅ FUNCIONARIO
  { label: "Funcionário", href: "/staff", roles: ["FUNCIONARIO", "ADMIN"] },
  { label: "Stock", href: "/staff/stock", roles: ["FUNCIONARIO", "ADMIN"] },
  { label: "Movimentos", href: "/staff/stock/movimentos", roles: ["FUNCIONARIO", "ADMIN"] },
  { label: "Compras", href: "/staff/compras", roles: ["FUNCIONARIO", "ADMIN"] },
  { label: "Vendas", href: "/staff/vendas", roles: ["FUNCIONARIO", "ADMIN"] },
  { label: "Nova Venda", href: "/staff/vendas/nova", roles: ["FUNCIONARIO", "ADMIN"] },

  { label: "Cliente", href: "/cliente", roles: ["CLIENTE"] },
  { label: "Compras", href: "/cliente/compras", roles: ["CLIENTE"] },
  { label: "Perfil", href: "/cliente/perfil", roles: ["CLIENTE"] },
];

export default function Sidebar() {
  const role = getRole();
  const list = role ? items.filter((i) => i.roles.includes(role)) : [];

  return (
    <div style={{ width: 240, borderRight: "1px solid #ddd", background: "white", padding: 12 }}>
      <div style={{ fontWeight: 700, marginBottom: 10 }}>Menu</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {list.map((i) => (
          <Link key={i.href} href={i.href}>
            {i.label}
          </Link>
        ))}
      </div>
    </div>
  );
}