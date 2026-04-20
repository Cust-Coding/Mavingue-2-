import type { Role } from "@/lib/auth/session";

export type NavLink = {
  label: string;
  href: string;
};

export type NavGroup = {
  id: string;
  label: string;
  items: NavLink[];
};

type NormalizedRole = "ADMIN" | "FUNCIONARIO" | "CLIENTE";

const navigation: Record<NormalizedRole, NavGroup[]> = {
  ADMIN: [
    {
      id: "painel",
      label: "Painel",
      items: [
        { label: "Dashboard", href: "/admin" },
        { label: "Relatorios", href: "/admin/relatorios" },
        { label: "Relatorio de vendas", href: "/admin/relatorios/vendas" },
        { label: "Relatorio de stock", href: "/admin/relatorios/stock" },
        { label: "Relatorio de agua", href: "/admin/relatorios/agua" },
      ],
    },
    {
      id: "operacoes",
      label: "Operacoes",
      items: [
        { label: "Produtos", href: "/admin/produtos" },
        { label: "Novo produto", href: "/admin/produtos/novo" },
        { label: "Clientes", href: "/admin/clientes" },
        { label: "Ferragem", href: "/admin/ferragem" },
        { label: "Utilizadores", href: "/admin/utilizadores" },
        { label: "Novo utilizador", href: "/admin/utilizadores/novo" },
      ],
    },
    {
      id: "comercial",
      label: "Comercial",
      items: [
        { label: "Vendas", href: "/admin/vendas" },
        { label: "Nova venda", href: "/admin/vendas/nova" },
        { label: "Compras", href: "/admin/compras" },
        { label: "Stock", href: "/admin/stock" },
        { label: "Movimentos", href: "/admin/stock/movimentos" },
      ],
    },
    {
      id: "agua",
      label: "Agua",
      items: [
        { label: "Modulo de agua", href: "/admin/agua" },
        { label: "Clientes de agua", href: "/admin/agua/clientes" },
        { label: "Contratos", href: "/admin/agua/contratos" },
        { label: "Leituras", href: "/admin/agua/leituras" },
        { label: "Facturas", href: "/admin/agua/faturas" },
        { label: "Relatorios de agua", href: "/admin/agua/relatorios" },
      ],
    },
  ],
  FUNCIONARIO: [
    {
      id: "painel",
      label: "Painel",
      items: [
        { label: "Dashboard", href: "/staff" },
        { label: "Utilizadores", href: "/staff/utilizadores" },
        { label: "Novo utilizador", href: "/staff/utilizadores/novo" },
      ],
    },
    {
      id: "comercial",
      label: "Comercial",
      items: [
        { label: "Produtos", href: "/staff/produtos" },
        { label: "Novo produto", href: "/staff/produtos/novo" },
        { label: "Vendas", href: "/staff/vendas" },
        { label: "Nova venda", href: "/staff/vendas/nova" },
        { label: "Compras", href: "/staff/compras" },
        { label: "Stock", href: "/staff/stock" },
        { label: "Movimentos", href: "/staff/stock/movimentos" },
      ],
    },
    {
      id: "agua",
      label: "Agua",
      items: [
        { label: "Modulo de agua", href: "/staff/agua" },
        { label: "Clientes de agua", href: "/staff/agua/clientes" },
        { label: "Leituras", href: "/staff/agua/leituras" },
        { label: "Facturas", href: "/staff/agua/faturas" },
      ],
    },
  ],
  CLIENTE: [
    {
      id: "area",
      label: "Minha area",
      items: [
        { label: "Dashboard", href: "/cliente" },
        { label: "Perfil", href: "/cliente/perfil" },
        { label: "Carrinho", href: "/carrinho" },
        { label: "Checkout", href: "/checkout" },
      ],
    },
    {
      id: "compras",
      label: "Compras",
      items: [
        { label: "Historico de compras", href: "/cliente/compras" },
        { label: "Catalogo publico", href: "/catalogo" },
      ],
    },
    {
      id: "agua",
      label: "Agua",
      items: [
        { label: "Modulo de agua", href: "/cliente/agua" },
        { label: "Facturas de agua", href: "/cliente/agua/faturas" },
        { label: "Pagamentos de agua", href: "/cliente/agua/pagamentos" },
      ],
    },
  ],
};

export function normalizeRole(role: Role | null): NormalizedRole | null {
  if (role === "ADMIN") return "ADMIN";
  if (role === "FUNCIONARIO" || role === "STAFF") return "FUNCIONARIO";
  if (role === "CLIENTE") return "CLIENTE";
  return null;
}

export function getNavigation(role: Role | null) {
  const normalized = normalizeRole(role);
  return normalized ? navigation[normalized] : [];
}

export function getQuickLinks(role: Role | null, limit = 4) {
  return getNavigation(role)
    .flatMap((group) => group.items)
    .slice(0, limit);
}
