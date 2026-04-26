"use client";

import { FormEvent, useState } from "react";
import Image from "next/image";
import { AlertCircle, CheckCircle2, Eye, EyeOff, Lock, Mail, MapPin, Phone, User } from "lucide-react";
import { apiPost } from "@/lib/http/client";
import { endpoints } from "@/lib/http/endpoints";
import { getErrorMessage, getFieldErrors } from "@/lib/errors";
import {
  isValidEmail,
  isValidMozPhone,
  normalizeEmail,
  normalizeMozPhone,
  validateConfirmPassword,
  validateMaxLength,
  validatePasswordStrength,
  validateRequired,
} from "@/lib/validation/forms";

type RegisterResponse = { message: string; status: "PENDENTE_VERIFICACAO" | "PENDENTE_REVISAO" };
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
  pedirAgua: boolean;
};

const provincias = [
  "Cabo Delgado",
  "Gaza",
  "Inhambane",
  "Manica",
  "Maputo",
  "Maputo City",
  "Nampula",
  "Niassa",
  "Sofala",
  "Tete",
  "Zambezia",
];

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p className="mt-2 flex items-center gap-1 text-xs font-medium text-red-600">
      <AlertCircle className="h-3.5 w-3.5" />
      {message}
    </p>
  );
}

export default function RegisterPage() {
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
    pedirAgua: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  function setField<K extends keyof FormState>(field: K, value: FormState[K]) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function validate() {
    const nextErrors: Record<string, string> = {};

    nextErrors.nome = validateRequired(form.nome, "Nome completo e obrigatorio.") || validateMaxLength(form.nome, 120, "O nome excede o limite permitido.");
    if (!form.nome.trim()) delete nextErrors.nome;

    if (!form.telefone.trim()) {
      nextErrors.telefone = "Numero de telefone e obrigatorio.";
    } else if (!isValidMozPhone(form.telefone)) {
      nextErrors.telefone = "Use um numero valido de Mocambique, com ou sem +258.";
    }

    if (form.email.trim() && !isValidEmail(form.email)) {
      nextErrors.email = "Introduza um email valido ou deixe o campo em branco.";
    }

    const passwordError = validatePasswordStrength(form.password);
    if (passwordError) {
      nextErrors.password = passwordError;
    }

    const confirmationError = validateConfirmPassword(form.password, form.confirmPassword);
    if (confirmationError) {
      nextErrors.confirmPassword = confirmationError;
    }

    if (!form.dataNascimento) {
      nextErrors.dataNascimento = "Data de nascimento e obrigatoria.";
    }

    nextErrors.provincia = validateRequired(form.provincia, "Provincia e obrigatoria.");
    if (!form.provincia.trim()) delete nextErrors.provincia;

    nextErrors.cidade = validateRequired(form.cidade, "Cidade e obrigatoria.");
    if (!form.cidade.trim()) delete nextErrors.cidade;

    nextErrors.bairro = validateRequired(form.bairro, "Bairro e obrigatorio.");
    if (!form.bairro.trim()) delete nextErrors.bairro;

    setFieldErrors(Object.fromEntries(Object.entries(nextErrors).filter(([, value]) => value)));
    return Object.keys(nextErrors).filter((key) => nextErrors[key]).length === 0;
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSuccess("");
    setFieldErrors({});

    if (!validate()) return;

    setLoading(true);
    try {
      const response = await apiPost<RegisterResponse>(endpoints.auth.register, {
        nome: form.nome.trim(),
        sexo: form.sexo,
        telefone: normalizeMozPhone(form.telefone),
        email: form.email.trim() ? normalizeEmail(form.email) : null,
        password: form.password,
        dataNascimento: form.dataNascimento,
        provincia: form.provincia.trim(),
        cidade: form.cidade.trim(),
        bairro: form.bairro.trim(),
        endereco: form.bairro.trim(),
        pedirAgua: form.pedirAgua,
      });

      setSuccess(response.message);

      if (response.status === "PENDENTE_VERIFICACAO" && form.email.trim()) {
        setTimeout(() => {
          window.location.href = `/auth/confirm-email?email=${encodeURIComponent(normalizeEmail(form.email))}`;
        }, 1400);
      }

      if (response.status === "PENDENTE_REVISAO") {
        setTimeout(() => {
          window.location.href = "/auth/login";
        }, 2200);
      }
    } catch (reason) {
      const apiFieldErrors = getFieldErrors(reason);
      if (Object.keys(apiFieldErrors).length > 0) {
        setFieldErrors(apiFieldErrors);
      }
      setError(getErrorMessage(reason, "Nao foi possivel concluir o registo."));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-100">
      <div className="grid min-h-screen lg:grid-cols-[0.98fr_1.02fr]">
        <section className="relative hidden overflow-hidden lg:block">
          <Image src="/intro.jpg" alt="Mavingue" fill className="object-cover" priority />
          <div className="absolute inset-0 bg-slate-950/50" />
          <div className="absolute inset-0 flex items-end p-12">
            <div className="max-w-xl text-white">
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-orange-200">Criar conta</p>
              <h1 className="mt-4 text-4xl font-bold tracking-tight">Registo preparado para email ou telefone.</h1>
              <p className="mt-4 text-sm leading-7 text-slate-200">
                Se registar apenas o numero de celular, a conta fica pendente ate a confirmacao da equipa.
              </p>
            </div>
          </div>
        </section>

        <section className="flex items-center justify-center px-6 py-10">
          <div className="w-full max-w-2xl rounded-3xl border border-slate-200 bg-white p-8 shadow-xl shadow-slate-900/5">
            <div className="mb-8">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-orange-600">Registo</p>
              <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-900">Criar nova conta</h2>
              <p className="mt-2 text-sm leading-6 text-slate-500">
                O email e opcional. O numero de celular e obrigatorio e sera usado para login e sincronizacao de dados.
              </p>
            </div>

            {error && (
              <div className="mb-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}

            {success && (
              <div className="mb-5 flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
                <span>{success}</span>
              </div>
            )}

            <form onSubmit={submit} className="space-y-6">
              <div className="grid gap-5 md:grid-cols-2">
                <div className="md:col-span-2">
                  <label className="mb-2 block text-sm font-medium text-slate-700">Nome completo</label>
                  <div className="relative">
                    <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <input
                      value={form.nome}
                      onChange={(event) => setField("nome", event.target.value)}
                      className="h-12 w-full rounded-2xl border border-slate-200 bg-white pl-10 pr-4 text-sm text-slate-900 outline-none transition focus:border-orange-400 focus:ring-4 focus:ring-orange-100"
                      placeholder="Nome completo"
                    />
                  </div>
                  <FieldError message={fieldErrors.nome} />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">Sexo</label>
                  <select
                    value={form.sexo}
                    onChange={(event) => setField("sexo", event.target.value as Sexo)}
                    className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition focus:border-orange-400 focus:ring-4 focus:ring-orange-100"
                  >
                    <option value="HOMEM">Homem</option>
                    <option value="MULHER">Mulher</option>
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">Data de nascimento</label>
                  <input
                    type="date"
                    value={form.dataNascimento}
                    onChange={(event) => setField("dataNascimento", event.target.value)}
                    className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition focus:border-orange-400 focus:ring-4 focus:ring-orange-100"
                  />
                  <FieldError message={fieldErrors.dataNascimento} />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">Telefone</label>
                  <div className="relative">
                    <Phone className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <input
                      value={form.telefone}
                      onChange={(event) => setField("telefone", event.target.value)}
                      className="h-12 w-full rounded-2xl border border-slate-200 bg-white pl-10 pr-4 text-sm text-slate-900 outline-none transition focus:border-orange-400 focus:ring-4 focus:ring-orange-100"
                      placeholder="84 123 4567"
                    />
                  </div>
                  <FieldError message={fieldErrors.telefone} />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">Email opcional</label>
                  <div className="relative">
                    <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <input
                      value={form.email}
                      onChange={(event) => setField("email", event.target.value)}
                      className="h-12 w-full rounded-2xl border border-slate-200 bg-white pl-10 pr-4 text-sm text-slate-900 outline-none transition focus:border-orange-400 focus:ring-4 focus:ring-orange-100"
                      placeholder="exemplo@email.com"
                    />
                  </div>
                  <FieldError message={fieldErrors.email} />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">Senha</label>
                  <div className="relative">
                    <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <input
                      type={showPassword ? "text" : "password"}
                      value={form.password}
                      onChange={(event) => setField("password", event.target.value)}
                      className="h-12 w-full rounded-2xl border border-slate-200 bg-white pl-10 pr-11 text-sm text-slate-900 outline-none transition focus:border-orange-400 focus:ring-4 focus:ring-orange-100"
                      placeholder="Pelo menos 6 caracteres"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((current) => !current)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-slate-700"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  <FieldError message={fieldErrors.password} />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">Confirmar senha</label>
                  <div className="relative">
                    <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      value={form.confirmPassword}
                      onChange={(event) => setField("confirmPassword", event.target.value)}
                      className="h-12 w-full rounded-2xl border border-slate-200 bg-white pl-10 pr-11 text-sm text-slate-900 outline-none transition focus:border-orange-400 focus:ring-4 focus:ring-orange-100"
                      placeholder="Repita a senha"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword((current) => !current)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-slate-700"
                    >
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  <FieldError message={fieldErrors.confirmPassword} />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">Provincia</label>
                  <div className="relative">
                    <MapPin className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <select
                      value={form.provincia}
                      onChange={(event) => setField("provincia", event.target.value)}
                      className="h-12 w-full rounded-2xl border border-slate-200 bg-white pl-10 pr-4 text-sm text-slate-900 outline-none transition focus:border-orange-400 focus:ring-4 focus:ring-orange-100"
                    >
                      <option value="">Seleccionar provincia</option>
                      {provincias.map((provincia) => (
                        <option key={provincia} value={provincia}>
                          {provincia}
                        </option>
                      ))}
                    </select>
                  </div>
                  <FieldError message={fieldErrors.provincia} />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">Cidade</label>
                  <input
                    value={form.cidade}
                    onChange={(event) => setField("cidade", event.target.value)}
                    className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition focus:border-orange-400 focus:ring-4 focus:ring-orange-100"
                    placeholder="Cidade"
                  />
                  <FieldError message={fieldErrors.cidade} />
                </div>

                <div className="md:col-span-2">
                  <label className="mb-2 block text-sm font-medium text-slate-700">Bairro</label>
                  <input
                    value={form.bairro}
                    onChange={(event) => setField("bairro", event.target.value)}
                    className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition focus:border-orange-400 focus:ring-4 focus:ring-orange-100"
                    placeholder="Bairro"
                  />
                  <FieldError message={fieldErrors.bairro} />
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">Pretende pedir acesso a agua?</p>
                    <p className="mt-1 text-xs leading-6 text-slate-500">
                      O pedido fica registado no sistema e podera ser acompanhado depois na sua area de cliente.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setField("pedirAgua", !form.pedirAgua)}
                    className={`relative inline-flex h-7 w-12 rounded-full transition ${form.pedirAgua ? "bg-orange-600" : "bg-slate-300"}`}
                    aria-label="Activar pedido de agua"
                  >
                    <span
                      className={`absolute top-1 h-5 w-5 rounded-full bg-white transition ${form.pedirAgua ? "left-6" : "left-1"}`}
                    />
                  </button>
                </div>
              </div>

              {!form.email.trim() && (
                <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                  Como o email esta vazio, a conta sera criada em estado pendente ate a confirmacao da equipa.
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="h-12 w-full rounded-2xl bg-orange-600 text-sm font-semibold text-white transition hover:bg-orange-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? "A criar conta..." : "Criar conta"}
              </button>
            </form>

            <p className="mt-8 text-center text-sm text-slate-500">
              Ja tem conta?{" "}
              <a href="/auth/login" className="font-semibold text-orange-600 transition hover:text-orange-700">
                Entrar no sistema
              </a>
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
