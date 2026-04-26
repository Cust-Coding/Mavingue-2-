"use client";

import { useEffect, useMemo, useState } from "react";
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
import { customersApi } from "@/features/customers/api";
import type { Customer } from "@/features/customers/types";
import {
  approveWaterRequest,
  createWaterContract,
  createWaterCustomer,
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
import type {
  AddressItem,
  WaterBill,
  WaterContract,
  WaterCustomer,
  WaterReading,
} from "@/features/water/types";
import { printWaterBillDocument } from "@/lib/documents/print";
import { getErrorMessage, getFieldErrors } from "@/lib/errors";
import { formatDateTime, formatMoney, formatPaymentMethod } from "@/lib/formatters";
import { getSessionUser } from "@/lib/auth/session";
import {
  normalizeEmail,
  normalizeMozPhone,
  validateMozPhone,
  validateOptionalEmail,
  validateRequired,
} from "@/lib/validation/forms";

type Scope = "admin" | "staff";
type PaymentMethod = "DINHEIRO_FISICO" | "CARTEIRA_MOVEL" | "CARTAO";

type WaterCustomerForm = {
  customerId: string;
  name: string;
  phone: string;
  email: string;
  referenciaLocal: string;
  houseNR: string;
  adressId: string;
  observacoes: string;
};

type WaterCustomerField = keyof WaterCustomerForm;

const paymentOptions: PaymentMethod[] = ["DINHEIRO_FISICO", "CARTEIRA_MOVEL", "CARTAO"];

function pageBase(scope: Scope) {
  return scope === "admin" ? "/admin/agua" : "/staff/agua";
}

function statusLabel(status: WaterCustomer["estado"]) {
  switch (status) {
    case "PENDENTE_APROVACAO":
      return "Pendente";
    case "AGUARDANDO_DADOS_CASA":
      return "Aguardando casa";
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

function billTone(status: WaterBill["estadoPagamento"]) {
  switch (status) {
    case "PAGO":
      return "bg-emerald-100 text-emerald-700";
    case "ATRASADO":
      return "bg-rose-100 text-rose-700";
    default:
      return "bg-amber-100 text-amber-700";
  }
}

function PageHeader({
  badge,
  title,
  description,
  children,
}: {
  badge: string;
  title: string;
  description: string;
  children?: React.ReactNode;
}) {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-600">{badge}</p>
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

export function WaterOverviewPage({ scope }: { scope: Scope }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [summary, setSummary] = useState({
    customers: 0,
    pending: 0,
    contracts: 0,
    readings: 0,
    bills: 0,
  });
  const [pendingRequests, setPendingRequests] = useState<WaterCustomer[]>([]);
  const [latestBills, setLatestBills] = useState<WaterBill[]>([]);
  const base = pageBase(scope);

  async function load() {
    setLoading(true);
    setError("");
    try {
      const [customers, pending, contracts, readings, bills] = await Promise.all([
        listWaterCustomers(),
        listPendingWaterCustomers(),
        listWaterContracts(),
        listWaterReadings(),
        listWaterBills(),
      ]);

      setSummary({
        customers: customers.length,
        pending: pending.length,
        contracts: contracts.length,
        readings: readings.length,
        bills: bills.length,
      });
      setPendingRequests(pending.slice(0, 5));
      setLatestBills(bills.slice(0, 5));
    } catch (reason) {
      setError(getErrorMessage(reason, "Nao foi possivel carregar a visao geral da agua."));
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
        badge="Agua"
        title="Modulo de agua organizado por etapas"
        description="O fluxo agora fica separado por paginas: pedidos, clientes, contratos, leituras e faturas, sem apontar tudo para a mesma tela."
      >
        <Button type="button" variant="outline" onClick={load} disabled={loading}>
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          Recarregar
        </Button>
      </PageHeader>

      <MessageStack error={error} success="" />

      <section className="grid gap-4 md:grid-cols-5">
        {[
          { label: "Clientes", value: summary.customers },
          { label: "Pendentes", value: summary.pending },
          { label: "Contratos", value: summary.contracts },
          { label: "Leituras", value: summary.readings },
          { label: "Faturas", value: summary.bills },
        ].map((card) => (
          <div key={card.label} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-slate-400">{card.label}</p>
            <p className="mt-3 text-3xl font-bold text-slate-900">{card.value}</p>
          </div>
        ))}
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        {[
          { href: `${base}/solicitacoes`, title: "Solicitacoes", text: "Aprovar ou rejeitar pedidos." },
          { href: `${base}/clientes`, title: "Clientes", text: "Criar e acompanhar contas de agua." },
          { href: `${base}/contratos`, title: "Contratos", text: "Abrir, cortar e reactivar ligacoes." },
          { href: `${base}/leituras`, title: "Leituras", text: "Registar consumo e gerar facturas." },
          { href: `${base}/faturas`, title: "Faturas", text: "Cobrar, pagar e imprimir." },
        ].map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-cyan-200 hover:shadow-md"
          >
            <div className="flex items-center gap-2 text-cyan-700">
              <Droplets className="h-4 w-4" />
              <span className="text-sm font-semibold">{link.title}</span>
            </div>
            <p className="mt-3 text-sm leading-6 text-slate-500">{link.text}</p>
          </Link>
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">Pedidos pendentes</h2>
          {loading ? (
            <p className="mt-4 text-sm text-slate-500">A carregar pedidos...</p>
          ) : pendingRequests.length === 0 ? (
            <p className="mt-4 text-sm text-slate-500">Nao existem pedidos pendentes neste momento.</p>
          ) : (
            <div className="mt-4 space-y-3">
              {pendingRequests.map((item) => (
                <div key={item.id} className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-4">
                  <p className="font-semibold text-slate-900">{item.name}</p>
                  <p className="mt-1 text-sm text-slate-500">{item.referenciaLocal}</p>
                  <p className="mt-1 text-xs text-slate-500">{item.phone}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">Ultimas faturas</h2>
          {loading ? (
            <p className="mt-4 text-sm text-slate-500">A carregar faturas...</p>
          ) : latestBills.length === 0 ? (
            <p className="mt-4 text-sm text-slate-500">Ainda nao foram emitidas faturas.</p>
          ) : (
            <div className="mt-4 space-y-3">
              {latestBills.map((bill) => (
                <div key={bill.id} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="font-semibold text-slate-900">Factura #{bill.id}</p>
                      <p className="mt-1 text-sm text-slate-500">{bill.consumidorNome}</p>
                    </div>
                    <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${billTone(bill.estadoPagamento)}`}>
                      {bill.estadoPagamento}
                    </span>
                  </div>
                  <p className="mt-3 text-sm font-semibold text-slate-900">{formatMoney(bill.valorTotal)}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}

export function WaterRequestsPage({ scope: _scope }: { scope: Scope }) {
  const [items, setItems] = useState<WaterCustomer[]>([]);
  const [loading, setLoading] = useState(true);
  const [workingId, setWorkingId] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function load() {
    setLoading(true);
    setError("");
    try {
      setItems(await listPendingWaterCustomers());
    } catch (reason) {
      setError(getErrorMessage(reason, "Nao foi possivel carregar as solicitacoes."));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function handleDecision(id: number, action: "approve" | "reject") {
    setWorkingId(id);
    setError("");
    setSuccess("");
    try {
      if (action === "approve") {
        await approveWaterRequest(id);
        setSuccess("Pedido aprovado. O registo segue agora para completar os dados da casa.");
      } else {
        await rejectWaterRequest(id);
        setSuccess("Pedido rejeitado com sucesso.");
      }
      await load();
    } catch (reason) {
      setError(getErrorMessage(reason, "Nao foi possivel actualizar a solicitacao."));
    } finally {
      setWorkingId(null);
    }
  }

  return (
    <main className="space-y-6">
      <PageHeader
        badge="Solicitacoes"
        title="Analise de pedidos de agua"
        description="Cada solicitacao fica aqui isolada para aprovar, rejeitar e acompanhar o estado antes da activacao."
      >
        <Button type="button" variant="outline" onClick={load} disabled={loading}>
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          Recarregar
        </Button>
      </PageHeader>

      <MessageStack error={error} success={success} />

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        {loading ? (
          <p className="text-sm text-slate-500">A carregar solicitacoes...</p>
        ) : items.length === 0 ? (
          <p className="text-sm text-slate-500">Nao existem pedidos pendentes neste momento.</p>
        ) : (
          <div className="space-y-4">
            {items.map((item) => (
              <div key={item.id} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <p className="font-semibold text-slate-900">{item.name}</p>
                    <p className="mt-1 text-sm text-slate-500">{item.referenciaLocal}</p>
                    <p className="mt-1 text-xs text-slate-500">
                      {item.phone} | {item.email || "Sem email"}
                    </p>
                    {item.observacoes && <p className="mt-3 text-sm text-slate-600">{item.observacoes}</p>}
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <Button
                      type="button"
                      disabled={workingId === item.id}
                      onClick={() => handleDecision(item.id, "approve")}
                      className="bg-emerald-600 text-white hover:bg-emerald-700"
                    >
                      Aprovar
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      disabled={workingId === item.id}
                      onClick={() => handleDecision(item.id, "reject")}
                    >
                      Rejeitar
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

export function WaterCustomersPage({ scope: _scope }: { scope: Scope }) {
  const [waterCustomers, setWaterCustomers] = useState<WaterCustomer[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [addresses, setAddresses] = useState<AddressItem[]>([]);
  const [form, setForm] = useState<WaterCustomerForm>({
    customerId: "",
    name: "",
    phone: "",
    email: "",
    referenciaLocal: "",
    houseNR: "",
    adressId: "",
    observacoes: "",
  });
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<WaterCustomerField, string>>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const sessionUser = useMemo(() => getSessionUser(), []);
  const canManageCustomers =
    sessionUser?.role === "ADMIN" || sessionUser?.permissions.includes("water.customers.manage");

  const customerMap = useMemo(
    () => new Map(customers.map((customer) => [customer.id, customer])),
    [customers]
  );

  async function load() {
    setLoading(true);
    setError("");
    try {
      const [waterRows, customerRows, addressRows] = await Promise.all([
        listWaterCustomers(),
        customersApi.list(),
        listAddresses(),
      ]);

      setWaterCustomers(waterRows);
      setCustomers(customerRows);
      setAddresses(addressRows);
    } catch (reason) {
      setError(getErrorMessage(reason, "Nao foi possivel carregar as contas de agua."));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  function setField<K extends keyof WaterCustomerForm>(field: K, value: WaterCustomerForm[K]) {
    setForm((current) => ({ ...current, [field]: value }));
    setFieldErrors((current) => ({ ...current, [field]: undefined }));
  }

  function hydrateFromCustomer(customerId: string) {
    setField("customerId", customerId);
    const current = customerMap.get(Number(customerId));
    if (!current) return;

    setForm((previous) => ({
      ...previous,
      customerId,
      name: current.name,
      phone: current.phone,
      email: current.email ?? "",
    }));
  }

  function validate() {
    const nextErrors: Partial<Record<WaterCustomerField, string>> = {};

    nextErrors.name = validateRequired(form.name, "Nome e obrigatorio.");
    nextErrors.phone = validateMozPhone(form.phone);
    nextErrors.email = validateOptionalEmail(form.email);
    nextErrors.referenciaLocal = validateRequired(form.referenciaLocal, "Referencia do local e obrigatoria.");

    const cleaned = Object.fromEntries(
      Object.entries(nextErrors).filter(([, value]) => value)
    ) as Partial<Record<WaterCustomerField, string>>;

    setFieldErrors(cleaned);
    return Object.keys(cleaned).length === 0;
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");
    setFieldErrors({});

    if (!validate()) {
      setSaving(false);
      return;
    }

    try {
      await createWaterCustomer({
        customerId: form.customerId ? Number(form.customerId) : null,
        name: form.name.trim(),
        phone: normalizeMozPhone(form.phone),
        email: form.email.trim() ? normalizeEmail(form.email) : null,
        referenciaLocal: form.referenciaLocal.trim(),
        houseNR: form.houseNR.trim() || null,
        adressId: form.adressId ? Number(form.adressId) : null,
        observacoes: form.observacoes.trim() || null,
      });

      setForm({
        customerId: "",
        name: "",
        phone: "",
        email: "",
        referenciaLocal: "",
        houseNR: "",
        adressId: "",
        observacoes: "",
      });
      setSuccess("Conta de agua criada com sucesso.");
      await load();
    } catch (reason) {
      const apiErrors = getFieldErrors(reason);
      setFieldErrors((current) => ({
        ...current,
        name: apiErrors.name ?? current.name,
        phone: apiErrors.phone ?? apiErrors.telefone ?? current.phone,
        email: apiErrors.email ?? current.email,
        referenciaLocal: apiErrors.referenciaLocal ?? current.referenciaLocal,
        houseNR: apiErrors.houseNR ?? current.houseNR,
        adressId: apiErrors.adressId ?? current.adressId,
        observacoes: apiErrors.observacoes ?? current.observacoes,
      }));
      setError(getErrorMessage(reason, "Nao foi possivel criar a conta de agua."));
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="space-y-6">
      <PageHeader
        badge="Clientes de agua"
        title="Contas de agua e associacao com cadastros"
        description="Aqui podes ligar o servico de agua a uma pessoa ja cadastrada ou criar o registo manualmente para sincronizar mais tarde."
      />

      <MessageStack error={error} success={success} />

      {canManageCustomers && (
        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">Nova conta de agua</h2>
          <form onSubmit={handleSubmit} className="mt-5 grid gap-5 md:grid-cols-2">
          <div className="md:col-span-2">
            <label className="mb-2 block text-sm font-medium text-slate-700">Cadastro existente (opcional)</label>
            <select
              value={form.customerId}
              onChange={(event) => hydrateFromCustomer(event.target.value)}
              className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition focus:border-cyan-400 focus:ring-4 focus:ring-cyan-100"
            >
              <option value="">Seleccionar pessoa cadastrada</option>
              {customers.map((customer) => (
                <option key={customer.id} value={customer.id}>
                  {customer.name} - {customer.phone}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">Nome</label>
            <Input value={form.name} onChange={(event) => setField("name", event.target.value)} className="h-12 rounded-2xl border-slate-200 px-4" />
            <FieldError message={fieldErrors.name} />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">Telefone</label>
            <Input value={form.phone} onChange={(event) => setField("phone", event.target.value)} className="h-12 rounded-2xl border-slate-200 px-4" />
            <FieldError message={fieldErrors.phone} />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">Email opcional</label>
            <Input value={form.email} onChange={(event) => setField("email", event.target.value)} className="h-12 rounded-2xl border-slate-200 px-4" />
            <FieldError message={fieldErrors.email} />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">Referencia do local</label>
            <Input value={form.referenciaLocal} onChange={(event) => setField("referenciaLocal", event.target.value)} className="h-12 rounded-2xl border-slate-200 px-4" />
            <FieldError message={fieldErrors.referenciaLocal} />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">Numero da casa</label>
            <Input value={form.houseNR} onChange={(event) => setField("houseNR", event.target.value)} className="h-12 rounded-2xl border-slate-200 px-4" />
            <FieldError message={fieldErrors.houseNR} />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">Zona</label>
            <select
              value={form.adressId}
              onChange={(event) => setField("adressId", event.target.value)}
              className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition focus:border-cyan-400 focus:ring-4 focus:ring-cyan-100"
            >
              <option value="">Seleccionar zona</option>
              {addresses.map((address) => (
                <option key={address.id} value={address.id}>
                  {address.name} - {address.bairro}
                </option>
              ))}
            </select>
            <FieldError message={fieldErrors.adressId} />
          </div>

          <div className="md:col-span-2">
            <label className="mb-2 block text-sm font-medium text-slate-700">Observacoes</label>
            <textarea
              value={form.observacoes}
              onChange={(event) => setField("observacoes", event.target.value)}
              rows={3}
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-cyan-400 focus:ring-4 focus:ring-cyan-100"
            />
          </div>

            <div className="md:col-span-2 flex justify-end">
              <Button type="submit" disabled={saving} className="bg-cyan-600 text-white hover:bg-cyan-700">
                Criar conta de agua
              </Button>
            </div>
          </form>
        </section>
      )}

      <section className="rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Contas registadas</h2>
            <p className="text-sm text-slate-500">Cada registo mostra claramente se esta pendente, em preparacao ou activo.</p>
          </div>
          <Button type="button" variant="outline" onClick={load} disabled={loading}>
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            Recarregar
          </Button>
        </div>

        {loading ? (
          <div className="px-6 py-10 text-sm text-slate-500">A carregar contas de agua...</div>
        ) : waterCustomers.length === 0 ? (
          <div className="px-6 py-10 text-sm text-slate-500">Ainda nao existem contas de agua registadas.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-slate-50 text-left text-slate-500">
                <tr>
                  <th className="px-6 py-3 font-medium">Pessoa</th>
                  <th className="px-6 py-3 font-medium">Local</th>
                  <th className="px-6 py-3 font-medium">Casa</th>
                  <th className="px-6 py-3 font-medium">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {waterCustomers.map((item) => (
                  <tr key={item.id}>
                    <td className="px-6 py-4">
                      <div className="font-semibold text-slate-900">{item.name}</div>
                      <div className="mt-1 text-xs text-slate-500">{item.phone}</div>
                    </td>
                    <td className="px-6 py-4 text-slate-600">
                      <div>{item.referenciaLocal}</div>
                      <div className="mt-1 text-xs text-slate-500">{item.adress || "Sem zona definida"}</div>
                    </td>
                    <td className="px-6 py-4 text-slate-600">{item.houseNR || "Por definir"}</td>
                    <td className="px-6 py-4">
                      <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${statusTone(item.estado)}`}>
                        {statusLabel(item.estado)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
}

export function WaterContractsPage({ scope: _scope }: { scope: Scope }) {
  const [waterCustomers, setWaterCustomers] = useState<WaterCustomer[]>([]);
  const [contracts, setContracts] = useState<WaterContract[]>([]);
  const [customerId, setCustomerId] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const activeCustomers = useMemo(
    () => waterCustomers.filter((item) => item.estado === "ATIVO" && item.activo),
    [waterCustomers]
  );

  async function load() {
    setLoading(true);
    setError("");
    try {
      const [customerRows, contractRows] = await Promise.all([listWaterCustomers(), listWaterContracts()]);
      setWaterCustomers(customerRows);
      setContracts(contractRows);
    } catch (reason) {
      setError(getErrorMessage(reason, "Nao foi possivel carregar os contratos."));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function handleCreate() {
    if (!customerId) {
      setError("Selecciona primeiro um cliente de agua activo.");
      return;
    }

    setSaving(true);
    setError("");
    setSuccess("");
    try {
      await createWaterContract({ consumidorId: Number(customerId) });
      setCustomerId("");
      setSuccess("Ligacao criada com sucesso.");
      await load();
    } catch (reason) {
      setError(getErrorMessage(reason, "Nao foi possivel criar a ligacao."));
    } finally {
      setSaving(false);
    }
  }

  async function handleToggle(contract: WaterContract) {
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      const nextState = contract.estado === "ATIVA" ? "CORTADA" : "ATIVA";
      await updateWaterContractState(contract.id, { estado: nextState });
      setSuccess(nextState === "ATIVA" ? "Ligacao reactivada com sucesso." : "Ligacao cortada com sucesso.");
      await load();
    } catch (reason) {
      setError(getErrorMessage(reason, "Nao foi possivel actualizar a ligacao."));
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="space-y-6">
      <PageHeader
        badge="Contratos"
        title="Ligacoes activas, cortadas e reactivadas"
        description="Cada ligacao fica aqui com o seu proprio controlo, sem misturar com pedidos, leituras ou cobrancas."
      />

      <MessageStack error={error} success={success} />

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">Criar ligacao</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-[1fr_auto]">
          <select
            value={customerId}
            onChange={(event) => setCustomerId(event.target.value)}
            className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition focus:border-cyan-400 focus:ring-4 focus:ring-cyan-100"
          >
            <option value="">Seleccionar cliente activo</option>
            {activeCustomers.map((customer) => (
              <option key={customer.id} value={customer.id}>
                {customer.name} - {customer.referenciaLocal}
              </option>
            ))}
          </select>
          <Button type="button" disabled={saving} onClick={handleCreate} className="h-12 bg-cyan-600 text-white hover:bg-cyan-700">
            Criar ligacao
          </Button>
        </div>
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Ligacoes registadas</h2>
            <p className="text-sm text-slate-500">O corte e a reactivacao ficam concentrados nesta pagina.</p>
          </div>
          <Button type="button" variant="outline" onClick={load} disabled={loading}>
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            Recarregar
          </Button>
        </div>

        {loading ? (
          <div className="px-6 py-10 text-sm text-slate-500">A carregar ligacoes...</div>
        ) : contracts.length === 0 ? (
          <div className="px-6 py-10 text-sm text-slate-500">Ainda nao existem ligacoes registadas.</div>
        ) : (
          <div className="space-y-4 px-6 py-6">
            {contracts.map((contract) => (
              <div key={contract.id} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <Home className="h-4 w-4 text-cyan-700" />
                      <p className="font-semibold text-slate-900">Ligacao #{contract.id}</p>
                    </div>
                    <p className="mt-2 text-sm text-slate-500">{contract.consumidorNome}</p>
                    <p className="mt-1 text-xs text-slate-500">Casa: {contract.houseNR || "Por definir"} | {formatDateTime(contract.data)}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${contract.estado === "ATIVA" ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"}`}>
                      {contract.estado === "ATIVA" ? "Activa" : "Cortada"}
                    </span>
                    <Button
                      type="button"
                      variant="outline"
                      disabled={saving}
                      onClick={() => handleToggle(contract)}
                    >
                      {contract.estado === "ATIVA" ? "Cortar agua" : "Reactivar"}
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

export function WaterReadingsPage({ scope: _scope }: { scope: Scope }) {
  const [contracts, setContracts] = useState<WaterContract[]>([]);
  const [readings, setReadings] = useState<WaterReading[]>([]);
  const [form, setForm] = useState({ ligacaoId: "", leituraActual: "", precoM3: "45" });
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function load() {
    setLoading(true);
    setError("");
    try {
      const [contractRows, readingRows] = await Promise.all([listWaterContracts(), listWaterReadings()]);
      setContracts(contractRows);
      setReadings(readingRows);
    } catch (reason) {
      setError(getErrorMessage(reason, "Nao foi possivel carregar as leituras."));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  function validate() {
    const nextErrors: Record<string, string> = {};
    if (!form.ligacaoId) nextErrors.ligacaoId = "Selecciona uma ligacao.";
    if (!form.leituraActual) nextErrors.leituraActual = "Introduz a leitura actual.";
    if (!form.precoM3) nextErrors.precoM3 = "Introduz o preco por metro cubico.";
    setFieldErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  async function handleSubmit() {
    setFieldErrors({});
    setError("");
    setSuccess("");

    if (!validate()) return;

    setSaving(true);
    try {
      await createWaterReading({
        ligacaoId: Number(form.ligacaoId),
        leituraActual: Number(form.leituraActual),
        precoM3: Number(form.precoM3),
      });
      setForm({ ligacaoId: "", leituraActual: "", precoM3: "45" });
      setSuccess("Leitura registada. A leitura anterior foi preservada e a factura foi emitida automaticamente.");
      await load();
    } catch (reason) {
      setError(getErrorMessage(reason, "Nao foi possivel registar a leitura."));
    } finally {
      setSaving(false);
    }
  }

  const activeContracts = contracts.filter((contract) => contract.estado === "ATIVA");

  return (
    <main className="space-y-6">
      <PageHeader
        badge="Leituras"
        title="Registo mensal de leituras"
        description="Ao guardar uma leitura, o sistema usa a ultima leitura como anterior, calcula o consumo e deixa a nova leitura pronta para o mes seguinte."
      />

      <MessageStack error={error} success={success} />

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">Nova leitura</h2>
        <div className="mt-5 grid gap-5 md:grid-cols-3">
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">Ligacao</label>
            <select
              value={form.ligacaoId}
              onChange={(event) => setForm((current) => ({ ...current, ligacaoId: event.target.value }))}
              className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition focus:border-cyan-400 focus:ring-4 focus:ring-cyan-100"
            >
              <option value="">Seleccionar ligacao</option>
              {activeContracts.map((contract) => (
                <option key={contract.id} value={contract.id}>
                  {contract.consumidorNome} - #{contract.id}
                </option>
              ))}
            </select>
            <FieldError message={fieldErrors.ligacaoId} />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">Leitura actual</label>
            <Input
              value={form.leituraActual}
              onChange={(event) => setForm((current) => ({ ...current, leituraActual: event.target.value }))}
              className="h-12 rounded-2xl border-slate-200 px-4"
            />
            <FieldError message={fieldErrors.leituraActual} />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">Preco por m3</label>
            <Input
              value={form.precoM3}
              onChange={(event) => setForm((current) => ({ ...current, precoM3: event.target.value }))}
              className="h-12 rounded-2xl border-slate-200 px-4"
            />
            <FieldError message={fieldErrors.precoM3} />
          </div>
        </div>

        <div className="mt-5 flex justify-end">
          <Button type="button" disabled={saving} onClick={handleSubmit} className="bg-cyan-600 text-white hover:bg-cyan-700">
            Registar leitura
          </Button>
        </div>
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Historico de leituras</h2>
            <p className="text-sm text-slate-500">A cada novo lancamento, a leitura actual passa a ser a anterior do proximo ciclo.</p>
          </div>
          <Button type="button" variant="outline" onClick={load} disabled={loading}>
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            Recarregar
          </Button>
        </div>

        {loading ? (
          <div className="px-6 py-10 text-sm text-slate-500">A carregar leituras...</div>
        ) : readings.length === 0 ? (
          <div className="px-6 py-10 text-sm text-slate-500">Ainda nao existem leituras registadas.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-slate-50 text-left text-slate-500">
                <tr>
                  <th className="px-6 py-3 font-medium">Data</th>
                  <th className="px-6 py-3 font-medium">Ligacao</th>
                  <th className="px-6 py-3 font-medium">Anterior</th>
                  <th className="px-6 py-3 font-medium">Actual</th>
                  <th className="px-6 py-3 font-medium">Consumo</th>
                  <th className="px-6 py-3 font-medium">Valor</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {readings.map((reading) => (
                  <tr key={reading.id}>
                    <td className="px-6 py-4 text-slate-600">{formatDateTime(reading.data)}</td>
                    <td className="px-6 py-4 text-slate-600">#{reading.ligacaoId}</td>
                    <td className="px-6 py-4 text-slate-600">{reading.leituraAnterior}</td>
                    <td className="px-6 py-4 text-slate-600">{reading.leituraActual}</td>
                    <td className="px-6 py-4 text-slate-600">{reading.consumoM3} m3</td>
                    <td className="px-6 py-4 font-semibold text-slate-900">{formatMoney(reading.valorPagar)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
}

export function WaterBillsPage({ scope: _scope }: { scope: Scope }) {
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
      setBills(await listWaterBills());
    } catch (reason) {
      setError(getErrorMessage(reason, "Nao foi possivel carregar as faturas."));
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
      const updated = await payWaterBill(id, { formaPagamento: paymentMethod });
      setBills((current) => current.map((bill) => (bill.id === updated.id ? updated : bill)));
      setSuccess("Pagamento confirmado com sucesso.");
    } catch (reason) {
      setError(getErrorMessage(reason, "Nao foi possivel confirmar o pagamento."));
    } finally {
      setPayingId(null);
    }
  }

  return (
    <main className="space-y-6">
      <PageHeader
        badge="Faturas"
        title="Cobranca e comprovativos"
        description="Nesta pagina ficam apenas as facturas de agua, os pagamentos e a impressao dos comprovativos."
      >
        <div className="flex items-center gap-3">
          <select
            value={paymentMethod}
            onChange={(event) => setPaymentMethod(event.target.value as PaymentMethod)}
            className="h-12 rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition focus:border-cyan-400 focus:ring-4 focus:ring-cyan-100"
          >
            {paymentOptions.map((option) => (
              <option key={option} value={option}>
                {formatPaymentMethod(option)}
              </option>
            ))}
          </select>
          <Button type="button" variant="outline" onClick={load} disabled={loading}>
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            Recarregar
          </Button>
        </div>
      </PageHeader>

      <MessageStack error={error} success={success} />

      <section className="rounded-3xl border border-slate-200 bg-white shadow-sm">
        {loading ? (
          <div className="px-6 py-10 text-sm text-slate-500">A carregar faturas...</div>
        ) : bills.length === 0 ? (
          <div className="px-6 py-10 text-sm text-slate-500">Ainda nao existem faturas emitidas.</div>
        ) : (
          <div className="space-y-4 px-6 py-6">
            {bills.map((bill) => (
              <div key={bill.id} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-cyan-700" />
                      <p className="font-semibold text-slate-900">Factura #{bill.id}</p>
                    </div>
                    <p className="mt-2 text-sm text-slate-500">{bill.consumidorNome}</p>
                    <p className="mt-1 text-xs text-slate-500">{formatDateTime(bill.data)}</p>
                    <p className="mt-3 text-sm font-semibold text-slate-900">{formatMoney(bill.valorTotal)}</p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${billTone(bill.estadoPagamento)}`}>
                      {bill.estadoPagamento}
                    </span>
                    <Button type="button" variant="outline" onClick={() => printWaterBillDocument(bill)}>
                      <FileText className="h-4 w-4" />
                      PDF
                    </Button>
                    {bill.estadoPagamento !== "PAGO" && (
                      <Button
                        type="button"
                        disabled={payingId === bill.id}
                        onClick={() => handlePay(bill.id)}
                        className="bg-emerald-600 text-white hover:bg-emerald-700"
                      >
                        <CreditCard className="h-4 w-4" />
                        Confirmar pagamento
                      </Button>
                    )}
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
