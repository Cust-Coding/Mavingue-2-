"use client";

import { useEffect, useMemo, useState, ReactElement } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { clientApi } from "@/features/client/api";
import type { ClientProfile } from "@/features/client/types";
import {
  completeClientWaterRequest,
  createClientWaterRequest,
  listAddresses,
  listClientWaterBills,
  listClientWaterContracts,
  listClientWaterReadings,
} from "@/features/water/api";
import type { AddressItem, WaterBill, WaterContract, WaterCustomer, WaterReading } from "@/features/water/types";
import { printWaterBillDocument } from "@/lib/documents/print";
import { getErrorMessage } from "@/lib/errors";
import { formatDateTime, formatMoney } from "@/lib/formatters";
import { 
  Droplets, 
  Home, 
  MapPin, 
  Phone, 
  Mail, 
  FileText, 
  Printer,
  CheckCircle,
  Clock,
  AlertCircle,
  PlusCircle,
  Building2
} from "lucide-react";

type CompletionFormMap = Record<number, { houseNR: string; adressId: string }>;

export default function ClienteAguaPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [profile, setProfile] = useState<ClientProfile | null>(null);
  const [enderecos, setEnderecos] = useState<AddressItem[]>([]);
  const [contratos, setContratos] = useState<WaterContract[]>([]);
  const [leituras, setLeituras] = useState<WaterReading[]>([]);
  const [faturas, setFaturas] = useState<WaterBill[]>([]);
  const [requestForm, setRequestForm] = useState({ referenciaLocal: "", observacoes: "" });
  const [completionForms, setCompletionForms] = useState<CompletionFormMap>({});
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  async function load() {
    setLoading(true);
    setError("");
    try {
      const [profileData, addressRows, contractRows, readingRows, billRows] = await Promise.all([
        clientApi.profile(),
        listAddresses(),
        listClientWaterContracts(),
        listClientWaterReadings(),
        listClientWaterBills(),
      ]);
      setProfile(profileData);
      setEnderecos(addressRows);
      setContratos(contractRows);
      setLeituras(readingRows);
      setFaturas(billRows);
      setCompletionForms(
        profileData.waterCustomers.reduce<CompletionFormMap>((acc, item) => {
          acc[item.id] = {
            houseNR: item.houseNR || "",
            adressId: item.adressId ? String(item.adressId) : "",
          };
          return acc;
        }, {})
      );
    } catch (reason: unknown) {
      setError(getErrorMessage(reason, "Nao foi possivel carregar a area de agua"));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (mounted) {
      load();
    }
  }, [mounted]);

  const waterCustomers = profile?.waterCustomers ?? [];
  const customerById = useMemo(() => new Map(waterCustomers.map((item) => [item.id, item])), [waterCustomers]);

  async function submitRequest() {
    setError("");
    setSuccess("");
    try {
      await createClientWaterRequest({
        referenciaLocal: requestForm.referenciaLocal.trim(),
        observacoes: requestForm.observacoes.trim() || undefined,
      });
      setRequestForm({ referenciaLocal: "", observacoes: "" });
      setSuccess("Pedido de agua enviado com sucesso. Aguarde aprovacao do administrador.");
      await load();
    } catch (reason: unknown) {
      setError(getErrorMessage(reason, "Nao foi possivel criar o pedido de agua"));
    }
  }

  async function submitCompletion(requestId: number) {
    const current = completionForms[requestId];
    setError("");
    setSuccess("");
    try {
      await completeClientWaterRequest(requestId, {
        houseNR: current.houseNR,
        adressId: Number(current.adressId),
      });
      setSuccess("Dados da casa enviados. O servico de agua desta conta ja esta activo.");
      await load();
    } catch (reason: unknown) {
      setError(getErrorMessage(reason, "Nao foi possivel guardar os dados da casa"));
    }
  }

  const getEstadoBadge = (estado: string) => {
    const styles: Record<string, { bg: string; text: string; icon: ReactElement }> = {
      ATIVO: { bg: "bg-green-100", text: "text-green-700", icon: <CheckCircle className="w-3 h-3" /> },
      PENDENTE_APROVACAO: { bg: "bg-yellow-100", text: "text-yellow-700", icon: <Clock className="w-3 h-3" /> },
      AGUARDANDO_DADOS_CASA: { bg: "bg-blue-100", text: "text-blue-700", icon: <Home className="w-3 h-3" /> },
      INATIVO: { bg: "bg-red-100", text: "text-red-700", icon: <AlertCircle className="w-3 h-3" /> },
    };
    const style = styles[estado] || styles.INATIVO;
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${style.bg} ${style.text}`}>
        {style.icon}
        {estado === "PENDENTE_APROVACAO" ? "Pendente" : estado === "AGUARDANDO_DADOS_CASA" ? "Aguardando dados" : estado}
      </span>
    );
  };

  if (!mounted) {
    return (
      <div className="p-6">
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-cyan-100 rounded-lg">
              <Droplets className="w-5 h-5 text-cyan-600" />
            </div>
            <h2 className="text-xl font-semibold text-slate-800">Módulo de Água</h2>
          </div>
          <p className="text-slate-500 text-sm mt-2">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <main className="p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-cyan-700 to-cyan-800 rounded-xl p-6 text-white shadow-lg">
        <div className="flex items-center gap-3 mb-2">
          <Droplets className="w-6 h-6" />
          <p className="text-xs font-semibold uppercase tracking-wider text-cyan-200">Módulo de Água</p>
        </div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
          Pedidos e contas de água
        </h1>
        <p className="mt-2 text-sm text-cyan-100 max-w-2xl">
          Aqui pode pedir água para uma ou mais casas. Cada pedido fica pendente para aprovação e depois completa os dados finais da casa para ativar o serviço.
        </p>
      </div>

      {/* Messages */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-red-700 text-sm flex items-center gap-2">
          <AlertCircle className="w-4 h-4" />
          {error}
        </div>
      )}
      {success && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-3 text-green-700 text-sm flex items-center gap-2">
          <CheckCircle className="w-4 h-4" />
          {success}
        </div>
      )}

      {loading && (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-600 mx-auto mb-3"></div>
          <p className="text-slate-500 text-sm">A carregar módulo de água...</p>
        </div>
      )}

      {!loading && (
        <>
          {/* Pedir nova conta */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <PlusCircle className="w-5 h-5 text-cyan-600" />
              <h2 className="text-lg font-semibold text-slate-800">Pedir nova conta de água</h2>
            </div>
            <p className="text-sm text-slate-500 mb-4">
              Use esta secção quando tiver outra casa ou novo local. O administrador aprova primeiro e depois completa o número da casa e a zona.
            </p>
            <div className="grid gap-3 sm:grid-cols-2">
              <Input
                value={requestForm.referenciaLocal}
                onChange={(event) => setRequestForm((current) => ({ ...current, referenciaLocal: event.target.value }))}
                placeholder="Ex.: Casa da Matola, Talhão 7"
              />
              <Input
                value={requestForm.observacoes}
                onChange={(event) => setRequestForm((current) => ({ ...current, observacoes: event.target.value }))}
                placeholder="Observações (opcional)"
              />
              <Button onClick={submitRequest} className="bg-cyan-600 hover:bg-cyan-700 sm:col-span-2">
                Enviar pedido
              </Button>
            </div>
          </div>

          {/* Contas e pedidos */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-800 mb-4">As suas contas e pedidos</h2>
            
            {waterCustomers.length === 0 ? (
              <p className="text-sm text-slate-500 text-center py-8">A sua conta ainda não tem pedidos de água associados.</p>
            ) : (
              <div className="space-y-4">
                {waterCustomers.map((waterCustomer) => (
                  <div key={waterCustomer.id} className="border border-slate-200 rounded-lg p-4 hover:shadow-sm transition">
                    <div className="flex flex-wrap justify-between items-start gap-3 mb-3">
                      <div className="flex items-center gap-2">
                        <Home className="w-4 h-4 text-cyan-600" />
                        <h3 className="font-semibold text-slate-800">Casa #{waterCustomer.id}</h3>
                      </div>
                      {getEstadoBadge(waterCustomer.estado)}
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3 text-sm">
                      <div className="flex items-center gap-2">
                        <Building2 className="w-3.5 h-3.5 text-slate-400" />
                        <span className="text-slate-600">{waterCustomer.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="w-3.5 h-3.5 text-slate-400" />
                        <span className="text-slate-600">{waterCustomer.phone}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Mail className="w-3.5 h-3.5 text-slate-400" />
                        <span className="text-slate-600">{waterCustomer.email}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        <span className="text-slate-600">{waterCustomer.referenciaLocal || "Sem local"}</span>
                      </div>
                    </div>

                    {waterCustomer.estado === "AGUARDANDO_DADOS_CASA" ? (
                      <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                        <h4 className="text-sm font-semibold text-blue-800 mb-3">Completar dados da casa</h4>
                        <div className="grid gap-3 sm:grid-cols-2">
                          <Input
                            value={completionForms[waterCustomer.id]?.houseNR || ""}
                            onChange={(event) =>
                              setCompletionForms((current) => ({
                                ...current,
                                [waterCustomer.id]: {
                                  ...(current[waterCustomer.id] ?? { houseNR: "", adressId: "" }),
                                  houseNR: event.target.value,
                                },
                              }))
                            }
                            placeholder="Número da casa"
                          />
                          <select
                            value={completionForms[waterCustomer.id]?.adressId || ""}
                            onChange={(event) =>
                              setCompletionForms((current) => ({
                                ...current,
                                [waterCustomer.id]: {
                                  ...(current[waterCustomer.id] ?? { houseNR: "", adressId: "" }),
                                  adressId: event.target.value,
                                },
                              }))
                            }
                            className="h-11 rounded-lg border border-slate-200 bg-white px-3 text-sm focus:outline-none focus:border-cyan-500"
                          >
                            <option value="">Selecionar zona</option>
                            {enderecos.map((endereco) => (
                              <option key={endereco.id} value={endereco.id}>
                                {endereco.name} - {endereco.bairro}
                              </option>
                            ))}
                          </select>
                          <Button onClick={() => submitCompletion(waterCustomer.id)} className="bg-cyan-600 hover:bg-cyan-700 sm:col-span-2">
                            Guardar dados da casa
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <p className="text-xs text-slate-400 mt-2">
                        {waterCustomer.estado === "PENDENTE_APROVACAO"
                          ? "⏳ Aguardando aprovação do administrador."
                          : waterCustomer.estado === "ATIVO"
                          ? "✅ Conta activa e pronta para gestão."
                          : "📋 Pedido em análise."}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Ligações e leituras em grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Ligações */}
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
              <h2 className="text-md font-semibold text-slate-800 mb-4 flex items-center gap-2">
                <Home className="w-4 h-4 text-cyan-600" />
                Ligações
              </h2>
              {contratos.length === 0 ? (
                <p className="text-sm text-slate-500 text-center py-6">Sem ligações activas.</p>
              ) : (
                <div className="space-y-3">
                  {contratos.map((contrato) => {
                    const cliente = customerById.get(contrato.consumidorId);
                    return (
                      <div key={contrato.id} className="bg-slate-50 rounded-lg p-3">
                        <p className="font-medium text-slate-800">Ligação #{contrato.id}</p>
                        <p className="text-xs text-slate-500">{contrato.consumidorNome}</p>
                        <p className="text-xs text-slate-400 mt-1">Estado: {contrato.estado}</p>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Leituras */}
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
              <h2 className="text-md font-semibold text-slate-800 mb-4 flex items-center gap-2">
                <FileText className="w-4 h-4 text-cyan-600" />
                Leituras
              </h2>
              {leituras.length === 0 ? (
                <p className="text-sm text-slate-500 text-center py-6">Sem leituras registadas.</p>
              ) : (
                <div className="space-y-3">
                  {leituras.slice(0, 5).map((leitura) => {
                    const contrato = contratos.find((item) => item.id === leitura.ligacaoId);
                    return (
                      <div key={leitura.id} className="bg-slate-50 rounded-lg p-3">
                        <p className="text-xs text-slate-500">{formatDateTime(leitura.data)}</p>
                        <p className="text-sm font-medium text-slate-800">{leitura.consumoM3} m³</p>
                        <p className="text-xs text-orange-600 font-semibold">{formatMoney(leitura.valorPagar)}</p>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Faturas */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
            <h2 className="text-md font-semibold text-slate-800 mb-4 flex items-center gap-2">
              <FileText className="w-4 h-4 text-cyan-600" />
              Faturas emitidas
            </h2>
            {faturas.length === 0 ? (
              <p className="text-sm text-slate-500 text-center py-6">Sem faturas emitidas.</p>
            ) : (
              <div className="space-y-3">
                {faturas.map((fatura) => {
                  const cliente = customerById.get(fatura.consumidorId);
                  return (
                    <div key={fatura.id} className="flex flex-wrap items-center justify-between gap-3 bg-slate-50 rounded-lg p-3">
                      <div>
                        <p className="font-medium text-slate-800 text-sm">Factura #{fatura.id}</p>
                        <p className="text-xs text-slate-500">{formatDateTime(fatura.data)}</p>
                        <p className="text-sm font-bold text-orange-600">{formatMoney(fatura.valorTotal)}</p>
                        <p className="text-xs text-slate-400">{fatura.estadoPagamento}</p>
                      </div>
                      <button
                        onClick={() => printWaterBillDocument(fatura)}
                        className="flex items-center gap-1 px-3 py-1.5 text-sm text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-100 transition"
                      >
                        <Printer className="w-3.5 h-3.5" />
                        PDF
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </>
      )}
    </main>
  );
}