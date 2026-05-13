"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  CheckCircle2,
  ClipboardCheck,
  CreditCard,
  FileText,
  Loader2,
  RefreshCw,
} from "lucide-react";
import { FieldError } from "@/components/forms/FieldError";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { clientApi } from "@/features/client/api";
import type { ClientProfile } from "@/features/client/types";
import {
  createClientWaterRequest,
  listAddresses,
  listClientWaterBills,
  listClientWaterContracts,
  listClientWaterReadings,
  payClientWaterBill,
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

type PaymentMethod = "DINHEIRO_FISICO" | "CARTEIRA_MOVEL" | "CARTAO";

type RequestFormState = {
  referenciaLocal: string;
  houseNR: string;
  adressId: string;
  observacoes: string;
};

function statusLabel(status: WaterCustomer["estado"]) {
  switch (status) {
    case "PENDENTE_APROVACAO":
      return "Pendente de analise";
    case "AGUARDANDO_DADOS_CASA":
      return "Em preparacao pela equipa";
    case "ATIVO":
      return "Conta activa";
    case "REJEITADO":
      return "Rejeitada";
    default:
      return status;
  }
}

function statusTone(status: WaterCustomer["estado"]) {
  switch (status) {
    case "ATIVO":
      return "bg-emerald-100 text-emerald-700 ring-emerald-200";
    case "AGUARDANDO_DADOS_CASA":
      return "bg-sky-100 text-sky-700 ring-sky-200";
    case "REJEITADO":
      return "bg-rose-100 text-rose-700 ring-rose-200";
    default:
      return "bg-amber-100 text-amber-700 ring-amber-200";
  }
}

function billTone(status: WaterBill["estadoPagamento"]) {
  switch (status) {
    case "PAGO":
      return "bg-emerald-100 text-emerald-700 ring-emerald-200";
    case "ATRASADO":
      return "bg-rose-100 text-rose-700 ring-rose-200";
    default:
      return "bg-amber-100 text-amber-700 ring-amber-200";
  }
}

function formatServiceAddress(address?: string | null, house?: string | null) {
  if (address && house) return `${address} | Casa ${house}`;
  if (address) return `${address} | Casa por definir`;
  if (house) return `Casa ${house} | Zona por definir`;
  return "Imovel por completar";
}

function HeroHeader({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children?: React.ReactNode;
}) {
  return (
    <section className="overflow-hidden rounded-[32px] bg-gradient-to-br from-slate-950 via-cyan-950 to-sky-700 p-6 text-white shadow-lg shadow-slate-950/15">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        <div className="max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-cyan-200">Agua</p>
          <h1 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">{title}</h1>
          <p className="mt-3 text-sm leading-7 text-slate-200">{description}</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">{children}</div>
      </div>
    </section>
  );
}

function Panel({
  title,
  description,
  children,
  action,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <section className="rounded-[30px] border border-slate-200 bg-white shadow-sm">
      <div className="flex flex-col gap-3 border-b border-slate-100 px-6 py-5 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-lg font-black tracking-tight text-slate-900">{title}</h2>
          {description ? <p className="mt-1 text-sm leading-6 text-slate-500">{description}</p> : null}
        </div>
        {action}
      </div>
      <div className="px-6 py-6">{children}</div>
    </section>
  );
}

function StatCard({
  label,
  value,
  helper,
  accent,
}: {
  label: string;
  value: string | number;
  helper: string;
  accent: "cyan" | "emerald" | "amber" | "slate";
}) {
  const tones = {
    cyan: "from-cyan-500/10 to-sky-500/10 text-cyan-700",
    emerald: "from-emerald-500/10 to-teal-500/10 text-emerald-700",
    amber: "from-amber-500/10 to-orange-500/10 text-amber-700",
    slate: "from-slate-500/10 to-slate-300/10 text-slate-700",
  } as const;

  return (
    <div className={`rounded-[28px] border border-slate-200 bg-gradient-to-br ${tones[accent]} p-5 shadow-sm`}>
      <p className="text-xs font-semibold uppercase tracking-[0.26em] text-slate-500">{label}</p>
      <p className="mt-3 text-3xl font-black tracking-tight text-slate-950">{value}</p>
      <p className="mt-2 text-sm leading-6 text-slate-600">{helper}</p>
    </div>
  );
}

function InfoChip({ text, tone }: { text: string; tone: string }) {
  return <span className={`rounded-full px-3 py-1 text-xs font-bold ring-1 ${tone}`}>{text}</span>;
}

function MessageStack({ error, success }: { error: string; success: string }) {
  return (
    <>
      {error ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {error}
        </div>
      ) : null}
      {success ? (
        <div className="flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{success}</span>
        </div>
      ) : null}
    </>
  );
}

