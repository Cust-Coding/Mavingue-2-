"use client";

import { useEffect, useState } from "react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { customersApi } from "@/features/customers/api";
import type { Customer } from "@/features/customers/types";
import { Empty, ErrorBox, Loading } from "@/components/ui/State";
import { Mail, User, AlertCircle, CheckCircle, Calendar, Phone, MapPin, Lock, Eye, EyeOff } from "lucide-react";

type Sexo = "HOMEM" | "MULHER";

type FormState = {
  nome: string;
  sexo: Sexo;
  telefone: string;
  email: string;
  password: string;
  confirmPassword: string;
  dataNascimento: string;
  provincia: string;
  cidade: string;
  bairro: string;
};

type FieldErrors = Partial<Record<keyof FormState, string>>;

export default function AdminClientes() {
  const [rows, setRows] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [ok, setOk] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [fe, setFe] = useState<FieldErrors>({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [form, setForm] = useState<FormState>({
    nome: "",
    sexo: "HOMEM",
    telefone: "",
    email: "",
    password: "",
    confirmPassword: "",
    dataNascimento: "",
    provincia: "",
    cidade: "",
    bairro: "",
  });

  async function load() {
    setErr("");
    setLoading(true);
    try {
      setRows(await customersApi.list());
    } catch (error: any) {
      setErr(error?.message ?? "Erro ao carregar clientes");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  function resetForm() {
    setEditingId(null);
    setForm({
      nome: "",
      sexo: "HOMEM",
      telefone: "",
      email: "",
      password: "",
      confirmPassword: "",
      dataNascimento: "",
      provincia: "",
      cidade: "",
      bairro: "",
    });
    setFe({});
    setErr("");
    setOk("");
  }

  function edit(customer: Customer) {
    setEditingId(customer.id);
    setForm({
      nome: customer.name,
      sexo: customer.sex,
      telefone: customer.phone,
      email: customer.email,
      password: "",
      confirmPassword: "",
      dataNascimento: customer.birthDate,
      provincia: customer.provincia,
      cidade: customer.cidade,
      bairro: customer.bairro || "",
    });
  }

  function validate() {
    const e: FieldErrors = {};

    if (!form.nome.trim()) e.nome = "Nome é obrigatório";
    if (!form.telefone.trim()) e.telefone = "Telefone é obrigatório";
    if (!form.email.trim()) {
      e.email = "Email é obrigatório";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      e.email = "Email inválido";
    }
    if (!form.dataNascimento) e.dataNascimento = "Data nascimento é obrigatória";
    if (!form.provincia.trim()) e.provincia = "Província é obrigatória";
    if (!form.cidade.trim()) e.cidade = "Cidade é obrigatória";
    if (!form.bairro.trim()) e.bairro = "Bairro é obrigatório";
    
    // Só valida senha se for criação (não edição)
    if (!editingId) {
      if (!form.password.trim() || form.password.length < 6) {
        e.password = "Senha deve ter no mínimo 6 caracteres";
      }
      if (form.confirmPassword !== form.password) {
        e.confirmPassword = "As senhas não coincidem";
      }
    }

    setFe(e);
    return Object.keys(e).length === 0;
  }

  async function save() {
    setErr("");
    setOk("");
    setFe({});

    if (!validate()) return;

    try {
      if (editingId) {
      
        const payload: any = {
          name: form.nome.trim(),
          sex: form.sexo,
          phone: form.telefone.trim(),
          email: form.email.trim(),
          birthDate: form.dataNascimento,
          provincia: form.provincia.trim(),
          cidade: form.cidade.trim(),
          bairro: form.bairro.trim() || "Sem bairro",
          endereco: form.bairro.trim() || "Sem endereço",
          nuit: null,
          tipoDocumento: "BI",
          numeroDocumento: null,
        };

        await customersApi.update(editingId, payload);
        setOk("Cliente atualizado com sucesso!");
      } else {
        
        const registerPayload = {
          nome: form.nome.trim(),
          sexo: form.sexo,
          telefone: form.telefone.trim(),
          email: form.email.trim(),
          password: form.password,
          dataNascimento: form.dataNascimento,
          provincia: form.provincia.trim(),
          cidade: form.cidade.trim(),
          bairro: form.bairro.trim(),
          pedirAgua: false,
          endereco: form.bairro.trim() || "Sem endereço",
          nuit: null,
          tipoDocumento: "BI",
          numeroDocumento: null,
        };

        console.log("Enviando registo:", registerPayload);

        const res = await fetch("/api/proxy/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(registerPayload),
        });

        if (!res.ok) {
          const errorText = await res.text();
          throw new Error(errorText || "Erro ao criar cliente");
        }

        setOk("Cliente criado com sucesso! Já pode fazer login.");
      }

      resetForm();
      await load();
      setTimeout(() => setOk(""), 3000);
    } catch (error: any) {
      console.error("Erro:", error);
      setErr(error?.message ?? "Erro ao salvar cliente");
    }
  }

  async function del(id: number) {
    if (!confirm("Tem certeza que deseja apagar este cliente?")) return;
    try {
      await customersApi.remove(id);
      await load();
      setOk("Cliente removido com sucesso!");
      setTimeout(() => setOk(""), 3000);
    } catch (error: any) {
      setErr(error?.message ?? "Erro ao apagar cliente");
    }
  }

  return (
    <div className="p-4 md:p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Clientes</h1>
        <Button variant="secondary" onClick={resetForm}>
          + Novo Cliente
        </Button>
      </div>

      {err && (
        <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-3 flex items-center gap-2 text-red-700">
          <AlertCircle className="w-4 h-4" />
          <p className="text-sm">{err}</p>
        </div>
      )}

      {ok && (
        <div className="mb-4 bg-green-50 border border-green-200 rounded-lg p-3 flex items-center gap-2 text-green-700">
          <CheckCircle className="w-4 h-4" />
          <p className="text-sm">{ok}</p>
        </div>
      )}

      {/* Formulario */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm mb-6">
        <h2 className="text-md font-semibold text-slate-800 mb-4">
          {editingId ? "Editar Cliente" : "Novo Cliente"}
        </h2>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Nome */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Nome <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                placeholder="Ex.: João Silva"
                value={form.nome}
                onChange={(e) => setForm({ ...form, nome: e.target.value })}
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
                onChange={(e) => setForm({ ...form, sexo: e.target.value as Sexo })}
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
                onChange={(e) => setForm({ ...form, telefone: e.target.value })}
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
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="pl-10"
              />
            </div>
            {fe.email && <p className="text-red-500 text-xs mt-1">{fe.email}</p>}
          </div>

          {/* Data Nascimento */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Data Nascimento <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                type="date"
                value={form.dataNascimento}
                onChange={(e) => setForm({ ...form, dataNascimento: e.target.value })}
                className="pl-10"
              />
            </div>
            {fe.dataNascimento && <p className="text-red-500 text-xs mt-1">{fe.dataNascimento}</p>}
          </div>

          {/* Provincia */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Província <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                placeholder="Ex.: Maputo"
                value={form.provincia}
                onChange={(e) => setForm({ ...form, provincia: e.target.value })}
                className="pl-10"
              />
            </div>
            {fe.provincia && <p className="text-red-500 text-xs mt-1">{fe.provincia}</p>}
          </div>

          {/* Cidade */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Cidade <span className="text-red-500">*</span>
            </label>
            <Input
              placeholder="Ex.: Maputo"
              value={form.cidade}
              onChange={(e) => setForm({ ...form, cidade: e.target.value })}
            />
            {fe.cidade && <p className="text-red-500 text-xs mt-1">{fe.cidade}</p>}
          </div>

          {/* Bairro */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Bairro <span className="text-red-500">*</span>
            </label>
            <Input
              placeholder="Ex.: Central"
              value={form.bairro}
              onChange={(e) => setForm({ ...form, bairro: e.target.value })}
            />
            {fe.bairro && <p className="text-red-500 text-xs mt-1">{fe.bairro}</p>}
          </div>

          {/* Senha (apenas para criaçao) */}
                  {/* Senha (apenas para criação) */}
{/* Senha (apenas para criação) */}
{!editingId && (
  <>
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-1">
        Senha <span className="text-red-500">*</span>
      </label>
      <div className="relative">
        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 z-10" />
        <input
          type={showPassword ? "text" : "password"}
          placeholder="Mínimo 6 caracteres"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          className="w-full h-11 pl-10 pr-10 rounded-lg border border-slate-200 bg-white text-sm focus:outline-none focus:border-orange-400"
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 z-10"
        >
          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      </div>
      {fe.password && <p className="text-red-500 text-xs mt-1">{fe.password}</p>}
    </div>

    <div>
      <label className="block text-sm font-medium text-slate-700 mb-1">
        Confirmar Senha <span className="text-red-500">*</span>
      </label>
      <div className="relative">
        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 z-10" />
        <input
          type={showConfirmPassword ? "text" : "password"}
          placeholder="Repita a senha"
          value={form.confirmPassword}
          onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
          className="w-full h-11 pl-10 pr-10 rounded-lg border border-slate-200 bg-white text-sm focus:outline-none focus:border-orange-400"
        />
        <button
          type="button"
          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 z-10"
        >
          {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      </div>
      {fe.confirmPassword && <p className="text-red-500 text-xs mt-1">{fe.confirmPassword}</p>}
    </div>
  </>
)}
        </div>

        <div className="flex gap-3 mt-6">
          <Button onClick={save} className="bg-orange-600 hover:bg-orange-700">
            {editingId ? "Guardar" : "Criar"}
          </Button>
          {editingId && (
            <Button variant="secondary" onClick={resetForm}>
              Cancelar
            </Button>
          )}
        </div>
      </div>

      {loading && <Loading />}
      {!loading && !err && rows.length === 0 && <Empty text="Sem clientes cadastrados." />}

      {!loading && !err && rows.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="text-left p-4 text-sm font-semibold text-slate-600">ID</th>
                  <th className="text-left p-4 text-sm font-semibold text-slate-600">Nome</th>
                  <th className="text-left p-4 text-sm font-semibold text-slate-600">Telefone</th>
                  <th className="text-left p-4 text-sm font-semibold text-slate-600">Email</th>
                  <th className="text-left p-4 text-sm font-semibold text-slate-600">Cidade</th>
                  <th className="text-right p-4 text-sm font-semibold text-slate-600">Acções</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {rows.map((customer) => (
                  <tr key={customer.id} className="hover:bg-slate-50 transition">
                    <td className="p-4 text-sm text-slate-500 font-mono">#{customer.id}</td>
                    <td className="p-4 text-sm text-slate-800 font-medium">{customer.name}</td>
                    <td className="p-4 text-sm text-slate-600">{customer.phone}</td>
                    <td className="p-4 text-sm text-slate-600 truncate max-w-[200px]">{customer.email}</td>
                    <td className="p-4 text-sm text-slate-600">{customer.cidade}</td>
                    <td className="p-4 text-right">
                      <button onClick={() => edit(customer)} className="text-orange-600 hover:text-orange-800 mr-3">
                        Editar
                      </button>
                      <button onClick={() => del(customer.id)} className="text-red-600 hover:text-red-800">
                        Apagar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}