"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Empty, ErrorBox, Loading } from "@/components/ui/State";
import { clientApi } from "@/features/client/api";
import type { ClientOrder, ClientProfile } from "@/features/client/types";
import { listClientWaterBills, listClientWaterContracts, listClientWaterReadings, payClientWaterBill } from "@/features/water/api";
import type { WaterBill, WaterContract, WaterReading } from "@/features/water/types";

const paymentOptions = [
  { value: "CARTEIRA_MOVEL", label: "Carteira Movel" },
  { value: "CARTAO", label: "Cartao" },
  { value: "DINHEIRO_FISICO", label: "Dinheiro Fisico" },
] as const;

function money(value: number) {
  return `${Number(value || 0).toFixed(2)} MT`;
}

export default function ClienteHome() {
  const [profile, setProfile] = useState<ClientProfile | null>(null);
  const [orders, setOrders] = useState<ClientOrder[]>([]);
  const [contracts, setContracts] = useState<WaterContract[]>([]);
  const [readings, setReadings] = useState<WaterReading[]>([]);
  const [bills, setBills] = useState<WaterBill[]>([]);
  const [paymentMethod, setPaymentMethod] = useState<(typeof paymentOptions)[number]["value"]>("CARTEIRA_MOVEL");
  const [paying, setPaying] = useState(false);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  async function load() {
    setLoading(true);
    setErr("");

    try {
      const [profileData, orderData, contractData, readingData, billData] = await Promise.all([
        clientApi.profile(),
        clientApi.listOrders(),
        listClientWaterContracts(),
        listClientWaterReadings(),
        listClientWaterBills(),
      ]);

      setProfile(profileData);
      setOrders(orderData);
      setContracts(contractData);
      setReadings(readingData);
      setBills(billData);
    } catch (error: any) {
      setErr(error?.message ?? "Erro ao carregar a area do cliente");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const orderTotal = useMemo(
    () => orders.reduce((sum, order) => sum + Number(order.total || 0), 0),
    [orders]
  );

  const latestReading = readings[0] ?? null;
  const pendingBill = bills.find((bill) => bill.estadoPagamento !== "PAGO") ?? null;

  async function handlePayBill() {
    if (!pendingBill) return;

    setPaying(true);
    setErr("");
    try {
      const updated = await payClientWaterBill(pendingBill.id, { formaPagamento: paymentMethod });
      setBills((current) => current.map((bill) => (bill.id === updated.id ? updated : bill)));
    } catch (error: any) {
      setErr(error?.message ?? "Nao foi possivel pagar a factura");
    } finally {
      setPaying(false);
    }
  }

  return (
    <div style={{ display: "grid", gap: 16 }}>
      <div style={{ background: "white", border: "1px solid #ddd", borderRadius: 10, padding: 16 }}>
        <h2 style={{ marginTop: 0 }}>Area do Cliente</h2>
        <p style={{ marginBottom: 0, color: "#555" }}>
          {profile ? `Sessao activa para ${profile.account.nome} (${profile.account.email})` : "A carregar dados da sua conta..."}
        </p>
      </div>

      {loading && <Loading />}
      {err && <ErrorBox text={err} />}

      {!loading && !err && (
        <>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
              gap: 12,
            }}
          >
            {[
              { label: "Compras", value: orders.length, hint: "Pedidos registados" },
              { label: "Total Comprado", value: money(orderTotal), hint: "Acumulado das compras" },
              { label: "Ligacoes de Agua", value: contracts.length, hint: "Contratos activos ou historicos" },
              {
                label: "Facturas Pendentes",
                value: bills.filter((bill) => bill.estadoPagamento !== "PAGO").length,
                hint: "Faturas por regularizar",
              },
            ].map((card) => (
              <div key={card.label} style={{ background: "white", border: "1px solid #ddd", borderRadius: 10, padding: 16 }}>
                <div style={{ fontSize: 12, textTransform: "uppercase", color: "#777", marginBottom: 8 }}>{card.label}</div>
                <div style={{ fontSize: 24, fontWeight: 700 }}>{card.value}</div>
                <div style={{ color: "#666", marginTop: 6 }}>{card.hint}</div>
              </div>
            ))}
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
              gap: 16,
            }}
          >
            <div style={{ background: "white", border: "1px solid #ddd", borderRadius: 10, padding: 16 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                <h3 style={{ margin: 0 }}>Ultimas Compras</h3>
                <Link href="/cliente/compras" style={{ color: "#9a3412", textDecoration: "none", fontWeight: 600 }}>
                  Ver tudo
                </Link>
              </div>

              {orders.length === 0 ? (
                <Empty text="Ainda nao existem compras associadas a esta conta." />
              ) : (
                <div style={{ display: "grid", gap: 10 }}>
                  {orders.slice(0, 3).map((order) => (
                    <Link
                      key={order.id}
                      href={`/cliente/compras/${order.id}`}
                      style={{
                        display: "block",
                        padding: 12,
                        borderRadius: 8,
                        border: "1px solid #eee",
                        textDecoration: "none",
                        color: "inherit",
                      }}
                    >
                      <div style={{ fontWeight: 600 }}>{order.produtoNome}</div>
                      <div style={{ color: "#666" }}>
                        Quantidade {order.quantidade} · Total {money(order.total)}
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            <div style={{ background: "white", border: "1px solid #ddd", borderRadius: 10, padding: 16 }}>
              <h3 style={{ marginTop: 0 }}>Consumo de Agua</h3>

              {latestReading ? (
                <div style={{ display: "grid", gap: 10 }}>
                  <div>
                    <strong>Ligacao:</strong> #{latestReading.ligacaoId}
                  </div>
                  <div>
                    <strong>Consumo:</strong> {latestReading.consumoM3} m3
                  </div>
                  <div>
                    <strong>Valor:</strong> {money(latestReading.valorPagar)}
                  </div>
                  <div>
                    <strong>Data:</strong> {new Date(latestReading.data).toLocaleString()}
                  </div>
                  <Link href="/cliente/agua" style={{ color: "#9a3412", textDecoration: "none", fontWeight: 600 }}>
                    Abrir modulo de agua
                  </Link>
                </div>
              ) : (
                <Empty text="Sem leituras de agua registadas para esta conta." />
              )}
            </div>
          </div>

          <div style={{ background: "white", border: "1px solid #ddd", borderRadius: 10, padding: 16 }}>
            <h3 style={{ marginTop: 0 }}>Factura de Agua em Aberto</h3>

            {!pendingBill ? (
              <Empty text="Nao ha facturas de agua pendentes neste momento." />
            ) : (
              <div style={{ display: "grid", gap: 12 }}>
                <div style={{ color: "#444" }}>
                  Factura #{pendingBill.id} · {money(pendingBill.valorTotal)} · Estado {pendingBill.estadoPagamento}
                </div>

                <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
                  <select
                    value={paymentMethod}
                    onChange={(event) => setPaymentMethod(event.target.value as (typeof paymentOptions)[number]["value"])}
                    style={{ padding: 10, borderRadius: 8, border: "1px solid #ddd", minWidth: 220 }}
                  >
                    {paymentOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>

                  <Button onClick={handlePayBill} disabled={paying}>
                    {paying ? "A pagar..." : "Pagar agora"}
                  </Button>

                  <Link href="/cliente/agua" style={{ color: "#9a3412", textDecoration: "none", fontWeight: 600 }}>
                    Ver historico completo
                  </Link>
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
