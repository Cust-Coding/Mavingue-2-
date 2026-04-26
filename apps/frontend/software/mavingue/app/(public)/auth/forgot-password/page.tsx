"use client";

import { FormEvent, useState } from "react";
import { AlertCircle, CheckCircle2, Mail } from "lucide-react";
import { apiPost } from "@/lib/http/client";
import { endpoints } from "@/lib/http/endpoints";
import { getErrorMessage, getFieldErrors } from "@/lib/errors";
import { isValidEmail } from "@/lib/validation/forms";

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
      const message = await apiPost<string>(endpoints.auth.forgotPassword, { email: email.trim().toLowerCase() });
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
    <div className="flex min-h-screen items-center justify-center bg-slate-100 px-4">
      <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 shadow-xl shadow-slate-900/5">
        <div className="mb-8">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-orange-600">Recuperacao</p>
          <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-900">Esqueceu a senha?</h1>
          <p className="mt-2 text-sm leading-6 text-slate-500">
            Enviamos um codigo para o email associado a conta.
          </p>
        </div>

        {error && <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}
        {success && (
          <div className="mb-4 flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{success}</span>
          </div>
        )}

        <form onSubmit={submit} className="space-y-5">
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">Email</label>
            <div className="relative">
              <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="exemplo@email.com"
                className="h-12 w-full rounded-2xl border border-slate-200 bg-white pl-10 pr-4 text-sm text-slate-900 outline-none transition focus:border-orange-400 focus:ring-4 focus:ring-orange-100"
              />
            </div>
            {fieldError && (
              <p className="mt-2 flex items-center gap-1 text-xs font-medium text-red-600">
                <AlertCircle className="h-3.5 w-3.5" />
                {fieldError}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="h-12 w-full rounded-2xl bg-orange-600 text-sm font-semibold text-white transition hover:bg-orange-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "A enviar..." : "Enviar codigo"}
          </button>
        </form>

        <a href="/auth/login" className="mt-6 block text-center text-sm font-medium text-slate-500 transition hover:text-orange-600">
          Voltar ao login
        </a>
      </div>
    </div>
  );
}
