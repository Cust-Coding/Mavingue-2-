"use client";

import { useEffect, useState } from "react";
import UserCreateForm from "@/components/forms/UserCreateForm";
import type { Role } from "@/features/users/types";
import { UserPlus, AlertCircle } from "lucide-react";

export default function AdminUserCreatePage() {
  const [role, setRole] = useState<Role>("ADMIN");
  const [err, setErr] = useState("");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    
    (async () => {
      try {
        const res = await fetch("/api/proxy/api/auth/me", { method: "GET", credentials: "include" });
        if (!res.ok) throw new Error("Não autenticado");
        const me = await res.json();
        setRole(me?.role ?? "ADMIN");
      } catch (e: any) {
        setErr(e?.message ?? "Erro a obter sessão");
      }
    })();
  }, [mounted]);

  if (!mounted) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <div className="animate-pulse flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-100 rounded-lg"></div>
            <div>
              <div className="h-5 w-32 bg-slate-200 rounded mb-2"></div>
              <div className="h-3 w-48 bg-slate-100 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4">
      <div className="max-w-lg mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-orange-100 rounded-lg">
              <UserPlus className="w-5 h-5 text-orange-600" />
            </div>
            <h1 className="text-xl font-semibold text-slate-800">Criar utilizador</h1>
          </div>
          <p className="text-sm text-slate-500 ml-12">
            Preencha os dados para adicionar um novo utilizador ao sistema
          </p>
        </div>

        {/* Erro */}
        {err && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-3 flex items-center gap-2 text-red-700">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <p className="text-sm">{err}</p>
          </div>
        )}

        {/* Form */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-slate-100">
            <h2 className="text-sm font-medium text-slate-700">Informações do utilizador</h2>
            <p className="text-xs text-slate-400 mt-1">Campos com * são obrigatórios</p>
          </div>
          <div className="p-5">
            <UserCreateForm creatorRole={role} />
          </div>
        </div>
      </div>
    </div>
  );
}