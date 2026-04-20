"use client";

import { useEffect, useState } from "react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Empty, ErrorBox, Loading } from "@/components/ui/State";
import { ferragemApi } from "@/features/ferragem/api";
import type { Ferragem } from "@/features/ferragem/types";

export default function AdminFerragem() {
  const [rows, setRows] = useState<Ferragem[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [form, setForm] = useState({ name: "", bairro: "", ownerId: "" });

  async function load() {
    setErr("");
    setLoading(true);
    try {
      setRows(await ferragemApi.list());
    } catch (error: any) {
      setErr(error?.message ?? "Erro");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function create() {
    setErr("");
    try {
      await ferragemApi.create({
        name: form.name.trim(),
        bairro: form.bairro.trim(),
        ownerId: form.ownerId ? Number(form.ownerId) : undefined,
      });
      setForm({ name: "", bairro: "", ownerId: "" });
      await load();
    } catch (error: any) {
      setErr(error?.message ?? "Erro");
    }
  }

  async function del(id: number) {
    if (!confirm("Apagar?")) return;
    await ferragemApi.remove(id);
    await load();
  }

  return (
    <div>
      <h2>Ferragem</h2>
      {err && <ErrorBox text={err} />}

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr auto", gap: 10, maxWidth: 1000, marginBottom: 12 }}>
        <Input placeholder="Nome" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        <Input placeholder="Bairro" value={form.bairro} onChange={(e) => setForm({ ...form, bairro: e.target.value })} />
        <Input placeholder="ownerId (opcional)" value={form.ownerId} onChange={(e) => setForm({ ...form, ownerId: e.target.value })} />
        <Button onClick={create}>Criar</Button>
      </div>

      {loading && <Loading />}
      {!loading && !err && rows.length === 0 && <Empty text="Sem ferragens." />}

      {!loading && !err && rows.length > 0 && (
        <div style={{ border: "1px solid #ddd", borderRadius: 10, background: "white" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th style={{ textAlign: "left", padding: 10, borderBottom: "1px solid #eee" }}>ID</th>
                <th style={{ textAlign: "left", padding: 10, borderBottom: "1px solid #eee" }}>Nome</th>
                <th style={{ textAlign: "left", padding: 10, borderBottom: "1px solid #eee" }}>Bairro</th>
                <th style={{ textAlign: "left", padding: 10, borderBottom: "1px solid #eee" }}>Owner</th>
                <th style={{ padding: 10, borderBottom: "1px solid #eee" }}></th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id}>
                  <td style={{ padding: 10, borderBottom: "1px solid #f3f3f3" }}>{row.id}</td>
                  <td style={{ padding: 10, borderBottom: "1px solid #f3f3f3" }}>{row.name}</td>
                  <td style={{ padding: 10, borderBottom: "1px solid #f3f3f3" }}>{row.bairro}</td>
                  <td style={{ padding: 10, borderBottom: "1px solid #f3f3f3" }}>{row.owner || "-"}</td>
                  <td style={{ padding: 10, borderBottom: "1px solid #f3f3f3", textAlign: "right" }}>
                    <Button variant="destructive" onClick={() => del(row.id)}>
                      Apagar
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
