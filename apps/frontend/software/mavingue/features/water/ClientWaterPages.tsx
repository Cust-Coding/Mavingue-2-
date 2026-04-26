"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  CheckCircle2,
  CreditCard,
  Droplets,
  FileText,
  Home,
  RefreshCw,
} from "lucide-react";
import { FieldError } from "@/components/forms/FieldError";
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
  payClientWaterBill,
} from "@/features/water/api";
import type { AddressItem, WaterBill, WaterContract, WaterCustomer, WaterReading } from "@/features/water/types";
import { printWaterBillDocument } from "@/lib/documents/print";
import { getErrorMessage } from "@/lib/errors";
import { formatDateTime, formatMoney, formatPaymentMethod } from "@/lib/formatters";

type PaymentMethod = "DINHEIRO_FISICO" | "CARTEIRA_MOVEL" | "CARTAO";

function statusLabel(status: WaterCustomer["estado"]) {
  switch (status) {
    case "PENDENTE_APROVACAO":
      return "Pendente";
    case "AGUARDANDO_DADOS_CASA":
      return "Aguardando dados";
    case "ATIVO":
      return "Activo";
    case "REJEITADO":
      return "Rejeitado";
    default:
      return status;
  }
}

function statusTone(status: WaterCustomer["estado"]) {
  switch (status) {
    case "ATIVO":
      return "bg-emerald-100 text-emerald-700";
    case "AGUARDANDO_DADOS_CASA":
      return "bg-blue-100 text-blue-700";
    case "REJEITADO":
      return "bg-rose-100 text-rose-700";
    default:
      return "bg-amber-100 text-amber-700";
  }
}

function PageHeader({ title, description, children }: { title: string; description: string; children?: React.ReactNode }) {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-600">Agua</p>
          <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-900">{title}</h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500">{description}</p>
        </div>
        {children}
      </div>
    </section>
  );
}

function MessageStack({ error, success }: { error: string; success: string }) {
  return (
    <>
      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}
      {success && (
        <div className="flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{success}</span>
        </div>
      )}
    </>
  );
}

async function loadClientWaterBundle() {
  const [profile, contracts, readings, bills] = await Promise.all([
    clientApi.profile(),
    listClientWaterContracts(),
    listClientWaterReadings(),
    listClientWaterBills(),
  ]);

  return { profile, contracts, readings, bills };
}

