import type { SessionUser } from "@/lib/auth/session";

export type NavLink = {
  label: string;
  href: string;
  permissions?: string[];
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
      items: [{ label: "Dashboard", href: "/admin" }],
    },
    {
      id: "operacoes",
      label: "Utilizadores",
      items: [
        { label: "Utilizadores", href: "/admin/utilizadores", permissions: ["users.view"] },
        { label: "Novo utilizador", href: "/admin/utilizadores/novo", permissions: ["users.manage"] },
      ],
    },
    {
      id: "cadastros",
      label: "Cadastros",
      items: [{ label: "Pessoas e clientes", href: "/admin/clientes", permissions: ["customers.view"] }],
    },
    {
      id: "agua",
      label: "Agua",
      items: [
        { label: "Visao geral", href: "/admin/agua", permissions: ["water.overview"] },
        { label: "Solicitacoes", href: "/admin/agua/solicitacoes", permissions: ["water.requests.review"] },
        { label: "Clientes", href: "/admin/agua/clientes", permissions: ["water.customers.view"] },
        { label: "Contratos", href: "/admin/agua/contratos", permissions: ["water.contracts.manage"] },
        { label: "Leituras", href: "/admin/agua/leituras", permissions: ["water.readings.manage"] },
        { label: "Faturas", href: "/admin/agua/faturas", permissions: ["water.bills.manage"] },
      ],
    },
  ],
  FUNCIONARIO: [
    {
      id: "painel",
      label: "Painel",
      items: [{ label: "Dashboard", href: "/staff" }],
    },
    {
      id: "operacoes",
      label: "Contas",
      items: [
        { label: "Utilizadores", href: "/staff/utilizadores", permissions: ["users.view"] },
        { label: "Novo utilizador", href: "/staff/utilizadores/novo", permissions: ["users.manage"] },
        { label: "Pessoas e clientes", href: "/staff/clientes", permissions: ["customers.view"] },
      ],
    },
    {
      id: "comercial",
      label: "Comercial",
      items: [
        { label: "Produtos", href: "/staff/produtos" },
        { label: "Vendas", href: "/staff/vendas" },
        { label: "Compras", href: "/staff/compras" },
        { label: "Stock", href: "/staff/stock" },
      ],
    },
    {
      id: "agua",
      label: "Agua",
      items: [
        { label: "Visao geral", href: "/staff/agua", permissions: ["water.overview"] },
        { label: "Solicitacoes", href: "/staff/agua/solicitacoes", permissions: ["water.requests.review"] },
        { label: "Clientes", href: "/staff/agua/clientes", permissions: ["water.customers.view"] },
        { label: "Contratos", href: "/staff/agua/contratos", permissions: ["water.contracts.manage"] },
        { label: "Leituras", href: "/staff/agua/leituras", permissions: ["water.readings.manage"] },
        { label: "Faturas", href: "/staff/agua/faturas", permissions: ["water.bills.manage"] },
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
      ],
    },
    {
      id: "compras",
      label: "Compras",
      items: [{ label: "Historico de compras", href: "/cliente/compras" }],
    },
    {
      id: "agua",
      label: "Agua",
      items: [
        { label: "Visao geral", href: "/cliente/agua" },
        { label: "Solicitacoes", href: "/cliente/agua/solicitacoes" },
        { label: "Faturas", href: "/cliente/agua/faturas" },
        { label: "Pagamentos", href: "/cliente/agua/pagamentos" },
      ],
    },
  ],
};

export function normalizeRole(role: SessionUser["role"] | null): NormalizedRole | null {
  if (role === "ADMIN") return "ADMIN";
  if (role === "FUNCIONARIO" || role === "STAFF") return "FUNCIONARIO";
  if (role === "CLIENTE") return "CLIENTE";
  return null;
}

function canAccessLink(user: SessionUser, link: NavLink) {
  if (user.role === "ADMIN") return true;
  if (!link.permissions?.length) return true;
  return link.permissions.some((permission) => user.permissions.includes(permission));
}

export function getNavigation(user: SessionUser | null) {
  const normalized = normalizeRole(user?.role ?? null);
  if (!normalized || !user) return [];

  return navigation[normalized]
    .map((group) => ({
      ...group,
      items: group.items.filter((item) => canAccessLink(user, item)),
    }))
    .filter((group) => group.items.length > 0);
}

export function getQuickLinks(user: SessionUser | null, limit = 4) {
  return getNavigation(user)
    .flatMap((group) => group.items)
    .slice(0, limit);
}
