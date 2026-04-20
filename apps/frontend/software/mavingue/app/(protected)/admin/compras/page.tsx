"use client";

import { useEffect, useState } from "react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Empty, ErrorBox, Loading } from "@/components/ui/State";
import { purchasesApi } from "@/features/purchases/api";
import type { FacturaCompra } from "@/features/purchases/types";

export default function AdminCompras() {
  const [rows, setRows] = useState<FacturaCompra[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [ok, setOk] = useState("");
  const [form, setForm] = useState({ produtoId: "", funcionarioId: "", quantidade: "" });

  async function load() {
    setErr("");
    setLoading(true);
    try {
      setRows(await purchasesApi.list());
    } catch (error: any) {
      setErr(error?.message ?? "Erro");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function submit() {
    setErr("");
    setOk("");
    try {
      await purchasesApi.create({
        produtoId: Number(form.produtoId),
        funcionarioId: Number(form.funcionarioId),
        quantidade: Number(form.quantidade),
      });
      setOk("Compra registada.");
      setForm({ produtoId: "", funcionarioId: "", quantidade: "" });
      await load();
    } catch (error: any) {
      setErr(error?.message ?? "Erro");
    }
  }

  return (
    <div>
      <h2>Compras</h2>
      {err && <ErrorBox text={err} />}
      {ok && <div style={{ color: "green" }}>{ok}</div>}

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr auto", gap: 10, maxWidth: 900, marginBottom: 12 }}>
        <Input placeholder="produtoId" value={form.produtoId} onChange={(e) => setForm({ ...form, produtoId: e.target.value })} />
        <Input placeholder="funcionarioId" value={form.funcionarioId} onChange={(e) => setForm({ ...form, funcionarioId: e.target.value })} />
        <Input placeholder="quantidade" value={form.quantidade} onChange={(e) => setForm({ ...form, quantidade: e.target.value })} />
        <Button onClick={submit}>Registar</Button>
      </div>

      {loading && <Loading />}
      {!loading && !err && rows.length === 0 && <Empty text="Sem compras." />}

      {!loading && !err && rows.length > 0 && (
        <div style={{ border: "1px solid #ddd", borderRadius: 10, background: "white" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th style={{ textAlign: "left", padding: 10, borderBottom: "1px solid #eee" }}>ID</th>
                <th style={{ textAlign: "left", padding: 10, borderBottom: "1px solid #eee" }}>Produto ID</th>
                <th style={{ textAlign: "left", padding: 10, borderBottom: "1px solid #eee" }}>Funcionario ID</th>
                <th style={{ textAlign: "left", padding: 10, borderBottom: "1px solid #eee" }}>Quantidade</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id}>
                  <td style={{ padding: 10, borderBottom: "1px solid #f3f3f3" }}>{row.id}</td>
                  <td style={{ padding: 10, borderBottom: "1px solid #f3f3f3" }}>{row.produtoId}</td>
                  <td style={{ padding: 10, borderBottom: "1px solid #f3f3f3" }}>{row.funcionarioId}</td>
                  <td style={{ padding: 10, borderBottom: "1px solid #f3f3f3" }}>{row.quantidade}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
