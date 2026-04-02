"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { clearSession, getRole } from "@/lib/auth/session";

interface MeResponse {
  nome?: string;
  name?: string;
  email?: string;
  id?: string | number;
}

function firstName(full?: string): string {
  if (!full) return "";
  const t = full.trim().split(/\s+/);
  return t[0] ?? "";
}

// Ícones Modernos
const Icons = {
  User: () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
  Cart: () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>,
  Sun: () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/></svg>,
  Moon: () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>,
  Menu: () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="18" y2="18"/></svg>,
  X: () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>,
  ChevronDown: () => <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
};

export default function Topbar() {

  const [mounted, setMounted] = useState(false);
  
  const role = getRole();
  const [meName, setMeName] = useState<string>("");
  const [open, setOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const boxRef = useRef<HTMLDivElement | null>(null);


  useEffect(() => {
    setMounted(true);
  }, []);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    document.documentElement.classList.toggle("dark");
  };

  useEffect(() => {
    if (!role) return;
    const cached = localStorage.getItem("me_name");
    if (cached) setMeName(cached);

    (async () => {
      try {
        const res = await fetch("/api/proxy/api/auth/me", { method: "GET", credentials: "include" });
        if (!res.ok) return;
        const me: MeResponse = await res.json();
        const nome = me?.nome ?? me?.name ?? "";
        if (nome) {
          setMeName(nome);
          localStorage.setItem("me_name", nome);
        }
      } catch (err) { console.error(err); }
    })();
  }, [role]);

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  const displayName = firstName(meName) || (role ? "Conta" : "");
  const profileHref = role === "ADMIN" ? "/admin" : role === "CLIENTE" ? "/cliente/perfil" : "/staff";

  
  if (!mounted) {
    return (
      <header className="sticky top-0 z-50 w-full border-b border-slate-200 bg-gray-100/80 backdrop-blur-md dark:border-slate-800 dark:bg-slate-950/80">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="h-8 w-24 bg-orange-200 animate-pulse rounded dark:bg-orange-900/30"></div>
          <div className="h-8 w-32 bg-slate-200 animate-pulse rounded dark:bg-slate-800"></div>
        </div>
      </header>
    );
  }

 
  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200 bg-gray-100/80 backdrop-blur-md dark:border-slate-800 dark:bg-slate-950/80">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        
        {/* Lado Esquerdo: Logo e Nav Desktop */}
        <div className="flex items-center gap-6">
          <button 
            className="text-slate-600 hover:text-orange-500 md:hidden dark:text-slate-300"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <Icons.X /> : <Icons.Menu />}
          </button>

          <Link href="/" className="text-2xl font-black tracking-tighter text-orange-600 dark:text-orange-500">
            M
          </Link>

          <nav className="hidden mx-20 space-x-1 md:flex">
            <Link href="/catalogo" className="rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-orange-50 hover:text-orange-600 dark:text-slate-300 dark:hover:bg-slate-900 dark:hover:text-orange-400">
              Catálogo
            </Link>
            <Link href="/novidades" className="rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-orange-50 hover:text-orange-600 dark:text-slate-300 dark:hover:bg-slate-900 dark:hover:text-orange-400">
              Novidades
            </Link>
            <Link href="/cliente/perfil" className="rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-orange-50 hover:text-orange-600 dark:text-slate-300 dark:hover:bg-slate-900 dark:hover:text-orange-400">
              Minha area
            </Link>
          </nav>
        </div>

        {/* Lado Direito: Ações */}
        <div className="flex items-center gap-2 sm:gap-4">
          
          {/* Dark Mode Toggle */}
          <button 
            onClick={toggleDarkMode}
            className="flex h-10 w-10 items-center justify-center rounded-full text-slate-600 transition hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-900"
            title="Alternar Tema"
          >
            {darkMode ? <Icons.Sun /> : <Icons.Moon />}
          </button>

          {/* Carrinho */}
          <Link 
            href="/carrinho" 
            className="relative flex h-10 w-10 items-center justify-center rounded-full text-slate-600 transition hover:bg-orange-50 hover:text-orange-600 dark:text-slate-300 dark:hover:bg-slate-900"
          >
            <Icons.Cart />
            <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-orange-600 text-[10px] font-bold text-white ring-2 ring-white dark:ring-slate-950">
              2
            </span>
          </Link>

          {!role ? (
            <div className="flex items-center gap-2">
              <Link href="/auth/login" className="hidden text-sm font-semibold text-slate-600 hover:text-orange-600 sm:block dark:text-slate-300">
                Entrar
              </Link>
              <Link href="/auth/register" className="rounded-full bg-orange-600 px-4 py-2 text-sm font-bold text-white shadow-lg shadow-orange-200 transition hover:bg-orange-700 active:scale-95 dark:shadow-none">
                Criar Conta
              </Link>
            </div>
          ) : (
            <div ref={boxRef} className="relative">
              <button
                onClick={() => setOpen(!open)}
                className={`flex items-center gap-2 rounded-full border p-1 pr-3 transition-all ${
                  open ? "border-orange-600 bg-orange-50 dark:bg-orange-950/30" : "border-slate-200 hover:border-orange-300 dark:border-slate-800"
                }`}
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-orange-600 text-white">
                  <Icons.User />
                </div>
                <span className="hidden text-sm font-bold text-slate-700 sm:block dark:text-slate-200">{displayName}</span>
                <Icons.ChevronDown />
              </button>

              {open && (
                <div className="absolute right-0 mt-2 w-52 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl animate-in fade-in slide-in-from-top-2 dark:border-slate-800 dark:bg-slate-900">
                  <Link href={profileHref} onClick={() => setOpen(false)} className="flex items-center gap-3 px-4 py-3 text-sm text-slate-700 hover:bg-orange-50 dark:text-slate-200 dark:hover:bg-slate-800">
                    Meu Perfil
                  </Link>
                  <button
                    onClick={() => { clearSession(); window.location.href = "/"; }}
                    className="flex w-full items-center gap-3 border-t border-slate-100 px-4 py-3 text-sm font-medium text-red-500 hover:bg-red-50 dark:border-slate-800 dark:hover:bg-red-950/20"
                  >
                    Sair
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Menu Mobile */}
      {mobileMenuOpen && (
        <div className="border-t border-slate-100 bg-white p-4 animate-in slide-in-from-top md:hidden dark:border-slate-800 dark:bg-slate-950">
          <nav className="flex flex-col gap-2">
            <Link href="/catalogo" className="rounded-xl p-3 text-base font-medium text-slate-700 hover:bg-orange-50 dark:text-slate-200 dark:hover:bg-slate-900">Catálogo</Link>
            <Link href="/novidades" className="rounded-xl p-3 text-base font-medium text-slate-700 hover:bg-orange-50 dark:text-slate-200 dark:hover:bg-slate-900">Novidades</Link>
            <Link href="/cliente/perfil" className="rounded-xl p-3 text-base font-medium text-slate-700 hover:bg-orange-50 dark:text-slate-200 dark:hover:bg-slate-900">Minha area</Link>
          </nav>
        </div>
      )}
    </header>
  );
}