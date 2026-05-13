"use client";

import Link from "next/link";
import type { ComponentType } from "react";
import {
  ActivitySquare,
  ClipboardList,
  Droplets,
  Package,
  PackageSearch,
  ShoppingBag,
  Shield,
  Server,
  Tags,
  TrendingDown,
  Users,
  Wrench,
} from "lucide-react";
import { getSessionUser } from "@/lib/auth/session";

type IconType = ComponentType<{ className?: string }>;

type ReportCard = {
  href: string;
  title: string;
  description: string;
  icon: IconType;
  tone: string;
  permissions?: string[];
};

function canAccess(user: ReturnType<typeof getSessionUser>, permissions?: string[]) {
  if (!permissions?.length) return true;
  if (user?.role === "ADMIN") return true;
  if (!user) return false;
  return permissions.some((permission) => user.permissions.includes(permission));
}

export function ReportsOverviewPage({ scope }: { scope: "admin" | "staff" }) {
  const user = getSessionUser();
  const basePath = scope === "admin" ? "/admin" : "/staff";

  const cards: ReportCard[] = [
    {
      href: "",
      title: "Dashboard geral",
      description: "Leitura rapida dos principais numeros do sistema a partir do painel principal.",
      icon: ActivitySquare,
      tone: "bg-slate-100 text-slate-700",
    },
    {
      href: "relatorios/vendas",
      title: "Estatistica de vendas",
      description: "Receita, produtos mais vendidos, totais por item e acompanhamento comercial.",
      icon: ClipboardList,
      tone: "bg-orange-50 text-orange-700",
      permissions: ["reports.sales.view"],
    },
    {
      href: "relatorios/stock",
      title: "Estatistica de stock",
      description: "Valor restante, alertas de minimo e leitura do inventario actual.",
      icon: PackageSearch,
      tone: "bg-cyan-50 text-cyan-700",
      permissions: ["reports.stock.view"],
    },
    {
      href: "relatorios/estado-sistema",
      title: "Estado do sistema",
      description: "Saude da base de dados, banda larga, CPU, memoria, disco e estabilidade do servidor.",
      icon: Server,
      tone: "bg-blue-50 text-blue-700",
      permissions: ["reports.system-status.view"],
    },
    {
      href: "relatorios/agua",
      title: "Estatistica de agua",
      description: "Clientes, contratos, leituras e cobranca do modulo de agua.",
      icon: Droplets,
      tone: "bg-sky-50 text-sky-700",
      permissions: ["reports.water.view"],
    },
    {
      href: "clientes",
      title: "Clientes",
      description: "Leitura operacional da base de pessoas e clientes registados no sistema.",
      icon: ShoppingBag,
      tone: "bg-emerald-50 text-emerald-700",
      permissions: ["customers.view"],
    },
    {
      href: "utilizadores",
      title: "Utilizadores",
      description: "Acesso rapido a contas operacionais e controlo de permissao.",
      icon: Users,
      tone: "bg-indigo-50 text-indigo-700",
      permissions: ["users.view"],
    },
    {
      href: "produtos",
      title: "Produtos",
      description: "Consulta do catalogo comercial e leitura rapida da frente de produtos.",
      icon: Package,
      tone: "bg-amber-50 text-amber-700",
      permissions: ["products.view"],
    },
    {
      href: "categorias",
      title: "Categorias",
      description: "Estrutura de categorias usada em produtos, filtros e operacao comercial.",
      icon: Tags,
      tone: "bg-fuchsia-50 text-fuchsia-700",
      permissions: ["categories.manage"],
    },
    {
      href: "compras",
      title: "Compras",
      description: "Abrir a area de compras para acompanhar registos e leitura operacional.",
      icon: TrendingDown,
      tone: "bg-rose-50 text-rose-700",
      permissions: ["purchases.view"],
    },
    {
      href: "ferragem",
      title: "Ferragem",
      description: "Atalho para leitura da area de ferragem e seus registos operacionais.",
      icon: Wrench,
      tone: "bg-lime-50 text-lime-700",
      permissions: ["ferragem.view"],
    },
    {
      href: "auditoria",
      title: "Auditoria",
      description: "Logs de login e operacoes internas, com filtros por cliente, equipa e accao.",
      icon: Shield,
      tone: "bg-slate-100 text-slate-700",
      permissions: ["audit.view"],
    },
  ].filter((card) => canAccess(user, card.permissions));

  return (
    <main className="grid gap-6">
      <section className="rounded-[32px] bg-gradient-to-br from-slate-950 via-slate-900 to-slate-700 p-6 text-white shadow-lg shadow-slate-950/10">
        <p className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-300">Estatistica</p>
        <h1 className="mt-3 text-3xl font-black tracking-tight">Centro de leitura do sistema inteiro</h1>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-200">
          Esta area concentra links de estatistica e leitura operacional para todas as frentes principais do sistema,
          incluindo vendas, stock, agua, estado tecnico do sistema, clientes, utilizadores, compras, ferragem e auditoria.
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {cards.map((card) => {
          const Icon = card.icon;
          const href = card.href ? `${basePath}/${card.href}` : basePath;

          return (
            <Link
              key={`${scope}-${card.href || "dashboard"}`}
              href={href}
              className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <div className={`inline-flex rounded-2xl p-3 ${card.tone}`}>
                <Icon className="h-5 w-5" />
              </div>
              <h2 className="mt-4 text-2xl font-black text-slate-900">{card.title}</h2>
              <p className="mt-3 text-sm leading-7 text-slate-500">{card.description}</p>
              <div className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-slate-700">
                <ActivitySquare className="h-4 w-4" />
                Abrir area
              </div>
            </Link>
          );
        })}
      </section>
    </main>
  );
}
