"use client";

import { useEffect, useMemo, useState, type ComponentType } from "react";
import { apiGet } from "@/lib/http/client";
import { endpoints } from "@/lib/http/endpoints";
import { getErrorMessage } from "@/lib/errors";
import { formatDateTime } from "@/lib/formatters";
import {
  AlertTriangle,
  Clock3,
  Cpu,
  Database,
  Gauge,
  HardDrive,
  RefreshCcw,
  Server,
  ShieldCheck,
  Wifi,
  XCircle,
} from "lucide-react";

type StatusTone = "blue" | "yellow" | "red";

type SystemStatusMetric = {
  id: string;
  titulo: string;
  estado: string;
  tom: StatusTone;
  percentagem: number;
  detalhe: string;
  observacao: string;
  actualizadoEm: string;
};

type SystemStatusSnapshot = {
  percentagemGeral: number;
  estadoGeral: string;
  tomGeral: StatusTone;
  resumo: string;
  geradoEm: string;
  metricas: SystemStatusMetric[];
};

type IconType = ComponentType<{ className?: string }>;

const toneStyles: Record<
  StatusTone,
  {
    panel: string;
    badge: string;
    progress: string;
    glow: string;
  }
> = {
  blue: {
    panel: "border-blue-200 bg-blue-50 text-blue-800",
    badge: "bg-blue-100 text-blue-700",
    progress: "bg-blue-600",
    glow: "shadow-blue-500/10",
  },
  yellow: {
    panel: "border-amber-200 bg-amber-50 text-amber-800",
    badge: "bg-amber-100 text-amber-700",
    progress: "bg-amber-500",
    glow: "shadow-amber-500/10",
  },
  red: {
    panel: "border-rose-200 bg-rose-50 text-rose-800",
    badge: "bg-rose-100 text-rose-700",
    progress: "bg-rose-600",
    glow: "shadow-rose-500/10",
  },
};

const metricIcons: Record<string, IconType> = {
  broadband: Wifi,
  cpu: Cpu,
  database: Database,
  disk: HardDrive,
  memory: Gauge,
  uptime: Clock3,
};

async function readSystemStatus() {
  return apiGet<SystemStatusSnapshot>(endpoints.systemStatus);
}