export function ClientWaterOverviewPage() {
  const [profile, setProfile] = useState<ClientProfile | null>(null);
  const [contracts, setContracts] = useState<WaterContract[]>([]);
  const [readings, setReadings] = useState<WaterReading[]>([]);
  const [bills, setBills] = useState<WaterBill[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function load() {
    setLoading(true);
    setError("");
    try {
      const data = await loadClientWaterBundle();
      setProfile(data.profile);
      setContracts(data.contracts);
      setReadings(data.readings);
      setBills(data.bills);
    } catch (reason) {
      setError(getErrorMessage(reason, "Nao foi possivel carregar o modulo de agua."));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const latestReading = readings[0] ?? null;
  const pendingBill = bills.find((bill) => bill.estadoPagamento !== "PAGO") ?? null;
  const waterCustomers = profile?.waterCustomers ?? [];

  return (
    <main className="space-y-6">
      <PageHeader
        title="Resumo das tuas contas de agua"
        description="Ves aqui o estado de cada pedido, o que ja esta activo, a ultima leitura e as faturas pendentes."
      >
        <Button type="button" variant="outline" onClick={load} disabled={loading}>
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          Recarregar
        </Button>
      </PageHeader>

      <MessageStack error={error} success="" />

      <section className="grid gap-4 md:grid-cols-4">
        {[
          { label: "Contas", value: waterCustomers.length },
          { label: "Ligacoes", value: contracts.length },
          { label: "Leituras", value: readings.length },
          { label: "Faturas", value: bills.length },
        ].map((card) => (
          <div key={card.label} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-slate-400">{card.label}</p>
            <p className="mt-3 text-3xl font-bold text-slate-900">{card.value}</p>
          </div>
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-2">
            <Droplets className="h-4 w-4 text-cyan-700" />
            <h2 className="text-lg font-semibold text-slate-900">Contas e estados</h2>
          </div>

          {loading ? (
            <p className="mt-4 text-sm text-slate-500">A carregar contas...</p>
          ) : waterCustomers.length === 0 ? (
            <p className="mt-4 text-sm text-slate-500">Ainda nao tens pedidos ou contas de agua associados.</p>
          ) : (
            <div className="mt-4 space-y-4">
              {waterCustomers.map((item) => (
                <div key={item.id} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-slate-900">{item.referenciaLocal || `Conta #${item.id}`}</p>
                      <p className="mt-1 text-sm text-slate-500">{item.adress || "Zona por definir"}</p>
                      <p className="mt-1 text-xs text-slate-500">Casa: {item.houseNR || "Por definir"}</p>
                    </div>
                    <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${statusTone(item.estado)}`}>
                      {statusLabel(item.estado)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-2">
              <Home className="h-4 w-4 text-cyan-700" />
              <h2 className="text-lg font-semibold text-slate-900">Ultima leitura</h2>
            </div>
            <p className="mt-4 text-sm text-slate-500">
              {latestReading
                ? `${latestReading.consumoM3} m3 consumidos | ${formatMoney(latestReading.valorPagar)}`
                : "Ainda nao existe leitura registada."}
            </p>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-cyan-700" />
              <h2 className="text-lg font-semibold text-slate-900">Factura em aberto</h2>
            </div>
            {pendingBill ? (
              <div className="mt-4 space-y-3">
                <p className="text-sm text-slate-500">Factura #{pendingBill.id}</p>
                <p className="text-2xl font-bold text-slate-900">{formatMoney(pendingBill.valorTotal)}</p>
                <div className="flex flex-wrap gap-3">
                  <Link href="/cliente/agua/faturas" className="rounded-xl bg-cyan-600 px-4 py-2 text-sm font-semibold text-white hover:bg-cyan-700">
                    Ver facturas
                  </Link>
                  <Link href="/cliente/agua/pagamentos" className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">
                    Pagar agora
                  </Link>
                </div>
              </div>
            ) : (
              <p className="mt-4 text-sm text-slate-500">Nao existe factura pendente neste momento.</p>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}

export function ClientWaterRequestsPage() {
  const [profile, setProfile] = useState<ClientProfile | null>(null);
  const [addresses, setAddresses] = useState<AddressItem[]>([]);
  const [form, setForm] = useState({ referenciaLocal: "", observacoes: "" });
  const [completionForms, setCompletionForms] = useState<Record<number, { houseNR: string; adressId: string }>>({});
  const [requestErrors, setRequestErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function load() {
    setLoading(true);
    setError("");
    try {
      const [profileData, addressRows] = await Promise.all([clientApi.profile(), listAddresses()]);
      setProfile(profileData);
      setAddresses(addressRows);
      setCompletionForms(
        profileData.waterCustomers.reduce<Record<number, { houseNR: string; adressId: string }>>((acc, item) => {
          acc[item.id] = {
            houseNR: item.houseNR || "",
            adressId: item.adressId ? String(item.adressId) : "",
          };
          return acc;
        }, {})
      );
    } catch (reason) {
      setError(getErrorMessage(reason, "Nao foi possivel carregar os teus pedidos de agua."));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function handleCreateRequest() {
    setRequestErrors({});
    setError("");
    setSuccess("");

    if (!form.referenciaLocal.trim()) {
      setRequestErrors({ referenciaLocal: "Referencia do local e obrigatoria." });
      return;
    }

    setSaving(true);
    try {
      await createClientWaterRequest({
        referenciaLocal: form.referenciaLocal.trim(),
        observacoes: form.observacoes.trim() || undefined,
      });
      setForm({ referenciaLocal: "", observacoes: "" });
      setSuccess("Pedido enviado com sucesso. Agora ele fica visivel para aprovacao.");
      await load();
    } catch (reason) {
      setError(getErrorMessage(reason, "Nao foi possivel criar o pedido."));
    } finally {
      setSaving(false);
    }
  }

  async function handleCompleteRequest(id: number) {
    const current = completionForms[id];
    if (!current?.houseNR.trim() || !current?.adressId) {
      setError("Preenche o numero da casa e a zona para concluir o pedido.");
      return;
    }

    setSaving(true);
    setError("");
    setSuccess("");
    try {
      await completeClientWaterRequest(id, {
        houseNR: current.houseNR.trim(),
        adressId: Number(current.adressId),
      });
      setSuccess("Dados da casa guardados. A conta de agua ja pode ficar activa.");
      await load();
    } catch (reason) {
      setError(getErrorMessage(reason, "Nao foi possivel concluir o pedido."));
    } finally {
      setSaving(false);
    }
  }

  const waterCustomers = profile?.waterCustomers ?? [];

  return (
    <main className="space-y-6">
      <PageHeader
        title="Pedidos, activacao e conclusao"
        description="Cria novos pedidos aqui e acompanha claramente o que esta pendente, o que aguarda dados da casa e o que ja esta activo."
      />

      <MessageStack error={error} success={success} />

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">Novo pedido de agua</h2>
        <div className="mt-5 grid gap-5 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">Referencia do local</label>
            <Input
              value={form.referenciaLocal}
              onChange={(event) => setForm((current) => ({ ...current, referenciaLocal: event.target.value }))}
              className="h-12 rounded-2xl border-slate-200 px-4"
              placeholder="Ex.: Casa da Matola"
            />
            <FieldError message={requestErrors.referenciaLocal} />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">Observacoes</label>
            <Input
              value={form.observacoes}
              onChange={(event) => setForm((current) => ({ ...current, observacoes: event.target.value }))}
              className="h-12 rounded-2xl border-slate-200 px-4"
              placeholder="Opcional"
            />
          </div>
        </div>

        <div className="mt-5 flex justify-end">
          <Button type="button" disabled={saving} onClick={handleCreateRequest} className="bg-cyan-600 text-white hover:bg-cyan-700">
            Enviar pedido
          </Button>
        </div>
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 px-6 py-5">
          <h2 className="text-lg font-semibold text-slate-900">Os teus registos de agua</h2>
          <p className="text-sm text-slate-500">Cada conta mostra o estado actual e, quando necessario, o formulario exacto para completar os dados finais.</p>
        </div>

        {loading ? (
          <div className="px-6 py-10 text-sm text-slate-500">A carregar pedidos...</div>
        ) : waterCustomers.length === 0 ? (
          <div className="px-6 py-10 text-sm text-slate-500">Ainda nao tens pedidos ou contas registadas.</div>
        ) : (
          <div className="space-y-4 px-6 py-6">
            {waterCustomers.map((item) => (
              <div key={item.id} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-slate-900">{item.referenciaLocal || `Conta #${item.id}`}</p>
                    <p className="mt-1 text-sm text-slate-500">{item.adress || "Zona por definir"}</p>
                    <p className="mt-1 text-xs text-slate-500">Casa: {item.houseNR || "Por definir"}</p>
                  </div>
                  <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${statusTone(item.estado)}`}>
                    {statusLabel(item.estado)}
                  </span>
                </div>

                {item.estado === "AGUARDANDO_DADOS_CASA" && (
                  <div className="mt-4 grid gap-4 md:grid-cols-3">
                    <div>
                      <label className="mb-2 block text-sm font-medium text-slate-700">Numero da casa</label>
                      <Input
                        value={completionForms[item.id]?.houseNR || ""}
                        onChange={(event) =>
                          setCompletionForms((current) => ({
                            ...current,
                            [item.id]: {
                              ...(current[item.id] ?? { houseNR: "", adressId: "" }),
                              houseNR: event.target.value,
                            },
                          }))
                        }
                        className="h-12 rounded-2xl border-slate-200 px-4"
                      />
                    </div>
                    <div>
                      <label className="mb-2 block text-sm font-medium text-slate-700">Zona</label>
                      <select
                        value={completionForms[item.id]?.adressId || ""}
                        onChange={(event) =>
                          setCompletionForms((current) => ({
                            ...current,
                            [item.id]: {
                              ...(current[item.id] ?? { houseNR: "", adressId: "" }),
                              adressId: event.target.value,
                            },
                          }))
                        }
                        className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition focus:border-cyan-400 focus:ring-4 focus:ring-cyan-100"
                      >
                        <option value="">Seleccionar zona</option>
                        {addresses.map((address) => (
                          <option key={address.id} value={address.id}>
                            {address.name} - {address.bairro}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="flex items-end">
                      <Button type="button" disabled={saving} onClick={() => handleCompleteRequest(item.id)} className="h-12 w-full bg-cyan-600 text-white hover:bg-cyan-700">
                        Concluir activacao
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}

export function ClientWaterBillsPage() {
  const [bills, setBills] = useState<WaterBill[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function load() {
    setLoading(true);
    setError("");
    try {
      setBills(await listClientWaterBills());
    } catch (reason) {
      setError(getErrorMessage(reason, "Nao foi possivel carregar as facturas."));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <main className="space-y-6">
      <PageHeader
        title="Facturas emitidas"
        description="Aqui ficam reunidas todas as facturas de agua, separadas dos pagamentos para manter a navegacao clara."
      >
        <Button type="button" variant="outline" onClick={load} disabled={loading}>
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          Recarregar
        </Button>
      </PageHeader>

      <MessageStack error={error} success="" />

      <section className="rounded-3xl border border-slate-200 bg-white shadow-sm">
        {loading ? (
          <div className="px-6 py-10 text-sm text-slate-500">A carregar facturas...</div>
        ) : bills.length === 0 ? (
          <div className="px-6 py-10 text-sm text-slate-500">Ainda nao tens facturas emitidas.</div>
        ) : (
          <div className="space-y-4 px-6 py-6">
            {bills.map((bill) => (
              <div key={bill.id} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <p className="font-semibold text-slate-900">Factura #{bill.id}</p>
                    <p className="mt-1 text-sm text-slate-500">{formatDateTime(bill.data)}</p>
                    <p className="mt-3 text-sm font-semibold text-slate-900">{formatMoney(bill.valorTotal)}</p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-slate-200 px-2.5 py-1 text-xs font-semibold text-slate-700">
                      {bill.estadoPagamento}
                    </span>
                    <Button type="button" variant="outline" onClick={() => printWaterBillDocument(bill)}>
                      <FileText className="h-4 w-4" />
                      PDF
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}

export function ClientWaterPaymentsPage() {
  const [bills, setBills] = useState<WaterBill[]>([]);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("DINHEIRO_FISICO");
  const [loading, setLoading] = useState(true);
  const [payingId, setPayingId] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function load() {
    setLoading(true);
    setError("");
    try {
      setBills(await listClientWaterBills());
    } catch (reason) {
      setError(getErrorMessage(reason, "Nao foi possivel carregar os pagamentos."));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function handlePay(id: number) {
    setPayingId(id);
    setError("");
    setSuccess("");
    try {
      const updated = await payClientWaterBill(id, { formaPagamento: paymentMethod });
      setBills((current) => current.map((bill) => (bill.id === updated.id ? updated : bill)));
      setSuccess(`Pagamento confirmado por ${formatPaymentMethod(paymentMethod)}.`);
    } catch (reason) {
      setError(getErrorMessage(reason, "Nao foi possivel processar o pagamento."));
    } finally {
      setPayingId(null);
    }
  }

  const pendingBills = bills.filter((bill) => bill.estadoPagamento !== "PAGO");

  return (
    <main className="space-y-6">
      <PageHeader
        title="Pagamentos de agua"
        description="Os pagamentos ficam isolados nesta pagina para que a factura e a accao de pagar nao se confundam."
      >
        <select
          value={paymentMethod}
          onChange={(event) => setPaymentMethod(event.target.value as PaymentMethod)}
          className="h-12 rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition focus:border-cyan-400 focus:ring-4 focus:ring-cyan-100"
        >
          <option value="DINHEIRO_FISICO">Dinheiro fisico</option>
          <option value="CARTEIRA_MOVEL">Carteira movel</option>
          <option value="CARTAO">Cartao</option>
        </select>
      </PageHeader>

      <MessageStack error={error} success={success} />

      <section className="rounded-3xl border border-slate-200 bg-white shadow-sm">
        {loading ? (
          <div className="px-6 py-10 text-sm text-slate-500">A carregar pagamentos...</div>
        ) : pendingBills.length === 0 ? (
          <div className="px-6 py-10 text-sm text-slate-500">Nao existem facturas pendentes para pagar.</div>
        ) : (
          <div className="space-y-4 px-6 py-6">
            {pendingBills.map((bill) => (
              <div key={bill.id} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <p className="font-semibold text-slate-900">Factura #{bill.id}</p>
                    <p className="mt-1 text-sm text-slate-500">{formatDateTime(bill.data)}</p>
                    <p className="mt-3 text-sm font-semibold text-slate-900">{formatMoney(bill.valorTotal)}</p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <Button type="button" variant="outline" onClick={() => printWaterBillDocument(bill)}>
                      <FileText className="h-4 w-4" />
                      PDF
                    </Button>
                    <Button
                      type="button"
                      disabled={payingId === bill.id}
                      onClick={() => handlePay(bill.id)}
                      className="bg-emerald-600 text-white hover:bg-emerald-700"
                    >
                      <CreditCard className="h-4 w-4" />
                      Pagar
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
