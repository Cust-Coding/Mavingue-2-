"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { listUsers } from "@/features/users/api";
import type { UserResponse } from "@/features/users/types";
import { Users, RefreshCw, UserPlus, Shield, Mail, User, AlertCircle } from "lucide-react";
import { ReactElement } from "react";

export default function AdminUsersPage() {
  const [items, setItems] = useState<UserResponse[]>([]);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  async function load() {
    setErr("");
    setLoading(true);
    try {
      const data = await listUsers();
      setItems(data);
    } catch (e: any) {
      setErr(e?.message ?? "Erro ao carregar utilizadores");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (mounted) {
      load();
    }
  }, [mounted]);

  const getRoleBadge = (role: string) => {
    const styles: Record<string, { bg: string; text: string; icon: ReactElement }> = {
      ADMIN: { bg: "bg-red-100", text: "text-red-700", icon: <Shield className="w-3 h-3" /> },
      STAFF: { bg: "bg-blue-100", text: "text-blue-700", icon: <User className="w-3 h-3" /> },
      FUNCIONARIO: { bg: "bg-purple-100", text: "text-purple-700", icon: <User className="w-3 h-3" /> },
      CLIENTE: { bg: "bg-green-100", text: "text-green-700", icon: <User className="w-3 h-3" /> },
    };
    const style = styles[role] || styles.CLIENTE;
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${style.bg} ${style.text}`}>
        {style.icon}
        {role}
      </span>
    );
  };

  if (!mounted) {
    return (
      <div className="p-4 md:p-6">
        <div className="bg-white rounded-xl border border-slate-200 p-4 md:p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-100 rounded-lg">
              <Users className="w-5 h-5 md:w-6 md:h-6 text-orange-600" />
            </div>
            <h2 className="text-lg md:text-xl font-semibold text-slate-800">Utilizadores</h2>
          </div>
          <p className="text-slate-500 text-sm mt-2">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 space-y-4 md:space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 md:p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-100 rounded-lg">
              <Users className="w-5 h-5 md:w-6 md:h-6 text-orange-600" />
            </div>
            <div>
              <h2 className="text-lg md:text-xl font-semibold text-slate-800">Utilizadores</h2>
              <p className="text-xs md:text-sm text-slate-500">Gestão de utilizadores do sistema</p>
            </div>
          </div>
          <Link href="/admin/utilizadores/novo">
            <Button className="flex items-center justify-center gap-2 bg-orange-600 hover:bg-orange-700 w-full sm:w-auto">
              <UserPlus className="w-4 h-4" />
              <span>Criar utilizador</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Erro */}
      {err && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-3 md:p-4 flex items-center gap-2 md:gap-3 text-red-700">
          <AlertCircle className="w-4 h-4 md:w-5 md:h-5 flex-shrink-0" />
          <p className="text-xs md:text-sm">{err}</p>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="bg-white rounded-xl border border-slate-200 p-8 md:p-12 text-center">
          <div className="animate-spin rounded-full h-6 w-6 md:h-8 md:w-8 border-b-2 border-orange-600 mx-auto mb-3"></div>
          <p className="text-slate-500 text-xs md:text-sm">Carregando utilizadores...</p>
        </div>
      )}

      {!loading && !err && items.length > 0 && (
        <>
          <div className="hidden lg:block bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
            <div className="grid grid-cols-12 gap-4 p-4 bg-slate-50 border-b border-slate-200 text-sm font-semibold text-slate-600">
              <div className="col-span-1">ID</div>
              <div className="col-span-4">Nome</div>
              <div className="col-span-4">Email</div>
              <div className="col-span-3">Role</div>
            </div>
            <div className="divide-y divide-slate-100">
              {items.map((u) => (
                <div key={u.id} className="grid grid-cols-12 gap-4 p-4 hover:bg-slate-50 transition-colors">
                  <div className="col-span-1 text-sm text-slate-700 font-mono">#{u.id}</div>
                  <div className="col-span-4 text-sm text-slate-800 font-medium">{u.nome}</div>
                  <div className="col-span-4 text-sm text-slate-600 truncate">{u.email}</div>
                  <div className="col-span-3">{getRoleBadge(u.role)}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:hidden space-y-3">
            {items.map((u) => (
              <div key={u.id} className="bg-white rounded-xl border border-slate-200 p-4 hover:shadow-sm transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center">
                      <User className="w-4 h-4 text-orange-600" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-800">{u.nome}</p>
                      <p className="text-xs text-slate-400 font-mono">ID: #{u.id}</p>
                    </div>
                  </div>
                  {getRoleBadge(u.role)}
                </div>
                <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                  <Mail className="w-3 h-3 text-slate-400 flex-shrink-0" />
                  <p className="text-xs text-slate-600 truncate">{u.email}</p>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {!loading && !err && items.length === 0 && (
        <div className="bg-white rounded-xl border border-slate-200 p-8 md:p-12 text-center">
          <Users className="w-10 h-10 md:w-12 md:h-12 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500 text-sm md:text-base">Sem utilizadores para mostrar</p>
          <Link href="/admin/utilizadores/novo" className="text-orange-600 text-sm hover:underline mt-2 inline-block">
            Criar primeiro utilizador
          </Link>
        </div>
      )}

      {!loading && (
        <div className="flex justify-end">
          <button
            onClick={load}
            className="flex items-center gap-2 px-3 py-1.5 md:px-4 md:py-2 text-xs md:text-sm text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
          >
            <RefreshCw className="w-3 h-3 md:w-4 md:h-4" />
            Recarregar
          </button>
        </div>
      )}
    </div>
  );
}