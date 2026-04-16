"use client";
import { useEffect, useState } from "react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { customersApi } from "@/features/customers/api";
import { Customer } from "@/features/customers/types";
import { Loading, ErrorBox, Empty } from "@/components/ui/State";

export default function AdminClientes() {
  const [rows, setRows] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState({ name: "", phone: "", email: "", address: "" });

  async function load() {
    setErr("");
    setLoading(true);
    try {
      setRows(await customersApi.list());
    } catch (e: any) {
      setErr(e?.message ?? "Erro");
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    load();
  }, []);

  function newForm() {
    setEditingId(null);
    setForm({ name: "", phone: "", email: "", address: "" });
  }

  function edit(c: Customer) {
    setEditingId(c.id);
    setForm({ name: c.name ?? "", phone: c.phone ?? "", email: c.email ?? "", address: c.phone ?? "" });
  }

  async function save() {
    setErr("");
    try {
      const payload = {
        name: form.name,
        phone: form.phone || "",
        email: form.email || "",
      };
      if (!payload.name) {
        setErr("Nome é obrigatório.");
        return;
      }

      if (editingId) await customersApi.update(editingId, payload);
      else await customersApi.create(payload);

      newForm();
      await load();
    } catch (e: any) {
      setErr(e?.message ?? "Erro");
    }
  }

  async function del(id: number) {
    if (!confirm("Apagar?")) return;
    await customersApi.remove(id);
    await load();
  }

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h2>Clientes</h2>
        <Button variant="secondary" onClick={newForm}>
          Novo
        </Button>
      </div>

      {err && <ErrorBox text={err} />}

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr auto", gap: 10, marginBottom: 12 }}>
        <Input placeholder="Nome" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        <Input placeholder="Telefone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
        <Input placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
        <Input placeholder="Telefone" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
        <Button onClick={save}>{editingId ? "Guardar" : "Criar"}</Button>
      </div>

      {loading && <Loading />}
      {!loading && !err && rows.length === 0 && <Empty text="Sem clientes." />}

      {!loading && !err && rows.length > 0 && (
        <div style={{ border: "1px solid #ddd", borderRadius: 10, background: "white" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th style={{ textAlign: "left", padding: 10, borderBottom: "1px solid #eee" }}>ID</th>
                <th style={{ textAlign: "left", padding: 10, borderBottom: "1px solid #eee" }}>Nome</th>
                <th style={{ textAlign: "left", padding: 10, borderBottom: "1px solid #eee" }}>Telefone</th>
                <th style={{ textAlign: "left", padding: 10, borderBottom: "1px solid #eee" }}>Email</th>
                <th style={{ padding: 10, borderBottom: "1px solid #eee" }}></th>
              </tr>
            </thead>
            <tbody>
              {rows.map((c) => (
                <tr key={c.id}>
                  <td style={{ padding: 10, borderBottom: "1px solid #f3f3f3" }}>{c.id}</td>
                  <td style={{ padding: 10, borderBottom: "1px solid #f3f3f3" }}>{c.name}</td>
                  <td style={{ padding: 10, borderBottom: "1px solid #f3f3f3" }}>{c.phone ?? "-"}</td>
                  <td style={{ padding: 10, borderBottom: "1px solid #f3f3f3" }}>{c.email ?? "-"}</td>
                  <td style={{ padding: 10, borderBottom: "1px solid #f3f3f3", textAlign: "right" }}>
                    <Button variant="secondary" onClick={() => edit(c)}>
                      Editar
                    </Button>{" "}
                    <Button variant="destructive" onClick={() => del(c.id)}>
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