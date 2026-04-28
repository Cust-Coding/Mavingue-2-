"use client";

import { FormEvent, useState } from "react";
import Image from "next/image";
import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  Loader2,
  Mail,
  Sparkles,
  ShieldCheck,
} from "lucide-react";
import { apiPost } from "@/lib/http/client";
import { endpoints } from "@/lib/http/endpoints";
import { getErrorMessage, getFieldErrors } from "@/lib/errors";
import { isValidEmail } from "@/lib/validation/forms";

function InputError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p className="mt-2 flex items-center gap-1 text-xs font-medium text-red-600 dark:text-red-400">
      <AlertCircle className="h-3.5 w-3.5 shrink-0" />
      <span>{message}</span>
    </p>
  );
}

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [fieldError, setFieldError] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSuccess("");
    setFieldError("");

    if (!email.trim()) {
      setFieldError("Introduza o email da sua conta.");
      return;
    }

    if (!isValidEmail(email)) {
      setFieldError("Introduza um email valido.");
      return;
    }

    setLoading(true);
    try {
      const message = await apiPost<string>(endpoints.auth.forgotPassword, {
        email: email.trim().toLowerCase(),
      });
      setSuccess(message || "Codigo enviado com sucesso.");
    } catch (reason) {
      const apiFieldErrors = getFieldErrors(reason);
      if (apiFieldErrors.email) setFieldError(apiFieldErrors.email);
      setError(getErrorMessage(reason, "Nao foi possivel enviar o codigo de redefinicao."));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen overflow-hidden bg-slate-100 dark:bg-slate-950">
      <div className="grid min-h-screen lg:grid-cols-[0.95fr_1.05fr]">
        <section className="relative hidden overflow-hidden lg:block">
          <Image
            src="/intro.jpg"
            alt="Recuperacao de senha"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-br from-slate-950/75 via-slate-950/55 to-orange-600/55" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(249,115,22,0.24),_transparent_30%),radial-gradient(circle_at_bottom_left,_rgba(255,255,255,0.12),_transparent_28%)]" />

          <div className="absolute inset-0 flex items-end p-12">
            <div className="max-w-xl text-white">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.28em] text-orange-100 backdrop-blur-md">
                <ShieldCheck className="h-4 w-4" />
                Recuperação de acesso
              </div>

              <h1 className="mt-5 text-4xl font-black tracking-tight lg:text-5xl">
                Vamos ajudar-te a recuperar a tua senha.
              </h1>

              <p className="mt-4 max-w-lg text-sm leading-7 text-slate-200 lg:text-base">
                Introduza o email associado à conta para receber o código de redefinição e continuar o processo em segurança.
              </p>

              <div className="mt-8 grid max-w-md gap-3 text-sm text-slate-200">
                <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 backdrop-blur-md">
                  <CheckCircle2 className="h-4 w-4 text-orange-300" />
                  Código enviado para o email
                </div>
                <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 backdrop-blur-md">
                  <CheckCircle2 className="h-4 w-4 text-orange-300" />
                  Processo simples e rápido
                </div>
                <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 backdrop-blur-md">
                  <CheckCircle2 className="h-4 w-4 text-orange-300" />
                  Acesso restaurado com segurança
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="relative flex items-center justify-center px-5 py-10 sm:px-6 lg:px-10">
          <div className="absolute inset-0 bg-gradient-to-b from-white/80 via-white/40 to-transparent dark:from-slate-950/70 dark:via-slate-950/30 dark:to-transparent" />

          <div className="relative w-full max-w-xl">
            <div className="mb-8">
              <p className="text-xs font-semibold uppercase tracking-[0.32em] text-orange-600 dark:text-orange-400">
                Recuperação
              </p>
              <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-900 dark:text-white sm:text-4xl">
                Esqueceu a senha?
              </h2>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500 dark:text-slate-400">
                Enviaremos um código para o email associado à sua conta.
              </p>
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
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Email
                </label>
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="exemplo@email.com"
                    className="h-12 w-full rounded-2xl border border-slate-200 bg-white pl-10 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-orange-400 focus:ring-4 focus:ring-orange-100 dark:border-slate-800 dark:bg-slate-950 dark:text-white dark:placeholder:text-slate-500 dark:focus:border-orange-500 dark:focus:ring-orange-500/20"
                  />
                </div>
                <InputError message={fieldError} />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-orange-600 text-sm font-semibold text-white shadow-lg shadow-orange-600/20 transition hover:-translate-y-0.5 hover:bg-orange-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <ArrowRight className="h-4 w-4" />
                )}
                {loading ? "A enviar..." : "Enviar código"}
              </button>
            </form>

            <p className="mt-8 text-center text-sm text-slate-500 dark:text-slate-400">
              Lembrou-se da senha?{" "}
              <a
                href="/auth/login"
                className="font-semibold text-orange-600 transition hover:text-orange-700 dark:text-orange-400 dark:hover:text-orange-300"
              >
                Voltar ao login
              </a>
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}