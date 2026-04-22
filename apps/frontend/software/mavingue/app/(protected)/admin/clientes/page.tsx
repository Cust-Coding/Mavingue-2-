"use client";

import { useEffect, useState } from "react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { customersApi } from "@/features/customers/api";
import type { Customer, CustomerCreate } from "@/features/customers/types";
import { Empty, ErrorBox, Loading } from "@/components/ui/State";
import { Mail, User, AlertCircle, CheckCircle, Calendar, Phone, MapPin } from "lucide-react";

type Sexo = "HOMEM" | "MULHER";

export default function AdminClientes() {
  const [rows, setRows] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [ok, setOk] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [fe, setFe] = useState<Record<string, string>>({});

  const [form, setForm] = useState<CustomerCreate>({
    name: "",
    sex: "HOMEM",
    phone: "",
    email: "",
    birthDate: "",
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
      name: "",
      sex: "HOMEM",
      phone: "",
      email: "",
      birthDate: "",
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
      name: customer.name,
      sex: customer.sex,
      phone: customer.phone,
      email: customer.email,
      birthDate: customer.birthDate,
      provincia: customer.provincia,
      cidade: customer.cidade,
      bairro: customer.bairro || "",
    });
  }

  function validate() {
    const e: Record<string, string> = {};
    if (!form.name?.trim()) e.name = "Nome é obrigatório";
    if (!form.email?.trim()) e.email = "Email é obrigatório";
    if (!form.phone?.trim()) e.phone = "Telefone é obrigatório";
    if (!form.birthDate) e.birthDate = "Data nascimento é obrigatória";
    if (!form.provincia?.trim()) e.provincia = "Província é obrigatória";
    if (!form.cidade?.trim()) e.cidade = "Cidade é obrigatória";
    if (!form.bairro?.trim()) e.bairro = "Bairro é obrigatório";

    setFe(e);
    return Object.keys(e).length === 0;
  }

  async function save() {
    setErr("");
    setOk("");
    setFe({});

    if (!validate()) return;

    try {
      const payload: any = {
        name: form.name.trim(),
        sex: form.sex,
        phone: form.phone.trim(),
        email: form.email.trim(),
        birthDate: form.birthDate,
        provincia: form.provincia.trim(),
        cidade: form.cidade.trim(),
        bairro: form.bairro.trim() || "Sem bairro",
        // Campos ocultos (necessários para o backend)
        endereco: "Sem endereço",
        nuit: null,
        tipoDocumento: "BI",
        numeroDocumento: null,
      };

      console.log("Enviando payload:", payload);

      if (editingId) {
        await customersApi.update(editingId, payload);
        setOk("Cliente atualizado com sucesso!");
      } else {
        await customersApi.create(payload);
        setOk("Cliente criado com sucesso!");
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

      {/* Formulário */}
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
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="pl-10"
              />
            </div>
            {fe.name && <p className="text-red-500 text-xs mt-1">{fe.name}</p>}
          </div>

          {/* Sexo */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Sexo <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <select
                value={form.sex}
                onChange={(e) => setForm({ ...form, sex: e.target.value as Sexo })}
                className="w-full h-11 pl-10 pr-4 rounded-lg border border-slate-200 bg-white text-sm focus:outline-none focus:border-orange-400"
              >
                <option value="HOMEM">Homem</option>
                <option value="MULHER">Mulher</option>
              </select>
            </div>
            {fe.sex && <p className="text-red-500 text-xs mt-1">{fe.sex}</p>}
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
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="pl-10"
              />
            </div>
            {fe.phone && <p className="text-red-500 text-xs mt-1">{fe.phone}</p>}
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
                value={form.birthDate}
                onChange={(e) => setForm({ ...form, birthDate: e.target.value })}
                className="pl-10"
              />
            </div>
            {fe.birthDate && <p className="text-red-500 text-xs mt-1">{fe.birthDate}</p>}
          </div>

          {/* Província */}
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