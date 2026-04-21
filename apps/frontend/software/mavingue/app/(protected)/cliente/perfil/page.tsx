"use client";

import { useEffect, useState } from "react";
import { Empty, ErrorBox, Loading } from "@/components/ui/State";
import { clientApi } from "@/features/client/api";
import type { ClientProfile } from "@/features/client/types";
import { User, Mail, Shield, Phone, MapPin, FileText, Droplets, Home, Map, Building } from "lucide-react";

export default function Perfil() {
  const [profile, setProfile] = useState<ClientProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    
    (async () => {
      setLoading(true);
      setErr("");

      try {
        setProfile(await clientApi.profile());
      } catch (error: any) {
        setErr(error?.message ?? "Erro ao carregar o perfil");
      } finally {
        setLoading(false);
      }
    })();
  }, [mounted]);

  if (!mounted) {
    return (
      <div className="p-6">
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-100 rounded-lg">
              <User className="w-5 h-5 text-orange-600" />
            </div>
            <h2 className="text-xl font-semibold text-slate-800">Perfil</h2>
          </div>
          <p className="text-slate-500 text-sm mt-2">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-orange-100 rounded-lg">
            <User className="w-5 h-5 text-orange-600" />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-slate-800">Perfil</h1>
            <p className="text-sm text-slate-500">Dados da conta, cadastro comercial e módulo de água</p>
          </div>
        </div>
      </div>

      {loading && <Loading />}
      {err && <ErrorBox text={err} />}

      {!loading && !err && profile && (
        <>
          {/* Conta */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-orange-600" />
                <h2 className="text-md font-semibold text-slate-800">Conta</h2>
              </div>
            </div>
            <div className="p-5 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3">
                <span className="text-sm font-medium text-slate-500 w-24">Nome</span>
                <span className="text-sm text-slate-800">{profile.account.nome}</span>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3">
                <span className="text-sm font-medium text-slate-500 w-24">Email</span>
                <div className="flex items-center gap-1">
                  <Mail className="w-3 h-3 text-slate-400" />
                  <span className="text-sm text-slate-800">{profile.account.email}</span>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3">
                <span className="text-sm font-medium text-slate-500 w-24">Role</span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 text-xs font-medium">
                  <Shield className="w-3 h-3" />
                  {profile.account.role}
                </span>
              </div>
            </div>
          </div>

          {/* Cadastro de Cliente */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-orange-600" />
                <h2 className="text-md font-semibold text-slate-800">Cadastro de Cliente</h2>
              </div>
            </div>
            <div className="p-5">
              {profile.customer ? (
                <div className="space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3">
                    <span className="text-sm font-medium text-slate-500 w-24">Nome</span>
                    <span className="text-sm text-slate-800">{profile.customer.name}</span>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3">
                    <span className="text-sm font-medium text-slate-500 w-24">Telefone</span>
                    <div className="flex items-center gap-1">
                      <Phone className="w-3 h-3 text-slate-400" />
                      <span className="text-sm text-slate-800">{profile.customer.phone}</span>
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3">
                    <span className="text-sm font-medium text-slate-500 w-24">Morada</span>
                    <div className="flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-slate-400" />
                      <span className="text-sm text-slate-800">
                        {profile.customer.endereco}, {profile.customer.bairro}, {profile.customer.cidade}
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3">
                    <span className="text-sm font-medium text-slate-500 w-24">Documento</span>
                    <span className="text-sm text-slate-800">
                      {profile.customer.tipoDocumento || "-"} {profile.customer.numeroDocumento || ""}
                    </span>
                  </div>
                </div>
              ) : (
                <Empty text="Não existe cadastro comercial ligado a este email." />
              )}
            </div>
          </div>

          {/* Contas e Pedidos de Água */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Droplets className="w-4 h-4 text-cyan-600" />
                <h2 className="text-md font-semibold text-slate-800">Contas e Pedidos de Água</h2>
              </div>
            </div>
            <div className="p-5">
              {profile.waterCustomers.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {profile.waterCustomers.map((waterCustomer) => (
                    <div key={waterCustomer.id} className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                      <div className="flex items-center gap-2 mb-3">
                        <Home className="w-4 h-4 text-cyan-600" />
                        <span className="text-sm font-semibold text-slate-800">Casa #{waterCustomer.id}</span>
                      </div>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-slate-500">Proprietário</span>
                          <span className="text-slate-700 font-medium">{waterCustomer.name}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">Telefone</span>
                          <span className="text-slate-700">{waterCustomer.phone}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">Local</span>
                          <span className="text-slate-700">{waterCustomer.referenciaLocal || "-"}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">Estado</span>
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                            waterCustomer.estado === "ATIVO" 
                              ? "bg-green-100 text-green-700" 
                              : "bg-red-100 text-red-700"
                          }`}>
                            {waterCustomer.estado}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">Casa</span>
                          <span className="text-slate-700">{waterCustomer.houseNR || "-"}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">Zona</span>
                          <span className="text-slate-700">{waterCustomer.adress || "-"}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <Empty text="Não existe cadastro de água ligado a este email." />
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}