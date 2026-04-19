"use client";
import { useEffect, useState } from "react";
import { Loading, ErrorBox, Empty } from "@/components/ui/State";
import { listWaterContracts, listWaterReadings, listWaterBills } from "@/features/water/api";
import type { WaterContract, WaterReading, WaterBill } from "@/features/water/types";

type Tab = "contratos" | "leituras" | "faturas";

export default function ClienteAguaPage() {
  const [tab, setTab] = useState<Tab>("contratos");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  
  const [contratos, setContratos] = useState<WaterContract[]>([]);
  const [leituras, setLeituras] = useState<WaterReading[]>([]);
  const [faturas, setFaturas] = useState<WaterBill[]>([]);

  async function load() {
    setErr("");
    setLoading(true);
    try {
      const [ct, l, f] = await Promise.all([
        listWaterContracts(),
        listWaterReadings(),
        listWaterBills(),
      ]);
      setContratos(ct);
      setLeituras(l);
      setFaturas(f);
    } catch (e: any) {
      setErr(e?.message ?? "Erro ao carregar");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const tabs: { key: Tab; label: string }[] = [
    { key: "contratos", label: "Meus Contratos" },
    { key: "leituras", label: "Minhas Leituras" },
    { key: "faturas", label: "Minhas Faturas" },
  ];

  return (
    <div>
      <h2>Água</h2>
      {err && <ErrorBox text={err} />}

      <div style={{ display: "flex", gap: 8, marginBottom: 16, borderBottom: "1px solid #eee", paddingBottom: 8 }}>
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            style={{
              padding: "8px 16px",
              border: "none",
              background: tab === t.key ? "#EF6A44" : "transparent",
              color: tab === t.key ? "white" : "#333",
              borderRadius: 6,
              cursor: "pointer",
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {loading && <Loading />}

      {!loading && tab === "contratos" && (
        contratos.length === 0 ? <Empty text="Sem contratos." /> : (
          <div style={{ border: "1px solid #ddd", borderRadius: 10, background: "white", overflow: "hidden" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  <th style={{ textAlign: "left", padding: 10, borderBottom: "1px solid #eee" }}>Nº Contador</th>
                  <th style={{ textAlign: "left", padding: 10, borderBottom: "1px solid #eee" }}>Estado</th>
                </tr>
              </thead>
              <tbody>
                {contratos.map((c) => (
                  <tr key={c.id}>
                    <td style={{ padding: 10, borderBottom: "1px solid #f3f3f3" }}>{c.meterNumber}</td>
                    <td style={{ padding: 10, borderBottom: "1px solid #f3f3f3" }}>
                      <span style={{ background: c.active ? "#dcfce7" : "#fee2e2", color: c.active ? "#16a34a" : "#dc2626", padding: "2px 8px", borderRadius: 4, fontSize: 12 }}>
                        {c.active ? "Ativo" : "Inativo"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      )}

      {!loading && tab === "leituras" && (
        leituras.length === 0 ? <Empty text="Sem leituras." /> : (
          <div style={{ border: "1px solid #ddd", borderRadius: 10, background: "white", overflow: "hidden" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  <th style={{ textAlign: "left", padding: 10, borderBottom: "1px solid #eee" }}>Data</th>
                  <th style={{ textAlign: "left", padding: 10, borderBottom: "1px solid #eee" }}>Valor</th>
                </tr>
              </thead>
              <tbody>
                {leituras.map((l) => (
                  <tr key={l.id}>
                    <td style={{ padding: 10, borderBottom: "1px solid #f3f3f3" }}>{new Date(l.readingDate).toLocaleDateString()}</td>
                    <td style={{ padding: 10, borderBottom: "1px solid #f3f3f3" }}>{l.value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      )}

      {!loading && tab === "faturas" && (
        faturas.length === 0 ? <Empty text="Sem faturas." /> : (
          <div style={{ border: "1px solid #ddd", borderRadius: 10, background: "white", overflow: "hidden" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  <th style={{ textAlign: "left", padding: 10, borderBottom: "1px solid #eee" }}>Valor</th>
                  <th style={{ textAlign: "left", padding: 10, borderBottom: "1px solid #eee" }}>Vencimento</th>
                  <th style={{ textAlign: "left", padding: 10, borderBottom: "1px solid #eee" }}>Estado</th>
                </tr>
              </thead>
              <tbody>
                {faturas.map((f) => (
                  <tr key={f.id}>
                    <td style={{ padding: 10, borderBottom: "1px solid #f3f3f3" }}>{f.amount} MT</td>
                    <td style={{ padding: 10, borderBottom: "1px solid #f3f3f3" }}>{new Date(f.dueDate).toLocaleDateString()}</td>
                    <td style={{ padding: 10, borderBottom: "1px solid #f3f3f3" }}>
                      <span style={{ background: f.status === "PAID" ? "#dcfce7" : "#fef3c7", color: f.status === "PAID" ? "#16a34a" : "#d97706", padding: "2px 8px", borderRadius: 4, fontSize: 12 }}>
                        {f.status === "PAID" ? "Pago" : "Pendente"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      )}
    </div>
  );
}