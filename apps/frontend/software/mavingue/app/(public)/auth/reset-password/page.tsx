"use client";

import { FormEvent, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { AlertCircle, CheckCircle2, Eye, EyeOff, Lock, Mail } from "lucide-react";
import { apiPost } from "@/lib/http/client";
import { endpoints } from "@/lib/http/endpoints";
import { getErrorMessage, getFieldErrors } from "@/lib/errors";
import { isValidEmail, validateConfirmPassword, validatePasswordStrength } from "@/lib/validation/forms";

export default function ResetPasswordPage() {
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const fromQuery = searchParams.get("email");
    if (fromQuery) setEmail(fromQuery);
  }, [searchParams]);

  function validate() {
    const nextErrors: Record<string, string> = {};

    if (!email.trim()) {
      nextErrors.email = "Introduza o email da sua conta.";
    } else if (!isValidEmail(email)) {
      nextErrors.email = "Introduza um email valido.";
    }

    if (!code.trim()) {
      nextErrors.code = "Introduza o codigo recebido.";
    } else if (!/^\d{6}$/.test(code.trim())) {
      nextErrors.code = "Use um codigo de 6 digitos.";
    }

    const passwordError = validatePasswordStrength(newPassword);
    if (passwordError) nextErrors.newPassword = passwordError;

    const confirmationError = validateConfirmPassword(newPassword, confirmPassword);
    if (confirmationError) nextErrors.confirmPassword = confirmationError;

    setFieldErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSuccess("");
    setFieldErrors({});

    if (!validate()) return;

    setLoading(true);
    try {
      const message = await apiPost<string>(endpoints.auth.resetPassword, {
        email: email.trim().toLowerCase(),
        code: code.trim(),
        newPassword,
      });
      setSuccess(message || "Senha redefinida com sucesso.");
      setTimeout(() => {
        window.location.href = "/auth/login";
      }, 1800);
    } catch (reason) {
      const apiFieldErrors = getFieldErrors(reason);
      if (Object.keys(apiFieldErrors).length > 0) {
        setFieldErrors(apiFieldErrors);
      }
      setError(getErrorMessage(reason, "Nao foi possivel redefinir a senha."));
    } finally {
      setLoading(false);
    }
  }

  function FieldError({ message }: { message?: string }) {
    if (!message) return null;
    return (
      <p className="mt-2 flex items-center gap-1 text-xs font-medium text-red-600">
        <AlertCircle className="h-3.5 w-3.5" />
        {message}
      </p>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 px-4">
      <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 shadow-xl shadow-slate-900/5">
        <div className="mb-8">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-orange-600">Nova senha</p>
          <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-900">Redefinir acesso</h1>
          <p className="mt-2 text-sm leading-6 text-slate-500">Introduza o codigo recebido por email e defina uma nova senha.</p>
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
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="h-12 w-full rounded-2xl border border-slate-200 bg-white pl-10 pr-4 text-sm text-slate-900 outline-none transition focus:border-orange-400 focus:ring-4 focus:ring-orange-100"
              />
            </div>
            <FieldError message={fieldErrors.email} />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">Codigo</label>
            <input
              value={code}
              onChange={(event) => setCode(event.target.value.replace(/\D/g, "").slice(0, 6))}
              className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-center text-lg tracking-[0.35em] text-slate-900 outline-none transition focus:border-orange-400 focus:ring-4 focus:ring-orange-100"
              placeholder="000000"
            />
            <FieldError message={fieldErrors.code} />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">Nova senha</label>
            <div className="relative">
              <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type={showPassword ? "text" : "password"}
                value={newPassword}
                onChange={(event) => setNewPassword(event.target.value)}
                className="h-12 w-full rounded-2xl border border-slate-200 bg-white pl-10 pr-11 text-sm text-slate-900 outline-none transition focus:border-orange-400 focus:ring-4 focus:ring-orange-100"
              />
              <button
                type="button"
                onClick={() => setShowPassword((current) => !current)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-slate-700"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            <FieldError message={fieldErrors.newPassword} />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">Confirmar senha</label>
            <div className="relative">
              <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                className="h-12 w-full rounded-2xl border border-slate-200 bg-white pl-10 pr-11 text-sm text-slate-900 outline-none transition focus:border-orange-400 focus:ring-4 focus:ring-orange-100"
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

          <button
            type="submit"
            disabled={loading}
            className="h-12 w-full rounded-2xl bg-orange-600 text-sm font-semibold text-white transition hover:bg-orange-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "A guardar..." : "Redefinir senha"}
          </button>
        </form>

        <a href="/auth/login" className="mt-6 block text-center text-sm font-medium text-slate-500 transition hover:text-orange-600">
          Voltar ao login
        </a>
      </div>
    </div>
  );
}
