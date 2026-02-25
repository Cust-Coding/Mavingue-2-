"use client";
import { useState } from "react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { productsApi } from "@/features/products/api";

export default function NovoProduto() {
  const [form, setForm] = useState({ name: "", description: "", price: "" });
  const [err, setErr] = useState("");
  const [ok, setOk] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr("");
    setOk("");
    try {
      await productsApi.create({
        name: form.name,
        description: form.description || undefined,
        price: Number(form.price),
      });
      setOk("Produto criado.");
      setForm({ name: "", description: "", price: "" });
    } catch (e: any) {
      setErr(e?.message ?? "Erro");
    }
  }

  return (
    <div style={{ maxWidth: 650 }}>
      <h2>Novo Produto</h2>
      {err && <div style={{ color: "crimson" }}>{err}</div>}
      {ok && <div style={{ color: "green" }}>{ok}</div>}
      <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        <Input placeholder="Nome" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        <Input placeholder="Descrição" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
        <Input placeholder="Preço" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
        <Button type="submit">Criar</Button>
      </form>
    </div>
  );
}