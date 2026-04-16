"use client";
import { useEffect, useState } from "react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { purchasesApi } from "@/features/purchases/api";
import { Loading, ErrorBox, Empty } from "@/components/ui/State";

export default function AdminCompras() {
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [ok, setOk] = useState("");
  const [form, setForm] = useState({ produtoId: "", funcionarioId: "", quantidade: "" });

  async function load() {
    setErr("");
    setLoading(true);
    try {
      setRows(await purchasesApi.list());
    } catch (e: any) {
      setErr(e?.message ?? "Erro");
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
    } catch (e: any) {
      setErr(e?.message ?? "Erro");
    }
  }

  return (
    <div>
      <h2>Compras (FacturaCompra)</h2>
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
        <pre style={{ whiteSpace: "pre-wrap", border: "1px solid #ddd", borderRadius: 10, background: "white", padding: 12 }}>
          {JSON.stringify(rows, null, 2)}
        </pre>
      )}
    </div>
  );
}