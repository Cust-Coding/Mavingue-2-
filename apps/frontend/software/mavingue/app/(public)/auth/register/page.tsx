"use client";

import { FormEvent, useState } from "react";
import Image from "next/image";
import {
  AlertCircle,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Droplets,
  Eye,
  EyeOff,
  Lock,
  Mail,
  MapPin,
  Phone,
  Sparkles,
  User,
} from "lucide-react";
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

type RegisterResponse = {
  message: string;
  status: "PENDENTE_VERIFICACAO" | "PENDENTE_REVISAO";
};

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

type Step = 1 | 2 | 3;

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
    <p className="mt-2 flex items-center gap-1 text-xs font-medium text-red-600 dark:text-red-400">
      <AlertCircle className="h-3.5 w-3.5 shrink-0" />
      <span>{message}</span>
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

  const [step, setStep] = useState<Step>(1);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  function setField<K extends keyof FormState>(field: K, value: FormState[K]) {
    setForm((current) => ({ ...current, [field]: value }));
    setFieldErrors((current) => ({ ...current, [field]: "" }));
  }

  function buildErrors(scope: Step | "all") {
    const nextErrors: Record<string, string> = {};

    const validateStep1 = scope === "all" || scope === 1;
    const validateStep2 = scope === "all" || scope === 2;
    const validateStep3 = scope === "all" || scope === 3;

    if (validateStep1) {
      nextErrors.nome =
        validateRequired(form.nome, "Nome completo e obrigatorio.") ||
        validateMaxLength(form.nome, 120, "O nome excede o limite permitido.");
      if (!form.nome.trim()) delete nextErrors.nome;

      if (!form.telefone.trim()) {
        nextErrors.telefone = "Numero de telefone e obrigatorio.";
      } else if (!isValidMozPhone(form.telefone)) {
        nextErrors.telefone = "Use um numero valido de Mocambique, com ou sem +258.";
      }

      if (!form.dataNascimento) {
        nextErrors.dataNascimento = "Data de nascimento e obrigatoria.";
      }
    }

    if (validateStep2) {
      if (form.email.trim() && !isValidEmail(form.email)) {
        nextErrors.email = "Introduza um email valido ou deixe o campo em branco.";
      }

      const passwordError = validatePasswordStrength(form.password);
      if (passwordError) {
        nextErrors.password = passwordError;
      }

      const confirmationError = validateConfirmPassword(
        form.password,
        form.confirmPassword
      );
      if (confirmationError) {
        nextErrors.confirmPassword = confirmationError;
      }
    }

    if (validateStep3) {
      nextErrors.provincia = validateRequired(form.provincia, "Provincia e obrigatoria.");
      if (!form.provincia.trim()) delete nextErrors.provincia;

      nextErrors.cidade = validateRequired(form.cidade, "Cidade e obrigatoria.");
      if (!form.cidade.trim()) delete nextErrors.cidade;

      nextErrors.bairro = validateRequired(form.bairro, "Bairro e obrigatorio.");
      if (!form.bairro.trim()) delete nextErrors.bairro;
    }

    return Object.fromEntries(
      Object.entries(nextErrors).filter(([, value]) => value)
    ) as Record<string, string>;
  }

  function validate(scope: Step | "all") {
    const nextErrors = buildErrors(scope);
    setFieldErrors((current) => ({ ...current, ...nextErrors }));

    if (scope === "all") {
      return Object.keys(nextErrors).length === 0;
    }

    const stepFields =
      scope === 1
        ? ["nome", "telefone", "dataNascimento"]
        : scope === 2
          ? ["email", "password", "confirmPassword"]
          : ["provincia", "cidade", "bairro"];

    return stepFields.every((field) => !nextErrors[field]);
  }

  function goNext() {
    if (!validate(step)) return;
    setStep((current) => (current < 3 ? ((current + 1) as Step) : current));
  }

  function goBack() {
    setStep((current) => (current > 1 ? ((current - 1) as Step) : current));
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (!validate("all")) return;

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
          window.location.href = `/auth/confirm-email?email=${encodeURIComponent(
            normalizeEmail(form.email)
          )}`;
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
        setFieldErrors((current) => ({ ...current, ...apiFieldErrors }));
      }
      setError(getErrorMessage(reason, "Nao foi possivel concluir o registo."));
    } finally {
      setLoading(false);
    }
  }

  const stepLabels = ["Dados pessoais", "Acesso", "Localizacao"];

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950">
      <div className="grid min-h-screen lg:grid-cols-[0.95fr_1.05fr]">
        <section className="relative hidden overflow-hidden lg:block">
          <Image
            src="/intro.jpg"
            alt="Mavingue"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-br from-slate-950/75 via-slate-950/55 to-orange-600/55" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(249,115,22,0.24),_transparent_30%),radial-gradient(circle_at_bottom_left,_rgba(255,255,255,0.12),_transparent_28%)]" />

          <div className="absolute inset-0 flex items-end p-12">
            <div className="max-w-xl text-white">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.28em] text-orange-100 backdrop-blur-md">
                <Sparkles className="h-4 w-4" />
                Criar conta
              </div>

              <h1 className="mt-5 text-4xl font-black tracking-tight lg:text-5xl">
                Registo limpo, simples e bem organizado.
              </h1>

              <p className="mt-4 max-w-lg text-sm leading-7 text-slate-200 lg:text-base">
                O email é opcional. Se o utilizador registar apenas o número de celular,
                a conta fica pendente até à confirmação da equipa.
              </p>

              <div className="mt-8 grid max-w-md gap-3 text-sm text-slate-200">
                <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 backdrop-blur-md">
                  <CheckCircle2 className="h-4 w-4 text-orange-300" />
                  Campos organizados por etapas
                </div>
                <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 backdrop-blur-md">
                  <CheckCircle2 className="h-4 w-4 text-orange-300" />
                  Validação clara e progressiva
                </div>
                <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 backdrop-blur-md">
                  <CheckCircle2 className="h-4 w-4 text-orange-300" />
                  Integração com o teu sistema
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="flex items-center justify-center px-5 py-10 sm:px-6 lg:px-10">
          <div className="w-full max-w-2xl">
            <div className="mb-8">
              <p className="text-xs font-semibold uppercase tracking-[0.32em] text-orange-600 dark:text-orange-400">
                Registo
              </p>
              <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-900 dark:text-white sm:text-4xl">
                Criar nova conta
              </h2>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500 dark:text-slate-400">
                O email é opcional. O número de celular é obrigatório e será usado para login e sincronização de dados.
              </p>

              <div className="mt-6">
                <div className="mb-2 flex items-center justify-between text-xs font-semibold uppercase tracking-[0.22em] text-slate-400 dark:text-slate-500">
                  <span>Passo {step} de 3</span>
                  <span>{stepLabels[step - 1]}</span>
                </div>

                <div className="flex items-center gap-2">
                  {[1, 2, 3].map((item) => (
                    <div
                      key={item}
                      className={`h-2 flex-1 rounded-full transition-all duration-500 ${
                        step >= item
                          ? "bg-orange-500"
                          : "bg-slate-300 dark:bg-slate-700"
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>

            {error && (
              <div className="mb-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/60 dark:bg-red-950/30 dark:text-red-300">
                {error}
              </div>
            )}

            {success && (
              <div className="mb-5 flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-950/30 dark:text-emerald-300">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
                <span>{success}</span>
              </div>
            )}

            <form onSubmit={submit} className="space-y-6">
              <div className="relative min-h-[420px] overflow-hidden">
                <div
                  className={`absolute inset-0 transition-all duration-500 ease-out ${
                    step === 1
                      ? "translate-x-0 opacity-100"
                      : "-translate-x-6 opacity-0 pointer-events-none"
                  }`}
                >
                  <div className="grid gap-5 md:grid-cols-2">
                    <div className="md:col-span-2">
                      <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
                        Nome completo
                      </label>
                      <div className="relative">
                        <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                        <input
                          value={form.nome}
                          onChange={(event) => setField("nome", event.target.value)}
                          className="h-12 w-full rounded-2xl border border-slate-200 bg-white pl-10 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-orange-400 focus:ring-4 focus:ring-orange-100 dark:border-slate-800 dark:bg-slate-950 dark:text-white dark:placeholder:text-slate-500 dark:focus:border-orange-500 dark:focus:ring-orange-500/20"
                          placeholder="Nome completo"
                        />
                      </div>
                      <FieldError message={fieldErrors.nome} />
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
                        Sexo
                      </label>
                      <select
                        value={form.sexo}
                        onChange={(event) => setField("sexo", event.target.value as Sexo)}
                        className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition focus:border-orange-400 focus:ring-4 focus:ring-orange-100 dark:border-slate-800 dark:bg-slate-950 dark:text-white dark:focus:border-orange-500 dark:focus:ring-orange-500/20"
                      >
                        <option value="HOMEM">Homem</option>
                        <option value="MULHER">Mulher</option>
                      </select>
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
                        Data de nascimento
                      </label>
                      <input
                        type="date"
                        value={form.dataNascimento}
                        onChange={(event) => setField("dataNascimento", event.target.value)}
                        className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition focus:border-orange-400 focus:ring-4 focus:ring-orange-100 dark:border-slate-800 dark:bg-slate-950 dark:text-white dark:[color-scheme:dark] dark:focus:border-orange-500 dark:focus:ring-orange-500/20"
                      />
                      <FieldError message={fieldErrors.dataNascimento} />
                    </div>

                    <div className="md:col-span-2">
                      <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
                        Telefone
                      </label>
                      <div className="relative">
                        <Phone className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                        <input
                          value={form.telefone}
                          onChange={(event) => setField("telefone", event.target.value)}
                          className="h-12 w-full rounded-2xl border border-slate-200 bg-white pl-10 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-orange-400 focus:ring-4 focus:ring-orange-100 dark:border-slate-800 dark:bg-slate-950 dark:text-white dark:placeholder:text-slate-500 dark:focus:border-orange-500 dark:focus:ring-orange-500/20"
                          placeholder="84 123 4567"
                        />
                      </div>
                      <FieldError message={fieldErrors.telefone} />
                    </div>
                  </div>

                  <div className="mt-8 rounded-[28px] border border-slate-200/80 bg-white/60 p-5 backdrop-blur-sm dark:border-slate-800 dark:bg-slate-900/30">
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">
                      Primeiro passo
                    </p>
                    <p className="mt-1 text-xs leading-6 text-slate-500 dark:text-slate-400">
                      Preencha os dados pessoais antes de avançar.
                    </p>
                  </div>
                </div>

                <div
                  className={`absolute inset-0 transition-all duration-500 ease-out ${
                    step === 2
                      ? "translate-x-0 opacity-100"
                      : step < 2
                        ? "translate-x-6 opacity-0 pointer-events-none"
                        : "-translate-x-6 opacity-0 pointer-events-none"
                  }`}
                >
                  <div className="grid gap-5 md:grid-cols-2">
                    <div className="md:col-span-2">
                      <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
                        Email opcional
                      </label>
                      <div className="relative">
                        <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                        <input
                          value={form.email}
                          onChange={(event) => setField("email", event.target.value)}
                          className="h-12 w-full rounded-2xl border border-slate-200 bg-white pl-10 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-orange-400 focus:ring-4 focus:ring-orange-100 dark:border-slate-800 dark:bg-slate-950 dark:text-white dark:placeholder:text-slate-500 dark:focus:border-orange-500 dark:focus:ring-orange-500/20"
                          placeholder="exemplo@email.com"
                        />
                      </div>
                      <FieldError message={fieldErrors.email} />
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
                        Senha
                      </label>
                      <div className="relative">
                        <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                        <input
                          type={showPassword ? "text" : "password"}
                          value={form.password}
                          onChange={(event) => setField("password", event.target.value)}
                          className="h-12 w-full rounded-2xl border border-slate-200 bg-white pl-10 pr-11 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-orange-400 focus:ring-4 focus:ring-orange-100 dark:border-slate-800 dark:bg-slate-950 dark:text-white dark:placeholder:text-slate-500 dark:focus:border-orange-500 dark:focus:ring-orange-500/20"
                          placeholder="Pelo menos 6 caracteres"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword((current) => !current)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-slate-700 dark:hover:text-slate-200"
                          aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                      <FieldError message={fieldErrors.password} />
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
                        Confirmar senha
                      </label>
                      <div className="relative">
                        <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                        <input
                          type={showConfirmPassword ? "text" : "password"}
                          value={form.confirmPassword}
                          onChange={(event) =>
                            setField("confirmPassword", event.target.value)
                          }
                          className="h-12 w-full rounded-2xl border border-slate-200 bg-white pl-10 pr-11 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-orange-400 focus:ring-4 focus:ring-orange-100 dark:border-slate-800 dark:bg-slate-950 dark:text-white dark:placeholder:text-slate-500 dark:focus:border-orange-500 dark:focus:ring-orange-500/20"
                          placeholder="Repita a senha"
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword((current) => !current)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-slate-700 dark:hover:text-slate-200"
                          aria-label={
                            showConfirmPassword
                              ? "Ocultar confirmação"
                              : "Mostrar confirmação"
                          }
                        >
                          {showConfirmPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                      <FieldError message={fieldErrors.confirmPassword} />
                    </div>
                  </div>

                  <div className="mt-8 rounded-[28px] border border-slate-200/80 bg-white/60 p-5 backdrop-blur-sm dark:border-slate-800 dark:bg-slate-900/30">
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">
                      Segundo passo
                    </p>
                    <p className="mt-1 text-xs leading-6 text-slate-500 dark:text-slate-400">
                      Defina o acesso à conta.
                    </p>
                  </div>
                </div>

                <div
                  className={`absolute inset-0 transition-all duration-500 ease-out ${
                    step === 3
                      ? "translate-x-0 opacity-100"
                      : "translate-x-6 opacity-0 pointer-events-none"
                  }`}
                >
                  <div className="grid gap-5 md:grid-cols-2">
                    <div>
                      <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
                        Provincia
                      </label>
                      <div className="relative">
                        <MapPin className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                        <select
                          value={form.provincia}
                          onChange={(event) => setField("provincia", event.target.value)}
                          className="h-12 w-full rounded-2xl border border-slate-200 bg-white pl-10 pr-4 text-sm text-slate-900 outline-none transition focus:border-orange-400 focus:ring-4 focus:ring-orange-100 dark:border-slate-800 dark:bg-slate-950 dark:text-white dark:focus:border-orange-500 dark:focus:ring-orange-500/20"
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
                      <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
                        Cidade
                      </label>
                      <input
                        value={form.cidade}
                        onChange={(event) => setField("cidade", event.target.value)}
                        className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-orange-400 focus:ring-4 focus:ring-orange-100 dark:border-slate-800 dark:bg-slate-950 dark:text-white dark:placeholder:text-slate-500 dark:focus:border-orange-500 dark:focus:ring-orange-500/20"
                        placeholder="Cidade"
                      />
                      <FieldError message={fieldErrors.cidade} />
                    </div>

                    <div className="md:col-span-2">
                      <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
                        Bairro
                      </label>
                      <input
                        value={form.bairro}
                        onChange={(event) => setField("bairro", event.target.value)}
                        className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-orange-400 focus:ring-4 focus:ring-orange-100 dark:border-slate-800 dark:bg-slate-950 dark:text-white dark:placeholder:text-slate-500 dark:focus:border-orange-500 dark:focus:ring-orange-500/20"
                        placeholder="Bairro"
                      />
                      <FieldError message={fieldErrors.bairro} />
                    </div>
                  </div>

                  <div className="mt-6 rounded-[28px] border border-slate-200 bg-gradient-to-br from-orange-50 to-white p-5 dark:border-slate-800 dark:from-slate-900 dark:to-slate-950">
                    <div className="flex items-start justify-between gap-4">
                      <div className="max-w-xl">
                        <div className="flex items-center gap-2">
                          <Droplets className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                          <p className="text-sm font-semibold text-slate-900 dark:text-white">
                            Pretende pedir acesso a agua?
                          </p>
                        </div>
                        <p className="mt-1 text-xs leading-6 text-slate-500 dark:text-slate-400">
                          O pedido fica registado no sistema e poderá ser acompanhado depois na sua área de cliente.
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => setField("pedirAgua", !form.pedirAgua)}
                        className={`relative inline-flex h-7 w-12 shrink-0 rounded-full border transition ${
                          form.pedirAgua
                            ? "border-orange-500 bg-orange-600"
                            : "border-slate-300 bg-slate-300 dark:border-slate-700 dark:bg-slate-700"
                        }`}
                        aria-label="Activar pedido de agua"
                      >
                        <span
                          className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow-sm transition ${
                            form.pedirAgua ? "left-6" : "left-1"
                          }`}
                        />
                      </button>
                    </div>
                  </div>

                  {!form.email.trim() && (
                    <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-900/40 dark:bg-amber-950/20 dark:text-amber-300">
                      Como o email está vazio, a conta será criada em estado pendente até à confirmação da equipa.
                    </div>
                  )}

                  <div className="mt-8 rounded-[28px] border border-slate-200/80 bg-white/60 p-5 backdrop-blur-sm dark:border-slate-800 dark:bg-slate-900/30">
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">
                      Terceiro passo
                    </p>
                    <p className="mt-1 text-xs leading-6 text-slate-500 dark:text-slate-400">
                      Confirme a localização e finalize o registo.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between gap-3 pt-2">
                <button
                  type="button"
                  onClick={goBack}
                  disabled={step === 1}
                  className="inline-flex h-12 items-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-700 transition hover:-translate-y-0.5 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200 dark:hover:bg-slate-900"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Voltar
                </button>

                {step < 3 ? (
                  <button
                    type="button"
                    onClick={goNext}
                    className="inline-flex h-12 items-center gap-2 rounded-2xl bg-orange-600 px-5 text-sm font-semibold text-white shadow-lg shadow-orange-600/20 transition hover:-translate-y-0.5 hover:bg-orange-700"
                  >
                    Seguinte
                    <ChevronRight className="h-4 w-4" />
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={loading}
                    className="inline-flex h-12 items-center gap-2 rounded-2xl bg-orange-600 px-5 text-sm font-semibold text-white shadow-lg shadow-orange-600/20 transition hover:-translate-y-0.5 hover:bg-orange-700 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {loading ? "A criar conta..." : "Criar conta"}
                  </button>
                )}
              </div>
            </form>

            <p className="mt-8 text-center text-sm text-slate-500 dark:text-slate-400">
              Já tem conta?{" "}
              <a
                href="/auth/login"
                className="font-semibold text-orange-600 transition hover:text-orange-700 dark:text-orange-400 dark:hover:text-orange-300"
              >
                Entrar no sistema
              </a>
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}