"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ErrorBox, Loading } from "@/components/ui/State";
import { purchasesApi } from "@/features/purchases/api";
import { salesApi } from "@/features/sales/api";
import { stockApi } from "@/features/stock/api";
import { listWaterBills, listWaterContracts, listWaterCustomers, listWaterReadings } from "@/features/water/api";
import { getErrorMessage } from "@/lib/errors";

type Summary = {
  stock: number;
  purchases: number;
  sales: number;
  pendingPickup: number;
  readyPickup: number;
  waterCustomers: number;
  waterContracts: number;
  waterReadings: number;
  waterBills: number;
};

export default function StaffHome() {
  const [summary, setSummary] = useState<Summary>({
    stock: 0,
    purchases: 0,
    sales: 0,
    pendingPickup: 0,
    readyPickup: 0,
    waterCustomers: 0,
    waterContracts: 0,
    waterReadings: 0,
    waterBills: 0,
  });
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  useEffect(() => {
    (async () => {
      setLoading(true);
      setErr("");

      try {
        const [stock, purchases, sales, waterCustomers, waterContracts, waterReadings, waterBills] = await Promise.all([
          stockApi.list(),
          purchasesApi.list(),
          salesApi.list(),
          listWaterCustomers(),
          listWaterContracts(),
          listWaterReadings(),
          listWaterBills(),
        ]);

        setSummary({
          stock: stock.length,
          purchases: purchases.length,
          sales: sales.length,
          pendingPickup: sales.filter((sale) => sale.estadoLevantamento === "AGUARDANDO_PREPARACAO").length,
          readyPickup: sales.filter((sale) => sale.estadoLevantamento === "PRONTO_PARA_LEVANTAMENTO").length,
          waterCustomers: waterCustomers.length,
          waterContracts: waterContracts.length,
          waterReadings: waterReadings.length,
          waterBills: waterBills.length,
        });
      } catch (error: unknown) {
        setErr(getErrorMessage(error, "Erro ao carregar o painel do staff"));
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const cards = [
    { label: "Stock", value: summary.stock, href: "/staff/stock" },
    { label: "Compras", value: summary.purchases, href: "/staff/compras" },
    { label: "Vendas", value: summary.sales, href: "/staff/vendas" },
    { label: "A Preparar", value: summary.pendingPickup, href: "/staff/vendas" },
    { label: "Prontas", value: summary.readyPickup, href: "/staff/vendas" },
    { label: "Clientes de Agua", value: summary.waterCustomers, href: "/staff/agua" },
    { label: "Ligacoes", value: summary.waterContracts, href: "/staff/agua" },
    { label: "Leituras", value: summary.waterReadings, href: "/staff/agua" },
    { label: "Facturas Agua", value: summary.waterBills, href: "/staff/agua" },
  ];

  return (
    <div style={{ display: "grid", gap: 16 }}>
      <div style={{ background: "white", border: "1px solid #ddd", borderRadius: 10, padding: 16 }}>
        <h2 style={{ marginTop: 0 }}>Painel Staff</h2>
        <p style={{ marginBottom: 0, color: "#555" }}>
          Operacoes de stock, compras, vendas e agua ligadas ao backend em tempo real.
        </p>
      </div>

      {loading && <Loading />}
      {err && <ErrorBox text={err} />}

      {!loading && !err && (
        <>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
              gap: 12,
            }}
          >
            {cards.map((card) => (
              <Link
                key={card.label}
                href={card.href}
                style={{
                  display: "block",
                  background: "white",
                  border: "1px solid #ddd",
                  borderRadius: 10,
                  padding: 16,
                  color: "inherit",
                  textDecoration: "none",
                }}
              >
                <div style={{ fontSize: 12, textTransform: "uppercase", color: "#777", marginBottom: 8 }}>{card.label}</div>
                <div style={{ fontSize: 28, fontWeight: 700 }}>{card.value}</div>
              </Link>
            ))}
          </div>

          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <Link href="/staff/vendas/nova" style={{ color: "#9a3412", textDecoration: "none", fontWeight: 600 }}>
              Registar nova venda
            </Link>
            <Link href="/staff/utilizadores/novo" style={{ color: "#9a3412", textDecoration: "none", fontWeight: 600 }}>
              Criar conta operacional
            </Link>
            <Link href="/staff/agua" style={{ color: "#9a3412", textDecoration: "none", fontWeight: 600 }}>
              Abrir modulo de agua
            </Link>
          </div>
        </>
      )}
    </div>
  );
}
