"use client";

import { useMemo, useState } from "react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { createUser } from "@/features/users/api";
import type { Role, UserCreateFullRequest } from "@/features/users/types";

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

function isFieldErrorMap(x: unknown): x is Record<string, string> {
  if (!x || typeof x !== "object" || Array.isArray(x)) return false;
  for (const k of Object.keys(x as Record<string, unknown>)) {
    const v = (x as Record<string, unknown>)[k];
    if (typeof v !== "string") return false;
  }
  return true;
}

function errMessage(err: unknown): string {
  if (err instanceof Error) return err.message;
  if (typeof err === "string") return err;
  if (err && typeof err === "object" && "message" in err) {
    const m = (err as any).message;
    if (typeof m === "string") return m;
  }
  return "Erro ao criar utilizador";
}

export default function UserCreateForm({
  creatorRole,
  onCreated,
}: {
  creatorRole: Role;
  onCreated?: () => void;
}) {
  const roleOptions = useMemo(() => {
    if (creatorRole === "ADMIN") return ["ADMIN", "FUNCIONARIO", "CLIENTE"] as Role[];
    if (creatorRole === "FUNCIONARIO") return ["FUNCIONARIO", "CLIENTE"] as Role[];
    return [] as Role[];
  }, [creatorRole]);

  const [loading, setLoading] = useState(false);
  const [ok, setOk] = useState("");
  const [err, setErr] = useState("");
  const [fe, setFe] = useState<Record<string, string>>({});

  const [form, setForm] = useState<UserCreateFullRequest>({
    nome: "",
    email: "",
    password: "",
    role: roleOptions.includes("CLIENTE") ? "CLIENTE" : (roleOptions[0] ?? "CLIENTE"),

    sexo: "HOMEM",
    telefone: "",
    dataNascimento: "",
    provincia: "",
    cidade: "",
    bairro: "",
    endereco: "",

    nuit: "",
    tipoDocumento: "BI",
    numeroDocumento: "",
  });

  function set<K extends keyof UserCreateFullRequest>(k: K, v: UserCreateFullRequest[K]) {
    setForm((p) => ({ ...p, [k]: v }));
  }

  function validate() {
    const e: Record<string, string> = {};
    if (!form.nome.trim()) e.nome = "Nome é obrigatório";
    if (!form.email.trim()) e.email = "Email é obrigatório";
    if (!form.password.trim() || form.password.length < 6) e.password = "Senha mínima: 6";

    if (!roleOptions.includes(form.role)) e.role = "Role inválida para este utilizador";

    if (!(form.sexo === "HOMEM" || form.sexo === "MULHER")) e.sexo = "Sexo inválido";
    if (!form.telefone.trim()) e.telefone = "Telefone é obrigatório";
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
      const payload: UserCreateFullRequest = {
        ...form,
        nome: form.nome.trim(),
        email: form.email.trim(),
        telefone: form.telefone.trim(),
        provincia: form.provincia.trim(),
        cidade: form.cidade.trim(),
        bairro: form.bairro.trim(),
        endereco: form.endereco.trim(),
        nuit: form.nuit?.trim() || null,
        tipoDocumento: form.tipoDocumento?.trim() || null,
        numeroDocumento: form.numeroDocumento?.trim() || null,
      };

      await createUser(payload);

      setOk("Utilizador criado com sucesso.");
      onCreated?.();
      setForm((p) => ({
        ...p,
        nome: "",
        email: "",
        password: "",
        telefone: "",
        dataNascimento: "",
        provincia: "",
        cidade: "",
        bairro: "",
        endereco: "",
        nuit: "",
        tipoDocumento: "BI",
        numeroDocumento: "",
      }));
    } catch (error: unknown) {
      if (isFieldErrorMap(error)) {
        setFe(error);
        setErr("Corrige os campos e tenta de novo.");
      } else {
        setErr(errMessage(error));
      }
    } finally {
      setLoading(false);
    }
  }

  if (!roleOptions.length) {
    return <div style={{ padding: 12, border: "1px solid #ddd", borderRadius: 10 }}>Sem permissão para criar utilizadores.</div>;
  }

  return (
    <form onSubmit={submit} style={{ display: "grid", gap: 12 }}>
      {err && <div style={{ padding: 10, border: "1px solid #f5b5b5", borderRadius: 10, color: "crimson" }}>{err}</div>}
      {ok && <div style={{ padding: 10, border: "1px solid #b7f0c2", borderRadius: 10, color: "green" }}>{ok}</div>}

      <Field label="Tipo de conta *" error={fe.role}>
        <select
          value={form.role}
          onChange={(e) => set("role", e.target.value as Role)}
          style={{ padding: 10, borderRadius: 8, border: "1px solid #ddd" }}
        >
          {roleOptions.map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </select>
      </Field>

      <Field label="Nome *" error={fe.nome}>
        <Input value={form.nome} onChange={(e) => set("nome", (e.target as HTMLInputElement).value)} />
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

      <Field label="Telefone *" error={fe.telefone}>
        <Input value={form.telefone} onChange={(e) => set("telefone", (e.target as HTMLInputElement).value)} />
      </Field>

      <Field label="Email *" error={fe.email}>
        <Input value={form.email} onChange={(e) => set("email", (e.target as HTMLInputElement).value)} />
      </Field>

      <Field label="Senha *" error={fe.password}>
        <Input type="password" value={form.password} onChange={(e) => set("password", (e.target as HTMLInputElement).value)} />
      </Field>

      <Field label="Data de nascimento *" error={fe.dataNascimento}>
        <Input type="date" value={form.dataNascimento} onChange={(e) => set("dataNascimento", (e.target as HTMLInputElement).value)} />
      </Field>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <Field label="Província *" error={fe.provincia}>
          <Input value={form.provincia} onChange={(e) => set("provincia", (e.target as HTMLInputElement).value)} />
        </Field>
        <Field label="Cidade *" error={fe.cidade}>
          <Input value={form.cidade} onChange={(e) => set("cidade", (e.target as HTMLInputElement).value)} />
        </Field>
      </div>

      <Field label="Bairro *" error={fe.bairro}>
        <Input value={form.bairro} onChange={(e) => set("bairro", (e.target as HTMLInputElement).value)} />
      </Field>

      <Field label="Endereço *" error={fe.endereco}>
        <Input value={form.endereco} onChange={(e) => set("endereco", (e.target as HTMLInputElement).value)} />
      </Field>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <Field label="NUIT (opcional)" error={fe.nuit}>
          <Input value={form.nuit ?? ""} onChange={(e) => set("nuit", (e.target as HTMLInputElement).value)} />
        </Field>
        <Field label="Tipo Documento (opcional)" error={fe.tipoDocumento}>
          <Input value={form.tipoDocumento ?? ""} onChange={(e) => set("tipoDocumento", (e.target as HTMLInputElement).value)} />
        </Field>
      </div>

      <Field label="Número Documento (opcional)" error={fe.numeroDocumento}>
        <Input value={form.numeroDocumento ?? ""} onChange={(e) => set("numeroDocumento", (e.target as HTMLInputElement).value)} />
      </Field>

      <Button type="submit" disabled={loading}>
        {loading ? "A criar..." : "Criar utilizador"}
      </Button>
    </form>
  );
}