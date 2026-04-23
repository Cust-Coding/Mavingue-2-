"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  ChevronDown,
  Globe,
  LogOut,
  Menu,
  Moon,
  ShoppingBag,
  Sun,
  User,
  X,
} from "lucide-react";
import { clearSession, getRole } from "@/lib/auth/session";
import { getQuickLinks, normalizeRole } from "@/components/layout/navigation";
import { useI18n } from "@/lib/i18n";
import { getCartCount, useCartStore } from "@/store/cart.store";
import Image from "next/image";

interface MeResponse {
  nome?: string;
  name?: string;
}

const publicLinks = [
  { label: "Inicio", href: "/" },
  { label: "Catalogo", href: "/catalogo" },
  { label: "Servicos", href: "/servicos" },
  { label: "Contactos", href: "/contactos" },
];

function firstName(full?: string) {
  if (!full) return "";
  return full.trim().split(/\s+/)[0] ?? "";
}

export default function Topbar() {
  const [mounted, setMounted] = useState(false);
  const role = getRole();
  const normalizedRole = normalizeRole(role);
  const quickLinks = useMemo(() => getQuickLinks(role, 5), [role]);
  const items = useCartStore((state) => state.items);
  const cartCount = getCartCount(items);
  const showCart = !role || normalizedRole === "CLIENTE";
  const { locale, setLocale } = useI18n();

  const [darkMode, setDarkMode] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const [meName, setMeName] = useState("");

  const accountRef = useRef<HTMLDivElement | null>(null);
  const langRef = useRef<HTMLDivElement | null>(null);

  // Marcar componente como montado
  useEffect(() => {
    setMounted(true);
    
    // Ler tema do localStorage apenas no cliente
    const savedTheme = localStorage.getItem("theme");
    const isDark = savedTheme === "dark" || document.documentElement.classList.contains("dark");
    setDarkMode(isDark);
    document.documentElement.classList.toggle("dark", isDark);
    
    // Ler nome do localStorage apenas no cliente
    const savedName = localStorage.getItem("me_name");
    if (savedName) {
      setMeName(savedName);
    }
  }, []);

  // Efeito separado para o tema
  useEffect(() => {
    if (!mounted) return;
    document.documentElement.classList.toggle("dark", darkMode);
  }, [darkMode, mounted]);

  useEffect(() => {
    if (!mounted || !role) return;

    (async () => {
      try {
        const response = await fetch("/api/proxy/api/auth/me", {
          method: "GET",
          credentials: "include",
        });

        if (!response.ok) return;

        const me: MeResponse = await response.json();
        const fullName = me.nome ?? me.name ?? "";
        if (!fullName) return;

        setMeName(fullName);
        localStorage.setItem("me_name", fullName);
      } catch (error) {
        console.error(error);
      }
    })();
  }, [role, mounted]);

  useEffect(() => {
    if (!mounted) return;
    
    function handleOutsideClick(event: MouseEvent) {
      if (accountRef.current && !accountRef.current.contains(event.target as Node)) {
        setAccountOpen(false);
      }

      if (langRef.current && !langRef.current.contains(event.target as Node)) {
        setLangOpen(false);
      }
    }

    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, [mounted]);

  const displayName = firstName(meName) || (normalizedRole === "CLIENTE" ? "Cliente" : normalizedRole === "ADMIN" ? "Admin" : "Staff");

  const toggleDarkMode = () => {
    const nextMode = !darkMode;
    setDarkMode(nextMode);
    localStorage.setItem("theme", nextMode ? "dark" : "light");
  };

  // Placeholder durante hidratação
  if (!mounted) {
    return (
      <header className="fixed inset-x-0 top-0 z-50 border-b border-slate-200 bg-white/95 shadow-sm backdrop-blur dark:border-slate-800 dark:bg-slate-950/95">
        <div className="mx-auto flex max-w-7xl items-center px-4 py-3">
          <div className="flex min-w-0 flex-1 items-center gap-3">
            <div className="h-11 w-11 rounded-2xl bg-slate-200 animate-pulse"></div>
            <div className="hidden sm:block">
              <div className="h-4 w-20 bg-slate-200 rounded animate-pulse"></div>
              <div className="h-3 w-16 bg-slate-100 rounded mt-1 animate-pulse"></div>
            </div>
          </div>
          <div className="ml-3 flex items-center gap-2">
            <div className="h-11 w-11 rounded-2xl bg-slate-200 animate-pulse"></div>
            <div className="h-11 w-11 rounded-2xl bg-slate-200 animate-pulse"></div>
            <div className="h-11 w-11 rounded-2xl bg-slate-200 animate-pulse"></div>
            <div className="h-11 w-28 rounded-2xl bg-slate-200 animate-pulse hidden sm:block"></div>
          </div>
        </div>
      </header>
    );
  }

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-slate-200 bg-white/95 shadow-sm backdrop-blur dark:border-slate-800 dark:bg-slate-950/95">
      <div className="mx-auto flex max-w-7xl items-center px-4 py-3">
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <button
            type="button"
            onClick={() => setMobileMenuOpen((current) => !current)}
            className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 text-slate-700 transition hover:border-orange-200 hover:bg-orange-50 hover:text-orange-600 lg:hidden dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-900"
            aria-label="Abrir menu"
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>

          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl  text-xl font-black text-white ">
              <Image src="/mavingue_logo_v1.svg" alt="Logo" width={26} height={26} />
            </div>
            <div className="hidden sm:block">
              <div className="text-sm font-black uppercase tracking-[0.3em] text-slate-400">Mavingue</div>
              <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">Materiais e agua</div>
            </div>
          </Link>

          <nav className="ml-4 hidden items-center gap-2 lg:flex">
            {publicLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="rounded-full px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-orange-50 hover:text-orange-600 dark:text-slate-300 dark:hover:bg-slate-900"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="ml-3 flex items-center gap-2">
          <button
            type="button"
            onClick={toggleDarkMode}
            className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 text-slate-700 transition hover:border-orange-200 hover:bg-orange-50 hover:text-orange-600 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-900"
            aria-label="Alternar tema"
          >
            {darkMode ? <Sun size={19} /> : <Moon size={19} />}
          </button>

          <div ref={langRef} className="relative">
            <button
              type="button"
              onClick={() => setLangOpen((current) => !current)}
              className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 text-slate-700 transition hover:border-orange-200 hover:bg-orange-50 hover:text-orange-600 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-900"
              aria-label="Idioma"
            >
              <Globe size={19} />
            </button>

            {langOpen && (
              <div className="absolute right-0 top-full mt-3 w-36 overflow-hidden rounded-3xl border border-slate-200 bg-white p-2 shadow-xl dark:border-slate-700 dark:bg-slate-950">
                {[
                  { value: "pt" as const, label: "Portugues" },
                  { value: "en" as const, label: "English" },
                ].map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => {
                      setLocale(option.value);
                      setLangOpen(false);
                    }}
                    className={`flex w-full items-center rounded-2xl px-3 py-2 text-sm font-semibold transition ${
                      locale === option.value
                        ? "bg-orange-50 text-orange-600 dark:bg-orange-950/40"
                        : "text-slate-600 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-900"
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {showCart && (
            <Link
              href="/carrinho"
              className="relative inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 text-slate-700 transition hover:border-orange-200 hover:bg-orange-50 hover:text-orange-600 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-900"
              aria-label="Carrinho"
            >
              <ShoppingBag size={19} />
              {cartCount > 0 && (
                <span className="absolute -right-1 -top-1 inline-flex min-h-5 min-w-5 items-center justify-center rounded-full bg-orange-600 px-1.5 text-[11px] font-black text-white">
                  {cartCount}
                </span>
              )}
            </Link>
          )}

          {!role ? (
            <div className="hidden items-center gap-2 sm:flex">
              <Link
                href="/auth/login"
                className="rounded-full px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-900"
              >
                Entrar
              </Link>
              <Link
                href="/auth/register"
                className="rounded-full bg-orange-600 px-4 py-2 text-sm font-bold text-white transition hover:bg-orange-700"
              >
                Criar conta
              </Link>
            </div>
          ) : (
            <div ref={accountRef} className="relative">
              <button
                type="button"
                onClick={() => setAccountOpen((current) => !current)}
                className="inline-flex h-11 items-center gap-2 rounded-2xl border border-slate-200 px-2 pr-3 text-slate-700 transition hover:border-orange-200 hover:bg-orange-50 hover:text-orange-600 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-900"
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-orange-600 text-white">
                  <User size={16} />
                </span>
                <span className="hidden max-w-28 truncate text-sm font-bold sm:block">{displayName}</span>
                <ChevronDown size={16} />
              </button>

              {accountOpen && (
                <div className="absolute right-0 top-full mt-3 w-72 overflow-hidden rounded-[28px] border border-slate-200 bg-white p-2 shadow-2xl dark:border-slate-700 dark:bg-slate-950">
                  <div className="rounded-[22px] bg-slate-50 px-4 py-3 dark:bg-slate-900">
                    <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-400">Sessao</p>
                    <p className="mt-1 text-base font-black text-slate-900 dark:text-white">{meName || displayName}</p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">{normalizedRole}</p>
                  </div>

                  <div className="mt-2 grid gap-1">
                    {quickLinks.map((link) => (
                      <Link
                        key={link.href}
                        href={link.href}
                        onClick={() => setAccountOpen(false)}
                        className="rounded-2xl px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-orange-50 hover:text-orange-600 dark:text-slate-200 dark:hover:bg-slate-900"
                      >
                        {link.label}
                      </Link>
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      clearSession();
                      window.location.href = "/";
                    }}
                    className="mt-2 flex w-full items-center gap-2 rounded-2xl px-4 py-3 text-sm font-bold text-rose-600 transition hover:bg-rose-50 dark:hover:bg-rose-950/30"
                  >
                    <LogOut size={16} />
                    Terminar sessao
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="mx-auto mt-1 max-w-7xl border-t border-slate-200 bg-white p-3 shadow-xl dark:border-slate-700 dark:bg-slate-950 lg:hidden">
          <div className="grid gap-1">
            {publicLinks.map((link) => (
              <Link
                key={`public-${link.href}`}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="rounded-2xl px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-orange-50 hover:text-orange-600 dark:text-slate-200 dark:hover:bg-slate-900"
              >
                {link.label}
              </Link>
            ))}

            {quickLinks.map((link) => (
              <Link
                key={`quick-${link.href}`}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="rounded-2xl px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-orange-50 hover:text-orange-600 dark:text-slate-200 dark:hover:bg-slate-900"
              >
                {link.label}
              </Link>
            ))}
          </div>

          {!role && (
            <div className="mt-3 grid gap-2 border-t border-slate-200 pt-3 dark:border-slate-800">
              <Link
                href="/auth/login"
                onClick={() => setMobileMenuOpen(false)}
                className="rounded-2xl border border-slate-200 px-4 py-3 text-center text-sm font-semibold text-slate-700 dark:border-slate-700 dark:text-slate-200"
              >
                Entrar
              </Link>
              <Link
                href="/auth/register"
                onClick={() => setMobileMenuOpen(false)}
                className="rounded-2xl bg-orange-600 px-4 py-3 text-center text-sm font-bold text-white"
              >
                Criar conta
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
}