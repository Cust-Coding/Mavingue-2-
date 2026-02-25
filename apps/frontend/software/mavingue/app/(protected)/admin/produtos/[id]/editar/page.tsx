"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { productsApi } from "@/features/products/api";

export default function EditarProduto() {
  const params = useParams();
  const id = Number(params.id);

  const [form, setForm] = useState({ name: "", description: "", price: "" });
  const [err, setErr] = useState("");
  const [ok, setOk] = useState("");

  useEffect(() => {
    productsApi
      .get(id)
      .then((p) => setForm({ name: p.name, description: p.description ?? "", price: String(p.price) }))
      .catch((e: any) => setErr(e?.message ?? "Erro"));
  }, [id]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr("");
    setOk("");
    try {
      await productsApi.update(id, {
        name: form.name,
        description: form.description || undefined,
        price: Number(form.price),
      });
      setOk("Actualizado.");
    } catch (e: any) {
      setErr(e?.message ?? "Erro");
    }
  }

  return (
    <div style={{ maxWidth: 650 }}>
      <h2>Editar Produto #{id}</h2>
      {err && <div style={{ color: "crimson" }}>{err}</div>}
      {ok && <div style={{ color: "green" }}>{ok}</div>}
      <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        <Input placeholder="Nome" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        <Input placeholder="Descrição" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
        <Input placeholder="Preço" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
        <Button type="submit">Guardar</Button>
      </form>
    </div>
  );
}