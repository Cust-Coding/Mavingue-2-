"use client";

import { useState } from "react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { setSession } from "@/lib/auth/session";

type Sexo = "HOMEM" | "MULHER";

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div style={{ display: "grid", gap: 6 }}>
      <label style={{ fontSize: 14 }}>{label}</label>
      {children}
      {error && <div style={{ color: "crimson", fontSize: 13 }}>{error}</div>}
    </div>
  );
}

export default function RegisterPage() {
  const [loading, setLoading] = useState(false);
  const [ok, setOk] = useState("");
  const [err, setErr] = useState("");
  const [fe, setFe] = useState<Record<string, string>>({});

  const [form, setForm] = useState({
    nome: "",
    sexo: "HOMEM" as Sexo,
    telefone: "",
    email: "",
    password: "",
    confirmPassword: "",
    dataNascimento: "",
    provincia: "",
    cidade: "",
    bairro: "",
    endereco: "",
    nuit: "",
    tipoDocumento: "BI",
    numeroDocumento: "",
  });

  function set<K extends keyof typeof form>(k: K, v: (typeof form)[K]) {
    setForm((p) => ({ ...p, [k]: v }));
  }

  function validate() {
    const e: Record<string, string> = {};
    if (!form.nome.trim()) e.nome = "Nome é obrigatório";
    if (!(form.sexo === "HOMEM" || form.sexo === "MULHER")) e.sexo = "Sexo inválido";
    if (!form.telefone.trim()) e.telefone = "Telefone é obrigatório";
    if (!form.email.trim()) e.email = "Email é obrigatório";
    if (!form.password.trim() || form.password.length < 6) e.password = "Senha (mín. 6)";
    if (form.confirmPassword !== form.password) e.confirmPassword = "Senhas não coincidem";
    if (!form.dataNascimento) e.dataNascimento = "Data nascimento obrigatória";
    if (!form.provincia.trim()) e.provincia = "Província obrigatória";
    if (!form.cidade.trim()) e.cidade = "Cidade obrigatória";
    if (!form.bairro.trim()) e.bairro = "Bairro obrigatório";
    if (!form.endereco.trim()) e.endereco = "Endereço obrigatório";
    setFe(e);
    return Object.keys(e).length === 0;
  }

  async function submit(ev: React.FormEvent) {
    ev.preventDefault();
    setErr("");
    setOk("");
    setFe({});

    if (!validate()) return;

    setLoading(true);
    try {
      // 1) registo
      const res = await fetch("/api/proxy/api/auth/register", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nome: form.nome.trim(),
          sexo: form.sexo,
          telefone: form.telefone.trim(),
          email: form.email.trim(),
          password: form.password,
          dataNascimento: form.dataNascimento, // yyyy-MM-dd
          provincia: form.provincia.trim(),
          cidade: form.cidade.trim(),
          bairro: form.bairro.trim(),
          endereco: form.endereco.trim(),
          nuit: form.nuit.trim() || null,
          tipoDocumento: form.tipoDocumento.trim() || null,
          numeroDocumento: form.numeroDocumento.trim() || null,
        }),
      });

      if (!res.ok) {
        const txt = await res.text().catch(() => "");
        // se vier mapa de validação
        try {
          const j = JSON.parse(txt);
          if (j && typeof j === "object" && !Array.isArray(j) && !j.message) {
            setFe(j);
            setErr("Há campos inválidos.");
            return;
          }
          if (j?.message) {
            setErr(String(j.message));
            return;
          }
        } catch {}
        setErr(txt || `Erro HTTP ${res.status}`);
        return;
      }

      const data = await res.json(); // LoginResponse -> token
      const token = data?.token ?? data; // caso venha {token} ou string

      // 2) buscar /me para saber role e gravar sessão
      // primeiro mete token no cookie/localStorage via setSession usando role temporário
      // (vamos buscar role já a seguir e actualizar)
      setSession(token, "CLIENTE");

      const meRes = await fetch("/api/proxy/api/auth/me", { method: "GET", credentials: "include" });
      if (meRes.ok) {
        const me = await meRes.json();
        const role = me?.role ?? "CLIENTE";
        setSession(token, role);
      }

      setOk("Conta criada e login feito. A entrar...");
      setTimeout(() => (location.href = "/cliente"), 600);
    } catch (e: any) {
      setErr(e?.message ?? "Falha ao comunicar com servidor");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ maxWidth: 760, margin: "10px auto", padding: 16, fontFamily: "sans-serif", background: "white"}} className="rounded-lg bg-gray-100">
      <h2>Criar Conta (Cliente)</h2>

      {err && <div style={{ padding: 10, border: "1px solid #f5b", borderRadius: 8, color: "crimson" }}>{err}</div>}
      {ok && <div style={{ padding: 10, border: "1px solid #9f9", borderRadius: 8, color: "green" }}>{ok}</div>}

      <form onSubmit={submit} style={{ display: "grid", gap: 12, marginTop: 12, fontFamily: "sans-serif" }}>
        
        <Field label="Nome completo *" error={fe.nome} >
          <Input value={form.nome} onChange={(e) => set("nome", e.target.value)} />
        </Field>

        <Field label="Sexo *" error={fe.sexo}>
          <select
            value={form.sexo}
            onChange={(e) => set("sexo", e.target.value as Sexo)}
            style={{ padding: 10, borderRadius: 8, border: "1px solid #ddd" }}
          >
            <option value="HOMEM">Homem</option>
            <option value="MULHER">Mulher</option>
          </select>
        </Field>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <Field label="Telefone *" error={fe.telefone}>
            <Input value={form.telefone} onChange={(e) => set("telefone", e.target.value)} />
          </Field>
          <Field label="Email *" error={fe.email}>
            <Input value={form.email} onChange={(e) => set("email", e.target.value)} />
          </Field>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <Field label="Senha *" error={fe.password}>
            <Input type="password" value={form.password} onChange={(e) => set("password", e.target.value)} />
          </Field>
          <Field label="Confirmar senha *" error={fe.confirmPassword}>
            <Input type="password" value={form.confirmPassword} onChange={(e) => set("confirmPassword", e.target.value)} />
          </Field>
        </div>

        <Field label="Data de nascimento *" error={fe.dataNascimento}>
          <Input type="date" value={form.dataNascimento} onChange={(e) => set("dataNascimento", e.target.value)} />
        </Field>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <Field label="Província *" error={fe.provincia}>
            <Input value={form.provincia} onChange={(e) => set("provincia", e.target.value)} />
          </Field>
          <Field label="Cidade *" error={fe.cidade}>
            <Input value={form.cidade} onChange={(e) => set("cidade", e.target.value)} />
          </Field>
        </div>

        <Field label="Bairro *" error={fe.bairro}>
          <Input value={form.bairro} onChange={(e) => set("bairro", e.target.value)} />
        </Field>

        <Field label="Endereço *" error={fe.endereco}>
          <Input value={form.endereco} onChange={(e) => set("endereco", e.target.value)} />
        </Field>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <Field label="NUIT (opcional)" error={fe.nuit}>
            <Input value={form.nuit} onChange={(e) => set("nuit", e.target.value)} />
          </Field>
          <Field label="Tipo Documento (opcional)" error={fe.tipoDocumento}>
            <Input value={form.tipoDocumento} onChange={(e) => set("tipoDocumento", e.target.value)} />
          </Field>
        </div>

        <Field label="Número Documento (opcional)" error={fe.numeroDocumento}>
          <Input value={form.numeroDocumento} onChange={(e) => set("numeroDocumento", e.target.value)} />
        </Field>

        <Button type="submit" disabled={loading} style={{background: "orangered"}}>
          {loading ? "A criar..." : "Criar conta"}
        </Button>
      </form>
    </div>
  );
}