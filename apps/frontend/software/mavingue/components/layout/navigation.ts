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
      id: "comercial",
      label: "Comercial",
      items: [
        { label: "Produtos", href: "/admin/produtos", permissions: ["products.view"] },
        { label: "Novo produto", href: "/admin/produtos/novo", permissions: ["products.manage"] },
        { label: "Categorias", href: "/admin/categorias", permissions: ["categories.manage"] },
        { label: "Vendas", href: "/admin/vendas", permissions: ["sales.view"] },
        { label: "Nova venda", href: "/admin/vendas/nova", permissions: ["sales.create"] },
        { label: "Compras", href: "/admin/compras", permissions: ["purchases.view"] },
        { label: "Stock", href: "/admin/stock", permissions: ["stock.view"] },
        { label: "Movimentos", href: "/admin/stock/movimentos", permissions: ["stock.movements.view"] },
      ],
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
      items: [
        { label: "Pessoas e clientes", href: "/admin/clientes", permissions: ["customers.view"] },
        { label: "Ferragem", href: "/admin/ferragem", permissions: ["ferragem.view"] },
      ],
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
    {
      id: "relatorios",
      label: "Relatorios",
      items: [
        { label: "Visao geral", href: "/admin/relatorios", permissions: ["reports.view"] },
        { label: "Vendas", href: "/admin/relatorios/vendas", permissions: ["reports.sales.view"] },
        { label: "Stock", href: "/admin/relatorios/stock", permissions: ["reports.stock.view"] },
        { label: "Agua", href: "/admin/relatorios/agua", permissions: ["reports.water.view"] },
        { label: "Auditoria", href: "/admin/auditoria", permissions: ["audit.view"] },
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
        { label: "Produtos", href: "/staff/produtos", permissions: ["products.view"] },
        { label: "Novo produto", href: "/staff/produtos/novo", permissions: ["products.manage"] },
        { label: "Categorias", href: "/staff/categorias", permissions: ["categories.manage"] },
        { label: "Vendas", href: "/staff/vendas", permissions: ["sales.view"] },
        { label: "Nova venda", href: "/staff/vendas/nova", permissions: ["sales.create"] },
        { label: "Compras", href: "/staff/compras", permissions: ["purchases.view"] },
        { label: "Stock", href: "/staff/stock", permissions: ["stock.view"] },
        { label: "Movimentos", href: "/staff/stock/movimentos", permissions: ["stock.movements.view"] },
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
    {
      id: "relatorios",
      label: "Relatorios",
      items: [
        { label: "Visao geral", href: "/staff/relatorios", permissions: ["reports.view"] },
        { label: "Vendas", href: "/staff/relatorios/vendas", permissions: ["reports.sales.view"] },
        { label: "Stock", href: "/staff/relatorios/stock", permissions: ["reports.stock.view"] },
        { label: "Auditoria", href: "/staff/auditoria", permissions: ["audit.view"] },
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
