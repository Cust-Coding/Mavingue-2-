"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ErrorBox, Loading } from "@/components/ui/State";
import { customersApi } from "@/features/customers/api";
import { purchasesApi } from "@/features/purchases/api";
import { productsApi } from "@/features/products/api";
import { salesApi } from "@/features/sales/api";
import { stockApi } from "@/features/stock/api";
import { listUsers } from "@/features/users/api";
import { listWaterBills, listWaterContracts, listWaterCustomers, listWaterReadings } from "@/features/water/api";
import { getErrorMessage } from "@/lib/errors";

type Summary = {
  users: number;
  products: number;
  customers: number;
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

const initialSummary: Summary = {
  users: 0,
  products: 0,
  customers: 0,
  stock: 0,
  purchases: 0,
  sales: 0,
  pendingPickup: 0,
  readyPickup: 0,
  waterCustomers: 0,
  waterContracts: 0,
  waterReadings: 0,
  waterBills: 0,
};

export default function AdminHome() {
  const [summary, setSummary] = useState<Summary>(initialSummary);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  useEffect(() => {
    (async () => {
      setLoading(true);
      setErr("");

      try {
        const [users, products, customers, stock, purchases, sales, waterCustomers, waterContracts, waterReadings, waterBills] =
          await Promise.all([
            listUsers(),
            productsApi.list(),
            customersApi.list(),
            stockApi.list(),
            purchasesApi.list(),
            salesApi.list(),
            listWaterCustomers(),
            listWaterContracts(),
            listWaterReadings(),
            listWaterBills(),
          ]);

        setSummary({
          users: users.length,
          products: products.length,
          customers: customers.length,
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
        setErr(getErrorMessage(error, "Erro ao carregar o painel"));
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const cards = [
    { label: "Utilizadores", value: summary.users, href: "/admin/utilizadores" },
    { label: "Produtos", value: summary.products, href: "/admin/produtos" },
    { label: "Clientes", value: summary.customers, href: "/admin/clientes" },
    { label: "Stock", value: summary.stock, href: "/admin/stock" },
    { label: "Compras", value: summary.purchases, href: "/admin/compras" },
    { label: "Vendas", value: summary.sales, href: "/admin/vendas" },
    { label: "A Preparar", value: summary.pendingPickup, href: "/admin/vendas" },
    { label: "Prontas", value: summary.readyPickup, href: "/admin/vendas" },
    { label: "Clientes de Agua", value: summary.waterCustomers, href: "/admin/agua" },
    { label: "Ligacoes", value: summary.waterContracts, href: "/admin/agua" },
    { label: "Leituras", value: summary.waterReadings, href: "/admin/agua" },
    { label: "Facturas Agua", value: summary.waterBills, href: "/admin/agua" },
  ];

  return (
    <div style={{ display: "grid", gap: 16 }}>
      <div style={{ background: "white", border: "1px solid #ddd", borderRadius: 10, padding: 16 }}>
        <h2 style={{ marginTop: 0 }}>Painel Admin</h2>
        <p style={{ marginBottom: 0, color: "#555" }}>
          Estado geral das APIs ligadas ao frontend para administracao, operacao e modulo de agua.
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

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
              gap: 12,
            }}
          >
            {[
              { href: "/admin/produtos/novo", label: "Criar produto" },
              { href: "/admin/utilizadores/novo", label: "Criar utilizador" },
              { href: "/admin/vendas/nova", label: "Registar venda" },
              { href: "/admin/agua", label: "Abrir modulo de agua" },
            ].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                style={{
                  display: "block",
                  background: "#fff7ed",
                  border: "1px solid #fed7aa",
                  borderRadius: 10,
                  padding: 16,
                  color: "#9a3412",
                  textDecoration: "none",
                  fontWeight: 600,
                }}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