export function SystemStatusPage() {
  const [snapshot, setSnapshot] = useState<SystemStatusSnapshot | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    const loadInitialSnapshot = async () => {
      setLoading(true);

      try {
        const next = await readSystemStatus();
        if (!active) return;
        setSnapshot(next);
        setError("");
      } catch (reason: unknown) {
        if (!active) return;
        setError(getErrorMessage(reason, "Nao foi possivel carregar o estado do sistema"));
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    const refreshSnapshot = async () => {
      try {
        const next = await readSystemStatus();
        if (!active) return;
        setSnapshot(next);
        setError("");
      } catch (reason: unknown) {
        if (!active) return;
        setError(getErrorMessage(reason, "Nao foi possivel carregar o estado do sistema"));
      }
    };

    void loadInitialSnapshot();

    const timer = window.setInterval(() => {
      void refreshSnapshot();
    }, 60000);

    return () => {
      active = false;
      window.clearInterval(timer);
    };
  }, []);

  const refreshNow = async () => {
    setRefreshing(true);

    try {
      const next = await readSystemStatus();
      setSnapshot(next);
      setError("");
    } catch (reason: unknown) {
      setError(getErrorMessage(reason, "Nao foi possivel carregar o estado do sistema"));
    } finally {
      setRefreshing(false);
    }
  };

  const counters = useMemo(() => {
    const metricas = snapshot?.metricas ?? [];
    return {
      blue: metricas.filter((metric) => metric.tom === "blue").length,
      yellow: metricas.filter((metric) => metric.tom === "yellow").length,
      red: metricas.filter((metric) => metric.tom === "red").length,
    };
  }, [snapshot]);

  const overallTone = snapshot?.tomGeral ?? "blue";
  const overallStyle = toneStyles[overallTone];

  return (
    <main className="grid gap-6">
      <section className="overflow-hidden rounded-[32px] bg-gradient-to-br from-slate-950 via-blue-950 to-slate-800 p-6 text-white shadow-lg shadow-slate-950/10">
        <div className="grid gap-6 xl:grid-cols-[1.35fr,0.65fr]">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-blue-200">Estado do sistema</p>
            <h1 className="mt-3 text-3xl font-black tracking-tight">Monitoria da BD, banda larga e recursos principais</h1>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-200">
              Esta vista mostra a saude operacional do sistema inteiro com percentagens de 0 a 100, leitura por cor e
              actualizacao periodica da base de dados, conectividade, CPU, memoria, disco e estabilidade.
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-3 text-xs font-semibold uppercase tracking-[0.24em] text-slate-300">
              <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2">
                <span className="h-2.5 w-2.5 rounded-full bg-blue-400" />
                Azul estavel
              </span>
              <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2">
                <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
                Amarelo atencao
              </span>
              <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2">
                <span className="h-2.5 w-2.5 rounded-full bg-rose-400" />
                Vermelho critico
              </span>
            </div>
          </div>

          <div className="rounded-[28px] border border-white/10 bg-white/10 p-5 backdrop-blur">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-300">Saude geral</p>
                <div className="mt-3 text-6xl font-black tracking-tight">{snapshot?.percentagemGeral ?? 0}%</div>
              </div>
              <div className={`rounded-2xl p-3 ${overallStyle.badge}`}>
                <Server className="h-5 w-5" />
              </div>
            </div>
            <div className={`mt-4 inline-flex rounded-full px-4 py-2 text-xs font-black uppercase tracking-[0.28em] ${overallStyle.badge}`}>
              {snapshot?.estadoGeral ?? "A carregar"}
            </div>
            <p className="mt-4 text-sm leading-7 text-slate-200">{snapshot?.resumo ?? "A recolher metricas do ambiente..."}</p>
            <p className="mt-3 text-xs text-slate-300">Ultima leitura: {formatDateTime(snapshot?.geradoEm)}</p>
            <button
              type="button"
              onClick={() => void refreshNow()}
              disabled={loading || refreshing}
              className="mt-5 inline-flex items-center gap-2 rounded-2xl border border-white/15 bg-white/10 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/15 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <RefreshCcw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
              {refreshing ? "A actualizar..." : "Actualizar agora"}
            </button>
          </div>
        </div>
      </section>

      {loading ? (
        <div className="rounded-[28px] border border-slate-200 bg-slate-50 px-6 py-14 text-center text-sm text-slate-500">
          A carregar estado do sistema...
        </div>
      ) : null}

      {error ? (
        <div className="rounded-[24px] border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div>
      ) : null}

      {!loading && snapshot ? (
        <>
          <section className="grid gap-4 md:grid-cols-3">
            {[
              {
                label: "Estavel",
                value: counters.blue,
                helper: "Areas em azul com leitura confortavel.",
                icon: ShieldCheck,
                tone: "blue" as const,
              },
              {
                label: "Atencao",
                value: counters.yellow,
                helper: "Pontos em amarelo que pedem observacao.",
                icon: AlertTriangle,
                tone: "yellow" as const,
              },
              {
                label: "Critico",
                value: counters.red,
                helper: "Frentes em vermelho para accao imediata.",
                icon: XCircle,
                tone: "red" as const,
              },
            ].map((item) => {
              const Icon = item.icon;
              const styles = toneStyles[item.tone];

              return (
                <div key={item.label} className={`rounded-[28px] border p-5 shadow-sm ${styles.panel}`}>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.3em]">{item.label}</p>
                      <div className="mt-3 text-4xl font-black">{item.value}</div>
                      <p className="mt-2 text-sm leading-6 opacity-80">{item.helper}</p>
                    </div>
                    <div className={`rounded-2xl p-3 ${styles.badge}`}>
                      <Icon className="h-5 w-5" />
                    </div>
                  </div>
                </div>
              );
            })}
          </section>

          <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {snapshot.metricas.map((metric) => {
              const Icon = metricIcons[metric.id] ?? Server;
              const styles = toneStyles[metric.tom];

              return (
                <article
                  key={metric.id}
                  className={`rounded-[30px] border border-slate-200 bg-white p-5 shadow-sm transition ${styles.glow}`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">{metric.titulo}</p>
                      <div className="mt-3 text-4xl font-black text-slate-900">{metric.percentagem}%</div>
                    </div>
                    <div className={`rounded-2xl p-3 ${styles.badge}`}>
                      <Icon className="h-5 w-5" />
                    </div>
                  </div>

                  <div className={`mt-4 inline-flex rounded-full px-3 py-1 text-[11px] font-black uppercase tracking-[0.25em] ${styles.badge}`}>
                    {metric.estado}
                  </div>

                  <div className="mt-5 h-3 overflow-hidden rounded-full bg-slate-100">
                    <div className={`h-full rounded-full ${styles.progress}`} style={{ width: `${metric.percentagem}%` }} />
                  </div>

                  <p className="mt-4 text-sm font-semibold leading-6 text-slate-700">{metric.detalhe}</p>
                  <p className="mt-2 text-sm leading-6 text-slate-500">{metric.observacao || "Sem observacoes adicionais."}</p>
                  <p className="mt-4 text-xs uppercase tracking-[0.24em] text-slate-400">
                    Actualizado em {formatDateTime(metric.actualizadoEm)}
                  </p>
                </article>
              );
            })}
          </section>
        </>
      ) : null}
    </main>
  );
}
