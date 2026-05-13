"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  CheckCircle2,
  ClipboardCheck,
  CreditCard,
  Droplets,
  FileText,
  Home,
  Loader2,
  RefreshCw,
  Search,
  ShieldCheck,
  Waves,
} from "lucide-react";
import { FieldError } from "@/components/forms/FieldError";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { customersApi } from "@/features/customers/api";
import type { Customer } from "@/features/customers/types";
import {
  activateWaterCustomer,
  applyWaterBillPenalty,
  approveWaterRequest,
  createWaterBillingRule,
  createWaterContract,
  createWaterCustomer,
  createWaterReading,
  getCurrentWaterBillingRule,
  listAddresses,
  listPendingWaterCustomers,
  listWaterBillingRules,
  listWaterBills,
  listWaterContracts,
  listWaterCustomers,
  listWaterReadings,
  payWaterBill,
  rejectWaterRequest,
  updateWaterContractState,
  updateWaterCustomer,
} from "@/features/water/api";
import type {
  AddressItem,
  WaterBill,
  WaterBillingRule,
  WaterContract,
  WaterCustomer,
  WaterReading,
} from "@/features/water/types";
import { printWaterBillDocument } from "@/lib/documents/print";
import { getSessionUser } from "@/lib/auth/session";
import { getErrorMessage, getFieldErrors } from "@/lib/errors";
import { formatDateTime, formatMoney, formatPaymentMethod } from "@/lib/formatters";
import { cn } from "@/lib/utils/index";
import {
  normalizeEmail,
  normalizeMozPhone,
  validateMozPhone,
  validateOptionalEmail,
  validateRequired,
} from "@/lib/validation/forms";

type Scope = "admin" | "staff";
type PaymentMethod = "DINHEIRO_FISICO" | "CARTEIRA_MOVEL" | "CARTAO";
type GroupedWaterBill = WaterBill & {
  groupKey: string;
  relatedBillIds: number[];
  facturasPendentes: number;
  valorFactura: number;
  multaValor: number;
  dividaValor: number;
  valorTotal: number;
};

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

type ApprovalForm = {
  houseNR: string;
  adressId: string;
  observacoes: string;
};

const paymentOptions: PaymentMethod[] = ["DINHEIRO_FISICO", "CARTEIRA_MOVEL", "CARTAO"];

const initialCustomerForm: WaterCustomerForm = {
  customerId: "",
  name: "",
  phone: "",
  email: "",
  referenciaLocal: "",
  houseNR: "",
  adressId: "",
  observacoes: "",
};

function pageBase(scope: Scope) {
  return scope === "admin" ? "/admin/agua" : "/staff/agua";
}

