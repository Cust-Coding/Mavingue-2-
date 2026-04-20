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
    if (typeof window === "undefined") return false;
    const saved = localStorage.getItem("sidebar-open");
    const isDesktop = window.innerWidth >= 1024;
    return saved !== null ? saved === "true" : isDesktop;
  });
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    localStorage.setItem("sidebar-open", String(isOpen));
  }, [isOpen, mounted]);

  useEffect(() => {
    if (!mounted) return;

    const handleResize = () => {
      const isDesktop = window.innerWidth >= 1024;
      if (!isDesktop && isOpen) {
        setIsOpen(false);
      }
    };

    const applyOffset = () => {
      const isDesktop = window.innerWidth >= 1024;
      const offset = isDesktop ? (isOpen ? "280px" : "80px") : "0px";
      document.documentElement.style.setProperty("--sidebar-offset", offset);
    };

    applyOffset();
    window.addEventListener("resize", handleResize);
    window.addEventListener("resize", applyOffset);

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("resize", applyOffset);
      document.documentElement.style.removeProperty("--sidebar-offset");
    };
  }, [isOpen, mounted]);

  useEffect(() => {
    if (!mounted) return;

    const handleClickOutside = (event: MouseEvent) => {
      const isDesktop = window.innerWidth >= 1024;
      if (isDesktop) return;
      
      const sidebar = document.getElementById("sidebar");
      const menuButton = document.getElementById("sidebar-menu-button");
      
      if (sidebar && !sidebar.contains(event.target as Node) && 
          menuButton && !menuButton.contains(event.target as Node) && 
          isOpen) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen, mounted]);

  if (!mounted || !role || !groups.length) {
    return null;
  }

  const isDesktop = typeof window !== "undefined" && window.innerWidth >= 1024;
  const sidebarWidth = isOpen ? "w-72" : "w-20";

  return (
    <>
      {isOpen && !isDesktop && (
        <div 
          className="fixed inset-0 bg-black/50 z-30 transition-opacity duration-300"
          onClick={() => setIsOpen(false)}
        />
      )}

      <aside
        id="sidebar"
        className={cn(
          "fixed left-0 top-[var(--app-topbar-offset)] z-5 h-[calc(100vh-var(--app-topbar-offset))] border-r border-slate-200 bg-white/90 shadow-xl shadow-slate-900/5 backdrop-blur-xl transition-all duration-300 ease-in-out dark:border-slate-800 dark:bg-slate-950/90",
          sidebarWidth,
          !isDesktop && !isOpen && "-translate-x-full",
          !isDesktop && isOpen && "translate-x-0 shadow-2xl"
        )}
        style={{
          transitionProperty: "width, transform",
        }}
      >
        <div className="flex h-full flex-col gap-4 p-3">
          <button
            id="sidebar-menu-button"
            type="button"
            onClick={() => setIsOpen((current) => !current)}
            className="inline-flex h-11 w-full items-center justify-center rounded-xl border border-slate-200 text-slate-700 transition-all hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-900"
            aria-label="Alternar sidebar"
          >
            <Menu size={20} />
          </button>

          <nav className="flex-1 space-y-3 overflow-y-auto pr-1 custom-scrollbar">
            {groups.map((group) => {
              const Icon = groupIcons[group.id as keyof typeof groupIcons] ?? Boxes;
              const isExpanded =
                expanded[group.id] ??
                group.items.some((item) => pathname === item.href || pathname.startsWith(`${item.href}/`));
              const hasActiveItem = group.items.some(
                (item) => pathname === item.href || pathname.startsWith(`${item.href}/`)
              );

              return (
                <div
                  key={group.id}
                  className="rounded-xl border  border-slate-200 bg-white/80 transition-all dark:border-slate-800 dark:bg-slate-950/70"
                >
                  <button
                    type="button"
                    onClick={() => {
                      if (!isOpen) {
                        setIsOpen(true);
                        setTimeout(() => {
                          setExpanded((current) => ({
                            ...current,
                            [group.id]: !isExpanded,
                          }));
                        }, 150);
                      } else {
                        setExpanded((current) => ({
                          ...current,
                          [group.id]: !isExpanded,
                        }));
                      }
                    }}
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
                        <ChevronDown
                          size={14}
                          className={cn("transition-transform duration-200", isExpanded ? "rotate-180" : "")}
                        />
                      </>
                    )}
                  </button>

                  {isOpen && isExpanded && (
                    <div className="mt-1 grid gap-1 px-2 pb-2 animate-in slide-in-from-top-1 duration-200">
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

          <div className="w-full -ml-1 pr-13 rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-900/50">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-green-600">Perfil activo</p>
            <p className="mt-1 text-sm font-bold text-orange-600 dark:text-white">{role}</p>
            {isOpen && (
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                Links completos disponíveis
              </p>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}