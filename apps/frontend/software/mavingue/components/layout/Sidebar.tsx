"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Boxes, ChevronDown, Droplets, LayoutDashboard, Menu, ShoppingCart, Users } from "lucide-react";
import { getNavigation } from "@/components/layout/navigation";
import { getRole } from "@/lib/auth/session";
import { cn } from "@/lib/utils/index";

const groupIcons = {
  painel: LayoutDashboard,
  operacoes: Users,
  comercial: ShoppingCart,
  agua: Droplets,
  area: LayoutDashboard,
  compras: Boxes,
} as const;

export default function Sidebar() {
  const role = getRole();
  const pathname = usePathname();
  const groups = useMemo(() => getNavigation(role), [role]);
  const [isOpen, setIsOpen] = useState(() => {
    if (typeof window === "undefined") return true;
    return localStorage.getItem("sidebar-open") !== "false";
  });
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  useEffect(() => {
    localStorage.setItem("sidebar-open", String(isOpen));
  }, [isOpen]);

  useEffect(() => {
    const query = window.matchMedia("(min-width: 1024px)");

    const applyOffset = () => {
      document.documentElement.style.setProperty(
        "--sidebar-offset",
        query.matches ? (isOpen ? "320px" : "104px") : "0px"
      );
    };

    applyOffset();
    query.addEventListener("change", applyOffset);

    return () => {
      query.removeEventListener("change", applyOffset);
      document.documentElement.style.removeProperty("--sidebar-offset");
    };
  }, [isOpen]);

  if (!role || !groups.length) {
    return null;
  }

  return (
    <aside
      className={cn(
        "fixed left-0 top-[var(--app-topbar-offset)] z-40 h-[calc(100vh-var(--app-topbar-offset))] border-r border-slate-200 bg-white/90 shadow-xl shadow-slate-900/5 backdrop-blur-xl transition-all duration-300 dark:border-slate-800 dark:bg-slate-950/90",
        isOpen ? "w-80" : "w-24"
      )}
    >
      <div className="flex h-full flex-col gap-4 p-4">
        <button
          type="button"
          onClick={() => setIsOpen((current) => !current)}
          className="inline-flex h-12 w-full items-center justify-center rounded-2xl border border-slate-200 text-slate-700 transition hover:border-orange-200 hover:bg-orange-50 hover:text-orange-600 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-900"
          aria-label="Alternar sidebar"
        >
          <Menu size={20} />
        </button>

        <nav className="flex-1 space-y-3 overflow-y-auto pr-1">
          {groups.map((group) => {
            const Icon = groupIcons[group.id as keyof typeof groupIcons] ?? Boxes;
            const isExpanded =
              expanded[group.id] ??
              group.items.some((item) => pathname === item.href || pathname.startsWith(`${item.href}/`));
            const hasActiveItem = group.items.some(
              (item) => pathname === item.href || pathname.startsWith(`${item.href}/`)
            );

            return (
              <div key={group.id} className="rounded-[24px] border border-slate-200 bg-white/80 p-2 dark:border-slate-800 dark:bg-slate-950/70">
                <button
                  type="button"
                  onClick={() => {
                    if (!isOpen) {
                      setIsOpen(true);
                    }

                    setExpanded((current) => ({
                      ...current,
                      [group.id]: !isExpanded,
                    }));
                  }}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-[18px] px-3 py-3 text-left transition",
                    hasActiveItem
                      ? "bg-orange-50 text-orange-600 dark:bg-orange-950/40"
                      : "text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-900"
                  )}
                >
                  <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-100 dark:bg-slate-900">
                    <Icon size={18} />
                  </span>

                  {isOpen && (
                    <>
                      <span className="flex-1 text-sm font-black tracking-tight">{group.label}</span>
                      <ChevronDown
                        size={16}
                        className={cn("transition", isExpanded ? "rotate-180" : "")}
                      />
                    </>
                  )}
                </button>

                {isOpen && isExpanded && (
                  <div className="mt-2 grid gap-1 px-2 pb-2">
                    {group.items.map((item) => {
                      const active = pathname === item.href || pathname.startsWith(`${item.href}/`);

                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          className={cn(
                            "rounded-2xl px-4 py-3 text-sm font-semibold transition",
                            active
                              ? "bg-slate-950 text-white dark:bg-orange-600"
                              : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-900 dark:hover:text-white"
                          )}
                        >
                          {item.label}
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        <div className="rounded-[24px] border border-orange-200 bg-orange-50 p-4 dark:border-orange-900/40 dark:bg-orange-950/20">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-orange-500">Perfil activo</p>
          <p className="mt-2 text-sm font-black text-slate-900 dark:text-white">{role}</p>
          {isOpen && (
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Os links completos deste perfil ficam sempre disponiveis na sidebar.
            </p>
          )}
        </div>
      </div>
    </aside>
  );
}