function statusLabel(status: WaterCustomer["estado"]) {
  switch (status) {
    case "PENDENTE_APROVACAO":
      return "Pendente de analise";
    case "AGUARDANDO_DADOS_CASA":
      return "A concluir pela equipa";
    case "ATIVO":
      return "Pronta para contrato";
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

function contractTone(status: WaterContract["estado"]) {
  return status === "ATIVA"
    ? "bg-emerald-100 text-emerald-700 ring-emerald-200"
    : "bg-rose-100 text-rose-700 ring-rose-200";
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

function billLabel(status: WaterBill["estadoPagamento"]) {
  switch (status) {
    case "PAGO":
      return "Pago";
    case "ATRASADO":
      return "Em atraso";
    default:
      return "Pendente";
  }
}

function formatServiceAddress(address?: string | null, house?: string | null) {
  if (address && house) return `${address} | Casa ${house}`;
  if (address) return `${address} | Casa por definir`;
  if (house) return `Casa ${house} | Zona por definir`;
  return "Imovel por completar";
}

function formatPercent(value?: number | null) {
  const amount = Number(value ?? 0);
  return `${new Intl.NumberFormat("pt-PT", {
    minimumFractionDigits: Number.isInteger(amount) ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(Number.isFinite(amount) ? amount : 0)}%`;
}

function matchesSearch(query: string, values: Array<string | number | null | undefined>) {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return true;

  return values
    .filter((value) => value !== null && value !== undefined && String(value).trim() !== "")
    .some((value) => String(value).toLowerCase().includes(normalized));
}

function formatAmountInput(value: number) {
  return Number.isFinite(value) ? value.toFixed(2) : "";
}

function HeroHeader({
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
    <section className="overflow-hidden rounded-[32px] bg-gradient-to-br from-slate-950 via-cyan-950 to-sky-700 p-6 text-white shadow-lg shadow-slate-950/15">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        <div className="max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-cyan-200">{badge}</p>
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
  accent: "cyan" | "emerald" | "amber" | "rose" | "slate";
}) {
  const tones = {
    cyan: "from-cyan-500/10 to-sky-500/10 text-cyan-700",
    emerald: "from-emerald-500/10 to-teal-500/10 text-emerald-700",
    amber: "from-amber-500/10 to-orange-500/10 text-amber-700",
    rose: "from-rose-500/10 to-red-500/10 text-rose-700",
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

function EmptyState({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
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
  isDanger = false,
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
  isDanger?: boolean;
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
          <Button
            type="button"
            onClick={onConfirm}
            disabled={isProcessing}
            className={isDanger ? "bg-rose-600 text-white hover:bg-rose-700" : "bg-cyan-600 text-white hover:bg-cyan-700"}
          >
            {isProcessing ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            {isProcessing ? processingText : confirmText}
          </Button>
        </div>
      </div>
    </div>
  );
}

export function WaterOverviewPage({ scope }: { scope: Scope }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [waterCustomers, setWaterCustomers] = useState<WaterCustomer[]>([]);
  const [contracts, setContracts] = useState<WaterContract[]>([]);
  const [readings, setReadings] = useState<WaterReading[]>([]);
  const [bills, setBills] = useState<WaterBill[]>([]);
  const [pendingRequests, setPendingRequests] = useState<WaterCustomer[]>([]);
  const base = pageBase(scope);

  async function load() {
    setLoading(true);
    setError("");
    try {
      const [customerRows, pendingRows, contractRows, readingRows, billRows] = await Promise.all([
        listWaterCustomers(),
        listPendingWaterCustomers(),
        listWaterContracts(),
        listWaterReadings(),
        listWaterBills(),
      ]);

      setWaterCustomers(customerRows);
      setPendingRequests(pendingRows);
      setContracts(contractRows);
      setReadings(readingRows);
      setBills(billRows);
    } catch (reason) {
      setError(getErrorMessage(reason, "Nao foi possivel carregar a visao geral da agua."));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const stats = useMemo(() => {
    const activeCustomers = waterCustomers.filter((item) => item.estado === "ATIVO" && item.activo).length;
    const cutContracts = contracts.filter((item) => item.estado === "CORTADA").length;
    const pendingBills = bills.filter((item) => item.estadoPagamento !== "PAGO");
    return {
      customers: waterCustomers.length,
      activeCustomers,
      pendingRequests: pendingRequests.length,
      contracts: contracts.length,
      cutContracts,
      readings: readings.length,
      bills: bills.length,
      pendingBills: pendingBills.length,
      pendingAmount: pendingBills.reduce((sum, item) => sum + Number(item.valorTotal || 0), 0),
    };
  }, [bills, contracts, pendingRequests.length, readings.length, waterCustomers]);

  const quickLinks = [
    {
      href: `${base}/solicitacoes`,
      title: "Solicitacoes e analise",
      text: "Aceitar pedidos, validar dados do imovel e decidir o que segue para activacao.",
    },
    {
      href: `${base}/clientes`,
      title: "Contas de agua",
      text: "Manter dados do consumidor, zona, casa e observacoes sempre correctos.",
    },
    {
      href: `${base}/contratos`,
      title: "Contratos e ligacoes",
      text: "Emitir ligacoes, cortar, reactivar e acompanhar o estado operacional.",
    },
    {
      href: `${base}/leituras`,
      title: "Leituras operacionais",
      text: "Registar consumo com contexto e deixar a facturacao pronta para cobranca.",
    },
    {
      href: `${base}/faturas`,
      title: "Facturas e caixa",
      text: "Cobrar, confirmar pagamento e emitir recibos com o mesmo padrao do sistema.",
    },
  ];

  return (
    <main className="space-y-6">
      <HeroHeader
        badge="Modulo de agua"
        title="Operacao de agua com controlo real de pedido, activacao e cobranca"
        description="O modulo agora fica organizado como uma operacao completa: entrada do pedido, validacao do imovel, activacao do servico, ligacao, leitura e cobranca, sempre dentro do mesmo padrao visual do sistema."
      >
        <Button type="button" variant="outline" onClick={load} disabled={loading} className="border-white/20 bg-white/10 text-white hover:bg-white/15">
          <RefreshCw className={loading ? "animate-spin" : ""} />
          Recarregar
        </Button>
      </HeroHeader>

      <MessageStack error={error} success="" />

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Contas de agua" value={stats.customers} helper={`${stats.activeCustomers} prontas para contrato`} accent="cyan" />
        <StatCard label="Solicitacoes" value={stats.pendingRequests} helper="Pedidos ainda em analise da equipa" accent="amber" />
        <StatCard label="Ligacoes" value={stats.contracts} helper={`${stats.cutContracts} cortadas ou suspensas`} accent="emerald" />
        <StatCard label="Facturas pendentes" value={stats.pendingBills} helper={formatMoney(stats.pendingAmount)} accent="rose" />
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        {quickLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-cyan-200 hover:shadow-md"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-cyan-50 text-cyan-700">
              <Droplets className="h-5 w-5" />
            </div>
            <h2 className="mt-4 text-lg font-black tracking-tight text-slate-900">{link.title}</h2>
            <p className="mt-2 text-sm leading-6 text-slate-500">{link.text}</p>
          </Link>
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <Panel
          title="Fila de activacao"
          description="A equipa ve logo quem ainda esta pendente, quem ja pode entrar em contrato e quem ainda precisa de casa ou zona."
        >
          {loading ? (
            <p className="text-sm text-slate-500">A carregar pipeline...</p>
          ) : pendingRequests.length === 0 ? (
            <EmptyState
              title="Nao ha pedidos pendentes"
              description="Todos os pedidos em aberto ja foram analisados ou activados."
            />
          ) : (
            <div className="space-y-4">
              {pendingRequests.slice(0, 5).map((item) => (
                <article key={item.id} className="rounded-[26px] border border-slate-200 bg-slate-50 p-4">
                  <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-base font-black tracking-tight text-slate-900">{item.name}</p>
                        <InfoChip text={statusLabel(item.estado)} tone={statusTone(item.estado)} />
                      </div>
                      <p className="mt-2 text-sm text-slate-600">{item.referenciaLocal || "Sem referencia do local"}</p>
                      <p className="mt-2 text-xs uppercase tracking-[0.24em] text-slate-400">{formatServiceAddress(item.adress, item.houseNR)}</p>
                    </div>
                    <div className="text-sm text-slate-500">
                      <p>{item.phone}</p>
                      <p>{item.email || "Sem email"}</p>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </Panel>

        <Panel
          title="Cobranca em aberto"
          description="As ultimas facturas pendentes ficam visiveis aqui para a equipa antecipar cobranca e caixa."
        >
          {loading ? (
            <p className="text-sm text-slate-500">A carregar facturas...</p>
          ) : bills.length === 0 ? (
            <EmptyState title="Sem facturas emitidas" description="Assim que houver leituras, as facturas aparecerao aqui." />
          ) : (
            <div className="space-y-4">
              {bills
                .filter((item) => item.estadoPagamento !== "PAGO")
                .slice(0, 5)
                .map((bill) => (
                  <article key={bill.id} className="rounded-[26px] border border-slate-200 bg-slate-50 p-4">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-cyan-700" />
                          <p className="font-black tracking-tight text-slate-900">Factura #{bill.id}</p>
                        </div>
                        <p className="mt-2 text-sm text-slate-600">{bill.consumidorNome}</p>
                        <p className="mt-1 text-xs uppercase tracking-[0.24em] text-slate-400">
                          Casa {bill.houseNR || "por definir"} | {formatDateTime(bill.data)}
                        </p>
                      </div>
                      <div className="text-right">
                        <InfoChip text={bill.estadoPagamento} tone={billTone(bill.estadoPagamento)} />
                        <p className="mt-3 text-lg font-black tracking-tight text-slate-900">{formatMoney(bill.valorTotal)}</p>
                      </div>
                    </div>
                  </article>
                ))}
            </div>
          )}
        </Panel>
      </section>
    </main>
  );
}

export function WaterRequestsPage({ scope }: { scope: Scope }) {
  const [items, setItems] = useState<WaterCustomer[]>([]);
  const [addresses, setAddresses] = useState<AddressItem[]>([]);
  const [approvalForms, setApprovalForms] = useState<Record<number, ApprovalForm>>({});
  const [loading, setLoading] = useState(true);
  const [workingId, setWorkingId] = useState<number | null>(null);
  const [query, setQuery] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    id: number;
    action: "approve" | "reject";
  }>({ isOpen: false, id: 0, action: "approve" });
  const base = pageBase(scope);

  async function load() {
    setLoading(true);
    setError("");
    try {
      const [pendingRows, addressRows] = await Promise.all([listPendingWaterCustomers(), listAddresses()]);
      setItems(pendingRows);
      setAddresses(addressRows);
      setApprovalForms(
        pendingRows.reduce<Record<number, ApprovalForm>>((acc, item) => {
          acc[item.id] = {
            houseNR: item.houseNR || "",
            adressId: item.adressId ? String(item.adressId) : "",
            observacoes: item.observacoes || "",
          };
          return acc;
        }, {})
      );
    } catch (reason) {
      setError(getErrorMessage(reason, "Nao foi possivel carregar as solicitacoes."));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  function setApprovalField(id: number, field: keyof ApprovalForm, value: string) {
    setApprovalForms((current) => ({
      ...current,
      [id]: {
        ...(current[id] ?? { houseNR: "", adressId: "", observacoes: "" }),
        [field]: value,
      },
    }));
  }

  async function handleDecision(id: number, action: "approve" | "reject") {
    const form = approvalForms[id] ?? { houseNR: "", adressId: "", observacoes: "" };
    const hasHouse = form.houseNR.trim().length > 0;
    const hasAddress = form.adressId.length > 0;

    if (action === "approve" && hasHouse !== hasAddress) {
      setError("Para activar diretamente o servico, preenche o numero da casa e a zona em conjunto.");
      setConfirmModal({ isOpen: false, id: 0, action: "approve" });
      return;
    }

    setWorkingId(id);
    setError("");
    setSuccess("");
    try {
      if (action === "approve") {
        await approveWaterRequest(id, {
          houseNR: hasHouse ? form.houseNR.trim() : undefined,
          adressId: hasAddress ? Number(form.adressId) : undefined,
          observacoes: form.observacoes.trim() || undefined,
        });
        setSuccess(
          hasHouse && hasAddress
            ? "Pedido aprovado e conta pronta para contrato de agua."
            : "Pedido aprovado. A conta ficou a aguardar dados completos do imovel."
        );
      } else {
        await rejectWaterRequest(id, {
          observacoes: form.observacoes.trim() || undefined,
        });
        setSuccess("Pedido rejeitado com sucesso.");
      }
      await load();
    } catch (reason) {
      setError(getErrorMessage(reason, "Nao foi possivel actualizar a solicitacao."));
    } finally {
      setWorkingId(null);
      setConfirmModal({ isOpen: false, id: 0, action: "approve" });
    }
  }

  const filteredItems = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return items;
    return items.filter((item) =>
      [
        item.name,
        item.phone,
        item.email,
        item.referenciaLocal,
        item.adress,
        item.houseNR,
        item.observacoes,
      ]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(normalized))
    );
  }, [items, query]);

  const readyToActivate = filteredItems.filter((item) => item.houseNR && item.adressId).length;

  return (
    <main className="space-y-6">
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        title={confirmModal.action === "approve" ? "Confirmar aprovacao?" : "Confirmar rejeicao?"}
        message={
          confirmModal.action === "approve"
            ? "Se a casa e a zona estiverem preenchidas, a conta fica pronta para seguir ao contrato. Caso contrario, ela fica com a equipa para conclusao apos a instalacao."
            : "O pedido sera rejeitado e a equipa mantera o historico desta decisao."
        }
        confirmText={confirmModal.action === "approve" ? "Aprovar pedido" : "Rejeitar pedido"}
        cancelText="Cancelar"
        onConfirm={() => handleDecision(confirmModal.id, confirmModal.action)}
        onCancel={() => setConfirmModal({ isOpen: false, id: 0, action: "approve" })}
        isDanger={confirmModal.action === "reject"}
        isProcessing={workingId === confirmModal.id}
        processingText={confirmModal.action === "approve" ? "A aprovar..." : "A rejeitar..."}
      />

      <HeroHeader
        badge="Solicitacoes"
        title="Aceitacao de pedidos com activacao interna"
        description="Cada pedido entra aqui com nome, contacto, referencia do local e dados do imovel. A equipa pode aprovar, activar de imediato quando a casa estiver completa ou concluir depois da instalacao no painel interno."
      >
        <Button type="button" variant="outline" onClick={load} disabled={loading} className="border-white/20 bg-white/10 text-white hover:bg-white/15">
          <RefreshCw className={loading ? "animate-spin" : ""} />
          Recarregar
        </Button>
      </HeroHeader>

      <MessageStack error={error} success={success} />

      <section className="grid gap-4 md:grid-cols-3">
        <StatCard label="Pendentes" value={filteredItems.length} helper="Pedidos ainda a aguardar decisao" accent="amber" />
        <StatCard label="Prontos para activar" value={readyToActivate} helper="Ja tem numero da casa e zona informados" accent="emerald" />
        <StatCard label="A completar" value={filteredItems.length - readyToActivate} helper="Precisam de mais dados do imovel" accent="slate" />
      </section>

      <Panel
        title="Fila de pedidos"
        description="Usa a caixa de pesquisa para localizar rapidamente um pedido por pessoa, telefone, local ou zona."
        action={
          <label className="relative w-full sm:w-[320px]">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Pesquisar pedido..."
              className="h-11 rounded-2xl border-slate-200 pl-9"
            />
          </label>
        }
      >
        {loading ? (
          <p className="text-sm text-slate-500">A carregar solicitacoes...</p>
        ) : filteredItems.length === 0 ? (
          <EmptyState
            title="Sem pedidos nesta fila"
            description="Nao ha solicitacoes pendentes para os filtros actuais."
          />
        ) : (
          <div className="space-y-5">
            {filteredItems.map((item) => {
              const approval = approvalForms[item.id] ?? { houseNR: "", adressId: "", observacoes: "" };
              const hasDirectActivation = approval.houseNR.trim() && approval.adressId;
              return (
                <article key={item.id} className="rounded-[28px] border border-slate-200 bg-slate-50 p-5">
                  <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
                    <div className="space-y-4">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="text-lg font-black tracking-tight text-slate-900">{item.name}</p>
                            <InfoChip text={statusLabel(item.estado)} tone={statusTone(item.estado)} />
                          </div>
                          <p className="mt-2 text-sm leading-6 text-slate-600">{item.referenciaLocal || "Sem referencia do local"}</p>
                        </div>
                        <div className="rounded-2xl bg-white px-4 py-3 text-right ring-1 ring-slate-200">
                          <p className="text-xs uppercase tracking-[0.22em] text-slate-400">Recebido em</p>
                          <p className="mt-1 text-sm font-semibold text-slate-900">{formatDateTime(item.created)}</p>
                        </div>
                      </div>

                      <div className="grid gap-3 sm:grid-cols-2">
                        <div className="rounded-2xl bg-white p-4 ring-1 ring-slate-200">
                          <p className="text-xs uppercase tracking-[0.22em] text-slate-400">Contacto</p>
                          <p className="mt-2 font-semibold text-slate-900">{item.phone}</p>
                          <p className="mt-1 text-sm text-slate-500">{item.email || "Sem email associado"}</p>
                        </div>
                        <div className="rounded-2xl bg-white p-4 ring-1 ring-slate-200">
                          <p className="text-xs uppercase tracking-[0.22em] text-slate-400">Imovel</p>
                          <p className="mt-2 font-semibold text-slate-900">{formatServiceAddress(item.adress, item.houseNR)}</p>
                          <p className="mt-1 text-sm text-slate-500">
                            {item.observacoes || "Sem observacoes adicionais no pedido."}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm">
                      <div className="flex items-center gap-2 text-slate-900">
                        <ClipboardCheck className="h-4 w-4 text-cyan-700" />
                        <h3 className="text-base font-black tracking-tight">Mesa de activacao</h3>
                      </div>
                      <p className="mt-2 text-sm leading-6 text-slate-500">
                        Se preencheres a casa e a zona aqui, o pedido ja sai desta etapa pronto para contrato. Se a instalacao ainda nao terminou, aprova e conclui depois na base de contas.
                      </p>

                      <div className="mt-5 grid gap-4 md:grid-cols-2">
                        <div>
                          <label className="mb-2 block text-sm font-medium text-slate-700">Numero da casa</label>
                          <Input
                            value={approval.houseNR}
                            onChange={(event) => setApprovalField(item.id, "houseNR", event.target.value)}
                            className="h-11 rounded-2xl border-slate-200 px-4"
                            placeholder="Ex.: 14B"
                          />
                        </div>
                        <div>
                          <label className="mb-2 block text-sm font-medium text-slate-700">Zona</label>
                          <select
                            value={approval.adressId}
                            onChange={(event) => setApprovalField(item.id, "adressId", event.target.value)}
                            className="h-11 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition focus:border-cyan-400 focus:ring-4 focus:ring-cyan-100"
                          >
                            <option value="">Seleccionar zona</option>
                            {addresses.map((address) => (
                              <option key={address.id} value={address.id}>
                                {address.name} - {address.bairro}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div className="md:col-span-2">
                          <label className="mb-2 block text-sm font-medium text-slate-700">Observacoes da equipa</label>
                          <textarea
                            value={approval.observacoes}
                            onChange={(event) => setApprovalField(item.id, "observacoes", event.target.value)}
                            rows={3}
                            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-cyan-400 focus:ring-4 focus:ring-cyan-100"
                            placeholder="Escreve uma nota de aprovacao, devolucao ou recusa..."
                          />
                        </div>
                      </div>

                      <div className="mt-5 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                        <div className="text-sm text-slate-500">
                          {hasDirectActivation ? (
                            <div className="flex items-center gap-2 text-emerald-700">
                              <ShieldCheck className="h-4 w-4" />
                              <span>Aprovacao pronta para activacao direta.</span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2 text-amber-700">
                              <AlertTriangle className="h-4 w-4" />
                              <span>Sem casa e zona completas, a conta ficara com a equipa para conclusao apos a instalacao.</span>
                            </div>
                          )}
                        </div>
                        <div className="flex flex-wrap gap-3">
                          <Button
                            type="button"
                            variant="outline"
                            disabled={workingId === item.id}
                            onClick={() => setConfirmModal({ isOpen: true, id: item.id, action: "reject" })}
                          >
                            Rejeitar
                          </Button>
                          <Button
                            type="button"
                            disabled={workingId === item.id}
                            onClick={() => setConfirmModal({ isOpen: true, id: item.id, action: "approve" })}
                            className="bg-emerald-600 text-white hover:bg-emerald-700"
                          >
                            Aprovar pedido
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}

        <div className="mt-6 rounded-[24px] border border-dashed border-slate-200 bg-slate-50 p-4 text-sm text-slate-500">
          Quando o pedido ja sair com dados completos do imovel, ele entra na pagina de <Link href={`${base}/contratos`} className="font-semibold text-cyan-700 underline-offset-4 hover:underline">contratos</Link> pronto para gerar a ligacao.
        </div>
      </Panel>
    </main>
  );
}

export function WaterCustomersPage({ scope }: { scope: Scope }) {
  void scope;
  const [waterCustomers, setWaterCustomers] = useState<WaterCustomer[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [addresses, setAddresses] = useState<AddressItem[]>([]);
  const [form, setForm] = useState<WaterCustomerForm>(initialCustomerForm);
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<WaterCustomerField, string>>>({});
  const [editingId, setEditingId] = useState<number | null>(null);
  const [activationDraft, setActivationDraft] = useState<{
    item: WaterCustomer;
    houseNR: string;
    adressId: string;
    observacoes: string;
  } | null>(null);
  const [activationErrors, setActivationErrors] = useState<{ houseNR?: string; adressId?: string }>({});
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const sessionUser = useMemo(() => getSessionUser(), []);
  const canManageCustomers =
    sessionUser?.role === "ADMIN" || Boolean(sessionUser?.permissions.includes("water.customers.manage"));
  const canActivateCustomers =
    sessionUser?.role === "ADMIN" || Boolean(sessionUser?.permissions.includes("water.customers.activate"));

  const customerMap = useMemo(() => new Map(customers.map((customer) => [customer.id, customer])), [customers]);

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

  function resetForm() {
    setEditingId(null);
    setForm(initialCustomerForm);
    setFieldErrors({});
  }

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

  function findLinkedCustomer(item: WaterCustomer) {
    return customers.find(
      (customer) =>
        customer.phone === item.phone || (item.email && customer.email && customer.email.toLowerCase() === item.email.toLowerCase())
    );
  }

  function editItem(item: WaterCustomer) {
    const linkedCustomer = findLinkedCustomer(item);

    setEditingId(item.id);
    setForm({
      customerId: linkedCustomer ? String(linkedCustomer.id) : "",
      name: item.name,
      phone: item.phone,
      email: item.email ?? "",
      referenciaLocal: item.referenciaLocal ?? "",
      houseNR: item.houseNR ?? "",
      adressId: item.adressId ? String(item.adressId) : "",
      observacoes: item.observacoes ?? "",
    });
    setFieldErrors({});
    setError("");
    setSuccess("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function openActivation(item: WaterCustomer) {
    setActivationDraft({
      item,
      houseNR: item.houseNR ?? "",
      adressId: item.adressId ? String(item.adressId) : "",
      observacoes: "Instalacao de agua concluida. Conta activada pela equipa.",
    });
    setActivationErrors({});
    setError("");
    setSuccess("");
  }

  async function handleActivationSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!activationDraft) return;

    const nextErrors: { houseNR?: string; adressId?: string } = {};
    if (!activationDraft.houseNR.trim()) nextErrors.houseNR = "Introduz o numero da casa instalado.";
    if (!activationDraft.adressId) nextErrors.adressId = "Selecciona a zona da instalacao.";
    setActivationErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setSaving(true);
    setError("");
    setSuccess("");
    try {
      await activateWaterCustomer(activationDraft.item.id, {
        houseNR: activationDraft.houseNR.trim(),
        adressId: Number(activationDraft.adressId),
        observacoes: activationDraft.observacoes.trim() || null,
      });
      setActivationDraft(null);
      setActivationErrors({});
      setSuccess("Activacao concluida. A conta ficou pronta para contrato.");
      await load();
    } catch (reason) {
      const apiErrors = getFieldErrors(reason);
      setActivationErrors({
        houseNR: apiErrors.houseNR,
        adressId: apiErrors.adressId,
      });
      setError(getErrorMessage(reason, "Nao foi possivel concluir a activacao."));
    } finally {
      setSaving(false);
    }
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

    const payload = {
      customerId: form.customerId ? Number(form.customerId) : null,
      name: form.name.trim(),
      phone: normalizeMozPhone(form.phone),
      email: form.email.trim() ? normalizeEmail(form.email) : null,
      referenciaLocal: form.referenciaLocal.trim(),
      houseNR: form.houseNR.trim() || null,
      adressId: form.adressId ? Number(form.adressId) : null,
      observacoes: form.observacoes.trim() || null,
    };

    try {
      if (editingId) {
        await updateWaterCustomer(editingId, payload);
        setSuccess(
          payload.houseNR && payload.adressId
            ? "Conta de agua actualizada e pronta para contrato."
            : "Conta de agua actualizada com sucesso."
        );
      } else {
        await createWaterCustomer(payload);
        setSuccess(
          payload.houseNR && payload.adressId
            ? "Conta de agua criada e pronta para contrato."
            : "Conta de agua criada com sucesso."
        );
      }

      resetForm();
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
      setError(getErrorMessage(reason, "Nao foi possivel guardar a conta de agua."));
    } finally {
      setSaving(false);
    }
  }

  const filteredItems = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return waterCustomers;
    return waterCustomers.filter((item) =>
      [
        item.name,
        item.phone,
        item.email,
        item.referenciaLocal,
        item.adress,
        item.houseNR,
        item.observacoes,
      ]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(normalized))
    );
  }, [query, waterCustomers]);

  const summary = useMemo(
    () => ({
      total: waterCustomers.length,
      active: waterCustomers.filter((item) => item.estado === "ATIVO" && item.activo).length,
      awaiting: waterCustomers.filter((item) => item.estado === "AGUARDANDO_DADOS_CASA").length,
      pending: waterCustomers.filter((item) => item.estado === "PENDENTE_APROVACAO").length,
    }),
    [waterCustomers]
  );

  return (
    <main className="space-y-6">
      {activationDraft ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 px-4">
          <div className="w-full max-w-2xl rounded-[28px] border border-slate-200 bg-white p-6 shadow-2xl">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-700">Instalacao de agua</p>
                <h3 className="mt-2 text-xl font-black tracking-tight text-slate-900">Concluir activacao</h3>
                <p className="mt-2 text-sm leading-6 text-slate-500">
                  {activationDraft.item.name} - {activationDraft.item.referenciaLocal || "Sem referencia do local"}
                </p>
              </div>
              <InfoChip text="Activa ao guardar" tone="bg-emerald-100 text-emerald-700 ring-emerald-200" />
            </div>

            <form onSubmit={handleActivationSubmit} className="mt-6 grid gap-5 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">Numero da casa instalado</label>
                <Input
                  value={activationDraft.houseNR}
                  onChange={(event) =>
                    setActivationDraft((current) => current ? { ...current, houseNR: event.target.value } : current)
                  }
                  className="h-12 rounded-2xl border-slate-200 px-4"
                  placeholder="Ex.: 14B"
                />
                <FieldError message={activationErrors.houseNR} />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">Zona da instalacao</label>
                <select
                  value={activationDraft.adressId}
                  onChange={(event) =>
                    setActivationDraft((current) => current ? { ...current, adressId: event.target.value } : current)
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
                <FieldError message={activationErrors.adressId} />
              </div>

              <div className="md:col-span-2">
                <label className="mb-2 block text-sm font-medium text-slate-700">Nota da equipa</label>
                <textarea
                  value={activationDraft.observacoes}
                  onChange={(event) =>
                    setActivationDraft((current) => current ? { ...current, observacoes: event.target.value } : current)
                  }
                  rows={3}
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-cyan-400 focus:ring-4 focus:ring-cyan-100"
                />
              </div>

              <div className="md:col-span-2 flex flex-wrap justify-end gap-3">
                <Button type="button" variant="outline" onClick={() => setActivationDraft(null)} disabled={saving}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={saving} className="bg-emerald-600 text-white hover:bg-emerald-700">
                  Concluir e activar
                </Button>
              </div>
            </form>
          </div>
        </div>
      ) : null}

      <HeroHeader
        badge="Contas de agua"
        title="Gestao completa do consumidor e do imovel"
        description="Esta pagina liga o registo da pessoa ao servico de agua, guarda numero da casa, zona e observacoes operacionais, e deixa cada conta pronta para contrato sem improviso."
      />

      <MessageStack error={error} success={success} />

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Registos" value={summary.total} helper="Total de contas de agua cadastradas" accent="cyan" />
        <StatCard label="Prontas para contrato" value={summary.active} helper="Ja com casa e zona validadas" accent="emerald" />
        <StatCard label="A completar" value={summary.awaiting} helper="Faltam dados do imovel para activacao" accent="amber" />
        <StatCard label="Pendentes" value={summary.pending} helper="Ainda dependem de analise da equipa" accent="slate" />
      </section>

      {canManageCustomers ? (
        <Panel
          title={editingId ? "Actualizar conta de agua" : "Nova conta de agua"}
          description="Podes criar um registo do zero ou aproveitar um cadastro ja existente da base de clientes."
          action={
            editingId ? (
              <Button type="button" variant="outline" onClick={resetForm}>
                Cancelar edicao
              </Button>
            ) : null
          }
        >
          <form onSubmit={handleSubmit} className="grid gap-5 md:grid-cols-2">
            <div className="md:col-span-2">
              <label className="mb-2 block text-sm font-medium text-slate-700">Cadastro existente</label>
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
              <label className="mb-2 block text-sm font-medium text-slate-700">Email</label>
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
                rows={4}
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-cyan-400 focus:ring-4 focus:ring-cyan-100"
              />
              <FieldError message={fieldErrors.observacoes} />
            </div>

            <div className="md:col-span-2 flex flex-wrap justify-end gap-3">
              {editingId ? (
                <Button type="button" variant="outline" onClick={resetForm}>
                  Limpar
                </Button>
              ) : null}
              <Button type="submit" disabled={saving} className="bg-cyan-600 text-white hover:bg-cyan-700">
                {editingId ? "Guardar alteracoes" : "Criar conta de agua"}
              </Button>
            </div>
          </form>
        </Panel>
      ) : null}

      <Panel
        title="Base de contas de agua"
        description="Pesquisa por pessoa, telefone, referencia do local, casa ou zona."
        action={
          <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
            <label className="relative sm:w-[320px]">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Pesquisar conta de agua..."
                className="h-11 rounded-2xl border-slate-200 pl-9"
              />
            </label>
            <Button type="button" variant="outline" onClick={load} disabled={loading}>
              <RefreshCw className={loading ? "animate-spin" : ""} />
              Recarregar
            </Button>
          </div>
        }
      >
        {loading ? (
          <p className="text-sm text-slate-500">A carregar contas de agua...</p>
        ) : filteredItems.length === 0 ? (
          <EmptyState title="Sem contas registadas" description="Ainda nao existem contas de agua para estes filtros." />
        ) : (
          <div className="grid gap-4 xl:grid-cols-2">
            {filteredItems.map((item) => (
              <article key={item.id} className="rounded-[28px] border border-slate-200 bg-slate-50 p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-lg font-black tracking-tight text-slate-900">{item.name}</p>
                      <InfoChip text={statusLabel(item.estado)} tone={statusTone(item.estado)} />
                    </div>
                    <p className="mt-2 text-sm text-slate-600">{item.referenciaLocal || "Sem referencia do local"}</p>
                  </div>
                  {canManageCustomers || canActivateCustomers ? (
                    <div className="flex flex-wrap gap-2">
                      {canActivateCustomers && item.estado === "AGUARDANDO_DADOS_CASA" ? (
                        <Button type="button" onClick={() => openActivation(item)} className="bg-emerald-600 text-white hover:bg-emerald-700">
                          Concluir activacao
                        </Button>
                      ) : null}
                      {canManageCustomers ? (
                        <Button type="button" variant="outline" onClick={() => editItem(item)}>
                          Editar dados
                        </Button>
                      ) : null}
                    </div>
                  ) : null}
                </div>

                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  <div className="rounded-2xl bg-white p-4 ring-1 ring-slate-200">
                    <p className="text-xs uppercase tracking-[0.22em] text-slate-400">Contacto</p>
                    <p className="mt-2 font-semibold text-slate-900">{item.phone}</p>
                    <p className="mt-1 text-sm text-slate-500">{item.email || "Sem email associado"}</p>
                  </div>
                  <div className="rounded-2xl bg-white p-4 ring-1 ring-slate-200">
                    <p className="text-xs uppercase tracking-[0.22em] text-slate-400">Imovel</p>
                    <p className="mt-2 font-semibold text-slate-900">{formatServiceAddress(item.adress, item.houseNR)}</p>
                    <p className="mt-1 text-sm text-slate-500">{formatDateTime(item.created)}</p>
                  </div>
                </div>

                {item.observacoes ? (
                  <div className="mt-4 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm leading-6 text-slate-600">
                    {item.observacoes}
                  </div>
                ) : null}

                {item.estado === "AGUARDANDO_DADOS_CASA" ? (
                  <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm leading-6 text-amber-800">
                    Depois da instalacao de agua, usa o botao Concluir activacao para preencher casa e zona e deixar esta conta pronta para contrato.
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

export function WaterBillingRulesPage({ scope }: { scope: Scope }) {
  void scope;
  const [rules, setRules] = useState<WaterBillingRule[]>([]);
  const [currentRule, setCurrentRule] = useState<WaterBillingRule | null>(null);
  const [form, setForm] = useState({ precoM3: "45", taxaFixa: "150", percentualMulta: "0", descricao: "" });
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function load() {
    setLoading(true);
    setError("");
    try {
      const [ruleRows, activeRule] = await Promise.all([listWaterBillingRules(), getCurrentWaterBillingRule()]);
      setRules(ruleRows);
      setCurrentRule(activeRule);
      setForm((current) => ({
        ...current,
        precoM3: String(activeRule.precoM3 ?? 45),
        taxaFixa: String(activeRule.taxaFixa ?? 150),
        percentualMulta: String(activeRule.percentualMulta ?? 0),
      }));
    } catch (reason) {
      setError(getErrorMessage(reason, "Nao foi possivel carregar as regras de cobranca."));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  function validateRule() {
    const nextErrors: Record<string, string> = {};
    const precoM3 = Number(form.precoM3);
    const taxaFixa = Number(form.taxaFixa);
    const percentualMulta = Number(form.percentualMulta);
    if (!form.precoM3 || Number.isNaN(precoM3) || precoM3 <= 0) {
      nextErrors.precoM3 = "Introduz um preco por m3 maior que zero.";
    }
    if (form.taxaFixa && (Number.isNaN(taxaFixa) || taxaFixa < 0)) {
      nextErrors.taxaFixa = "A taxa fixa nao pode ser negativa.";
    }
    if (form.percentualMulta && (Number.isNaN(percentualMulta) || percentualMulta < 0 || percentualMulta > 100)) {
      nextErrors.percentualMulta = "A multa deve ficar entre 0 e 100%.";
    }
    setFieldErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSuccess("");
    setFieldErrors({});
    if (!validateRule()) return;

    setSaving(true);
    try {
      await createWaterBillingRule({
        precoM3: Number(form.precoM3),
        taxaFixa: form.taxaFixa ? Number(form.taxaFixa) : null,
        percentualMulta: form.percentualMulta ? Number(form.percentualMulta) : 0,
        descricao: form.descricao.trim() || null,
      });
      setForm((current) => ({ ...current, descricao: "" }));
      setSuccess("Regra de cobranca activa actualizada com sucesso.");
      await load();
    } catch (reason) {
      const apiErrors = getFieldErrors(reason);
      setFieldErrors({
        precoM3: apiErrors.precoM3,
        taxaFixa: apiErrors.taxaFixa,
        percentualMulta: apiErrors.percentualMulta,
        descricao: apiErrors.descricao,
      });
      setError(getErrorMessage(reason, "Nao foi possivel guardar a regra de cobranca."));
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="space-y-6">
      <HeroHeader
        badge="Regras de cobranca"
        title="Politica activa de tarifa, taxa fixa e multa"
        description="Define a regra activa usada nas proximas leituras e o percentual de multa de 0 a 100% para aplicacao manual nas contas pendentes."
      >
        <Button type="button" variant="outline" onClick={load} disabled={loading} className="border-white/20 bg-white/10 text-white hover:bg-white/15">
          <RefreshCw className={loading ? "animate-spin" : ""} />
          Recarregar
        </Button>
      </HeroHeader>

      <MessageStack error={error} success={success} />

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Preco activo" value={formatMoney(currentRule?.precoM3 ?? 45)} helper="Valor cobrado por cada m3 consumido" accent="cyan" />
        <StatCard label="Taxa fixa" value={formatMoney(currentRule?.taxaFixa ?? 150)} helper="Valor somado automaticamente na factura" accent="slate" />
        <StatCard
          label="Multa activa"
          value={formatPercent(currentRule?.percentualMulta ?? 0)}
          helper="Percentual disponivel para aplicacao manual nas facturas pendentes"
          accent="amber"
        />
        <StatCard label="Historico" value={rules.length} helper="Regras registadas no modulo de agua" accent="emerald" />
      </section>

      <Panel
        title="Nova regra de cobranca"
        description="Ao guardar, esta politica passa a valer para as proximas leituras e define a percentagem usada quando a equipa aplicar multa manualmente."
      >
        <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
          <form onSubmit={handleSubmit} className="grid gap-5 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Preco por m3 (MZN)</label>
              <Input
                value={form.precoM3}
                onChange={(event) => setForm((current) => ({ ...current, precoM3: event.target.value }))}
                className="h-12 rounded-2xl border-slate-200 px-4"
                type="number"
                min="0"
                step="0.01"
              />
              <FieldError message={fieldErrors.precoM3} />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Taxa fixa mensal (MZN)</label>
              <Input
                value={form.taxaFixa}
                onChange={(event) => setForm((current) => ({ ...current, taxaFixa: event.target.value }))}
                className="h-12 rounded-2xl border-slate-200 px-4"
                type="number"
                min="0"
                step="0.01"
              />
              <FieldError message={fieldErrors.taxaFixa} />
            </div>

            <div className="md:col-span-2">
              <label className="mb-2 block text-sm font-medium text-slate-700">Multa por atraso (%)</label>
              <Input
                value={form.percentualMulta}
                onChange={(event) => setForm((current) => ({ ...current, percentualMulta: event.target.value }))}
                className="h-12 rounded-2xl border-slate-200 px-4"
                type="number"
                min="0"
                max="100"
                step="0.01"
              />
              <FieldError message={fieldErrors.percentualMulta} />
              <p className="mt-2 text-xs uppercase tracking-[0.18em] text-slate-400">
                Usa 0 para desactivar multa. Usa 100 para cobrar o dobro do total em atraso.
              </p>
            </div>

            <div className="md:col-span-2">
              <label className="mb-2 block text-sm font-medium text-slate-700">Descricao</label>
              <textarea
                value={form.descricao}
                onChange={(event) => setForm((current) => ({ ...current, descricao: event.target.value }))}
                rows={3}
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-cyan-400 focus:ring-4 focus:ring-cyan-100"
                placeholder="Ex.: Tarifa geral aprovada para Maio"
              />
              <FieldError message={fieldErrors.descricao} />
            </div>

            <div className="md:col-span-2 flex justify-end">
              <Button type="submit" disabled={saving} className="bg-cyan-600 text-white hover:bg-cyan-700">
                Guardar regra activa
              </Button>
            </div>
          </form>

          <div className="rounded-[28px] border border-slate-200 bg-slate-50 p-5">
            <div className="flex items-center gap-2 text-slate-900">
              <ClipboardCheck className="h-4 w-4 text-cyan-700" />
              <h3 className="text-base font-black tracking-tight">Resumo da politica actual</h3>
            </div>

            <div className="mt-4 grid gap-3">
              <div className="rounded-2xl bg-white p-4 ring-1 ring-slate-200">
                <p className="text-xs uppercase tracking-[0.22em] text-slate-400">Consumo</p>
                <p className="mt-2 text-lg font-black tracking-tight text-slate-900">
                  {formatMoney(currentRule?.precoM3 ?? 45)} por m3
                </p>
              </div>
              <div className="rounded-2xl bg-white p-4 ring-1 ring-slate-200">
                <p className="text-xs uppercase tracking-[0.22em] text-slate-400">Taxa fixa</p>
                <p className="mt-2 text-lg font-black tracking-tight text-slate-900">
                  {formatMoney(currentRule?.taxaFixa ?? 150)}
                </p>
              </div>
              <div className="rounded-2xl bg-white p-4 ring-1 ring-slate-200">
                <p className="text-xs uppercase tracking-[0.22em] text-slate-400">Multa em atraso</p>
                <p className="mt-2 text-lg font-black tracking-tight text-slate-900">
                  {formatPercent(currentRule?.percentualMulta ?? 0)}
                </p>
                <p className="mt-1 text-sm leading-6 text-slate-500">
                  O adicional fica preparado para aplicacao manual nas facturas pendentes emitidas com esta politica.
                </p>
              </div>
              <div className="rounded-2xl border border-dashed border-slate-200 bg-white px-4 py-4 text-sm leading-6 text-slate-600">
                {currentRule?.descricao || "Sem descricao. O sistema vai usar a regra activa mesmo sem texto complementar."}
              </div>
            </div>
          </div>
        </div>
      </Panel>

      <Panel
        title="Historico de regras"
        description="A regra marcada como activa e a que sera usada nas proximas leituras e nas multas das novas facturas."
      >
        {loading ? (
          <p className="text-sm text-slate-500">A carregar regras...</p>
        ) : rules.length === 0 ? (
          <EmptyState
            title="Sem regras registadas"
            description="Ainda nao existe regra criada. O sistema usa o padrao de 45 MZN por m3, 150 MZN de taxa fixa e 0% de multa."
          />
        ) : (
          <div className="grid gap-4 xl:grid-cols-2">
            {rules.map((rule) => (
              <article key={rule.id ?? `default-${rule.criadoEm}`} className="rounded-[28px] border border-slate-200 bg-slate-50 p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-lg font-black tracking-tight text-slate-900">{formatMoney(rule.precoM3)} por m3</p>
                      {rule.activo ? <InfoChip text="Activa" tone="bg-emerald-100 text-emerald-700 ring-emerald-200" /> : null}
                    </div>
                    <p className="mt-2 text-sm text-slate-600">{rule.descricao || "Sem descricao"}</p>
                  </div>
                  <div className="rounded-2xl bg-white px-4 py-3 text-right ring-1 ring-slate-200">
                    <p className="text-xs uppercase tracking-[0.22em] text-slate-400">Taxa fixa</p>
                    <p className="mt-1 text-sm font-semibold text-slate-900">{formatMoney(rule.taxaFixa)}</p>
                  </div>
                </div>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <div className="rounded-2xl bg-white p-4 ring-1 ring-slate-200">
                    <p className="text-xs uppercase tracking-[0.22em] text-slate-400">Multa</p>
                    <p className="mt-2 font-semibold text-slate-900">{formatPercent(rule.percentualMulta ?? 0)}</p>
                  </div>
                  <div className="rounded-2xl bg-white p-4 ring-1 ring-slate-200">
                    <p className="text-xs uppercase tracking-[0.22em] text-slate-400">Aplica a</p>
                    <p className="mt-2 font-semibold text-slate-900">Novas leituras e facturas</p>
                  </div>
                </div>
                <p className="mt-4 text-xs uppercase tracking-[0.22em] text-slate-400">{formatDateTime(rule.criadoEm)}</p>
              </article>
            ))}
          </div>
        )}
      </Panel>
    </main>
  );
}

export function WaterContractsPage({ scope }: { scope: Scope }) {
  void scope;
  const [waterCustomers, setWaterCustomers] = useState<WaterCustomer[]>([]);
  const [contracts, setContracts] = useState<WaterContract[]>([]);
  const [customerId, setCustomerId] = useState("");
  const [readyQuery, setReadyQuery] = useState("");
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [toggleConfirm, setToggleConfirm] = useState<{
    isOpen: boolean;
    contract: WaterContract | null;
  }>({ isOpen: false, contract: null });

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

  const activeContractIds = useMemo(
    () => new Set(contracts.filter((item) => item.estado === "ATIVA").map((item) => item.consumidorId)),
    [contracts]
  );

  const readyCustomers = useMemo(
    () =>
      waterCustomers.filter(
        (item) => item.estado === "ATIVO" && item.activo && !activeContractIds.has(item.id)
      ),
    [activeContractIds, waterCustomers]
  );

  const selectedCustomer = useMemo(
    () => readyCustomers.find((item) => item.id === Number(customerId)) ?? null,
    [customerId, readyCustomers]
  );

  const filteredReadyCustomers = useMemo(() => {
    const normalized = readyQuery.trim().toLowerCase();
    if (!normalized) return readyCustomers;
    return readyCustomers.filter((item) =>
      [
        item.id,
        item.name,
        item.referenciaLocal,
        item.adress,
        item.houseNR,
        item.phone,
        item.email,
      ]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(normalized))
    );
  }, [readyCustomers, readyQuery]);

  const filteredContracts = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return contracts;
    return contracts.filter((item) =>
      [
        item.id,
        item.consumidorNome,
        item.referenciaLocal,
        item.adress,
        item.houseNR,
        item.phone,
        item.email,
        item.funcionarioNome,
        item.estado,
      ]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(normalized))
    );
  }, [contracts, query]);

  async function handleCreate() {
    if (!customerId) {
      setError("Selecciona primeiro uma conta de agua pronta para contrato.");
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
      setToggleConfirm({ isOpen: false, contract: null });
    }
  }

  return (
    <main className="space-y-6">
      <ConfirmModal
        isOpen={toggleConfirm.isOpen}
        title={toggleConfirm.contract?.estado === "ATIVA" ? "Cortar ligacao?" : "Reactivar ligacao?"}
        message={
          toggleConfirm.contract?.estado === "ATIVA"
            ? `O fornecimento de agua de ${toggleConfirm.contract?.consumidorNome} ficara cortado ate nova reactivacao.`
            : `A ligacao de ${toggleConfirm.contract?.consumidorNome} voltara ao estado activo.`
        }
        confirmText={toggleConfirm.contract?.estado === "ATIVA" ? "Cortar agua" : "Reactivar ligacao"}
        cancelText="Cancelar"
        onConfirm={() => toggleConfirm.contract && handleToggle(toggleConfirm.contract)}
        onCancel={() => setToggleConfirm({ isOpen: false, contract: null })}
        isDanger={toggleConfirm.contract?.estado === "ATIVA"}
        isProcessing={saving}
        processingText={toggleConfirm.contract?.estado === "ATIVA" ? "A cortar..." : "A reactivar..."}
      />

      <HeroHeader
        badge="Contratos e ligacoes"
        title="Ligacao operacional do servico de agua"
        description="Depois da conta estar pronta, a ligacao passa a ser controlada aqui com dados do imovel, contacto do consumidor e estado do fornecimento."
      />

      <MessageStack error={error} success={success} />

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Ligacoes" value={contracts.length} helper="Total de contratos emitidos" accent="cyan" />
        <StatCard label="Activas" value={contracts.filter((item) => item.estado === "ATIVA").length} helper="Servico actualmente em fornecimento" accent="emerald" />
        <StatCard label="Cortadas" value={contracts.filter((item) => item.estado === "CORTADA").length} helper="Aguardam reactivacao pela equipa" accent="rose" />
        <StatCard label="Prontas para contrato" value={readyCustomers.length} helper="Contas activas ainda sem ligacao emitida" accent="amber" />
      </section>

      <Panel
        title="Emitir nova ligacao"
        description="Somente contas activas e sem ligacao activa aparecem aqui. Em vez de selector, escolhes a conta em cards com casa, zona e contacto visiveis."
      >
        <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
          <div className="space-y-4">
            <div className="rounded-[26px] border border-slate-200 bg-slate-50 p-5">
              <label className="mb-2 block text-sm font-medium text-slate-700">Pesquisar conta pronta para contrato</label>
              <label className="relative block">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input
                  value={readyQuery}
                  onChange={(event) => setReadyQuery(event.target.value)}
                  placeholder="Ex.: cliente 12, casa 4 ou nome do proprietario"
                  className="h-12 rounded-2xl border-slate-200 pl-9"
                />
              </label>
              <p className="mt-3 text-xs uppercase tracking-[0.18em] text-slate-400">
                {filteredReadyCustomers.length} conta(s) pronta(s) para contrato
              </p>
            </div>

            {filteredReadyCustomers.length === 0 ? (
              <EmptyState
                title="Nenhuma conta pronta encontrada"
                description="Tenta outro nome, casa, zona ou numero interno da conta."
              />
            ) : (
              <div className="space-y-3">
                {filteredReadyCustomers.map((customer) => {
                  const selected = customerId === String(customer.id);
                  return (
                    <button
                      key={customer.id}
                      type="button"
                      onClick={() => setCustomerId(String(customer.id))}
                      className={cn(
                        "w-full rounded-[26px] border p-5 text-left transition",
                        selected
                          ? "border-cyan-300 bg-cyan-50 shadow-sm shadow-cyan-100"
                          : "border-slate-200 bg-white hover:border-cyan-200 hover:shadow-sm"
                      )}
                    >
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">Conta #{customer.id}</p>
                          <p className="mt-2 text-lg font-black tracking-tight text-slate-900">{customer.name}</p>
                          <p className="mt-1 text-sm text-slate-600">{customer.referenciaLocal || "Sem referencia do local"}</p>
                          <p className="mt-2 text-xs uppercase tracking-[0.22em] text-slate-400">
                            {formatServiceAddress(customer.adress, customer.houseNR)}
                          </p>
                        </div>
                        <InfoChip text="Pronta para contrato" tone="bg-emerald-100 text-emerald-700 ring-emerald-200" />
                      </div>

                      <div className="mt-4 grid gap-3 sm:grid-cols-2">
                        <div className="rounded-2xl bg-slate-50 px-4 py-3 ring-1 ring-slate-200">
                          <p className="text-xs uppercase tracking-[0.22em] text-slate-400">Numero da casa</p>
                          <p className="mt-2 font-semibold text-slate-900">{customer.houseNR || "Por definir"}</p>
                        </div>
                        <div className="rounded-2xl bg-slate-50 px-4 py-3 ring-1 ring-slate-200">
                          <p className="text-xs uppercase tracking-[0.22em] text-slate-400">Contacto</p>
                          <p className="mt-2 font-semibold text-slate-900">{customer.phone}</p>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <div className="rounded-[26px] border border-slate-200 bg-slate-50 p-5">
            <div className="flex items-center gap-2 text-slate-900">
              <Home className="h-4 w-4 text-cyan-700" />
              <h3 className="text-base font-black tracking-tight">Resumo da conta seleccionada</h3>
            </div>

            {selectedCustomer ? (
              <div className="mt-4 space-y-4">
                <div className="rounded-2xl bg-white p-4 ring-1 ring-slate-200">
                  <p className="text-xs uppercase tracking-[0.22em] text-slate-400">Cliente seleccionado</p>
                  <p className="mt-2 text-lg font-black tracking-tight text-slate-900">{selectedCustomer.name}</p>
                  <p className="mt-1 text-sm text-slate-600">{selectedCustomer.referenciaLocal || "Sem referencia do local"}</p>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-2xl bg-white p-4 ring-1 ring-slate-200">
                    <p className="text-xs uppercase tracking-[0.22em] text-slate-400">Numero da conta</p>
                    <p className="mt-2 font-semibold text-slate-900">#{selectedCustomer.id}</p>
                  </div>
                  <div className="rounded-2xl bg-white p-4 ring-1 ring-slate-200">
                    <p className="text-xs uppercase tracking-[0.22em] text-slate-400">Numero do contrato</p>
                    <p className="mt-2 font-semibold text-slate-900">Gerado ao emitir</p>
                  </div>
                  <div className="rounded-2xl bg-white p-4 ring-1 ring-slate-200">
                    <p className="text-xs uppercase tracking-[0.22em] text-slate-400">Numero da casa</p>
                    <p className="mt-2 font-semibold text-slate-900">{selectedCustomer.houseNR || "Por definir"}</p>
                  </div>
                  <div className="rounded-2xl bg-white p-4 ring-1 ring-slate-200">
                    <p className="text-xs uppercase tracking-[0.22em] text-slate-400">Contacto</p>
                    <p className="mt-2 font-semibold text-slate-900">{selectedCustomer.phone}</p>
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600">
                  <p>{formatServiceAddress(selectedCustomer.adress, selectedCustomer.houseNR)}</p>
                  <p className="mt-1">{selectedCustomer.email || "Sem email associado"}</p>
                </div>
              </div>
            ) : (
              <p className="mt-4 text-sm text-slate-500">Escolhe um card da esquerda para ver os detalhes do imovel, contacto e emissao do contrato.</p>
            )}

            <div className="mt-5 flex justify-end">
              <Button type="button" disabled={saving || !selectedCustomer} onClick={handleCreate} className="bg-cyan-600 text-white hover:bg-cyan-700">
                Emitir ligacao
              </Button>
            </div>
          </div>
        </div>
      </Panel>

      <Panel
        title="Carteira de contratos"
        description="Pesquisa por consumidor, local, casa, contacto ou operador."
        action={
          <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
            <label className="relative sm:w-[320px]">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Pesquisar contrato, casa ou contacto..."
                className="h-11 rounded-2xl border-slate-200 pl-9"
              />
            </label>
            <Button type="button" variant="outline" onClick={load} disabled={loading}>
              <RefreshCw className={loading ? "animate-spin" : ""} />
              Recarregar
            </Button>
          </div>
        }
      >
        {loading ? (
          <p className="text-sm text-slate-500">A carregar ligacoes...</p>
        ) : filteredContracts.length === 0 ? (
          <EmptyState title="Sem ligacoes registadas" description="Nenhum contrato encontrado para os filtros actuais." />
        ) : (
          <div className="grid gap-4 xl:grid-cols-2">
            {filteredContracts.map((contract) => (
              <article key={contract.id} className="rounded-[28px] border border-slate-200 bg-slate-50 p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                    <p className="text-lg font-black tracking-tight text-slate-900">Contrato #{contract.id}</p>
                      <InfoChip text={contract.estado === "ATIVA" ? "Activa" : "Cortada"} tone={contractTone(contract.estado)} />
                    </div>
                    <p className="mt-2 text-sm font-semibold text-slate-700">{contract.consumidorNome}</p>
                    <p className="mt-1 text-sm text-slate-500">{contract.referenciaLocal || "Sem referencia do local"}</p>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    disabled={saving}
                    onClick={() => setToggleConfirm({ isOpen: true, contract })}
                  >
                    {contract.estado === "ATIVA" ? "Cortar agua" : "Reactivar"}
                  </Button>
                </div>

                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  <div className="rounded-2xl bg-white p-4 ring-1 ring-slate-200">
                    <p className="text-xs uppercase tracking-[0.22em] text-slate-400">Imovel</p>
                    <p className="mt-2 font-semibold text-slate-900">{formatServiceAddress(contract.adress, contract.houseNR)}</p>
                    <p className="mt-1 text-sm text-slate-500">{formatDateTime(contract.data)}</p>
                  </div>
                  <div className="rounded-2xl bg-white p-4 ring-1 ring-slate-200">
                    <p className="text-xs uppercase tracking-[0.22em] text-slate-400">Contrato e contacto</p>
                    <p className="mt-2 font-semibold text-slate-900">Contrato #{contract.id} | Casa {contract.houseNR || "por definir"}</p>
                    <p className="mt-1 text-sm text-slate-500">{contract.phone || "Sem telefone"}</p>
                    <p className="mt-1 text-sm text-slate-500">{contract.email || "Sem email associado"}</p>
                  </div>
                </div>

                <div className="mt-4 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600">
                  Operador responsavel: <span className="font-semibold text-slate-900">{contract.funcionarioNome}</span>
                </div>
              </article>
            ))}
          </div>
        )}
      </Panel>
    </main>
  );
}

export function WaterReadingsPage({ scope: _scope }: { scope: Scope }) {
  void _scope;
  const [contracts, setContracts] = useState<WaterContract[]>([]);
  const [readings, setReadings] = useState<WaterReading[]>([]);
  const [billingRule, setBillingRule] = useState<WaterBillingRule | null>(null);
  const [query, setQuery] = useState("");
  const [form, setForm] = useState({ ligacaoId: "", leituraActual: "" });
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [confirmModal, setConfirmModal] = useState(false);

  async function load() {
    setLoading(true);
    setError("");
    try {
      const [contractRows, readingRows, activeRule] = await Promise.all([
        listWaterContracts(),
        listWaterReadings(),
        getCurrentWaterBillingRule(),
      ]);
      setContracts(contractRows);
      setReadings(readingRows);
      setBillingRule(activeRule);
    } catch (reason) {
      setError(getErrorMessage(reason, "Nao foi possivel carregar as leituras."));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const activeContracts = useMemo(() => contracts.filter((contract) => contract.estado === "ATIVA"), [contracts]);
  const contractMap = useMemo(() => new Map(contracts.map((contract) => [contract.id, contract])), [contracts]);
  const latestReadingByContract = useMemo(() => {
    const map = new Map<number, WaterReading>();
    readings.forEach((reading) => {
      const current = map.get(reading.ligacaoId);
      if (!current || new Date(reading.data).getTime() > new Date(current.data).getTime()) {
        map.set(reading.ligacaoId, reading);
      }
    });
    return map;
  }, [readings]);

  useEffect(() => {
    if (activeContracts.length === 0) return;
    setForm((current) => {
      const selectedExists = activeContracts.some((contract) => String(contract.id) === current.ligacaoId);
      if (selectedExists) return current;
      return { ...current, ligacaoId: String(activeContracts[0].id), leituraActual: "" };
    });
  }, [activeContracts]);

  const filteredContracts = useMemo(
    () =>
      activeContracts.filter((contract) =>
        matchesSearch(query, [
          contract.id,
          contract.consumidorNome,
          contract.houseNR,
          contract.referenciaLocal,
          contract.adress,
        ])
      ),
    [activeContracts, query]
  );

  const selectedContract = useMemo(
    () => contractMap.get(Number(form.ligacaoId)) ?? null,
    [contractMap, form.ligacaoId]
  );
  const selectedLastReading = selectedContract ? latestReadingByContract.get(selectedContract.id) ?? null : null;
  const previousReading = selectedLastReading?.leituraActual ?? 0;
  const readingValue = Number(form.leituraActual);
  const hasReadingValue = form.leituraActual.trim() !== "" && Number.isFinite(readingValue);
  const projectedConsumption = hasReadingValue ? Math.max(0, readingValue - previousReading) : 0;
  const projectedTotal = projectedConsumption * Number(billingRule?.precoM3 ?? 45) + Number(billingRule?.taxaFixa ?? 150);
  const visibleReadings = useMemo(() => {
    if (!query.trim()) return readings;
    const visibleContractIds = new Set(filteredContracts.map((contract) => contract.id));
    return readings.filter((reading) => visibleContractIds.has(reading.ligacaoId));
  }, [filteredContracts, query, readings]);

  function selectContract(contractId: number) {
    setFieldErrors({});
    setForm((current) => ({ ...current, ligacaoId: String(contractId), leituraActual: "" }));
  }

  function validate() {
    const nextErrors: Record<string, string> = {};
    if (!form.ligacaoId) nextErrors.ligacaoId = "Selecciona um contrato para continuar.";
    if (!form.leituraActual) {
      nextErrors.leituraActual = "Introduz a leitura actual.";
    } else if (Number.isNaN(readingValue)) {
      nextErrors.leituraActual = "Introduz um numero valido.";
    } else if (readingValue < previousReading) {
      nextErrors.leituraActual = `A leitura actual nao pode ser menor que ${previousReading}.`;
    }
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
        leituraActual: readingValue,
      });
      setForm((current) => ({ ...current, leituraActual: "" }));
      setSuccess("Leitura registada. A factura mensal foi gerada automaticamente.");
      await load();
    } catch (reason) {
      setError(getErrorMessage(reason, "Nao foi possivel registar a leitura."));
    } finally {
      setSaving(false);
      setConfirmModal(false);
    }
  }

  return (
    <main className="space-y-6">
      <ConfirmModal
        isOpen={confirmModal}
        title="Confirmar leitura?"
        message={
          selectedContract
            ? `O contrato #${selectedContract.id} de ${selectedContract.consumidorNome} vai receber a leitura ${form.leituraActual || "0"} m3. A factura prevista deste ciclo fica em ${formatMoney(projectedTotal)}.`
            : "Confirma o lancamento desta leitura mensal."
        }
        confirmText="Registar leitura"
        cancelText="Cancelar"
        onConfirm={handleSubmit}
        onCancel={() => setConfirmModal(false)}
        isProcessing={saving}
        processingText="A registar..."
      />

      <HeroHeader
        badge="Leituras"
        title="Leituras simples, pesquisaveis e prontas para facturar"
        description="Pesquisa pelo contrato de agua, nome do proprietario ou numero da casa, escolhe o card certo e lanca a leitura no painel ao lado."
      />

      <MessageStack error={error} success={success} />

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Ligacoes activas" value={activeContracts.length} helper="Disponiveis para lancamento de leitura" accent="cyan" />
        <StatCard label="Leituras registadas" value={readings.length} helper="Historico consolidado do modulo" accent="emerald" />
        <StatCard label="Preco por m3" value={formatMoney(billingRule?.precoM3 ?? 45)} helper="Regra activa aplicada automaticamente" accent="slate" />
        <StatCard label="Multa activa" value={formatPercent(billingRule?.percentualMulta ?? 0)} helper="Disponivel para aplicacao manual nas facturas pendentes" accent="amber" />
      </section>

      <Panel
        title="Lancamento de leitura"
        description="A fila da esquerda serve para encontrar rapidamente o contrato certo. O painel da direita recebe a leitura e mostra a previsao da factura."
      >
        {activeContracts.length === 0 ? (
          <EmptyState
            title="Sem contratos activos"
            description="Activa pelo menos uma ligacao de agua antes de tentar registar leituras."
          />
        ) : (
          <div className="grid gap-6 xl:grid-cols-[1.08fr_0.92fr]">
            <div className="space-y-4">
              <div className="rounded-[26px] border border-slate-200 bg-slate-50 p-5">
                <label className="mb-2 block text-sm font-medium text-slate-700">Pesquisar contrato, proprietario ou casa</label>
                <label className="relative block">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <Input
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder="Ex.: contrato 12, casa 24 ou nome do proprietario"
                    className="h-12 rounded-2xl border-slate-200 pl-9"
                  />
                </label>
                <p className="mt-3 text-xs uppercase tracking-[0.18em] text-slate-400">
                  {filteredContracts.length} contrato(s) visivel(is) para leitura
                </p>
              </div>

              {filteredContracts.length === 0 ? (
                <EmptyState
                  title="Nenhum contrato encontrado"
                  description="Tenta outro numero de contrato, nome do proprietario ou numero da casa."
                />
              ) : (
                <div className="space-y-3">
                  {filteredContracts.map((contract) => {
                    const contractReading = latestReadingByContract.get(contract.id);
                    const selected = form.ligacaoId === String(contract.id);
                    return (
                      <button
                        key={contract.id}
                        type="button"
                        onClick={() => selectContract(contract.id)}
                        className={cn(
                          "w-full rounded-[26px] border p-5 text-left transition",
                          selected
                            ? "border-cyan-300 bg-cyan-50 shadow-sm shadow-cyan-100"
                            : "border-slate-200 bg-white hover:border-cyan-200 hover:shadow-sm"
                        )}
                      >
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <div>
                            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">Contrato #{contract.id}</p>
                            <p className="mt-2 text-lg font-black tracking-tight text-slate-900">{contract.consumidorNome}</p>
                            <p className="mt-1 text-sm text-slate-600">{contract.referenciaLocal || "Sem referencia do local"}</p>
                            <p className="mt-2 text-xs uppercase tracking-[0.22em] text-slate-400">
                              {formatServiceAddress(contract.adress, contract.houseNR)}
                            </p>
                          </div>
                          <InfoChip text="Activa" tone="bg-emerald-100 text-emerald-700 ring-emerald-200" />
                        </div>

                        <div className="mt-4 grid gap-3 sm:grid-cols-2">
                          <div className="rounded-2xl bg-slate-50 px-4 py-3 ring-1 ring-slate-200">
                            <p className="text-xs uppercase tracking-[0.22em] text-slate-400">Ultima leitura</p>
                            <p className="mt-2 font-semibold text-slate-900">
                              {contractReading ? `${contractReading.leituraActual} m3` : "Sem historico"}
                            </p>
                          </div>
                          <div className="rounded-2xl bg-slate-50 px-4 py-3 ring-1 ring-slate-200">
                            <p className="text-xs uppercase tracking-[0.22em] text-slate-400">Contacto</p>
                            <p className="mt-2 font-semibold text-slate-900">{contract.phone || "Sem telefone"}</p>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="space-y-4">
              <div className="rounded-[26px] border border-slate-200 bg-slate-50 p-5">
                <div className="flex items-center gap-2 text-slate-900">
                  <Waves className="h-4 w-4 text-cyan-700" />
                  <h3 className="text-base font-black tracking-tight">Painel da leitura</h3>
                </div>

                {selectedContract ? (
                  <>
                    <div className="mt-4 rounded-2xl bg-white p-4 ring-1 ring-slate-200">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <p className="text-xs uppercase tracking-[0.22em] text-slate-400">Contrato seleccionado</p>
                          <p className="mt-2 text-lg font-black tracking-tight text-slate-900">
                            #{selectedContract.id} | {selectedContract.consumidorNome}
                          </p>
                          <p className="mt-1 text-sm text-slate-600">{selectedContract.referenciaLocal || "Sem referencia do local"}</p>
                        </div>
                        <InfoChip text="Pronto para lancar" tone="bg-cyan-100 text-cyan-700 ring-cyan-200" />
                      </div>
                      <p className="mt-3 text-sm text-slate-600">{formatServiceAddress(selectedContract.adress, selectedContract.houseNR)}</p>
                    </div>

                    <div className="mt-4">
                      <label className="mb-2 block text-sm font-medium text-slate-700">Leitura actual (m3)</label>
                      <Input
                        value={form.leituraActual}
                        onChange={(event) => setForm((current) => ({ ...current, leituraActual: event.target.value }))}
                        className="h-12 rounded-2xl border-slate-200 px-4"
                        type="number"
                        min={previousReading}
                        step="0.01"
                        placeholder={`Minimo ${previousReading}`}
                      />
                      <FieldError message={fieldErrors.leituraActual || fieldErrors.ligacaoId} />
                    </div>

                    <div className="mt-4 grid gap-3 sm:grid-cols-3">
                      <div className="rounded-2xl bg-white p-4 ring-1 ring-slate-200">
                        <p className="text-xs uppercase tracking-[0.22em] text-slate-400">Leitura anterior</p>
                        <p className="mt-2 font-semibold text-slate-900">{previousReading}</p>
                      </div>
                      <div className="rounded-2xl bg-white p-4 ring-1 ring-slate-200">
                        <p className="text-xs uppercase tracking-[0.22em] text-slate-400">Consumo previsto</p>
                        <p className="mt-2 font-semibold text-slate-900">{projectedConsumption.toFixed(2)} m3</p>
                      </div>
                      <div className="rounded-2xl bg-white p-4 ring-1 ring-slate-200">
                        <p className="text-xs uppercase tracking-[0.22em] text-slate-400">Factura prevista</p>
                        <p className="mt-2 font-semibold text-slate-900">{formatMoney(projectedTotal)}</p>
                      </div>
                    </div>

                    <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-600">
                      <p className="font-semibold text-slate-900">Regra activa desta leitura</p>
                      <p className="mt-2">{formatMoney(billingRule?.precoM3 ?? 45)} por m3</p>
                      <p className="mt-1">Taxa fixa: {formatMoney(billingRule?.taxaFixa ?? 150)}</p>
                      <p className="mt-1">Multa manual disponivel: {formatPercent(billingRule?.percentualMulta ?? 0)}</p>
                    </div>

                    <div className="mt-5 flex justify-end">
                      <Button type="button" disabled={saving} onClick={() => setConfirmModal(true)} className="bg-cyan-600 text-white hover:bg-cyan-700">
                        Registar leitura
                      </Button>
                    </div>
                  </>
                ) : (
                  <p className="mt-4 text-sm text-slate-500">Selecciona um contrato na coluna da esquerda para registar a leitura.</p>
                )}
              </div>
            </div>
          </div>
        )}
      </Panel>

      <Panel
        title="Historico de leituras"
        description="O historico acompanha a mesma pesquisa dos contratos para ficar facil rever o consumo antes de lancar uma nova leitura."
        action={
          <Button type="button" variant="outline" onClick={load} disabled={loading}>
            <RefreshCw className={loading ? "animate-spin" : ""} />
            Recarregar
          </Button>
        }
      >
        {loading ? (
          <p className="text-sm text-slate-500">A carregar leituras...</p>
        ) : visibleReadings.length === 0 ? (
          <EmptyState title="Sem leituras registadas" description="As leituras aparecerao aqui assim que forem lancadas." />
        ) : (
          <div className="grid gap-4 xl:grid-cols-2">
            {visibleReadings.map((reading) => {
              const contract = contractMap.get(reading.ligacaoId);
              return (
                <article key={reading.id} className="rounded-[28px] border border-slate-200 bg-slate-50 p-5">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">Contrato #{reading.ligacaoId}</p>
                      <p className="mt-2 text-lg font-black tracking-tight text-slate-900">
                        {contract?.consumidorNome || `Ligacao #${reading.ligacaoId}`}
                      </p>
                      <p className="mt-1 text-sm text-slate-600">{contract?.referenciaLocal || "Sem referencia do local"}</p>
                      <p className="mt-1 text-xs uppercase tracking-[0.22em] text-slate-400">{formatDateTime(reading.data)}</p>
                    </div>
                    <div className="rounded-2xl bg-white px-4 py-3 text-right ring-1 ring-slate-200">
                      <p className="text-xs uppercase tracking-[0.22em] text-slate-400">Valor</p>
                      <p className="mt-1 text-lg font-black tracking-tight text-slate-900">{formatMoney(reading.valorPagar)}</p>
                    </div>
                  </div>

                  <div className="mt-5 grid gap-3 sm:grid-cols-3">
                    <div className="rounded-2xl bg-white p-4 ring-1 ring-slate-200">
                      <p className="text-xs uppercase tracking-[0.22em] text-slate-400">Anterior</p>
                      <p className="mt-2 font-semibold text-slate-900">{reading.leituraAnterior}</p>
                    </div>
                    <div className="rounded-2xl bg-white p-4 ring-1 ring-slate-200">
                      <p className="text-xs uppercase tracking-[0.22em] text-slate-400">Actual</p>
                      <p className="mt-2 font-semibold text-slate-900">{reading.leituraActual}</p>
                    </div>
                    <div className="rounded-2xl bg-white p-4 ring-1 ring-slate-200">
                      <p className="text-xs uppercase tracking-[0.22em] text-slate-400">Consumo</p>
                      <p className="mt-2 font-semibold text-slate-900">{reading.consumoM3} m3</p>
                    </div>
                  </div>

                  {contract ? (
                    <div className="mt-4 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600">
                      {formatServiceAddress(contract.adress, contract.houseNR)}
                    </div>
                  ) : null}
                </article>
              );
            })}
          </div>
        )}
      </Panel>
    </main>
  );
}

export function WaterBillsPage({ scope: _scope }: { scope: Scope }) {
  void _scope;
  const [bills, setBills] = useState<WaterBill[]>([]);
  const [contracts, setContracts] = useState<WaterContract[]>([]);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("DINHEIRO_FISICO");
  const [valorPago, setValorPago] = useState("");
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [payingId, setPayingId] = useState<number | null>(null);
  const [selectedBillId, setSelectedBillId] = useState<number | null>(null);
  const [selectedPenaltyIds, setSelectedPenaltyIds] = useState<number[]>([]);
  const [applyingPenalty, setApplyingPenalty] = useState(false);
  const [confirmPenaltyApply, setConfirmPenaltyApply] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [confirmPayId, setConfirmPayId] = useState<number | null>(null);

  async function load() {
    setLoading(true);
    setError("");
    try {
      const [billRows, contractRows] = await Promise.all([listWaterBills(), listWaterContracts()]);
      setBills(billRows);
      setContracts(contractRows);
    } catch (reason) {
      setError(getErrorMessage(reason, "Nao foi possivel carregar as faturas."));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const contractMap = useMemo(() => new Map(contracts.map((contract) => [contract.id, contract])), [contracts]);
  const pendingBills = useMemo(() => bills.filter((bill) => bill.estadoPagamento !== "PAGO"), [bills]);
  const groupedBills = useMemo<GroupedWaterBill[]>(() => {
    const groups = new Map<string, WaterBill[]>();

    for (const bill of pendingBills) {
      const groupKey = `${bill.consumidorId}:${bill.ligacaoId ?? "sem-contrato"}`;
      const current = groups.get(groupKey) ?? [];
      current.push(bill);
      groups.set(groupKey, current);
    }

    return Array.from(groups.entries())
      .map(([groupKey, entries]) => {
        const ordered = [...entries].sort((left, right) => {
          const leftTime = new Date(left.data).getTime();
          const rightTime = new Date(right.data).getTime();
          if (rightTime !== leftTime) return rightTime - leftTime;
          return right.id - left.id;
        });
        const current = ordered[0];
        const valorFactura = Number(current.valorFactura ?? Number(current.valor ?? 0) + Number(current.taxaFixa ?? 0));
        const multaValor = Number(current.multaValor ?? 0);
        const dividaValor = ordered.slice(1).reduce((sum, bill) => sum + Number(bill.valorTotal ?? 0), 0);
        const hasPenaltyInGroup = ordered.some((bill) => Number(bill.multaValor ?? 0) > 0);
        return {
          ...current,
          groupKey,
          relatedBillIds: ordered.map((bill) => bill.id),
          facturasPendentes: ordered.length,
          valorFactura,
          multaValor,
          dividaValor,
          estadoPagamento: hasPenaltyInGroup ? "ATRASADO" : current.estadoPagamento,
          valorTotal: valorFactura + multaValor + dividaValor,
        };
      })
      .sort((left, right) => {
        const leftTime = new Date(left.data).getTime();
        const rightTime = new Date(right.data).getTime();
        if (rightTime !== leftTime) return rightTime - leftTime;
        return right.id - left.id;
      });
  }, [pendingBills]);

  const filteredBills = useMemo(
    () =>
      groupedBills.filter((bill) => {
        const contract = bill.ligacaoId ? contractMap.get(bill.ligacaoId) : null;
        return matchesSearch(query, [
          bill.id,
          bill.ligacaoId,
          bill.consumidorNome,
          bill.houseNR,
          contract?.referenciaLocal,
          contract?.adress,
          bill.relatedBillIds.join(" "),
        ]);
      }),
    [contractMap, groupedBills, query]
  );

  useEffect(() => {
    setSelectedBillId((current) => {
      if (current && filteredBills.some((bill) => bill.id === current)) {
        return current;
      }
      return filteredBills[0]?.id ?? null;
    });
  }, [filteredBills]);

  const selectedBill = useMemo(
    () => filteredBills.find((bill) => bill.id === selectedBillId) ?? groupedBills.find((bill) => bill.id === selectedBillId) ?? null,
    [filteredBills, groupedBills, selectedBillId]
  );
  const selectedContract = selectedBill?.ligacaoId ? contractMap.get(selectedBill.ligacaoId) ?? null : null;

  useEffect(() => {
    setSelectedPenaltyIds((current) => current.filter((id) => groupedBills.some((bill) => bill.id === id)));
  }, [groupedBills]);

  useEffect(() => {
    if (!selectedBill) {
      setValorPago("");
      return;
    }
    setValorPago(formatAmountInput(Number(selectedBill.valorTotal || 0)));
  }, [selectedBill]);

  const enteredAmount = Number(valorPago);
  const hasEnteredAmount = valorPago.trim() !== "" && Number.isFinite(enteredAmount);
  const remainingAmount = selectedBill && hasEnteredAmount ? Math.max(Number(selectedBill.valorTotal) - enteredAmount, 0) : 0;
  const changeAmount = selectedBill && hasEnteredAmount ? Math.max(enteredAmount - Number(selectedBill.valorTotal), 0) : 0;
  const selectedPenaltyBills = useMemo(
    () => groupedBills.filter((bill) => selectedPenaltyIds.includes(bill.id)),
    [groupedBills, selectedPenaltyIds]
  );
  const selectedPenaltyFacturaIds = useMemo(
    () => selectedPenaltyBills.flatMap((bill) => bill.relatedBillIds),
    [selectedPenaltyBills]
  );

  function togglePenaltySelection(id: number) {
    setSelectedPenaltyIds((current) => (current.includes(id) ? current.filter((item) => item !== id) : [...current, id]));
  }

  async function handlePay(id: number) {
    const currentBill = groupedBills.find((bill) => bill.id === id);
    if (!currentBill) return;

    if (!valorPago.trim() || Number.isNaN(enteredAmount) || enteredAmount <= 0) {
      setError("Introduz o valor que vai ser registado no pagamento.");
      return;
    }

    if (enteredAmount < Number(currentBill.valorTotal || 0)) {
      setError("O valor registado nao pode ser inferior ao total da factura.");
      return;
    }

    setPayingId(id);
    setError("");
    setSuccess("");
    try {
      const updated = await payWaterBill(id, {
        formaPagamento: paymentMethod,
        valorPago: enteredAmount,
        facturaIds: currentBill.relatedBillIds,
      });
      const printableBill: WaterBill = {
        ...currentBill,
        ...updated,
        valorFactura: currentBill.valorFactura,
        multaValor: currentBill.multaValor,
        dividaValor: currentBill.dividaValor,
        valorTotal: currentBill.valorTotal,
        valorPago: updated.valorPago ?? enteredAmount,
        troco: updated.troco ?? Math.max(enteredAmount - currentBill.valorTotal, 0),
        estadoPagamento: "PAGO",
        formaPagamento: updated.formaPagamento ?? paymentMethod,
      };
      setBills(await listWaterBills());
      setSuccess("Pagamento confirmado com sucesso. O recibo foi preparado com o resumo completo da factura.");
      printWaterBillDocument(printableBill, { autoPrint: true });
    } catch (reason) {
      setError(getErrorMessage(reason, "Nao foi possivel confirmar o pagamento."));
    } finally {
      setPayingId(null);
      setConfirmPayId(null);
    }
  }

  async function handleApplyPenalty() {
    if (selectedPenaltyFacturaIds.length === 0) {
      setError("Marca pelo menos um contrato pendente antes de aplicar a multa.");
      return;
    }

    setApplyingPenalty(true);
    setError("");
    setSuccess("");
    try {
      const updated = await applyWaterBillPenalty({ facturaIds: selectedPenaltyFacturaIds });
      setBills(await listWaterBills());
      setSuccess(`Multa aplicada e consolidada em ${updated.length} factura(s) pendente(s).`);
    } catch (reason) {
      setError(getErrorMessage(reason, "Nao foi possivel aplicar a multa."));
    } finally {
      setApplyingPenalty(false);
      setConfirmPenaltyApply(false);
    }
  }

  const summary = useMemo(() => {
    const withPenalty = groupedBills.filter((bill) => bill.estadoPagamento === "ATRASADO");
    return {
      pendingContracts: groupedBills.length,
      pendingBills: pendingBills.length,
      withPenalty: withPenalty.length,
      pendingAmount: groupedBills.reduce((sum, item) => sum + Number(item.valorTotal || 0), 0),
    };
  }, [groupedBills, pendingBills]);

  const paymentMethodDetails: Record<PaymentMethod, { title: string; helper: string }> = {
    DINHEIRO_FISICO: {
      title: "Dinheiro fisico",
      helper: "Permite controlar troco automaticamente.",
    },
    CARTEIRA_MOVEL: {
      title: "Carteira movel",
      helper: "Regista pagamento digital com valor exacto ou superior.",
    },
    CARTAO: {
      title: "Cartao",
      helper: "Fecha a factura e imprime o recibo logo a seguir.",
    },
  };

  return (
    <main className="space-y-6">
      <ConfirmModal
        isOpen={confirmPenaltyApply}
        title="Aplicar multa agora?"
        message={
          selectedPenaltyFacturaIds.length > 0
            ? `A multa sera aplicada a ${selectedPenaltyFacturaIds.length} factura(s) pendente(s) dos contratos marcados. Esta operacao nao e reversivel ate contactar o admin.`
            : "Marca pelo menos um contrato antes de aplicar a multa."
        }
        confirmText="Aplicar multa"
        cancelText="Cancelar"
        onConfirm={handleApplyPenalty}
        onCancel={() => setConfirmPenaltyApply(false)}
        isDanger
        isProcessing={applyingPenalty}
        processingText="A aplicar..."
      />

      <ConfirmModal
        isOpen={confirmPayId !== null}
        title="Confirmar pagamento da factura?"
        message={
          selectedBill
            ? `A factura #${selectedBill.id} do contrato #${selectedBill.ligacaoId ?? "--"} sera paga por ${formatPaymentMethod(paymentMethod)} no valor de ${formatMoney(enteredAmount || selectedBill.valorTotal)}. Esta operacao fecha ${selectedBill.facturasPendentes} factura(s) pendente(s) deste contrato.`
            : "Confirma este pagamento?"
        }
        confirmText="Confirmar pagamento"
        cancelText="Cancelar"
        onConfirm={() => confirmPayId && handlePay(confirmPayId)}
        onCancel={() => setConfirmPayId(null)}
        isProcessing={confirmPayId !== null && payingId === confirmPayId}
        processingText="A confirmar..."
      />

      <HeroHeader
        badge="Facturas e caixa"
        title="Cobranca limpa, multa manual e recibo profissional"
        description="Pesquisa por contrato, nome do proprietario ou numero da casa, trabalha com cards em vez de selector, aplica multa manualmente e cobra tudo no mesmo painel sem duplicar facturas."
      >
        <Button asChild variant="outline" className="border-white/20 bg-white/10 text-white hover:bg-white/15">
          <a href="#painel-multas">Aplicar multa</a>
        </Button>
        <Button type="button" variant="outline" onClick={load} disabled={loading} className="border-white/20 bg-white/10 text-white hover:bg-white/15">
          <RefreshCw className={loading ? "animate-spin" : ""} />
          Recarregar
        </Button>
      </HeroHeader>

      <MessageStack error={error} success={success} />

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Contratos pendentes" value={summary.pendingContracts} helper="Cards activos na fila de cobranca" accent="cyan" />
        <StatCard label="Facturas em aberto" value={summary.pendingBills} helper="Inclui a divida acumulada do mesmo contrato" accent="rose" />
        <StatCard label="Com multa" value={summary.withPenalty} helper="Facturas que ja receberam multa manual" accent="amber" />
        <StatCard label="Fila em aberto" value={formatMoney(summary.pendingAmount)} helper="Montante total ainda por regularizar" accent="amber" />
        <StatCard
          label="Pagamento actual"
          value={selectedBill ? formatMoney(selectedBill.valorTotal) : formatMoney(0)}
          helper={selectedBill ? `Contrato #${selectedBill.ligacaoId ?? "--"}` : "Selecciona um card para receber"}
          accent="slate"
        />
      </section>

      <section id="painel-multas">
        <Panel
          title="Aplicar multa"
        description="A multa passa a ser manual. Marca os contratos pendentes, usa o botao marcar todos se quiseres fechar a fila inteira e aplica a percentagem configurada sem criar uma nova factura."
        action={
          <div className="flex flex-wrap gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setSelectedPenaltyIds(filteredBills.map((bill) => bill.id))}
                disabled={filteredBills.length === 0}
              >
                Marcar todos
              </Button>
              <Button type="button" variant="outline" onClick={() => setSelectedPenaltyIds([])} disabled={selectedPenaltyIds.length === 0}>
                Limpar
              </Button>
              <Button
                type="button"
                onClick={() => setConfirmPenaltyApply(true)}
                disabled={applyingPenalty || selectedPenaltyFacturaIds.length === 0}
                className="bg-amber-600 text-white hover:bg-amber-700"
              >
                {applyingPenalty ? "Aplicando..." : "Aplicar multa"}
              </Button>
            </div>
          }
        >
          {pendingBills.length === 0 ? (
            <EmptyState title="Sem facturas pendentes" description="Nao existe nenhuma conta em aberto para receber multa neste momento." />
          ) : (
            <div className="space-y-4">
              <div className="grid gap-3 md:grid-cols-3">
                <div className="rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-200">
                  <p className="text-xs uppercase tracking-[0.22em] text-slate-400">Contratos marcados</p>
                  <p className="mt-2 text-2xl font-black tracking-tight text-slate-900">{selectedPenaltyBills.length}</p>
                </div>
                <div className="rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-200">
                  <p className="text-xs uppercase tracking-[0.22em] text-slate-400">Facturas abrangidas</p>
                  <p className="mt-2 text-2xl font-black tracking-tight text-slate-900">{selectedPenaltyFacturaIds.length}</p>
                </div>
                <div className="rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-200">
                  <p className="text-xs uppercase tracking-[0.22em] text-slate-400">Percentagem actual</p>
                  <p className="mt-2 text-2xl font-black tracking-tight text-slate-900">
                    {formatPercent(selectedBill?.percentualMulta ?? groupedBills[0]?.percentualMulta ?? 0)}
                  </p>
                </div>
              </div>

              <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-4">
                <p className="text-sm font-semibold text-slate-900">Seleccao pronta para multa</p>
                <p className="mt-2 text-sm leading-6 text-rose-700">
                  Depois de aplicar a multa, o valor fica na factura e nao e reversivel ate contactar o admin.
                </p>
                {selectedPenaltyBills.length === 0 ? (
                  <p className="mt-2 text-sm text-slate-500">Usa os cards da fila abaixo para marcar contratos individuais ou clica em marcar todos.</p>
                ) : (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {selectedPenaltyBills.slice(0, 8).map((bill) => (
                      <span key={bill.id} className="rounded-full bg-white px-3 py-2 text-xs font-semibold text-slate-700 ring-1 ring-slate-200">
                        Contrato #{bill.ligacaoId ?? "--"} | {bill.consumidorNome}
                      </span>
                    ))}
                    {selectedPenaltyBills.length > 8 ? (
                      <span className="rounded-full bg-white px-3 py-2 text-xs font-semibold text-slate-700 ring-1 ring-slate-200">
                        +{selectedPenaltyBills.length - 8} contrato(s)
                      </span>
                    ) : null}
                  </div>
                )}
              </div>
            </div>
          )}
        </Panel>
      </section>

      <Panel
        title="Operacao de cobranca"
        description="A coluna da esquerda mostra os contratos que ainda nao pagaram. Quando existir mais de uma factura, a divida antiga entra no mesmo card para cobrares tudo num unico movimento."
      >
        {loading ? (
          <p className="text-sm text-slate-500">A carregar facturas...</p>
        ) : pendingBills.length === 0 ? (
          <EmptyState title="Sem facturas pendentes" description="Nao existe nenhum pagamento em aberto neste momento." />
        ) : (
          <div className="grid gap-6 xl:grid-cols-[1.08fr_0.92fr]">
            <div className="space-y-4">
              <div className="rounded-[26px] border border-slate-200 bg-slate-50 p-5">
                <label className="mb-2 block text-sm font-medium text-slate-700">Pesquisar por contrato, proprietario ou casa</label>
                <label className="relative block">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <Input
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder="Ex.: contrato 18, casa 42 ou nome do proprietario"
                    className="h-12 rounded-2xl border-slate-200 pl-9"
                  />
                </label>
                <p className="mt-3 text-xs uppercase tracking-[0.18em] text-slate-400">
                  {filteredBills.length} contrato(s) pendente(s) encontrado(s)
                </p>
              </div>

              {filteredBills.length === 0 ? (
                <EmptyState
                  title="Nenhum contrato pendente encontrado"
                  description="Tenta outro contrato, nome do proprietario ou numero da casa."
                />
              ) : (
                <div className="space-y-3">
                  {filteredBills.map((bill) => {
                    const selected = selectedBillId === bill.id;
                    const penaltySelected = selectedPenaltyIds.includes(bill.id);
                    const contract = bill.ligacaoId ? contractMap.get(bill.ligacaoId) : null;
                    return (
                      <button
                        key={bill.id}
                        type="button"
                        onClick={() => setSelectedBillId(bill.id)}
                        className={cn(
                          "w-full rounded-[26px] border p-5 text-left transition",
                          selected
                            ? "border-cyan-300 bg-cyan-50 shadow-sm shadow-cyan-100"
                            : penaltySelected
                              ? "border-amber-300 bg-amber-50 shadow-sm shadow-amber-100"
                              : "border-slate-200 bg-white hover:border-cyan-200 hover:shadow-sm"
                        )}
                      >
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <div>
                            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">
                              Factura #{bill.id} | Contrato #{bill.ligacaoId ?? "--"}
                            </p>
                            <p className="mt-2 text-lg font-black tracking-tight text-slate-900">{bill.consumidorNome}</p>
                            <p className="mt-1 text-sm text-slate-600">{contract?.referenciaLocal || "Sem referencia do local"}</p>
                            <p className="mt-2 text-xs uppercase tracking-[0.22em] text-slate-400">
                              {formatServiceAddress(contract?.adress ?? null, bill.houseNR)}
                            </p>
                          </div>
                          <div className="text-right">
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={(event) => {
                                event.stopPropagation();
                                togglePenaltySelection(bill.id);
                              }}
                              className={cn(
                                "mb-3 rounded-full",
                                penaltySelected
                                  ? "border-amber-300 bg-amber-100 text-amber-900 hover:bg-amber-100"
                                  : "border-slate-200 bg-white text-slate-700"
                              )}
                            >
                              {penaltySelected ? "Marcada para multa" : "Marcar multa"}
                            </Button>
                            <InfoChip text={billLabel(bill.estadoPagamento)} tone={billTone(bill.estadoPagamento)} />
                            <p className="mt-3 text-lg font-black tracking-tight text-slate-900">{formatMoney(bill.valorTotal)}</p>
                          </div>
                        </div>

                        <div className="mt-4 grid gap-3 sm:grid-cols-4">
                          <div className="rounded-2xl bg-slate-50 px-4 py-3 ring-1 ring-slate-200">
                            <p className="text-xs uppercase tracking-[0.22em] text-slate-400">Factura</p>
                            <p className="mt-2 font-semibold text-slate-900">{formatMoney(bill.valorFactura)}</p>
                          </div>
                          <div className="rounded-2xl bg-slate-50 px-4 py-3 ring-1 ring-slate-200">
                            <p className="text-xs uppercase tracking-[0.22em] text-slate-400">Multa</p>
                            <p className="mt-2 font-semibold text-slate-900">{formatMoney(bill.multaValor)}</p>
                          </div>
                          <div className="rounded-2xl bg-slate-50 px-4 py-3 ring-1 ring-slate-200">
                            <p className="text-xs uppercase tracking-[0.22em] text-slate-400">Divida</p>
                            <p className="mt-2 font-semibold text-slate-900">{formatMoney(bill.dividaValor)}</p>
                          </div>
                          <div className="rounded-2xl bg-slate-50 px-4 py-3 ring-1 ring-slate-200">
                            <p className="text-xs uppercase tracking-[0.22em] text-slate-400">Pendentes</p>
                            <p className="mt-2 font-semibold text-slate-900">
                              {bill.facturasPendentes} factura(s) | Casa {bill.houseNR || "por definir"}
                            </p>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="space-y-4">
              <div className="rounded-[26px] border border-slate-200 bg-slate-50 p-5">
                <div className="flex items-center gap-2 text-slate-900">
                  <CreditCard className="h-4 w-4 text-cyan-700" />
                  <h3 className="text-base font-black tracking-tight">Mesa de pagamento</h3>
                </div>

                {selectedBill ? (
                  <>
                    <div className="mt-4 rounded-2xl bg-white p-4 ring-1 ring-slate-200">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <p className="text-xs uppercase tracking-[0.22em] text-slate-400">Factura seleccionada</p>
                          <p className="mt-2 text-lg font-black tracking-tight text-slate-900">
                            #{selectedBill.id} | Contrato #{selectedBill.ligacaoId ?? "--"}
                          </p>
                          <p className="mt-1 text-sm text-slate-600">{selectedBill.consumidorNome}</p>
                        </div>
                        <InfoChip text={billLabel(selectedBill.estadoPagamento)} tone={billTone(selectedBill.estadoPagamento)} />
                      </div>
                      <p className="mt-3 text-sm text-slate-600">
                        {formatServiceAddress(selectedContract?.adress ?? null, selectedBill.houseNR)}
                      </p>
                      <p className="mt-2 text-xs uppercase tracking-[0.2em] text-slate-400">
                        {selectedBill.facturasPendentes} factura(s) agregada(s) neste recebimento
                      </p>
                    </div>

                    <div className="mt-4 grid gap-3 sm:grid-cols-3">
                      {paymentOptions.map((option) => {
                        const active = paymentMethod === option;
                        return (
                          <button
                            key={option}
                            type="button"
                            onClick={() => setPaymentMethod(option)}
                            className={cn(
                              "rounded-2xl border px-4 py-4 text-left transition",
                              active
                                ? "border-cyan-300 bg-cyan-50 text-cyan-900 shadow-sm shadow-cyan-100"
                                : "border-slate-200 bg-white text-slate-700 hover:border-cyan-200"
                            )}
                          >
                            <p className="text-sm font-semibold">{paymentMethodDetails[option].title}</p>
                            <p className="mt-2 text-xs leading-5 text-slate-500">{paymentMethodDetails[option].helper}</p>
                          </button>
                        );
                      })}
                    </div>

                    <div className="mt-4">
                      <label className="mb-2 block text-sm font-medium text-slate-700">Valor a registar</label>
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        value={valorPago}
                        onChange={(event) => setValorPago(event.target.value)}
                        placeholder="Valor recebido"
                        className="h-12 rounded-2xl border-slate-200 px-4"
                      />
                    </div>

                    <div className="mt-4 grid gap-3 sm:grid-cols-4">
                      <div className="rounded-2xl bg-white p-4 ring-1 ring-slate-200">
                        <p className="text-xs uppercase tracking-[0.22em] text-slate-400">Valor da factura</p>
                        <p className="mt-2 font-semibold text-slate-900">{formatMoney(selectedBill.valorFactura)}</p>
                      </div>
                      <div className="rounded-2xl bg-white p-4 ring-1 ring-slate-200">
                        <p className="text-xs uppercase tracking-[0.22em] text-slate-400">Multa</p>
                        <p className="mt-2 font-semibold text-slate-900">{formatMoney(selectedBill.multaValor)}</p>
                      </div>
                      <div className="rounded-2xl bg-white p-4 ring-1 ring-slate-200">
                        <p className="text-xs uppercase tracking-[0.22em] text-slate-400">Divida</p>
                        <p className="mt-2 font-semibold text-slate-900">{formatMoney(selectedBill.dividaValor)}</p>
                      </div>
                      <div className="rounded-2xl bg-white p-4 ring-1 ring-slate-200">
                        <p className="text-xs uppercase tracking-[0.22em] text-slate-400">Total</p>
                        <p className="mt-2 font-semibold text-slate-900">{formatMoney(selectedBill.valorTotal)}</p>
                      </div>
                    </div>

                    <div className="mt-4 grid gap-3 sm:grid-cols-3">
                      <div className="rounded-2xl bg-white p-4 ring-1 ring-slate-200">
                        <p className="text-xs uppercase tracking-[0.22em] text-slate-400">Consumo</p>
                        <p className="mt-2 font-semibold text-slate-900">{selectedBill.consumoM3 != null ? `${selectedBill.consumoM3} m3` : "-"}</p>
                      </div>
                      <div className="rounded-2xl bg-white p-4 ring-1 ring-slate-200">
                        <p className="text-xs uppercase tracking-[0.22em] text-slate-400">Falta</p>
                        <p className="mt-2 font-semibold text-slate-900">{formatMoney(remainingAmount)}</p>
                      </div>
                      <div className="rounded-2xl bg-white p-4 ring-1 ring-slate-200">
                        <p className="text-xs uppercase tracking-[0.22em] text-slate-400">Troco</p>
                        <p className="mt-2 font-semibold text-slate-900">{formatMoney(changeAmount)}</p>
                      </div>
                    </div>

                    <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-600">
                      <p className="font-semibold text-slate-900">Resumo do recibo</p>
                      <p className="mt-2">Metodo: {formatPaymentMethod(paymentMethod)}</p>
                      <p className="mt-1">Valor da factura: {formatMoney(selectedBill.valorFactura)}</p>
                      <p className="mt-1">Multa: {formatMoney(selectedBill.multaValor)}</p>
                      <p className="mt-1">Divida: {formatMoney(selectedBill.dividaValor)}</p>
                      <p className="mt-1">O recibo vai mostrar a tabela com valor a pagar, multa, divida e total, alem do texto Pago com a referencia 843892980.</p>
                    </div>

                    <div className="mt-5 flex flex-wrap justify-end gap-3">
                      <Button type="button" variant="outline" onClick={() => printWaterBillDocument(selectedBill)}>
                        <FileText className="h-4 w-4" />
                        Imprimir factura
                      </Button>
                      <Button
                        type="button"
                        disabled={payingId === selectedBill.id}
                        onClick={() => setConfirmPayId(selectedBill.id)}
                        className="bg-emerald-600 text-white hover:bg-emerald-700"
                      >
                        <CreditCard className="h-4 w-4" />
                        Confirmar pagamento
                      </Button>
                    </div>
                  </>
                ) : (
                  <p className="mt-4 text-sm text-slate-500">Selecciona uma factura pendente na coluna da esquerda para concluir o pagamento.</p>
                )}
              </div>
            </div>
          </div>
        )}
      </Panel>
    </main>
  );
}
