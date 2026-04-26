"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { CheckCircle2, Link2, RefreshCw, UserRound, Users } from "lucide-react";
import { FieldError } from "@/components/forms/FieldError";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { customersApi } from "@/features/customers/api";
import type { Customer, CustomerCreate } from "@/features/customers/types";
import { getSessionUser } from "@/lib/auth/session";
import { getErrorMessage, getFieldErrors } from "@/lib/errors";
import {
  normalizeEmail,
  normalizeMozPhone,
  validateMaxLength,
  validateMozPhone,
  validateOptionalEmail,
  validateRequired,
} from "@/lib/validation/forms";

type Sexo = "HOMEM" | "MULHER";

type FormState = {
  name: string;
  sex: Sexo;
  phone: string;
  email: string;
  birthDate: string;
  provincia: string;
  cidade: string;
  bairro: string;
  elegivelConta: boolean;
  observacoes: string;
};

type FormField = keyof FormState;

const initialForm: FormState = {
  name: "",
  sex: "HOMEM",
  phone: "",
  email: "",
  birthDate: "",
  provincia: "",
  cidade: "",
  bairro: "",
  elegivelConta: false,
  observacoes: "",
};

type Scope = "admin" | "staff";

export function CustomerRegistryPage({ scope }: { scope: Scope }) {
  const [items, setItems] = useState<Customer[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<FormState>(initialForm);
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<FormField, string>>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [syncingId, setSyncingId] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const sessionUser = useMemo(() => getSessionUser(), []);
  const canManageCustomers =
    sessionUser?.role === "ADMIN" || sessionUser?.permissions.includes("customers.manage");

  const userBasePath = scope === "admin" ? "/admin/utilizadores/novo" : "/staff/utilizadores/novo";

  const summary = useMemo(
    () => ({
      total: items.length,
      linked: items.filter((item) => item.appUserId).length,
      eligible: items.filter((item) => item.elegivelConta).length,
      withWater: items.filter((item) => item.temServicoAgua).length,
    }),
    [items]
  );

  async function load() {
    setLoading(true);
    setError("");
    try {
      setItems(await customersApi.list());
    } catch (reason) {
      setError(getErrorMessage(reason, "Nao foi possivel carregar os cadastros."));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  function setField<K extends keyof FormState>(field: K, value: FormState[K]) {
    setForm((current) => ({ ...current, [field]: value }));
    setFieldErrors((current) => ({ ...current, [field]: undefined }));
  }

  function resetForm() {
    setEditingId(null);
    setForm(initialForm);
    setFieldErrors({});
  }

  function editItem(item: Customer) {
    setEditingId(item.id);
    setForm({
      name: item.name,
      sex: item.sex,
      phone: item.phone,
      email: item.email ?? "",
      birthDate: item.birthDate,
      provincia: item.provincia,
      cidade: item.cidade,
      bairro: item.bairro,
      elegivelConta: item.elegivelConta,
      observacoes: item.observacoes ?? "",
    });
    setFieldErrors({});
    setError("");
    setSuccess("");
  }

  function validate() {
    const nextErrors: Partial<Record<FormField, string>> = {};

    nextErrors.name =
      validateRequired(form.name, "Nome e obrigatorio.") ||
      validateMaxLength(form.name, 150, "Nome excede o limite permitido.");
    nextErrors.phone = validateMozPhone(form.phone);
    nextErrors.email = validateOptionalEmail(form.email);
    nextErrors.birthDate = form.birthDate ? "" : "Data de nascimento e obrigatoria.";
    nextErrors.provincia = validateRequired(form.provincia, "Provincia e obrigatoria.");
    nextErrors.cidade = validateRequired(form.cidade, "Cidade e obrigatoria.");
    nextErrors.bairro = validateRequired(form.bairro, "Bairro e obrigatorio.");
    nextErrors.observacoes = validateMaxLength(
      form.observacoes,
      255,
      "Observacoes excedem o limite permitido."
    );

    const cleaned = Object.fromEntries(
      Object.entries(nextErrors).filter(([, value]) => value)
    ) as Partial<Record<FormField, string>>;

    setFieldErrors(cleaned);
    return Object.keys(cleaned).length === 0;
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSuccess("");
    setFieldErrors({});

    if (!validate()) return;

    const payload: CustomerCreate = {
      name: form.name.trim(),
      sex: form.sex,
      phone: normalizeMozPhone(form.phone),
      email: form.email.trim() ? normalizeEmail(form.email) : null,
      birthDate: form.birthDate,
      provincia: form.provincia.trim(),
      cidade: form.cidade.trim(),
      bairro: form.bairro.trim(),
      elegivelConta: form.elegivelConta,
      observacoes: form.observacoes.trim() || null,
    };

    setSaving(true);
    try {
      if (editingId) {
        await customersApi.update(editingId, payload);
        setSuccess("Cadastro actualizado com sucesso.");
      } else {
        await customersApi.create(payload);
        setSuccess("Pessoa cadastrada com sucesso.");
      }

      resetForm();
      await load();
    } catch (reason) {
      const apiErrors = getFieldErrors(reason);
      setFieldErrors((current) => ({
        ...current,
        name: apiErrors.name ?? current.name,
        phone: apiErrors.phone ?? apiErrors.telefone ?? current.phone,
        email: apiErrors.email ?? current.email,
        birthDate: apiErrors.birthDate ?? current.birthDate,
        provincia: apiErrors.provincia ?? current.provincia,
        cidade: apiErrors.cidade ?? current.cidade,
        bairro: apiErrors.bairro ?? current.bairro,
        observacoes: apiErrors.observacoes ?? current.observacoes,
      }));
      setError(getErrorMessage(reason, "Nao foi possivel guardar o cadastro."));
    } finally {
      setSaving(false);
    }
  }

  async function handleSyncAccount(id: number) {
    setSyncingId(id);
    setError("");
    setSuccess("");
    try {
      await customersApi.syncAccount(id);
      setSuccess("Conta sincronizada com sucesso.");
      await load();
    } catch (reason) {
      setError(getErrorMessage(reason, "Nao foi possivel sincronizar a conta."));
    } finally {
      setSyncingId(null);
    }
  }

  return (
    <main className="space-y-6">
      {canManageCustomers && (
        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-orange-600">Cadastros</p>
            <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-900">Pessoas e clientes</h1>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500">
              Esta area serve para cadastrar pessoas, marcar elegibilidade e sincronizar contas existentes.
              A criacao de login fica separada da criacao do cadastro para nao misturar fluxos.
            </p>
          </div>

          <Link
            href={userBasePath}
            className="inline-flex items-center gap-2 rounded-2xl bg-orange-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-orange-700"
          >
            <UserRound className="h-4 w-4" />
            Criar conta de cliente
          </Link>
        </div>
        </section>
      )}

      <section className="grid gap-4 md:grid-cols-4">
        {[
          { label: "Cadastros", value: summary.total },
          { label: "Com conta ligada", value: summary.linked },
          { label: "Elegiveis", value: summary.eligible },
          { label: "Com agua", value: summary.withWater },
        ].map((card) => (
          <div key={card.label} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-slate-400">{card.label}</p>
            <p className="mt-3 text-3xl font-bold text-slate-900">{card.value}</p>
          </div>
        ))}
      </section>

      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {success && (
        <div className="flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{success}</span>
        </div>
      )}

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-6 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">
              {editingId ? "Actualizar cadastro" : "Novo cadastro"}
            </h2>
            <p className="text-sm text-slate-500">
              Cadastra a pessoa primeiro. Depois a conta pode ser criada ou sincronizada separadamente.
            </p>
          </div>

          {editingId && (
            <Button type="button" variant="outline" onClick={resetForm}>
              Cancelar edicao
            </Button>
          )}
        </div>

        <form onSubmit={handleSubmit} className="grid gap-5 md:grid-cols-2">
          <div className="md:col-span-2">
            <label className="mb-2 block text-sm font-medium text-slate-700">Nome completo</label>
            <Input
              value={form.name}
              onChange={(event) => setField("name", event.target.value)}
              className="h-12 rounded-2xl border-slate-200 px-4"
              placeholder="Nome completo"
            />
            <FieldError message={fieldErrors.name} />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">Sexo</label>
            <select
              value={form.sex}
              onChange={(event) => setField("sex", event.target.value as Sexo)}
              className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition focus:border-orange-400 focus:ring-4 focus:ring-orange-100"
            >
              <option value="HOMEM">Homem</option>
              <option value="MULHER">Mulher</option>
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">Telefone</label>
            <Input
              value={form.phone}
              onChange={(event) => setField("phone", event.target.value)}
              className="h-12 rounded-2xl border-slate-200 px-4"
              placeholder="84 123 4567"
            />
            <FieldError message={fieldErrors.phone} />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">Email opcional</label>
            <Input
              value={form.email}
              onChange={(event) => setField("email", event.target.value)}
              type="email"
              className="h-12 rounded-2xl border-slate-200 px-4"
              placeholder="exemplo@email.com"
            />
            <FieldError message={fieldErrors.email} />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">Data de nascimento</label>
            <Input
              value={form.birthDate}
              onChange={(event) => setField("birthDate", event.target.value)}
              type="date"
              className="h-12 rounded-2xl border-slate-200 px-4"
            />
            <FieldError message={fieldErrors.birthDate} />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">Provincia</label>
            <Input
              value={form.provincia}
              onChange={(event) => setField("provincia", event.target.value)}
              className="h-12 rounded-2xl border-slate-200 px-4"
              placeholder="Provincia"
            />
            <FieldError message={fieldErrors.provincia} />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">Cidade</label>
            <Input
              value={form.cidade}
              onChange={(event) => setField("cidade", event.target.value)}
              className="h-12 rounded-2xl border-slate-200 px-4"
              placeholder="Cidade"
            />
            <FieldError message={fieldErrors.cidade} />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">Bairro</label>
            <Input
              value={form.bairro}
              onChange={(event) => setField("bairro", event.target.value)}
              className="h-12 rounded-2xl border-slate-200 px-4"
              placeholder="Bairro"
            />
            <FieldError message={fieldErrors.bairro} />
          </div>

          <div className="md:col-span-2">
            <label className="mb-2 block text-sm font-medium text-slate-700">Observacoes</label>
            <textarea
              value={form.observacoes}
              onChange={(event) => setField("observacoes", event.target.value)}
              rows={3}
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-orange-400 focus:ring-4 focus:ring-orange-100"
              placeholder="Notas internas sobre verificacao, elegibilidade ou sincronizacao"
            />
            <FieldError message={fieldErrors.observacoes} />
          </div>

          <div className="md:col-span-2">
            <label className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
              <input
                type="checkbox"
                checked={form.elegivelConta}
                onChange={(event) => setField("elegivelConta", event.target.checked)}
              />
              Esta pessoa ja esta elegivel para criar ou sincronizar conta no sistema
            </label>
          </div>

          <div className="md:col-span-2 flex flex-wrap justify-end gap-3">
            <Button type="submit" disabled={saving} className="rounded-2xl bg-orange-600 px-5 py-3 text-white hover:bg-orange-700">
              {saving ? "A guardar..." : editingId ? "Guardar alteracoes" : "Cadastrar pessoa"}
            </Button>
          </div>
        </form>
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-3 border-b border-slate-100 px-6 py-5 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Cadastros existentes</h2>
            <p className="text-sm text-slate-500">
              Usa a sincronizacao quando a pessoa ja criou conta com o mesmo telefone ou email.
            </p>
          </div>

          <Button type="button" variant="outline" onClick={load} disabled={loading}>
            <RefreshCw className="h-4 w-4" />
            Recarregar
          </Button>
        </div>

        {loading ? (
          <div className="px-6 py-10 text-sm text-slate-500">A carregar cadastros...</div>
        ) : items.length === 0 ? (
          <div className="px-6 py-10 text-sm text-slate-500">Ainda nao existem pessoas cadastradas.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-slate-50 text-left text-slate-500">
                <tr>
                  <th className="px-6 py-3 font-medium">Pessoa</th>
                  <th className="px-6 py-3 font-medium">Contacto</th>
                  <th className="px-6 py-3 font-medium">Conta</th>
                  <th className="px-6 py-3 font-medium">Agua</th>
                  <th className="px-6 py-3 font-medium">Accoes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {items.map((item) => (
                  <tr key={item.id} className="align-top">
                    <td className="px-6 py-4">
                      <div className="font-semibold text-slate-900">{item.name}</div>
                      <div className="mt-1 text-xs text-slate-500">
                        {item.cidade}, {item.provincia}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-600">
                      <div>{item.phone}</div>
                      <div className="mt-1 text-xs text-slate-500">{item.email || "Sem email"}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-2">
                        <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${item.elegivelConta ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-600"}`}>
                          {item.elegivelConta ? "Elegivel" : "Nao elegivel"}
                        </span>
                        <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${item.contaActiva ? "bg-blue-100 text-blue-700" : "bg-amber-100 text-amber-700"}`}>
                          {item.appUserId ? (item.contaActiva ? "Conta activa" : "Conta ligada") : "Sem conta"}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${item.temServicoAgua ? "bg-cyan-100 text-cyan-700" : "bg-slate-100 text-slate-600"}`}>
                        {item.temServicoAgua ? "Com agua" : "Sem agua"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-2">
                        {canManageCustomers && (
                          <Button type="button" variant="outline" onClick={() => editItem(item)}>
                            Editar
                          </Button>
                        )}

                        {canManageCustomers && item.elegivelConta && !item.appUserId && (
                          <Button
                            type="button"
                            variant="secondary"
                            disabled={syncingId === item.id}
                            onClick={() => handleSyncAccount(item.id)}
                          >
                            <Link2 className="h-4 w-4" />
                            {syncingId === item.id ? "A sincronizar..." : "Sincronizar conta"}
                          </Button>
                        )}

                        {canManageCustomers && item.elegivelConta && !item.appUserId && (
                          <Link
                            href={userBasePath}
                            className="inline-flex items-center gap-2 rounded-md border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                          >
                            <Users className="h-4 w-4" />
                            Criar conta
                          </Link>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
}
