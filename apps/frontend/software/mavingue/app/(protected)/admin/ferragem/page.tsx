"use client";
import { useEffect, useState } from "react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Loading, ErrorBox, Empty } from "@/components/ui/State";
import { ferragemApi } from "@/features/ferragem/api";
import { Ferragem } from "@/features/ferragem/types";

export default function AdminFerragem() {
  const [rows, setRows] = useState<Ferragem[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [form, setForm] = useState({ nome: "", endereco: "" });

  async function load() {
    setErr("");
    setLoading(true);
    try {
      setRows(await ferragemApi.list());
    } catch (e: any) {
      setErr(e?.message ?? "Erro");
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
      await ferragemApi.create(form);
      setForm({ nome: "", endereco: "" });
      await load();
    } catch (e: any) {
      setErr(e?.message ?? "Erro");
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

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr auto", gap: 10, maxWidth: 900, marginBottom: 12 }}>
        <Input placeholder="Nome" value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} />
        <Input placeholder="Endereço" value={form.endereco} onChange={(e) => setForm({ ...form, endereco: e.target.value })} />
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
                <th style={{ textAlign: "left", padding: 10, borderBottom: "1px solid #eee" }}>Endereço</th>
                <th style={{ padding: 10, borderBottom: "1px solid #eee" }}></th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id}>
                  <td style={{ padding: 10, borderBottom: "1px solid #f3f3f3" }}>{r.id}</td>
                  <td style={{ padding: 10, borderBottom: "1px solid #f3f3f3" }}>{r.nome}</td>
                  <td style={{ padding: 10, borderBottom: "1px solid #f3f3f3" }}>{r.endereco}</td>
                  <td style={{ padding: 10, borderBottom: "1px solid #f3f3f3", textAlign: "right" }}>
                    <Button variant="destructive" onClick={() => del(r.id)}>
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