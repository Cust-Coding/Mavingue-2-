"use client";

import { useState } from "react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { productsApi } from "@/features/products/api";
import { getErrorMessage } from "@/lib/errors";

export default function NovoProduto() {
  const [form, setForm] = useState({ name: "", description: "", price: "", urlImg: "" });
  const [err, setErr] = useState("");
  const [ok, setOk] = useState("");

  async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    setErr("");
    try {
      const formData = new FormData();
      formData.append('file', file);
      const response = await fetch('/api/proxy/api/files/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await response.json();
      if (response.ok) {
        setForm((current) => ({ ...current, urlImg: data.url }));
      } else {
        setErr(data.error || 'Upload failed');
      }
    } catch (reason: unknown) {
      setErr(getErrorMessage(reason, "Nao foi possivel carregar a imagem"));
    }
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr("");
    setOk("");

    try {
      await productsApi.create({
        name: form.name.trim(),
        description: form.description.trim(),
        price: Number(form.price),
        urlImg: form.urlImg,
      });
      setOk("Produto criado.");
      setForm({ name: "", description: "", price: "", urlImg: "" });
    } catch (reason: unknown) {
      setErr(getErrorMessage(reason, "Erro ao criar produto"));
    }
  }

  return (
    <div style={{ maxWidth: 700 }}>
      <h2>Novo Produto</h2>
      {err && <div style={{ color: "crimson" }}>{err}</div>}
      {ok && <div style={{ color: "green" }}>{ok}</div>}

      <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <Input placeholder="Nome" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        <Input placeholder="Descricao" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
        <Input placeholder="Preco" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
        <label style={{ fontWeight: 600 }}>Upload da imagem do produto</label>
        <input type="file" accept="image/*" onChange={handleFileChange} />
        {form.urlImg ? <img src={form.urlImg} alt="Preview" style={{ maxWidth: 220, borderRadius: 12, border: "1px solid #ddd" }} /> : null}
        <Button type="submit">Criar</Button>
      </form>
    </div>
  );
}
