"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { getRole, isStaff } from "@/lib/auth/session";
import {
  approveWaterRequest,
  createWaterContract,
  createWaterReading,
  listAddresses,
  listPendingWaterCustomers,
  listWaterBills,
  listWaterContracts,
  listWaterCustomers,
  listWaterReadings,
  payWaterBill,
  rejectWaterRequest,
  updateWaterContractState,
} from "@/features/water/api";
import type { AddressItem, WaterBill, WaterContract, WaterCustomer, WaterReading } from "@/features/water/types";
import { printWaterBillDocument } from "@/lib/documents/print";
import { getErrorMessage } from "@/lib/errors";
import { formatDateTime, formatMoney } from "@/lib/formatters";
import { 
  Droplets, 
  Users, 
  Activity, 
  FileText, 
  CheckCircle, 
  XCircle, 
  PlusCircle, 
  Printer,
  CreditCard,
  Home,
  MapPin
} from "lucide-react";

type PaymentMethod = "CARTEIRA_MOVEL" | "CARTAO" | "DINHEIRO_FISICO";

export default function AguaPage() {
  const [role, setRole] = useState<ReturnType<typeof getRole>>(null);
  const staffMode = isStaff(role);
  const adminMode = role === "ADMIN";

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [clientes, setClientes] = useState<WaterCustomer[]>([]);
  const [pendentes, setPendentes] = useState<WaterCustomer[]>([]);
  const [contratos, setContratos] = useState<WaterContract[]>([]);
  const [leituras, setLeituras] = useState<WaterReading[]>([]);
  const [faturas, setFaturas] = useState<WaterBill[]>([]);
  const [enderecos, setEnderecos] = useState<AddressItem[]>([]);
  const [ligacaoForm, setLigacaoForm] = useState({ consumidorId: "" });
  const [leituraForm, setLeituraForm] = useState({ ligacaoId: "", leituraActual: "", precoM3: "45" });
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("DINHEIRO_FISICO");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setRole(getRole());
  }, []);

  async function load() {
    setLoading(true);
    setError("");

    try {
      const [customerRows, contractRows, readingRows, billRows, addressRows, pendingRows] = await Promise.all([
        listWaterCustomers(),
        listWaterContracts(),
        listWaterReadings(),
        listWaterBills(),
        listAddresses(),
        adminMode ? listPendingWaterCustomers() : Promise.resolve([]),
      ]);

      setClientes(customerRows);
      setContratos(contractRows);
      setLeituras(readingRows);
      setFaturas(billRows);
      setEnderecos(addressRows);
      setPendentes(pendingRows);
    } catch (reason: unknown) {
      setError(getErrorMessage(reason, "Não foi possível carregar o módulo de água"));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (mounted && role) {
      load();
    }
  }, [adminMode, role, mounted]);

  const clientesActivos = useMemo(() => clientes.filter((cliente) => cliente.estado === "ATIVO"), [clientes]);
  const clientePorId = useMemo(() => new Map(clientes.map((cliente) => [cliente.id, cliente])), [clientes]);

  async function handleApprove(id: number) {
    setError("");
    setSuccess("");
    try {
      await approveWaterRequest(id);
      setSuccess("Pedido de água aprovado. O cliente já pode completar os dados da casa.");
      await load();
    } catch (reason: unknown) {
      setError(getErrorMessage(reason, "Não foi possível aprovar o pedido"));
    }
  }

  async function handleReject(id: number) {
    setError("");
    setSuccess("");
    try {
      await rejectWaterRequest(id);
      setSuccess("Pedido de água rejeitado.");
      await load();
    } catch (reason: unknown) {
      setError(getErrorMessage(reason, "Não foi possível rejeitar o pedido"));
    }
  }

  async function handleCreateContract() {
    setError("");
    setSuccess("");
    try {
      await createWaterContract({ consumidorId: Number(ligacaoForm.consumidorId) });
      setLigacaoForm({ consumidorId: "" });
      setSuccess("Ligação criada com sucesso.");
      await load();
    } catch (reason: unknown) {
      setError(getErrorMessage(reason, "Não foi possível criar a ligação"));
    }
  }

  async function handleToggleContract(contract: WaterContract) {
    setError("");
    setSuccess("");
    try {
      const novoEstado = contract.estado === "ATIVA" ? "CORTADA" : "ATIVA";
      await updateWaterContractState(contract.id, { estado: novoEstado });
      setSuccess(
        novoEstado === "CORTADA"
          ? "Serviço de água cortado. O cadastro foi mantido para futura reactivação."
          : "Serviço de água reactivado com sucesso."
      );
      await load();
    } catch (reason: unknown) {
      setError(getErrorMessage(reason, "Não foi possível actualizar o estado da ligação"));
    }
  }

  async function handleCreateReading() {
    setError("");
    setSuccess("");
    try {
      await createWaterReading({
        ligacaoId: Number(leituraForm.ligacaoId),
        leituraActual: Number(leituraForm.leituraActual),
        precoM3: Number(leituraForm.precoM3),
      });
      setLeituraForm({ ligacaoId: "", leituraActual: "", precoM3: "45" });
      setSuccess("Leitura registada e factura emitida automaticamente.");
      await load();
    } catch (reason: unknown) {
      setError(getErrorMessage(reason, "Não foi possível registar a leitura"));
    }
  }

  async function handlePay(id: number) {
    setError("");
    setSuccess("");
    try {
      const updated = await payWaterBill(id, { formaPagamento: paymentMethod });
      setFaturas((current) => current.map((bill) => (bill.id === updated.id ? updated : bill)));
      setSuccess("Pagamento confirmado no sistema e factura pronta para impressão.");
      printWaterBillDocument(updated);
    } catch (reason: unknown) {
      setError(getErrorMessage(reason, "Não foi possível confirmar o pagamento"));
    }
  }

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
      <div className="bg-gradient-to-r from-cyan-700 to-cyan-600 rounded-xl p-6 text-white shadow-lg">
        <div className="flex items-center gap-3 mb-2">
          <Droplets className="w-6 h-6" />
          <p className="text-xs font-semibold uppercase tracking-wider text-cyan-200">Módulo de Água</p>
        </div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
          Gestão de água
        </h1>
        <p className="mt-2 text-sm text-cyan-100 max-w-2xl">
          {adminMode 
            ? "Pedidos, ligações, leituras e faturação" 
            : "Operação de água, leitura, corte e faturação"}
        </p>
      </div>

      {/* Info da Staff */}
      {staffMode && !adminMode && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-amber-700 text-sm">
          Os pedidos pendentes são aprovados apenas pelo administrador. Aqui a equipa trata das operações do serviço e das facturas.
        </div>
      )}

      {/* Mg*/}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-red-700 text-sm">
          {error}
        </div>
      )}
      {success && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-3 text-green-700 text-sm">
          {success}
        </div>
      )}

      {/* Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs text-slate-400">Pendentes</p>
            <Activity className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-2xl font-bold text-amber-600">{pendentes.length}</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs text-slate-400">Clientes activos</p>
            <Users className="w-4 h-4 text-green-500" />
          </div>
          <p className="text-2xl font-bold text-slate-800">{clientesActivos.length}</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs text-slate-400">Ligações</p>
            <Home className="w-4 h-4 text-cyan-500" />
          </div>
          <p className="text-2xl font-bold text-slate-800">{contratos.length}</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs text-slate-400">Faturas</p>
            <FileText className="w-4 h-4 text-purple-500" />
          </div>
          <p className="text-2xl font-bold text-slate-800">{faturas.length}</p>
        </div>
      </div>

      {/* Pedidos pendentes (adM) */}
      {adminMode && pendentes.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-800 mb-4">Pedidos pendentes</h2>
          <div className="space-y-3">
            {pendentes.map((pedido) => (
              <div key={pedido.id} className="bg-amber-50 rounded-lg p-4 border border-amber-200">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div>
                    <p className="font-semibold text-slate-800">Casa #{pedido.id} - {pedido.name}</p>
                    <p className="text-sm text-slate-500">{pedido.email} • {pedido.phone}</p>
                    <p className="text-xs text-slate-400 mt-1">{pedido.observacoes || "Aguardando aprovação"}</p>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => handleApprove(pedido.id)} className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700">
                      <CheckCircle className="w-4 h-4 inline mr-1" /> Aprovar
                    </button>
                    <button onClick={() => handleReject(pedido.id)} className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700">
                      <XCircle className="w-4 h-4 inline mr-1" /> Rejeitar
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Forms */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          <h2 className="text-md font-semibold text-slate-800 mb-4 flex items-center gap-2">
            <PlusCircle className="w-4 h-4 text-cyan-500" />
            Criar ligação
          </h2>
          <div className="space-y-3">
            <select
              value={ligacaoForm.consumidorId}
              onChange={(event) => setLigacaoForm({ consumidorId: event.target.value })}
              className="w-full h-11 rounded-lg border border-slate-200 bg-white px-4 text-sm focus:outline-none focus:border-cyan-500"
            >
              <option value="">Selecionar cliente activo</option>
              {clientesActivos.map((cliente) => (
                <option key={cliente.id} value={cliente.id}>
                  #{cliente.id} - {cliente.name} - Casa {cliente.houseNR || "—"}
                </option>
              ))}
            </select>
            <button onClick={handleCreateContract} className="w-full bg-cyan-600 text-white py-2 rounded-lg hover:bg-cyan-700">
              Criar ligação activa
            </button>
          </div>
        </div>

        {/* R.Leitura */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          <h2 className="text-md font-semibold text-slate-800 mb-4 flex items-center gap-2">
            <Activity className="w-4 h-4 text-cyan-500" />
            Registrar leitura
          </h2>
          <div className="space-y-3">
            <select
              value={leituraForm.ligacaoId}
              onChange={(event) => setLeituraForm({ ...leituraForm, ligacaoId: event.target.value })}
              className="w-full h-11 rounded-lg border border-slate-200 bg-white px-4 text-sm focus:outline-none focus:border-cyan-500"
            >
              <option value="">Selecionar ligação</option>
              {contratos
                .filter((contrato) => contrato.estado === "ATIVA")
                .map((contrato) => (
                  <option key={contrato.id} value={contrato.id}>
                    Ligação #{contrato.id} - {contrato.consumidorNome}
                  </option>
                ))}
            </select>
            <Input
              placeholder="Leitura actual (m³)"
              value={leituraForm.leituraActual}
              onChange={(event) => setLeituraForm({ ...leituraForm, leituraActual: event.target.value })}
            />
            <Input
              placeholder="Preço por m³"
              value={leituraForm.precoM3}
              onChange={(event) => setLeituraForm({ ...leituraForm, precoM3: event.target.value })}
            />
            <button onClick={handleCreateReading} className="w-full bg-cyan-600 text-white py-2 rounded-lg hover:bg-cyan-700">
              Registrar e emitir fatura
            </button>
          </div>
        </div>
      </div>

      {/* Cliente water */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
        <h2 className="text-md font-semibold text-slate-800 mb-4">Clientes de água</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-3 py-2 text-left">ID</th>
                <th className="px-3 py-2 text-left">Proprietário</th>
                <th className="px-3 py-2 text-left">Local</th>
                <th className="px-3 py-2 text-left">Estado</th>
                <th className="px-3 py-2 text-left">Casa</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {clientes.slice(0, 5).map((cliente) => (
                <tr key={cliente.id} className="hover:bg-slate-50">
                  <td className="px-3 py-2 font-mono">#{cliente.id}</td>
                  <td className="px-3 py-2">{cliente.name}</td>
                  <td className="px-3 py-2">{cliente.referenciaLocal || "-"}</td>
                  <td className="px-3 py-2">
                    <span className={`px-2 py-0.5 rounded-full text-xs ${
                      cliente.estado === "ATIVO" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                    }`}>
                      {cliente.estado}
                    </span>
                  </td>
                  <td className="px-3 py-2">{cliente.houseNR || "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Ligacao */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
        <h2 className="text-md font-semibold text-slate-800 mb-4">Ligações activas e cortadas</h2>
        <div className="space-y-3">
          {contratos.length === 0 ? (
            <p className="text-slate-500 text-sm">Sem ligações registadas.</p>
          ) : (
            contratos.map((contrato) => {
              const cliente = clientePorId.get(contrato.consumidorId);
              return (
                <div key={contrato.id} className="bg-slate-50 rounded-lg p-4">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div>
                      <p className="font-semibold text-slate-800">Ligação #{contrato.id}</p>
                      <p className="text-sm text-slate-500">{contrato.consumidorNome}</p>
                      <p className="text-xs text-slate-400">Casa {contrato.houseNR || "-"} • {contrato.estado}</p>
                    </div>
                    <button
                      onClick={() => handleToggleContract(contrato)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium ${
                        contrato.estado === "ATIVA" 
                          ? "bg-red-600 text-white hover:bg-red-700" 
                          : "bg-green-600 text-white hover:bg-green-700"
                      }`}
                    >
                      {contrato.estado === "ATIVA" ? "Cortar água" : "Reactivar água"}
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Faturas */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
          <h2 className="text-md font-semibold text-slate-800">Faturas emitidas</h2>
          <select
            value={paymentMethod}
            onChange={(event) => setPaymentMethod(event.target.value as PaymentMethod)}
            className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm"
          >
            <option value="DINHEIRO_FISICO">Dinheiro físico</option>
            <option value="CARTEIRA_MOVEL">Carteira móvel</option>
            <option value="CARTAO">Cartão</option>
          </select>
        </div>

        <div className="space-y-3">
          {faturas.length === 0 ? (
            <p className="text-slate-500 text-sm">Sem faturas emitidas.</p>
          ) : (
            faturas.map((fatura) => (
              <div key={fatura.id} className="bg-slate-50 rounded-lg p-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div>
                    <p className="font-semibold text-slate-800">Factura #{fatura.id}</p>
                    <p className="text-sm text-slate-500">{fatura.consumidorNome}</p>
                    <p className="text-sm font-bold text-cyan-600">{formatMoney(fatura.valorTotal)}</p>
                    <p className="text-xs text-slate-400">{formatDateTime(fatura.data)} • {fatura.estadoPagamento}</p>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => printWaterBillDocument(fatura)} className="px-3 py-2 border border-slate-300 rounded-lg text-sm hover:bg-slate-100">
                      <Printer className="w-4 h-4 inline mr-1" /> PDF
                    </button>
                    {fatura.estadoPagamento !== "PAGO" && (
                      <button onClick={() => handlePay(fatura.id)} className="px-3 py-2 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700">
                        <CreditCard className="w-4 h-4 inline mr-1" /> Pagar
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </main>
  );
}