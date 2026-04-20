"use client";

import { useEffect, useState } from "react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Empty, ErrorBox, Loading } from "@/components/ui/State";
import { stockApi } from "@/features/stock/api";
import type { StockItem } from "@/features/stock/types";

export default function AdminStock() {
  const [rows, setRows] = useState<StockItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [form, setForm] = useState({ produtoId: "", quantidade: "", tipo: "ENTRADA" as "ENTRADA" | "SAIDA", motivo: "" });

  async function load() {
    setErr("");
    setLoading(true);
    try {
      setRows(await stockApi.list());
    } catch (error: any) {
      setErr(error?.message ?? "Erro");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function adjust() {
    setErr("");
    try {
      await stockApi.adjust({
        produtoId: Number(form.produtoId),
        quantidade: Number(form.quantidade),
        tipo: form.tipo,
        motivo: form.motivo || undefined,
      });
      setForm({ produtoId: "", quantidade: "", tipo: "ENTRADA", motivo: "" });
      await load();
    } catch (error: any) {
      setErr(error?.message ?? "Erro no ajuste");
    }
  }

  return (
    <div>
      <h2>Stock</h2>
      {err && <ErrorBox text={err} />}

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr auto", gap: 10, marginBottom: 12, maxWidth: 1000 }}>
        <Input placeholder="produtoId" value={form.produtoId} onChange={(e) => setForm({ ...form, produtoId: e.target.value })} />
        <Input placeholder="quantidade" value={form.quantidade} onChange={(e) => setForm({ ...form, quantidade: e.target.value })} />
        <select value={form.tipo} onChange={(e) => setForm({ ...form, tipo: e.target.value as "ENTRADA" | "SAIDA" })} style={{ padding: 10, borderRadius: 8, border: "1px solid #ddd" }}>
          <option value="ENTRADA">ENTRADA</option>
          <option value="SAIDA">SAIDA</option>
        </select>
        <Input placeholder="motivo (opcional)" value={form.motivo} onChange={(e) => setForm({ ...form, motivo: e.target.value })} />
        <Button onClick={adjust}>Aplicar</Button>
      </div>

      {loading && <Loading />}
      {!loading && !err && rows.length === 0 && <Empty text="Sem stock." />}

      {!loading && !err && rows.length > 0 && (
        <div style={{ border: "1px solid #ddd", borderRadius: 10, background: "white" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th style={{ textAlign: "left", padding: 10, borderBottom: "1px solid #eee" }}>Produto ID</th>
                <th style={{ textAlign: "left", padding: 10, borderBottom: "1px solid #eee" }}>Produto</th>
                <th style={{ textAlign: "left", padding: 10, borderBottom: "1px solid #eee" }}>Quantidade</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((stock) => (
                <tr key={stock.produtoId}>
                  <td style={{ padding: 10, borderBottom: "1px solid #f3f3f3" }}>{stock.produtoId}</td>
                  <td style={{ padding: 10, borderBottom: "1px solid #f3f3f3" }}>{stock.produtoNome}</td>
                  <td style={{ padding: 10, borderBottom: "1px solid #f3f3f3" }}>{stock.quantidade}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
