"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Empty, ErrorBox, Loading } from "@/components/ui/State";
import { salesApi } from "@/features/sales/api";
import type { Venda } from "@/features/sales/types";

function money(value: number) {
  return `${Number(value || 0).toFixed(2)} MT`;
}

export default function AdminVendas() {
  const [rows, setRows] = useState<Venda[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  useEffect(() => {
    salesApi
      .list()
      .then(setRows)
      .catch((error: any) => setErr(error?.message ?? "Erro"))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h2>Vendas</h2>
        <Link href="/admin/vendas/nova" style={{ color: "#9a3412", textDecoration: "none", fontWeight: 600 }}>
          Nova venda
        </Link>
      </div>

      {loading && <Loading />}
      {err && <ErrorBox text={err} />}
      {!loading && !err && rows.length === 0 && <Empty text="Sem vendas." />}

      {!loading && !err && rows.length > 0 && (
        <div style={{ border: "1px solid #ddd", borderRadius: 10, background: "white" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th style={{ textAlign: "left", padding: 10, borderBottom: "1px solid #eee" }}>ID</th>
                <th style={{ textAlign: "left", padding: 10, borderBottom: "1px solid #eee" }}>Produto</th>
                <th style={{ textAlign: "left", padding: 10, borderBottom: "1px solid #eee" }}>Cliente ID</th>
                <th style={{ textAlign: "left", padding: 10, borderBottom: "1px solid #eee" }}>Funcionario ID</th>
                <th style={{ textAlign: "left", padding: 10, borderBottom: "1px solid #eee" }}>Quantidade</th>
                <th style={{ textAlign: "left", padding: 10, borderBottom: "1px solid #eee" }}>Pagamento</th>
                <th style={{ textAlign: "left", padding: 10, borderBottom: "1px solid #eee" }}>Total</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id}>
                  <td style={{ padding: 10, borderBottom: "1px solid #f3f3f3" }}>{row.id}</td>
                  <td style={{ padding: 10, borderBottom: "1px solid #f3f3f3" }}>{row.produtoNome}</td>
                  <td style={{ padding: 10, borderBottom: "1px solid #f3f3f3" }}>{row.clienteId}</td>
                  <td style={{ padding: 10, borderBottom: "1px solid #f3f3f3" }}>{row.funcionarioId}</td>
                  <td style={{ padding: 10, borderBottom: "1px solid #f3f3f3" }}>{row.quantidade}</td>
                  <td style={{ padding: 10, borderBottom: "1px solid #f3f3f3" }}>{row.formaPagamento}</td>
                  <td style={{ padding: 10, borderBottom: "1px solid #f3f3f3" }}>{money(row.total)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