function EmptyState({ title, description }: { title: string; description: string }) {
  return (
    <div className="rounded-[26px] border border-dashed border-slate-200 bg-slate-50 px-6 py-12 text-center">
      <p className="text-sm font-semibold text-slate-700">{title}</p>
      <p className="mt-2 text-sm leading-6 text-slate-500">{description}</p>
    </div>
  );
}

function ConfirmModal({
  isOpen,
  title,
  message,
  confirmText,
  cancelText,
  onConfirm,
  onCancel,
  isProcessing = false,
  processingText = "A processar...",
}: {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText: string;
  cancelText: string;
  onConfirm: () => void;
  onCancel: () => void;
  isProcessing?: boolean;
  processingText?: string;
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 px-4">
      <div className="w-full max-w-lg rounded-[28px] border border-slate-200 bg-white p-6 shadow-2xl">
        <h3 className="text-xl font-black tracking-tight text-slate-900">{title}</h3>
        <p className="mt-3 text-sm leading-7 text-slate-600">{message}</p>
        <div className="mt-6 flex flex-wrap justify-end gap-3">
          <Button type="button" variant="outline" onClick={onCancel} disabled={isProcessing}>
            {cancelText}
          </Button>
          <Button type="button" onClick={onConfirm} disabled={isProcessing} className="bg-cyan-600 text-white hover:bg-cyan-700">
            {isProcessing ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            {isProcessing ? processingText : confirmText}
          </Button>
        </div>
      </div>
    </div>
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

  const waterCustomers = profile?.waterCustomers ?? [];
  const latestReading = readings[0] ?? null;
  const pendingBill = bills.find((bill) => bill.estadoPagamento !== "PAGO") ?? null;
  const activeContract = contracts.find((contract) => contract.estado === "ATIVA") ?? contracts[0] ?? null;

  return (
    <main className="space-y-6">
      <HeroHeader
        title="A tua operacao de agua num unico painel"
        description="Segue o estado do pedido, acompanha a tua ligacao, consulta leituras e resolve facturas sem perder o fio do processo."
      >
        <Button type="button" variant="outline" onClick={load} disabled={loading} className="border-white/20 bg-white/10 text-white hover:bg-white/15">
          <RefreshCw className={loading ? "animate-spin" : ""} />
          Recarregar
        </Button>
      </HeroHeader>

      <MessageStack error={error} success="" />

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Contas de agua" value={waterCustomers.length} helper="Pedidos e contas associados ao teu perfil" accent="cyan" />
        <StatCard label="Ligacoes" value={contracts.length} helper={activeContract ? "Ja existe servico contratado" : "Ainda sem ligacao activa"} accent="emerald" />
        <StatCard label="Leituras" value={readings.length} helper={latestReading ? `${latestReading.consumoM3} m3 no ultimo ciclo` : "Sem leituras registadas"} accent="amber" />
        <StatCard label="Facturas pendentes" value={bills.filter((bill) => bill.estadoPagamento !== "PAGO").length} helper={pendingBill ? formatMoney(pendingBill.valorTotal) : "Nenhum valor em aberto"} accent="slate" />
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <Panel
          title="Estado das tuas contas"
          description="Cada pedido ou conta mostra o local, o imovel e o estado exacto do processo."
        >
          {loading ? (
            <p className="text-sm text-slate-500">A carregar contas...</p>
          ) : waterCustomers.length === 0 ? (
            <EmptyState
              title="Ainda nao tens contas de agua"
              description="Podes iniciar um pedido agora e acompanhar toda a aprovacao a partir da tua area."
            />
          ) : (
            <div className="space-y-4">
              {waterCustomers.map((item) => (
                <article key={item.id} className="rounded-[26px] border border-slate-200 bg-slate-50 p-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-black tracking-tight text-slate-900">{item.referenciaLocal || `Conta #${item.id}`}</p>
                        <InfoChip text={statusLabel(item.estado)} tone={statusTone(item.estado)} />
                      </div>
                      <p className="mt-2 text-sm text-slate-600">{formatServiceAddress(item.adress, item.houseNR)}</p>
                      {item.observacoes ? <p className="mt-2 text-sm leading-6 text-slate-500">{item.observacoes}</p> : null}
                    </div>
                    <div className="rounded-2xl bg-white px-4 py-3 text-right ring-1 ring-slate-200">
                      <p className="text-xs uppercase tracking-[0.22em] text-slate-400">Criado em</p>
                      <p className="mt-1 text-sm font-semibold text-slate-900">{formatDateTime(item.created)}</p>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </Panel>

        <div className="space-y-6">
          <Panel title="Ligacao actual" description="Resumo rapido do servico associado ao teu imovel.">
            {activeContract ? (
              <div className="space-y-3 text-sm text-slate-600">
                <p className="font-semibold text-slate-900">{activeContract.consumidorNome}</p>
                <p>{activeContract.referenciaLocal || "Sem referencia do local"}</p>
                <p>{formatServiceAddress(activeContract.adress, activeContract.houseNR)}</p>
                <p>{activeContract.estado === "ATIVA" ? "Servico em fornecimento" : "Servico cortado"}</p>
              </div>
            ) : (
              <p className="text-sm text-slate-500">Ainda nao existe ligacao activa para o teu perfil.</p>
            )}
          </Panel>

          <Panel title="Proximo valor em aberto" description="O que tens para regularizar neste momento.">
            {pendingBill ? (
              <div className="space-y-4">
                <p className="text-sm text-slate-500">Factura #{pendingBill.id}</p>
                <p className="text-3xl font-black tracking-tight text-slate-900">{formatMoney(pendingBill.valorTotal)}</p>
                <div className="flex flex-wrap gap-3">
                  <Link href="/cliente/agua/faturas" className="rounded-2xl bg-cyan-600 px-4 py-2 text-sm font-semibold text-white hover:bg-cyan-700">
                    Ver facturas
                  </Link>
                  <Link href="/cliente/agua/pagamentos" className="rounded-2xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">
                    Pagar agora
                  </Link>
                </div>
              </div>
            ) : (
              <p className="text-sm text-slate-500">Nao existe nenhuma factura pendente neste momento.</p>
            )}
          </Panel>
        </div>
      </section>
    </main>
  );
}

export function ClientWaterRequestsPage() {
  const [profile, setProfile] = useState<ClientProfile | null>(null);
  const [addresses, setAddresses] = useState<AddressItem[]>([]);
  const [form, setForm] = useState<RequestFormState>({
    referenciaLocal: "",
    houseNR: "",
    adressId: "",
    observacoes: "",
  });
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

    const nextErrors: Record<string, string> = {};
    if (!form.referenciaLocal.trim()) {
      nextErrors.referenciaLocal = "Referencia do local e obrigatoria.";
    }
    if (Boolean(form.houseNR.trim()) !== Boolean(form.adressId)) {
      nextErrors.houseNR = "Preenche a casa e a zona em conjunto.";
      nextErrors.adressId = "Preenche a casa e a zona em conjunto.";
    }

    if (Object.keys(nextErrors).length > 0) {
      setRequestErrors(nextErrors);
      return;
    }

    setSaving(true);
    try {
      await createClientWaterRequest({
        referenciaLocal: form.referenciaLocal.trim(),
        houseNR: form.houseNR.trim() || null,
        adressId: form.adressId ? Number(form.adressId) : null,
        observacoes: form.observacoes.trim() || undefined,
      });
      setForm({ referenciaLocal: "", houseNR: "", adressId: "", observacoes: "" });
      setSuccess(
        form.houseNR.trim() && form.adressId
          ? "Pedido enviado com os dados completos do imovel. Depois da aprovacao, ele pode seguir direto para contrato."
          : "Pedido enviado com sucesso. A equipa vai analisar e pedir complemento se necessario."
      );
      await load();
    } catch (reason) {
      const apiErrors = getFieldErrors(reason);
      setRequestErrors({
        referenciaLocal: apiErrors.referenciaLocal || "",
        houseNR: apiErrors.houseNR || "",
        adressId: apiErrors.adressId || "",
        observacoes: apiErrors.observacoes || "",
      });
      setError(getErrorMessage(reason, "Nao foi possivel criar o pedido."));
    } finally {
      setSaving(false);
    }
  }

  const waterCustomers = profile?.waterCustomers ?? [];

  return (
    <main className="space-y-6">
      <HeroHeader
        title="Pedido, activacao e acompanhamento do servico"
        description="Aqui inicias o pedido de agua, podes indicar a referencia do local e acompanhas quando a equipa aprova, instala e activa o servico."
      />

      <MessageStack error={error} success={success} />

      <section className="grid gap-4 md:grid-cols-3">
        <StatCard label="Pedidos totais" value={waterCustomers.length} helper="Tudo o que ja passou pelo teu perfil" accent="cyan" />
        <StatCard label="Activos" value={waterCustomers.filter((item) => item.estado === "ATIVO").length} helper="Contas prontas para contrato ou ja em operacao" accent="emerald" />
        <StatCard label="Em preparacao" value={waterCustomers.filter((item) => item.estado === "AGUARDANDO_DADOS_CASA").length} helper="A equipa ainda esta a concluir a activacao interna" accent="amber" />
      </section>

      <Panel
        title="Novo pedido de agua"
        description="Podes enviar logo a referencia do local e, se ja souberes, a casa e a zona para acelerar a aprovacao."
      >
        <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
          <div className="grid gap-5 md:grid-cols-2">
            <div className="md:col-span-2">
              <label className="mb-2 block text-sm font-medium text-slate-700">Referencia do local</label>
              <Input
                value={form.referenciaLocal}
                onChange={(event) => setForm((current) => ({ ...current, referenciaLocal: event.target.value }))}
                className="h-12 rounded-2xl border-slate-200 px-4"
                placeholder="Ex.: Casa da Matola, Bloco B"
              />
              <FieldError message={requestErrors.referenciaLocal} />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Numero da casa</label>
              <Input
                value={form.houseNR}
                onChange={(event) => setForm((current) => ({ ...current, houseNR: event.target.value }))}
                className="h-12 rounded-2xl border-slate-200 px-4"
                placeholder="Opcional"
              />
              <FieldError message={requestErrors.houseNR} />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Zona</label>
              <select
                value={form.adressId}
                onChange={(event) => setForm((current) => ({ ...current, adressId: event.target.value }))}
                className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition focus:border-cyan-400 focus:ring-4 focus:ring-cyan-100"
              >
                <option value="">Seleccionar zona</option>
                {addresses.map((address) => (
                  <option key={address.id} value={address.id}>
                    {address.name} - {address.bairro}
                  </option>
                ))}
              </select>
              <FieldError message={requestErrors.adressId} />
            </div>

            <div className="md:col-span-2">
              <label className="mb-2 block text-sm font-medium text-slate-700">Observacoes</label>
              <textarea
                value={form.observacoes}
                onChange={(event) => setForm((current) => ({ ...current, observacoes: event.target.value }))}
                rows={4}
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-cyan-400 focus:ring-4 focus:ring-cyan-100"
                placeholder="Detalhes para ajudar a equipa a localizar o imovel"
              />
              <FieldError message={requestErrors.observacoes} />
            </div>

            <div className="md:col-span-2 flex justify-end">
              <Button type="button" disabled={saving} onClick={handleCreateRequest} className="bg-cyan-600 text-white hover:bg-cyan-700">
                Enviar pedido
              </Button>
            </div>
          </div>

          <div className="rounded-[26px] border border-slate-200 bg-slate-50 p-5">
            <div className="flex items-center gap-2 text-slate-900">
              <ClipboardCheck className="h-4 w-4 text-cyan-700" />
              <h3 className="text-base font-black tracking-tight">Como funciona</h3>
            </div>
            <div className="mt-4 space-y-4">
              <div className="rounded-2xl bg-white p-4 ring-1 ring-slate-200">
                <p className="text-sm font-semibold text-slate-900">1. Envio do pedido</p>
                <p className="mt-2 text-sm leading-6 text-slate-500">A tua referencia do local entra logo para analise da equipa.</p>
              </div>
              <div className="rounded-2xl bg-white p-4 ring-1 ring-slate-200">
                <p className="text-sm font-semibold text-slate-900">2. Validacao do imovel</p>
                <p className="mt-2 text-sm leading-6 text-slate-500">Se ja souberes a casa e a zona, podes enviar logo esses dados para acelerar a analise.</p>
              </div>
              <div className="rounded-2xl bg-white p-4 ring-1 ring-slate-200">
                <p className="text-sm font-semibold text-slate-900">3. Contrato e ligacao</p>
                <p className="mt-2 text-sm leading-6 text-slate-500">Depois da aprovacao, a equipa trata da instalacao, activa a conta e prepara as leituras futuras.</p>
              </div>
            </div>
          </div>
        </div>
      </Panel>

      <Panel
        title="Estado dos teus pedidos e contas"
        description="Quando algum pedido entrar em preparacao, a activacao passa a ser concluida pelo admin ou funcionario apos a instalacao."
      >
        {loading ? (
          <p className="text-sm text-slate-500">A carregar pedidos...</p>
        ) : waterCustomers.length === 0 ? (
          <EmptyState title="Sem pedidos registados" description="Ainda nao existe nenhum pedido ou conta de agua associado ao teu perfil." />
        ) : (
          <div className="space-y-4">
            {waterCustomers.map((item) => (
              <article key={item.id} className="rounded-[28px] border border-slate-200 bg-slate-50 p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-lg font-black tracking-tight text-slate-900">{item.referenciaLocal || `Conta #${item.id}`}</p>
                      <InfoChip text={statusLabel(item.estado)} tone={statusTone(item.estado)} />
                    </div>
                    <p className="mt-2 text-sm text-slate-600">{formatServiceAddress(item.adress, item.houseNR)}</p>
                    {item.observacoes ? <p className="mt-2 text-sm leading-6 text-slate-500">{item.observacoes}</p> : null}
                  </div>
                  <div className="rounded-2xl bg-white px-4 py-3 text-right ring-1 ring-slate-200">
                    <p className="text-xs uppercase tracking-[0.22em] text-slate-400">Criado em</p>
                    <p className="mt-1 text-sm font-semibold text-slate-900">{formatDateTime(item.created)}</p>
                  </div>
                </div>

                {item.estado === "AGUARDANDO_DADOS_CASA" ? (
                  <div className="mt-5 rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm">
                    <div className="flex items-center gap-2 text-amber-700">
                      <AlertTriangle className="h-4 w-4" />
                      <p className="text-sm font-semibold">A tua conta esta em preparacao interna.</p>
                    </div>
                    <div className="mt-4 rounded-2xl bg-slate-50 px-4 py-3 text-sm leading-6 text-slate-600 ring-1 ring-slate-200">
                      Depois da instalacao de agua, a equipa interna vai preencher casa e zona no painel de admin ou funcionario e activar a tua conta para seguir ao contrato.
                    </div>
                  </div>
                ) : null}
              </article>
            ))}
          </div>
        )}
      </Panel>
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

  const summary = useMemo(() => {
    const pending = bills.filter((bill) => bill.estadoPagamento !== "PAGO");
    return {
      total: bills.length,
      pending: pending.length,
      totalPendingAmount: pending.reduce((sum, item) => sum + Number(item.valorTotal || 0), 0),
    };
  }, [bills]);

  return (
    <main className="space-y-6">
      <HeroHeader
        title="Facturas emitidas para a tua conta"
        description="Consulta o historico de facturacao, consumo e estado de pagamento sem misturar isso com o fluxo de pedido."
      >
        <Button type="button" variant="outline" onClick={load} disabled={loading} className="border-white/20 bg-white/10 text-white hover:bg-white/15">
          <RefreshCw className={loading ? "animate-spin" : ""} />
          Recarregar
        </Button>
      </HeroHeader>

      <MessageStack error={error} success="" />

      <section className="grid gap-4 md:grid-cols-3">
        <StatCard label="Facturas" value={summary.total} helper="Total emitido para o teu perfil" accent="cyan" />
        <StatCard label="Pendentes" value={summary.pending} helper="Ainda por regularizar" accent="amber" />
        <StatCard label="Valor em aberto" value={formatMoney(summary.totalPendingAmount)} helper="Somatorio actual por pagar" accent="slate" />
      </section>

      <Panel title="Historico de facturas" description="Cada factura mostra os dados principais do ciclo e permite imprimir o recibo.">
        {loading ? (
          <p className="text-sm text-slate-500">A carregar facturas...</p>
        ) : bills.length === 0 ? (
          <EmptyState title="Sem facturas emitidas" description="As tuas facturas aparecerao aqui depois das primeiras leituras." />
        ) : (
          <div className="grid gap-4 xl:grid-cols-2">
            {bills.map((bill) => (
              <article key={bill.id} className="rounded-[28px] border border-slate-200 bg-slate-50 p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-cyan-700" />
                      <p className="text-lg font-black tracking-tight text-slate-900">Factura #{bill.id}</p>
                    </div>
                    <p className="mt-2 text-sm text-slate-600">{formatDateTime(bill.data)}</p>
                    <p className="mt-1 text-xs uppercase tracking-[0.22em] text-slate-400">Casa {bill.houseNR || "por definir"}</p>
                  </div>
                  <div className="text-right">
                    <InfoChip text={bill.estadoPagamento} tone={billTone(bill.estadoPagamento)} />
                    <p className="mt-3 text-lg font-black tracking-tight text-slate-900">{formatMoney(bill.valorTotal)}</p>
                  </div>
                </div>

                <div className="mt-5 grid gap-3 sm:grid-cols-3">
                  <div className="rounded-2xl bg-white p-4 ring-1 ring-slate-200">
                    <p className="text-xs uppercase tracking-[0.22em] text-slate-400">Anterior</p>
                    <p className="mt-2 font-semibold text-slate-900">{bill.leituraAnterior ?? "-"}</p>
                  </div>
                  <div className="rounded-2xl bg-white p-4 ring-1 ring-slate-200">
                    <p className="text-xs uppercase tracking-[0.22em] text-slate-400">Actual</p>
                    <p className="mt-2 font-semibold text-slate-900">{bill.leituraActual ?? "-"}</p>
                  </div>
                  <div className="rounded-2xl bg-white p-4 ring-1 ring-slate-200">
                    <p className="text-xs uppercase tracking-[0.22em] text-slate-400">Consumo</p>
                    <p className="mt-2 font-semibold text-slate-900">{bill.consumoM3 != null ? `${bill.consumoM3} m3` : "-"}</p>
                  </div>
                </div>

                <div className="mt-5">
                  <Button type="button" variant="outline" onClick={() => printWaterBillDocument(bill)}>
                    <FileText className="h-4 w-4" />
                    Imprimir recibo
                  </Button>
                </div>
              </article>
            ))}
          </div>
        )}
      </Panel>
    </main>
  );
}

export function ClientWaterPaymentsPage() {
  const [bills, setBills] = useState<WaterBill[]>([]);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("DINHEIRO_FISICO");
  const [valorPago, setValorPago] = useState("");
  const [loading, setLoading] = useState(true);
  const [payingId, setPayingId] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [confirmPayId, setConfirmPayId] = useState<number | null>(null);

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
    const currentBill = bills.find((bill) => bill.id === id);
    if (!currentBill) return;

    if (paymentMethod === "DINHEIRO_FISICO" && Number(valorPago || 0) < Number(currentBill.valorTotal || 0)) {
      setError("O valor fisico recebido nao pode ser inferior ao total da factura.");
      return;
    }

    setPayingId(id);
    setError("");
    setSuccess("");
    try {
      const updated = await payClientWaterBill(id, {
        formaPagamento: paymentMethod,
        valorPago: paymentMethod === "DINHEIRO_FISICO" ? Number(valorPago || 0) : undefined,
      });
      setBills((current) => current.map((bill) => (bill.id === updated.id ? updated : bill)));
      setSuccess(`Pagamento confirmado por ${formatPaymentMethod(paymentMethod)}.`);
      setValorPago("");
      printWaterBillDocument(updated, { autoPrint: true });
    } catch (reason) {
      setError(getErrorMessage(reason, "Nao foi possivel processar o pagamento."));
    } finally {
      setPayingId(null);
      setConfirmPayId(null);
    }
  }

  const pendingBills = bills.filter((bill) => bill.estadoPagamento !== "PAGO");
  const currentBill = confirmPayId ? pendingBills.find((bill) => bill.id === confirmPayId) : null;

  return (
    <main className="space-y-6">
      <ConfirmModal
        isOpen={confirmPayId !== null}
        title="Confirmar pagamento?"
        message={`A factura #${confirmPayId} sera paga por ${formatPaymentMethod(paymentMethod)}${currentBill ? ` no valor de ${formatMoney(currentBill.valorTotal)}` : ""}.`}
        confirmText="Pagar factura"
        cancelText="Cancelar"
        onConfirm={() => confirmPayId && handlePay(confirmPayId)}
        onCancel={() => setConfirmPayId(null)}
        isProcessing={confirmPayId !== null && payingId === confirmPayId}
        processingText="A processar..."
      />

      <HeroHeader
        title="Pagamentos de agua"
        description="Resolve as facturas pendentes com um fluxo simples, claro e consistente com o resto da plataforma."
      />

      <MessageStack error={error} success={success} />

      <section className="grid gap-4 md:grid-cols-3">
        <StatCard label="Pendentes" value={pendingBills.length} helper="Facturas prontas para pagamento" accent="amber" />
        <StatCard label="Metodo actual" value={formatPaymentMethod(paymentMethod)} helper="Usado no proximo pagamento" accent="cyan" />
        <StatCard
          label="Valor total em aberto"
          value={formatMoney(pendingBills.reduce((sum, item) => sum + Number(item.valorTotal || 0), 0))}
          helper="Montante pendente para regularizar"
          accent="slate"
        />
      </section>

      <Panel
        title="Carteira de pagamentos"
        description="Escolhe o metodo de pagamento e informa o valor recebido quando o pagamento for em dinheiro fisico."
        action={
          <div className="flex w-full flex-col gap-3 xl:flex-row xl:items-center">
            <select
              value={paymentMethod}
              onChange={(event) => setPaymentMethod(event.target.value as PaymentMethod)}
              className="h-11 rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition focus:border-cyan-400 focus:ring-4 focus:ring-cyan-100"
            >
              <option value="DINHEIRO_FISICO">Dinheiro fisico</option>
              <option value="CARTEIRA_MOVEL">Carteira movel</option>
              <option value="CARTAO">Cartao</option>
            </select>

            {paymentMethod === "DINHEIRO_FISICO" ? (
              <Input
                type="number"
                min="0"
                step="0.01"
                value={valorPago}
                onChange={(event) => setValorPago(event.target.value)}
                placeholder="Valor recebido"
                className="h-11 min-w-[220px] rounded-2xl border-slate-200 px-4"
              />
            ) : null}

            <Button type="button" variant="outline" onClick={load} disabled={loading}>
              <RefreshCw className={loading ? "animate-spin" : ""} />
              Recarregar
            </Button>
          </div>
        }
      >
        {loading ? (
          <p className="text-sm text-slate-500">A carregar pagamentos...</p>
        ) : pendingBills.length === 0 ? (
          <EmptyState title="Sem facturas pendentes" description="Nao existe nenhum pagamento em aberto neste momento." />
        ) : (
          <div className="grid gap-4 xl:grid-cols-2">
            {pendingBills.map((bill) => (
              <article key={bill.id} className="rounded-[28px] border border-slate-200 bg-slate-50 p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <CreditCard className="h-4 w-4 text-cyan-700" />
                      <p className="text-lg font-black tracking-tight text-slate-900">Factura #{bill.id}</p>
                    </div>
                    <p className="mt-2 text-sm text-slate-600">{formatDateTime(bill.data)}</p>
                    <p className="mt-1 text-xs uppercase tracking-[0.22em] text-slate-400">Casa {bill.houseNR || "por definir"}</p>
                  </div>
                  <div className="text-right">
                    <InfoChip text={bill.estadoPagamento} tone={billTone(bill.estadoPagamento)} />
                    <p className="mt-3 text-lg font-black tracking-tight text-slate-900">{formatMoney(bill.valorTotal)}</p>
                  </div>
                </div>

                <div className="mt-5 flex flex-wrap items-center gap-3">
                  <Button type="button" variant="outline" onClick={() => printWaterBillDocument(bill)}>
                    <FileText className="h-4 w-4" />
                    Imprimir recibo
                  </Button>
                  <Button
                    type="button"
                    disabled={payingId === bill.id}
                    onClick={() => setConfirmPayId(bill.id)}
                    className="bg-emerald-600 text-white hover:bg-emerald-700"
                  >
                    <CreditCard className="h-4 w-4" />
                    Pagar factura
                  </Button>
                </div>
              </article>
            ))}
          </div>
        )}
      </Panel>
    </main>
  );
}
