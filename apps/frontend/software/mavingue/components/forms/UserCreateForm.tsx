"use client";

import { useMemo, useState } from "react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { createUser } from "@/features/users/api";
import type { Role, UserCreateFullRequest } from "@/features/users/types";
import { Mail, Lock, User, Shield, AlertCircle, CheckCircle, Calendar, Phone, MapPin } from "lucide-react";

type Sexo = "HOMEM" | "MULHER";

interface UserCreateFormProps {
  creatorRole: Role;
  onCreated?: () => void;
}

export default function UserCreateForm({ creatorRole, onCreated }: UserCreateFormProps) {
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

  function setField<K extends keyof UserCreateFullRequest>(k: K, v: UserCreateFullRequest[K]) {
    setForm((p) => ({ ...p, [k]: v }));
  }

  function validate() {
    const e: Record<string, string> = {};
    if (!form.nome?.trim()) e.nome = "Nome é obrigatório";
    if (!form.email?.trim()) e.email = "Email é obrigatório";
    if (!form.password || form.password.length < 6) e.password = "Senha mínima: 6 caracteres";
    if (!roleOptions.includes(form.role)) e.role = "Role inválida para este utilizador";
    if (!form.telefone?.trim()) e.telefone = "Telefone é obrigatório";
    if (!form.dataNascimento) e.dataNascimento = "Data nascimento é obrigatória";
    if (!form.provincia?.trim()) e.provincia = "Província é obrigatória";
    if (!form.cidade?.trim()) e.cidade = "Cidade é obrigatória";

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
        nome: form.nome.trim(),
        email: form.email.trim(),
        password: form.password,
        role: form.role,
        sexo: form.sexo,
        telefone: form.telefone.trim(),
        dataNascimento: form.dataNascimento,
        provincia: form.provincia.trim(),
        cidade: form.cidade.trim(),
        bairro: "Sem bairro",
        endereco: "Sem endereço",
        nuit: null,
        tipoDocumento: "BI",
        numeroDocumento: null,
      };

      await createUser(payload);

      setOk("Utilizador criado com sucesso!");
      onCreated?.();
      setForm({
        nome: "",
        email: "",
        password: "",
        role: roleOptions[0] ?? "CLIENTE",
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
      setTimeout(() => setOk(""), 3000);
    } catch (error: any) {
      setErr(error?.message || "Erro ao criar utilizador");
    } finally {
      setLoading(false);
    }
  }

  if (!roleOptions.length) {
    return (
      <div className="p-4 border border-slate-200 rounded-xl text-slate-500 text-center">
        Sem permissão para criar utilizadores.
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-5">
      {err && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-center gap-2 text-red-700">
          <AlertCircle className="w-4 h-4" />
          <p className="text-sm">{err}</p>
        </div>
      )}

      {ok && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-3 flex items-center gap-2 text-green-700">
          <CheckCircle className="w-4 h-4" />
          <p className="text-sm">{ok}</p>
        </div>
      )}

      {/* Role */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">
          Tipo de conta <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <Shield className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <select
            value={form.role}
            onChange={(e) => setField("role", e.target.value as Role)}
            className="w-full h-11 pl-10 pr-4 rounded-lg border border-slate-200 bg-white text-sm focus:outline-none focus:border-orange-400"
          >
            {roleOptions.map((r) => (
              <option key={r} value={r}>
                {r === "ADMIN" ? "Administrador" : r === "FUNCIONARIO" ? "Funcionário" : "Cliente"}
              </option>
            ))}
          </select>
        </div>
        {fe.role && <p className="text-red-500 text-xs mt-1">{fe.role}</p>}
      </div>

      {/* Nome */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">
          Nome completo <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            placeholder="Ex.: João Silva"
            value={form.nome}
            onChange={(e) => setField("nome", e.target.value)}
            className="pl-10"
          />
        </div>
        {fe.nome && <p className="text-red-500 text-xs mt-1">{fe.nome}</p>}
      </div>

      {/* Sexo */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">
          Sexo <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <select
            value={form.sexo}
            onChange={(e) => setField("sexo", e.target.value as Sexo)}
            className="w-full h-11 pl-10 pr-4 rounded-lg border border-slate-200 bg-white text-sm focus:outline-none focus:border-orange-400"
          >
            <option value="HOMEM">Homem</option>
            <option value="MULHER">Mulher</option>
          </select>
        </div>
        {fe.sexo && <p className="text-red-500 text-xs mt-1">{fe.sexo}</p>}
      </div>

      {/* Telefone */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">
          Telefone <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            placeholder="Ex.: 84 123 4567"
            value={form.telefone}
            onChange={(e) => setField("telefone", e.target.value)}
            className="pl-10"
          />
        </div>
        {fe.telefone && <p className="text-red-500 text-xs mt-1">{fe.telefone}</p>}
      </div>

      {/* Email */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">
          Email <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            type="email"
            placeholder="exemplo@email.com"
            value={form.email}
            onChange={(e) => setField("email", e.target.value)}
            className="pl-10"
          />
        </div>
        {fe.email && <p className="text-red-500 text-xs mt-1">{fe.email}</p>}
      </div>

      {/* Senha */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">
          Senha <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            type="password"
            placeholder="Mínimo 6 caracteres"
            value={form.password}
            onChange={(e) => setField("password", e.target.value)}
            className="pl-10"
          />
        </div>
        {fe.password && <p className="text-red-500 text-xs mt-1">{fe.password}</p>}
      </div>

      {/* Data Nascimento */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">
          Data de nascimento <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            type="date"
            value={form.dataNascimento}
            onChange={(e) => setField("dataNascimento", e.target.value)}
            className="pl-10"
          />
        </div>
        {fe.dataNascimento && <p className="text-red-500 text-xs mt-1">{fe.dataNascimento}</p>}
      </div>

      {/* Província e Cidade */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Província <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              placeholder="Ex.: Maputo"
              value={form.provincia}
              onChange={(e) => setField("provincia", e.target.value)}
              className="pl-10"
            />
          </div>
          {fe.provincia && <p className="text-red-500 text-xs mt-1">{fe.provincia}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Cidade <span className="text-red-500">*</span>
          </label>
          <Input
            placeholder="Ex.: Maputo"
            value={form.cidade}
            onChange={(e) => setField("cidade", e.target.value)}
          />
          {fe.cidade && <p className="text-red-500 text-xs mt-1">{fe.cidade}</p>}
        </div>
      </div>

      <Button
        type="submit"
        disabled={loading}
        className="w-full bg-orange-600 hover:bg-orange-700"
      >
        {loading ? "A criar..." : "Criar utilizador"}
      </Button>
    </form>
  );
}