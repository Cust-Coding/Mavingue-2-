"use client";

import Link from "next/link";
import { ActivitySquare, ClipboardList, PackageSearch, Shield } from "lucide-react";

const cards = [
  {
    href: "relatorios/vendas",
    title: "Relatorio de vendas",
    description: "Receita, produtos mais vendidos, totais por item e acompanhamento operacional.",
    icon: ClipboardList,
    tone: "bg-orange-50 text-orange-700",
  },
  {
    href: "relatorios/stock",
    title: "Relatorio de stock",
    description: "Valor restante em stock, produtos em alerta e detalhe do inventario actual.",
    icon: PackageSearch,
    tone: "bg-cyan-50 text-cyan-700",
  },
  {
    href: "auditoria",
    title: "Auditoria",
    description: "Logs de login e operacoes internas, com filtros por cliente, equipa e accao.",
    icon: Shield,
    tone: "bg-slate-100 text-slate-700",
  },
];

export function ReportsOverviewPage({ scope }: { scope: "admin" | "staff" }) {
  const basePath = scope === "admin" ? "/admin" : "/staff";

  return (
    <main className="grid gap-6">
      <section className="rounded-[32px] bg-gradient-to-br from-slate-950 via-slate-900 to-slate-700 p-6 text-white shadow-lg shadow-slate-950/10">
        <p className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-300">Relatorios</p>
        <h1 className="mt-3 text-3xl font-black tracking-tight">Centro de leitura e auditoria</h1>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-200">
          Esta area foi pensada para perfis com permissao de leitura e controlo, com acesso rapido a vendas, stock e auditoria do sistema.
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {cards.map((card) => {
          const Icon = card.icon;

          return (
            <Link
              key={card.href}
              href={`${basePath}/${card.href}`}
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
