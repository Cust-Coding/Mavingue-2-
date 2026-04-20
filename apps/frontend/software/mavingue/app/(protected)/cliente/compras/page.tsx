"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Empty, ErrorBox, Loading } from "@/components/ui/State";
import { clientApi } from "@/features/client/api";
import type { ClientOrder } from "@/features/client/types";

function money(value: number) {
  return `${Number(value || 0).toFixed(2)} MT`;
}

export default function ClienteCompras() {
  const [orders, setOrders] = useState<ClientOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  useEffect(() => {
    (async () => {
      setLoading(true);
      setErr("");

      try {
        setOrders(await clientApi.listOrders());
      } catch (error: any) {
        setErr(error?.message ?? "Erro ao carregar compras");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <div style={{ display: "grid", gap: 16 }}>
      <div style={{ background: "white", border: "1px solid #ddd", borderRadius: 10, padding: 16 }}>
        <h2 style={{ marginTop: 0 }}>Minhas Compras</h2>
        <p style={{ marginBottom: 0, color: "#555" }}>Pedidos ligados ao backend pela sua conta autenticada.</p>
      </div>

      {loading && <Loading />}
      {err && <ErrorBox text={err} />}

      {!loading && !err && orders.length === 0 && <Empty text="Ainda nao existem compras associadas a esta conta." />}

      {!loading && !err && orders.length > 0 && (
        <div style={{ border: "1px solid #ddd", borderRadius: 10, background: "white", overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th style={{ textAlign: "left", padding: 10, borderBottom: "1px solid #eee" }}>Pedido</th>
                <th style={{ textAlign: "left", padding: 10, borderBottom: "1px solid #eee" }}>Produto</th>
                <th style={{ textAlign: "left", padding: 10, borderBottom: "1px solid #eee" }}>Quantidade</th>
                <th style={{ textAlign: "left", padding: 10, borderBottom: "1px solid #eee" }}>Pagamento</th>
                <th style={{ textAlign: "left", padding: 10, borderBottom: "1px solid #eee" }}>Total</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id}>
                  <td style={{ padding: 10, borderBottom: "1px solid #f3f3f3" }}>
                    <Link href={`/cliente/compras/${order.id}`} style={{ color: "#9a3412", textDecoration: "none", fontWeight: 600 }}>
                      #{order.id}
                    </Link>
                  </td>
                  <td style={{ padding: 10, borderBottom: "1px solid #f3f3f3" }}>{order.produtoNome}</td>
                  <td style={{ padding: 10, borderBottom: "1px solid #f3f3f3" }}>{order.quantidade}</td>
                  <td style={{ padding: 10, borderBottom: "1px solid #f3f3f3" }}>{order.formaPagamento}</td>
                  <td style={{ padding: 10, borderBottom: "1px solid #f3f3f3" }}>{money(order.total)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
