"use client";

import { useEffect, useState } from "react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { customersApi } from "@/features/customers/api";
import type { Customer, CustomerCreate } from "@/features/customers/types";
import { Empty, ErrorBox, Loading } from "@/components/ui/State";

const emptyForm: CustomerCreate = {
  name: "",
  sex: "HOMEM",
  phone: "",
  email: "",
  birthDate: "",
  provincia: "",
  cidade: "",
  bairro: "",
  endereco: "",
  nuit: "",
  numeroDocumento: "",
  tipoDocumento: "BI",
};

export default function AdminClientes() {
  const [rows, setRows] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<CustomerCreate>(emptyForm);

  async function load() {
    setErr("");
    setLoading(true);
    try {
      setRows(await customersApi.list());
    } catch (error: any) {
      setErr(error?.message ?? "Erro");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  function resetForm() {
    setEditingId(null);
    setForm(emptyForm);
  }

  function edit(customer: Customer) {
    setEditingId(customer.id);
    setForm({
      name: customer.name,
      sex: customer.sex,
      phone: customer.phone,
      email: customer.email,
      birthDate: customer.birthDate,
      provincia: customer.provincia,
      cidade: customer.cidade,
      bairro: customer.bairro,
      endereco: customer.endereco,
      nuit: customer.nuit ?? "",
      numeroDocumento: customer.numeroDocumento ?? "",
      tipoDocumento: customer.tipoDocumento ?? "BI",
    });
  }

  async function save() {
    setErr("");

    const requiredFields = [
      form.name,
      form.phone,
      form.email,
      form.birthDate,
      form.provincia,
      form.cidade,
      form.bairro,
      form.endereco,
    ];

    if (requiredFields.some((value) => !String(value).trim())) {
      setErr("Preencha todos os campos obrigatorios.");
      return;
    }

    try {
      const payload: CustomerCreate = {
        ...form,
        name: form.name.trim(),
        phone: form.phone.trim(),
        email: form.email.trim(),
        provincia: form.provincia.trim(),
        cidade: form.cidade.trim(),
        bairro: form.bairro.trim(),
        endereco: form.endereco.trim(),
        nuit: form.nuit?.trim() || null,
        numeroDocumento: form.numeroDocumento?.trim() || null,
        tipoDocumento: form.tipoDocumento?.trim() || null,
      };

      if (editingId) {
        await customersApi.update(editingId, payload);
      } else {
        await customersApi.create(payload);
      }

      resetForm();
      await load();
    } catch (error: any) {
      setErr(error?.message ?? "Erro");
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
        <Button variant="secondary" onClick={resetForm}>
          Novo
        </Button>
      </div>

      {err && <ErrorBox text={err} />}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(0, 1fr))", gap: 10, marginBottom: 12 }}>
        <Input placeholder="Nome" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        <select value={form.sex} onChange={(e) => setForm({ ...form, sex: e.target.value as CustomerCreate["sex"] })} style={{ padding: 10, borderRadius: 8, border: "1px solid #ddd" }}>
          <option value="HOMEM">Homem</option>
          <option value="MULHER">Mulher</option>
        </select>
        <Input placeholder="Telefone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
        <Input placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
        <Input type="date" placeholder="Nascimento" value={form.birthDate} onChange={(e) => setForm({ ...form, birthDate: e.target.value })} />
        <Input placeholder="Provincia" value={form.provincia} onChange={(e) => setForm({ ...form, provincia: e.target.value })} />
        <Input placeholder="Cidade" value={form.cidade} onChange={(e) => setForm({ ...form, cidade: e.target.value })} />
        <Input placeholder="Bairro" value={form.bairro} onChange={(e) => setForm({ ...form, bairro: e.target.value })} />
        <Input placeholder="Endereco" value={form.endereco} onChange={(e) => setForm({ ...form, endereco: e.target.value })} />
        <Input placeholder="NUIT (opcional)" value={form.nuit ?? ""} onChange={(e) => setForm({ ...form, nuit: e.target.value })} />
        <Input placeholder="Tipo documento" value={form.tipoDocumento ?? ""} onChange={(e) => setForm({ ...form, tipoDocumento: e.target.value })} />
        <Input placeholder="Numero documento" value={form.numeroDocumento ?? ""} onChange={(e) => setForm({ ...form, numeroDocumento: e.target.value })} />
        <div style={{ gridColumn: "1 / -1", display: "flex", gap: 10 }}>
          <Button onClick={save}>{editingId ? "Guardar" : "Criar"}</Button>
          {editingId && (
            <Button variant="secondary" onClick={resetForm}>
              Cancelar
            </Button>
          )}
        </div>
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
                <th style={{ textAlign: "left", padding: 10, borderBottom: "1px solid #eee" }}>Cidade</th>
                <th style={{ padding: 10, borderBottom: "1px solid #eee" }}></th>
              </tr>
            </thead>
            <tbody>
              {rows.map((customer) => (
                <tr key={customer.id}>
                  <td style={{ padding: 10, borderBottom: "1px solid #f3f3f3" }}>{customer.id}</td>
                  <td style={{ padding: 10, borderBottom: "1px solid #f3f3f3" }}>{customer.name}</td>
                  <td style={{ padding: 10, borderBottom: "1px solid #f3f3f3" }}>{customer.phone}</td>
                  <td style={{ padding: 10, borderBottom: "1px solid #f3f3f3" }}>{customer.email}</td>
                  <td style={{ padding: 10, borderBottom: "1px solid #f3f3f3" }}>{customer.cidade}</td>
                  <td style={{ padding: 10, borderBottom: "1px solid #f3f3f3", textAlign: "right" }}>
                    <Button variant="secondary" onClick={() => edit(customer)}>
                      Editar
                    </Button>{" "}
                    <Button variant="destructive" onClick={() => del(customer.id)}>
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
