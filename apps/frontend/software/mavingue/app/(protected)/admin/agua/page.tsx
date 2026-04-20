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
      setError(getErrorMessage(reason, "Nao foi possivel carregar o modulo de agua"));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    setRole(getRole());
  }, []);

  useEffect(() => {
    if (!role) return;
    load();
  }, [adminMode, role]);

  const clientesActivos = useMemo(() => clientes.filter((cliente) => cliente.estado === "ATIVO"), [clientes]);
  const clientePorId = useMemo(() => new Map(clientes.map((cliente) => [cliente.id, cliente])), [clientes]);

  async function handleApprove(id: number) {
    setError("");
    setSuccess("");
    try {
      await approveWaterRequest(id);
      setSuccess("Pedido de agua aprovado. O cliente ja pode completar os dados da casa.");
      await load();
    } catch (reason: unknown) {
      setError(getErrorMessage(reason, "Nao foi possivel aprovar o pedido"));
    }
  }

  async function handleReject(id: number) {
    setError("");
    setSuccess("");
    try {
      await rejectWaterRequest(id);
      setSuccess("Pedido de agua rejeitado.");
      await load();
    } catch (reason: unknown) {
      setError(getErrorMessage(reason, "Nao foi possivel rejeitar o pedido"));
    }
  }

  async function handleCreateContract() {
    setError("");
    setSuccess("");
    try {
      await createWaterContract({ consumidorId: Number(ligacaoForm.consumidorId) });
      setLigacaoForm({ consumidorId: "" });
      setSuccess("Ligacao criada com sucesso.");
      await load();
    } catch (reason: unknown) {
      setError(getErrorMessage(reason, "Nao foi possivel criar a ligacao"));
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
          ? "Servico de agua marcado como cortado. O cadastro foi mantido para futura reactivacao."
          : "Servico de agua reactivado com sucesso."
      );
      await load();
    } catch (reason: unknown) {
      setError(getErrorMessage(reason, "Nao foi possivel actualizar o estado da ligacao"));
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
      setError(getErrorMessage(reason, "Nao foi possivel registar a leitura"));
    }
  }

  async function handlePay(id: number) {
    setError("");
    setSuccess("");
    try {
      const updated = await payWaterBill(id, { formaPagamento: paymentMethod });
      setFaturas((current) => current.map((bill) => (bill.id === updated.id ? updated : bill)));
      setSuccess("Pagamento confirmado no sistema e factura pronta para impressao.");
      printWaterBillDocument(updated);
    } catch (reason: unknown) {
      setError(getErrorMessage(reason, "Nao foi possivel confirmar o pagamento"));
    }
  }

  return (
    <main className="grid gap-6">
      <section className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/70">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">Agua</p>
        <h1 className="mt-3 text-3xl font-black tracking-tight text-slate-900 dark:text-white">
          {adminMode ? "Pedidos, ligacoes, leituras e faturacao" : "Operacao de agua, leitura, corte e faturacao"}
        </h1>
        <p className="mt-3 max-w-4xl text-base leading-7 text-slate-500 dark:text-slate-400">
          O cliente pode pedir uma ou mais contas de agua. O administrador aprova o pedido, o cliente completa a casa
          e depois a equipa gere ligacao, corte, reactivacao, leitura, pagamento e impressao da factura.
        </p>
      </section>

      {staffMode ? (
        <div className="rounded-[24px] border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          Os pedidos pendentes sao aprovados apenas pelo administrador. Aqui a equipa trata das operacoes do servico e
          das facturas.
        </div>
      ) : null}

      {error ? <div className="rounded-[24px] border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div> : null}
      {success ? <div className="rounded-[24px] border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{success}</div> : null}

      <section className="grid gap-4 xl:grid-cols-4">
        <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900/70">
          <div className="text-xs uppercase tracking-[0.2em] text-slate-400">Pendentes</div>
          <div className="mt-2 text-3xl font-black text-orange-600">{pendentes.length}</div>
        </div>
        <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900/70">
          <div className="text-xs uppercase tracking-[0.2em] text-slate-400">Clientes activos</div>
          <div className="mt-2 text-3xl font-black text-slate-900 dark:text-white">{clientesActivos.length}</div>
        </div>
        <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900/70">
          <div className="text-xs uppercase tracking-[0.2em] text-slate-400">Ligacoes</div>
          <div className="mt-2 text-3xl font-black text-slate-900 dark:text-white">{contratos.length}</div>
        </div>
        <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900/70">
          <div className="text-xs uppercase tracking-[0.2em] text-slate-400">Faturas</div>
          <div className="mt-2 text-3xl font-black text-slate-900 dark:text-white">{faturas.length}</div>
        </div>
      </section>

      {adminMode ? (
        <section className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/70">
          <h2 className="text-2xl font-black text-slate-900 dark:text-white">Pedidos pendentes</h2>
          {loading ? <div className="mt-4 text-sm text-slate-500">A carregar pedidos...</div> : null}
          {!loading && pendentes.length === 0 ? <div className="mt-4 text-sm text-slate-500">Sem pedidos pendentes.</div> : null}
          {!loading && pendentes.length > 0 ? (
            <div className="mt-5 grid gap-4">
              {pendentes.map((pedido) => (
                <article key={pedido.id} className="rounded-[24px] border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950">
                  <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                    <div className="grid gap-2">
                      <div className="text-lg font-black text-slate-900 dark:text-white">
                        Casa ID #{pedido.id} - {pedido.name}
                      </div>
                      <div className="text-sm text-slate-500 dark:text-slate-400">{pedido.email} - {pedido.phone}</div>
                      <div className="text-sm text-slate-500 dark:text-slate-400">
                        Local pedido: {pedido.referenciaLocal || "Sem referencia"}
                      </div>
                      <div className="text-sm text-slate-500 dark:text-slate-400">{pedido.observacoes || "Pedido aguardando aprovacao."}</div>
                    </div>
                    <div className="flex gap-3">
                      <Button type="button" onClick={() => handleApprove(pedido.id)}>Aprovar</Button>
                      <Button type="button" variant="destructive" onClick={() => handleReject(pedido.id)}>Rejeitar</Button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          ) : null}
        </section>
      ) : null}

      <section className="grid gap-6 xl:grid-cols-2">
        <div className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/70">
          <h2 className="text-2xl font-black text-slate-900 dark:text-white">Criar ligacao</h2>
          <div className="mt-4 grid gap-3">
            <select
              value={ligacaoForm.consumidorId}
              onChange={(event) => setLigacaoForm({ consumidorId: event.target.value })}
              className="h-11 rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
            >
              <option value="">Seleccionar cliente activo</option>
              {clientesActivos.map((cliente) => (
                <option key={cliente.id} value={cliente.id}>
                  #{cliente.id} - {cliente.name} - {cliente.referenciaLocal || "Sem local"} - Casa {cliente.houseNR || "sem numero"}
                </option>
              ))}
            </select>
            <Button type="button" onClick={handleCreateContract}>Criar ligacao activa</Button>
          </div>
        </div>

        <div className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/70">
          <h2 className="text-2xl font-black text-slate-900 dark:text-white">Registar leitura</h2>
          <div className="mt-4 grid gap-3">
            <select
              value={leituraForm.ligacaoId}
              onChange={(event) => setLeituraForm({ ...leituraForm, ligacaoId: event.target.value })}
              className="h-11 rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
            >
              <option value="">Seleccionar ligacao</option>
              {contratos
                .filter((contrato) => contrato.estado === "ATIVA")
                .map((contrato) => {
                  const cliente = clientePorId.get(contrato.consumidorId);
                  return (
                    <option key={contrato.id} value={contrato.id}>
                      Ligacao #{contrato.id} - Casa ID #{contrato.consumidorId} - {contrato.consumidorNome} - {cliente?.referenciaLocal || "Sem local"}
                    </option>
                  );
                })}
            </select>
            <Input
              placeholder="Leitura actual"
              value={leituraForm.leituraActual}
              onChange={(event) => setLeituraForm({ ...leituraForm, leituraActual: event.target.value })}
            />
            <Input
              placeholder="Preco por m3"
              value={leituraForm.precoM3}
              onChange={(event) => setLeituraForm({ ...leituraForm, precoM3: event.target.value })}
            />
            <Button type="button" onClick={handleCreateReading}>Registar leitura e emitir fatura</Button>
          </div>
        </div>
      </section>

      <section className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/70">
        <h2 className="text-2xl font-black text-slate-900 dark:text-white">Clientes de agua</h2>
        <div className="mt-5 overflow-x-auto rounded-[24px] border border-slate-200 dark:border-slate-800">
          <table className="min-w-full border-collapse">
            <thead className="bg-slate-50 dark:bg-slate-950">
              <tr>
                <th className="px-4 py-3 text-left text-xs uppercase tracking-[0.2em] text-slate-400">Casa ID</th>
                <th className="px-4 py-3 text-left text-xs uppercase tracking-[0.2em] text-slate-400">Proprietario</th>
                <th className="px-4 py-3 text-left text-xs uppercase tracking-[0.2em] text-slate-400">Local</th>
                <th className="px-4 py-3 text-left text-xs uppercase tracking-[0.2em] text-slate-400">Estado</th>
                <th className="px-4 py-3 text-left text-xs uppercase tracking-[0.2em] text-slate-400">Casa</th>
                <th className="px-4 py-3 text-left text-xs uppercase tracking-[0.2em] text-slate-400">Zona</th>
              </tr>
            </thead>
            <tbody>
              {clientes.map((cliente) => (
                <tr key={cliente.id} className="border-t border-slate-200 dark:border-slate-800">
                  <td className="px-4 py-3 text-sm font-bold text-slate-900 dark:text-white">#{cliente.id}</td>
                  <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-300">{cliente.name}</td>
                  <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-300">{cliente.referenciaLocal || "-"}</td>
                  <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-300">{cliente.estado}</td>
                  <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-300">{cliente.houseNR || "-"}</td>
                  <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-300">{cliente.adress || "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <div className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/70">
          <h2 className="text-2xl font-black text-slate-900 dark:text-white">Ligacoes activas e cortadas</h2>
          <div className="mt-5 grid gap-3">
            {contratos.length === 0 ? <div className="text-sm text-slate-500">Sem ligacoes registadas.</div> : contratos.map((contrato) => {
              const cliente = clientePorId.get(contrato.consumidorId);
              return (
                <article key={contrato.id} className="rounded-[24px] border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950">
                  <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                    <div>
                      <div className="text-base font-black text-slate-900 dark:text-white">
                        Ligacao #{contrato.id} - Casa ID #{contrato.consumidorId}
                      </div>
                      <div className="text-sm text-slate-500 dark:text-slate-400">
                        Proprietario: {contrato.consumidorNome} - Local: {cliente?.referenciaLocal || "Sem local"}
                      </div>
                      <div className="text-sm text-slate-500 dark:text-slate-400">
                        Casa {contrato.houseNR || "-"} - Estado {contrato.estado} - Operador {contrato.funcionarioNome}
                      </div>
                    </div>
                    <Button type="button" variant={contrato.estado === "ATIVA" ? "destructive" : "secondary"} onClick={() => handleToggleContract(contrato)}>
                      {contrato.estado === "ATIVA" ? "Cortar agua" : "Reactivar agua"}
                    </Button>
                  </div>
                </article>
              );
            })}
          </div>
        </div>

        <div className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/70">
          <h2 className="text-2xl font-black text-slate-900 dark:text-white">Enderecos disponiveis</h2>
          <div className="mt-5 grid gap-3">
            {enderecos.map((endereco) => (
              <article key={endereco.id} className="rounded-[24px] border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950">
                <div className="text-base font-black text-slate-900 dark:text-white">{endereco.name}</div>
                <div className="text-sm text-slate-500 dark:text-slate-400">{endereco.bairro}</div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/70">
        <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
          <h2 className="text-2xl font-black text-slate-900 dark:text-white">Faturas emitidas</h2>
          <select
            value={paymentMethod}
            onChange={(event) => setPaymentMethod(event.target.value as PaymentMethod)}
            className="h-11 rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
          >
            <option value="DINHEIRO_FISICO">Dinheiro fisico</option>
            <option value="CARTEIRA_MOVEL">Carteira movel</option>
            <option value="CARTAO">Cartao</option>
          </select>
        </div>

        <div className="mt-5 grid gap-4">
          {faturas.length === 0 ? <div className="text-sm text-slate-500">Sem faturas emitidas.</div> : faturas.map((fatura) => {
            const cliente = clientePorId.get(fatura.consumidorId);
            return (
              <article key={fatura.id} className="rounded-[24px] border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950">
                <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                  <div>
                    <div className="text-lg font-black text-slate-900 dark:text-white">
                      Factura #{fatura.id} - Casa ID #{fatura.consumidorId}
                    </div>
                    <div className="text-sm text-slate-500 dark:text-slate-400">
                      Proprietario: {fatura.consumidorNome} - Local: {cliente?.referenciaLocal || "Sem local"}
                    </div>
                    <div className="text-sm text-slate-500 dark:text-slate-400">
                      Casa {fatura.houseNR || "-"} - {formatDateTime(fatura.data)} - {formatMoney(fatura.valorTotal)}
                    </div>
                    <div className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                      Estado: {fatura.estadoPagamento} - Pagamento: {fatura.formaPagamento}
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <Button type="button" variant="secondary" onClick={() => printWaterBillDocument(fatura)}>
                      Imprimir PDF
                    </Button>
                    {fatura.estadoPagamento !== "PAGO" ? (
                      <Button type="button" onClick={() => handlePay(fatura.id)}>
                        Marcar como pago
                      </Button>
                    ) : null}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <section className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/70">
        <h2 className="text-2xl font-black text-slate-900 dark:text-white">Leituras registadas</h2>
        <div className="mt-5 grid gap-3">
          {leituras.length === 0 ? <div className="text-sm text-slate-500">Sem leituras ainda.</div> : leituras.map((leitura) => {
            const contrato = contratos.find((item) => item.id === leitura.ligacaoId);
            return (
              <article key={leitura.id} className="rounded-[24px] border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950">
                <div className="text-base font-black text-slate-900 dark:text-white">{formatDateTime(leitura.data)}</div>
                <div className="text-sm text-slate-500 dark:text-slate-400">
                  Ligacao #{leitura.ligacaoId} - Casa ID #{contrato?.consumidorId || "-"} - {contrato?.consumidorNome || "Consumidor"}
                </div>
                <div className="text-sm text-slate-500 dark:text-slate-400">
                  Actual: {leitura.leituraActual} - Consumo: {leitura.consumoM3} m3 - Valor: {formatMoney(leitura.valorPagar)}
                </div>
              </article>
            );
          })}
        </div>
      </section>
    </main>
  );
}
