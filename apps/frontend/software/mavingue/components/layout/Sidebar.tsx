"use client";

import React, { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { getRole, type Role } from "@/lib/auth/session";

interface SubItem {
  label: string;
  href: string;
}

interface NavItem {
  label: string;
  href?: string;
  roles: Role[];
  icon: React.ReactNode;
  sublinks?: SubItem[];
}

const Icons = {
  Admin: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
    </svg>
  ),
  Stock: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
      <path d="m3.3 7 8.7 5 8.7-5" />
      <path d="M12 22V12" />
    </svg>
  ),
  Sales: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" x2="12" y1="2" y2="22" />
      <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
    </svg>
  ),
  Users: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  ),
  Chevron: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m6 9 6 6 6-6" />
    </svg>
  ),
  Menu: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="4" x2="20" y1="12" y2="12" />
      <line x1="4" x2="20" y1="6" y2="6" />
      <line x1="4" x2="20" y1="18" y2="18" />
    </svg>
  ),
};

const menuItems: NavItem[] = [
  {
    label: "Administração",
    roles: ["ADMIN"],
    icon: <Icons.Admin />,
    sublinks: [
      { label: "Admin", href: "/admin" },
      { label: "Produtos", href: "/admin/produtos" },
      { label: "Ferragem", href: "/admin/ferragem" },
      { label: "Clientes", href: "/admin/clientes" },
      { label: "Utilizadores", href: "/admin/utilizadores" },
      { label: "Água", href: "/admin/agua" },
    ],
  },
  {
    label: "Produtos & Stock",
    roles: ["ADMIN"],
    icon: <Icons.Stock />,
    sublinks: [
      { label: "Stock", href: "/admin/stock" },
      { label: "Movimentos", href: "/admin/stock/movimentos" },
    ],
  },
  {
    label: "Vendas & Compras",
    roles: ["ADMIN"],
    icon: <Icons.Sales />,
    sublinks: [
      { label: "Compras", href: "/admin/compras" },
      { label: "Vendas", href: "/admin/vendas" },
      { label: "Nova Venda", href: "/admin/vendas/nova" },
    ],
  },
  {
    label: "Funcionário",
    roles: ["FUNCIONARIO", "ADMIN"],
    icon: <Icons.Users />,
    sublinks: [
      { label: "Funcionário", href: "/staff" },
      { label: "Stock", href: "/staff/stock" },
      { label: "Movimentos", href: "/staff/stock/movimentos" },
      { label: "Compras", href: "/staff/compras" },
      { label: "Vendas", href: "/staff/vendas" },
      { label: "Nova Venda", href: "/staff/vendas/nova" },
    ],
  },
  {
    label: "Cliente",
    roles: ["CLIENTE"],
    icon: <Icons.Users />,
    sublinks: [
      { label: "Cliente", href: "/cliente" },
      { label: "Compras", href: "/cliente/compras" },
      { label: "Perfil", href: "/cliente/perfil" },
    ],
  },
];

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(true);
  const [activeSubmenu, setActiveSubmenu] = useState<string | null>(null);
  const [hasInitialAnimation, setHasInitialAnimation] = useState(false);
  const autoCloseTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const initialSubmenuTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const role = getRole();
  const pathname = usePathname();

  const filteredItems = role ? menuItems.filter((item) => item.roles.includes(role as Role)) : [];

  // Abrir todos os submenus um por um durante a animação inicial
  useEffect(() => {
    if (!hasInitialAnimation && isOpen && filteredItems.length > 0) {
      // Abrir submenus sequencialmente
      filteredItems.forEach((item, index) => {
        if (item.sublinks && item.sublinks.length > 0) {
          const timeoutId = setTimeout(() => {
            setActiveSubmenu(prev => {
              // Se já tiver um submenu aberto, adiciona o novo (pode abrir múltiplos)
              if (prev === item.label) return prev;
              if (prev === null) return item.label;
              // Para múltiplos submenus, você pode armazenar como array ou string
              // Aqui vamos apenas mostrar o último, mas você pode modificar
              return item.label;
            });
          }, index * 300); // Abre cada submenu com 300ms de intervalo
          
          initialSubmenuTimeoutRef.current = timeoutId;
        }
      });

      // Fechar a sidebar após 2 segundos
      autoCloseTimeoutRef.current = setTimeout(() => {
        setIsOpen(false);
        setActiveSubmenu(null);
        setHasInitialAnimation(true);
      }, 2000);
    }

    return () => {
      if (autoCloseTimeoutRef.current) {
        clearTimeout(autoCloseTimeoutRef.current);
      }
      if (initialSubmenuTimeoutRef.current) {
        clearTimeout(initialSubmenuTimeoutRef.current);
      }
    };
  }, [hasInitialAnimation, isOpen, filteredItems]);

  // Efeito para o offset do conteúdo principal
  useEffect(() => {
    document.documentElement.style.setProperty("--sidebar-offset", isOpen ? "256px" : "80px");
    return () => {
      document.documentElement.style.removeProperty("--sidebar-offset");
    };
  }, [isOpen]);

  const toggleSubmenu = (label: string) => {
    if (!isOpen) setIsOpen(true);
    setActiveSubmenu(activeSubmenu === label ? null : label);
  };

  const handleMenuClick = () => {
    setIsOpen(!isOpen);
    setActiveSubmenu(null);
    if (autoCloseTimeoutRef.current) {
      clearTimeout(autoCloseTimeoutRef.current);
      setHasInitialAnimation(true);
    }
    if (initialSubmenuTimeoutRef.current) {
      clearTimeout(initialSubmenuTimeoutRef.current);
    }
  };

  return (
    <aside
      className={`fixed left-0 top-16 z-40 h-[calc(100vh-4rem)] border-r border-slate-200 bg-white/90 backdrop-blur-md transition-all duration-300 dark:border-slate-800 dark:bg-slate-950/90 ${
        isOpen ? "w-64" : "w-20"
      }`}
    >
      <div className="flex h-full flex-col p-3">
        <button
          onClick={handleMenuClick}
          className="mb-6 flex h-12 w-full items-center justify-center rounded-xl text-slate-500 transition-colors hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-900"
        >
          <Icons.Menu />
        </button>

        <nav className="flex flex-col gap-2">
          {filteredItems.map((item) => {
            const hasSub = !!item.sublinks;
            const isSubOpen = activeSubmenu === item.label;
            const isActive = pathname === item.href || item.sublinks?.some((s) => s.href === pathname);

            return (
              <div key={item.label}>
                {hasSub ? (
                  <button
                    onClick={() => toggleSubmenu(item.label)}
                    className={`flex w-full items-center gap-4 rounded-xl p-3 transition-all ${
                      isActive ? "bg-orange-50 text-orange-600 dark:bg-orange-500/10" : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900"
                    }`}
                  >
                    <div className={`min-w-[22px] ${isActive ? "text-orange-600" : ""}`}>{item.icon}</div>
                    {isOpen && (
                      <>
                        <span className="flex-1 text-left text-sm font-bold tracking-tight">{item.label}</span>
                        <div className={`transition-transform duration-200 ${isSubOpen ? "rotate-180" : ""}`}>
                          <Icons.Chevron />
                        </div>
                      </>
                    )}
                  </button>
                ) : (
                  <Link
                    href={item.href || "#"}
                    className={`flex items-center gap-4 rounded-xl p-3 transition-all ${
                      pathname === item.href ? "bg-orange-600 text-white shadow-lg shadow-orange-200 dark:shadow-none" : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900"
                    }`}
                  >
                    <div className="min-w-[22px]">{item.icon}</div>
                    {isOpen && <span className="text-sm font-bold tracking-tight">{item.label}</span>}
                  </Link>
                )}

                {isOpen && hasSub && isSubOpen && (
                  <div className="mt-1 flex flex-col gap-1 overflow-hidden pl-12 animate-in fade-in slide-in-from-top-2">
                    {item.sublinks?.map((sub) => (
                      <Link
                        key={sub.href}
                        href={sub.href}
                        className={`block rounded-lg py-2 text-sm transition-colors ${
                          pathname === sub.href ? "font-bold text-orange-600 dark:text-orange-500" : "text-slate-500 hover:text-orange-600 dark:text-slate-400 dark:hover:text-slate-200"
                        }`}
                      >
                        {sub.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        {isOpen && (
          <div className="mt-auto border-t border-slate-100 pt-4 dark:border-slate-800">
            <div className="rounded-xl bg-orange-50/50 p-3 dark:bg-orange-500/5">
              <p className="text-[10px] uppercase tracking-widest text-orange-600 font-black">Acesso</p>
              <p className="text-sm font-bold text-slate-700 dark:text-slate-300">{role}</p>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}