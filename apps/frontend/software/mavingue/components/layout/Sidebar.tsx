"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Boxes, ChevronDown, Droplets, LayoutDashboard, Menu, ShoppingCart, Users } from "lucide-react";
import { getNavigation } from "@/components/layout/navigation";
import { getSessionUser } from "@/lib/auth/session";
import { cn } from "@/lib/utils/index";

const groupIcons = {
  painel: LayoutDashboard,
  operacoes: Users,
  cadastros: Users,
  comercial: ShoppingCart,
  agua: Droplets,
  area: LayoutDashboard,
  compras: Boxes,
} as const;

export default function Sidebar() {
  const user = getSessionUser();
  const pathname = usePathname();
  const groups = useMemo(() => getNavigation(user), [user]);
  const [isOpen, setIsOpen] = useState(() => {
    if (typeof window === "undefined") return false;
    const saved = localStorage.getItem("sidebar-open");
    const isDesktop = window.innerWidth >= 1024;
    return saved !== null ? saved === "true" : isDesktop;
  });
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [mounted, setMounted] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    setMounted(true);

    const checkDesktop = () => {
      setIsDesktop(window.innerWidth >= 1024);
      if (window.innerWidth < 1024) {
        setIsOpen(false);
      }
    };

    checkDesktop();
    window.addEventListener("resize", checkDesktop);
    return () => window.removeEventListener("resize", checkDesktop);
  }, []);

  useEffect(() => {
    if (!mounted || !isDesktop) return;
    localStorage.setItem("sidebar-open", String(isOpen));
  }, [isOpen, mounted, isDesktop]);

  useEffect(() => {
    if (!mounted || !isDesktop) return;

    const offset = isOpen ? "280px" : "80px";
    document.documentElement.style.setProperty("--sidebar-offset", offset);

    return () => {
      document.documentElement.style.removeProperty("--sidebar-offset");
    };
  }, [isOpen, mounted, isDesktop]);

  if (!mounted || !user || !groups.length || !isDesktop) {
    return null;
  }

  const sidebarWidth = isOpen ? "w-72" : "w-20";

  return (
    <aside
      id="sidebar"
      className={cn(
        "fixed left-0 top-[var(--app-topbar-offset)] z-5 h-[calc(100vh-var(--app-topbar-offset))] border-r border-slate-200 bg-white/90 shadow-xl shadow-slate-900/5 backdrop-blur-xl transition-all duration-300 ease-in-out dark:border-slate-800 dark:bg-slate-950/90",
        sidebarWidth
      )}
      style={{ transitionProperty: "width" }}
    >
      <div className="flex h-full flex-col gap-4 p-3">
        <button
          type="button"
          onClick={() => setIsOpen((current) => !current)}
          className="inline-flex h-11 w-full items-center justify-center rounded-xl border border-slate-200 text-slate-700 transition-all hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-900"
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
            const hasActiveItem = group.items.some((item) => pathname === item.href || pathname.startsWith(`${item.href}/`));

            return (
              <div key={group.id} className="rounded-xl border border-slate-200 bg-white/80 transition-all dark:border-slate-800 dark:bg-slate-950/70">
                <button
                  type="button"
                  onClick={() =>
                    setExpanded((current) => ({
                      ...current,
                      [group.id]: !isExpanded,
                    }))
                  }
                  className={cn(
                    "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-all",
                    hasActiveItem
                      ? "bg-slate-100 text-slate-900 dark:bg-slate-900 dark:text-white"
                      : "text-slate-700 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-900"
                  )}
                >
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-900">
                    <Icon size={18} />
                  </span>

                  {isOpen && (
                    <>
                      <span className="flex-1 text-sm font-semibold tracking-tight">{group.label}</span>
                      <ChevronDown size={14} className={cn("transition-transform duration-200", isExpanded ? "rotate-180" : "")} />
                    </>
                  )}
                </button>

                {isOpen && isExpanded && (
                  <div className="mt-1 grid gap-1 px-2 pb-2">
                    {group.items.map((item) => {
                      const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          className={cn(
                            "rounded-lg px-3 py-2.5 text-sm font-medium transition-all",
                            active
                              ? "bg-slate-900 text-white dark:bg-slate-800"
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

        <div className="rounded-xl border border-slate-200 bg-slate-50 p-2 -m-2 dark:border-slate-800 dark:bg-slate-900/50">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-green-600">Perfil activo</p>
          <p className="mt-1 text-[9px] font-bold text-orange-600 dark:text-white">{user.role}</p>
          {isOpen && <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Apenas areas permitidas para esta conta.</p>}
        </div>
      </div>
    </aside>
  );
}
