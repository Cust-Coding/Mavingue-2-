"use client";
import { useEffect, useState } from "react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { stockApi } from "@/features/stock/api";
import { StockItem } from "@/features/stock/types";
import { Loading, ErrorBox, Empty } from "@/components/ui/State";

export default function AdminStock() {
  const [rows, setRows] = useState<StockItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const [form, setForm] = useState({ produtoId: "", quantidade: "", tipo: "ENTRADA", motivo: "", ferragemId: "" });

  async function load() {
    setErr("");
    setLoading(true);
    try {
      setRows(await stockApi.list());
    } catch (e: any) {
      setErr(e?.message ?? "Erro");
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
        tipo: form.tipo as any,
        motivo: form.motivo || undefined,
        ferragemId: form.ferragemId ? Number(form.ferragemId) : undefined,
      });
      setForm({ produtoId: "", quantidade: "", tipo: "ENTRADA", motivo: "", ferragemId: "" });
      await load();
    } catch (e: any) {
      setErr(e?.message ?? "Erro no ajuste");
    }
  }

  return (
    <div>
      <h2>Stock</h2>
      {err && <ErrorBox text={err} />}

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr 1fr auto", gap: 10, marginBottom: 12, maxWidth: 1100 }}>
        <Input placeholder="produtoId" value={form.produtoId} onChange={(e) => setForm({ ...form, produtoId: e.target.value })} />
        <Input placeholder="quantidade" value={form.quantidade} onChange={(e) => setForm({ ...form, quantidade: e.target.value })} />
        <select value={form.tipo} onChange={(e) => setForm({ ...form, tipo: e.target.value })} style={{ padding: 10, borderRadius: 8, border: "1px solid #ddd" }}>
          <option value="ENTRADA">ENTRADA</option>
          <option value="SAIDA">SAIDA</option>
          <option value="AJUSTE">AJUSTE</option>
        </select>
        <Input placeholder="ferragemId (opcional)" value={form.ferragemId} onChange={(e) => setForm({ ...form, ferragemId: e.target.value })} />
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
                <th style={{ textAlign: "left", padding: 10, borderBottom: "1px solid #eee" }}>ID</th>
                <th style={{ textAlign: "left", padding: 10, borderBottom: "1px solid #eee" }}>Produto</th>
                <th style={{ textAlign: "left", padding: 10, borderBottom: "1px solid #eee" }}>Ferragem</th>
                <th style={{ textAlign: "left", padding: 10, borderBottom: "1px solid #eee" }}>Qtd</th>
                <th style={{ textAlign: "left", padding: 10, borderBottom: "1px solid #eee" }}>Mínimo</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((s) => (
                <tr key={s.id}>
                  <td style={{ padding: 10, borderBottom: "1px solid #f3f3f3" }}>{s.id}</td>
                  <td style={{ padding: 10, borderBottom: "1px solid #f3f3f3" }}>{s.produto?.name ?? s.produto?.id ?? "-"}</td>
                  <td style={{ padding: 10, borderBottom: "1px solid #f3f3f3" }}>{s.ferragem?.nome ?? s.ferragem?.id ?? "-"}</td>
                  <td style={{ padding: 10, borderBottom: "1px solid #f3f3f3" }}>{s.quantidade}</td>
                  <td style={{ padding: 10, borderBottom: "1px solid #f3f3f3" }}>{s.stockMinimo}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}