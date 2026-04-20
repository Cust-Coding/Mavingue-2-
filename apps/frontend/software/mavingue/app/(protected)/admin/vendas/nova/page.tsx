"use client";

import { useState } from "react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { salesApi } from "@/features/sales/api";
import type { FormaPagamento } from "@/features/sales/types";

const paymentOptions: FormaPagamento[] = ["CARTEIRA_MOVEL", "CARTAO", "DINHEIRO_FISICO"];

export default function NovaVenda() {
  const [form, setForm] = useState({
    produtoId: "",
    clienteId: "",
    funcionarioId: "",
    quantidade: "",
    formaPagamento: "DINHEIRO_FISICO" as FormaPagamento,
  });
  const [err, setErr] = useState("");
  const [ok, setOk] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr("");
    setOk("");

    try {
      await salesApi.create({
        produtoId: Number(form.produtoId),
        clienteId: Number(form.clienteId),
        funcionarioId: Number(form.funcionarioId),
        quantidade: Number(form.quantidade),
        formaPagamento: form.formaPagamento,
      });
      setOk("Venda registada.");
      setForm({ produtoId: "", clienteId: "", funcionarioId: "", quantidade: "", formaPagamento: "DINHEIRO_FISICO" });
    } catch (error: any) {
      setErr(error?.message ?? "Erro");
    }
  }

  return (
    <div style={{ maxWidth: 700 }}>
      <h2>Nova Venda</h2>
      {err && <div style={{ color: "crimson" }}>{err}</div>}
      {ok && <div style={{ color: "green" }}>{ok}</div>}

      <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        <Input placeholder="produtoId" value={form.produtoId} onChange={(e) => setForm({ ...form, produtoId: e.target.value })} />
        <Input placeholder="clienteId" value={form.clienteId} onChange={(e) => setForm({ ...form, clienteId: e.target.value })} />
        <Input placeholder="funcionarioId" value={form.funcionarioId} onChange={(e) => setForm({ ...form, funcionarioId: e.target.value })} />
        <Input placeholder="quantidade" value={form.quantidade} onChange={(e) => setForm({ ...form, quantidade: e.target.value })} />
        <select value={form.formaPagamento} onChange={(e) => setForm({ ...form, formaPagamento: e.target.value as FormaPagamento })} style={{ padding: 10, borderRadius: 8, border: "1px solid #ddd" }}>
          {paymentOptions.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
        <Button type="submit">Registar</Button>
      </form>
    </div>
  );
}
