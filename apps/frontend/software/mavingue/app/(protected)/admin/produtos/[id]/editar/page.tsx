"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { productsApi } from "@/features/products/api";
import { getErrorMessage } from "@/lib/errors";

async function fileToDataUrl(file: File) {
  return await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = () => reject(new Error("Nao foi possivel ler a imagem"));
    reader.readAsDataURL(file);
  });
}

export default function EditarProduto() {
  const params = useParams();
  const id = Number(params.id);

  const [form, setForm] = useState({ name: "", description: "", price: "", urlImg: "" });
  const [err, setErr] = useState("");
  const [ok, setOk] = useState("");

  useEffect(() => {
    productsApi
      .get(id)
      .then((product) =>
        setForm({
          name: product.name,
          description: product.description,
          price: String(product.price),
          urlImg: product.urlImg,
        })
      )
      .catch((reason: unknown) => setErr(getErrorMessage(reason, "Erro ao carregar produto")));
  }, [id]);

  async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    setErr("");
    try {
      const dataUrl = await fileToDataUrl(file);
      setForm((current) => ({ ...current, urlImg: dataUrl }));
    } catch (reason: unknown) {
      setErr(getErrorMessage(reason, "Nao foi possivel carregar a imagem"));
    }
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr("");
    setOk("");

    try {
      await productsApi.update(id, {
        name: form.name.trim(),
        description: form.description.trim(),
        price: Number(form.price),
        urlImg: form.urlImg,
      });
      setOk("Actualizado.");
    } catch (reason: unknown) {
      setErr(getErrorMessage(reason, "Erro ao actualizar produto"));
    }
  }

  return (
    <div style={{ maxWidth: 700 }}>
      <h2>Editar Produto #{id}</h2>
      {err && <div style={{ color: "crimson" }}>{err}</div>}
      {ok && <div style={{ color: "green" }}>{ok}</div>}

      <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <Input placeholder="Nome" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        <Input placeholder="Descricao" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
        <Input placeholder="Preco" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
        <label style={{ fontWeight: 600 }}>Substituir imagem por upload</label>
        <input type="file" accept="image/*" onChange={handleFileChange} />
        {form.urlImg ? <img src={form.urlImg} alt="Preview" style={{ maxWidth: 220, borderRadius: 12, border: "1px solid #ddd" }} /> : null}
        <Button type="submit">Guardar</Button>
      </form>
    </div>
  );
}
