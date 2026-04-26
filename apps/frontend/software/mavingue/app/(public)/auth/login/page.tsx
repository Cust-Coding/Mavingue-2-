"use client";

import { FormEvent, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import { AlertCircle, Eye, EyeOff, Lock, Mail, Phone } from "lucide-react";
import { apiGet, apiPost } from "@/lib/http/client";
import { endpoints } from "@/lib/http/endpoints";
import { clearSession, setSession, type SessionUser } from "@/lib/auth/session";
import { getErrorMessage, getFieldErrors } from "@/lib/errors";
import { isValidEmail, isValidMozPhone } from "@/lib/validation/forms";

type LoginResponse = { token: string };

function dashboardForRole(role: SessionUser["role"]) {
  if (role === "ADMIN") return "/admin";
  if (role === "FUNCIONARIO" || role === "STAFF") return "/staff";
  return "/cliente";
}

function InputError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p className="mt-2 flex items-center gap-1 text-xs font-medium text-red-600">
      <AlertCircle className="h-3.5 w-3.5" />
      {message}
    </p>
  );
}

export default function LoginPage() {
  const searchParams = useSearchParams();
  const nextParam = searchParams.get("next");

  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const pendingMessage = useMemo(() => {
    if (!error) return "";
    if (error.includes("pendente de verificacao por email")) {
      return "A sua conta ainda nao foi verificada por email. Introduza o codigo enviado para concluir a activacao.";
    }
    if (error.includes("pendente de verificacao pela equipa")) {
      return "A sua conta esta pendente de confirmacao pela equipa. Assim que for verificada, podera entrar normalmente.";
    }
    return "";
  }, [error]);

  function validate() {
    const nextErrors: Record<string, string> = {};

    if (!identifier.trim()) {
      nextErrors.identifier = "Introduza o email ou numero de telefone.";
    } else if (!identifier.includes("@") && !isValidMozPhone(identifier)) {
      nextErrors.identifier = "Use um numero valido de Mocambique, com ou sem +258.";
    } else if (identifier.includes("@") && !isValidEmail(identifier)) {
      nextErrors.identifier = "Introduza um email valido.";
    }

    if (!password.trim()) {
      nextErrors.password = "Introduza a sua senha.";
    }

    setFieldErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setFieldErrors({});

    if (!validate()) return;

    setLoading(true);
    try {
      clearSession();
      const login = await apiPost<LoginResponse>(endpoints.auth.login, {
        identifier: identifier.trim(),
        password,
      });

      // Guardar token primeiro para que o /me funcione
      setSession(login.token, { id: 0, nome: "", email: null, phone: "", role: "CLIENTE", status: "ATIVO", permissions: [] });

      const me = await apiGet<SessionUser>(endpoints.auth.me);
      setSession(login.token, me);

      localStorage.setItem("me_name", me.nome);

      const fallback = dashboardForRole(me.role);
      const next =
        nextParam && nextParam.startsWith("/") && !nextParam.startsWith("/auth") ? nextParam : fallback;

      window.location.href = next;
    } catch (reason) {
      const apiFieldErrors = getFieldErrors(reason);
      if (Object.keys(apiFieldErrors).length > 0) {
        setFieldErrors(apiFieldErrors);
      }
      setError(getErrorMessage(reason, "Nao foi possivel iniciar sessao."));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-100">
      <div className="grid min-h-screen lg:grid-cols-[1.05fr_0.95fr]">
        <section className="relative hidden overflow-hidden lg:block">
          <Image src="/intro.jpg" alt="Mavingue" fill className="object-cover" priority />
          <div className="absolute inset-0 bg-slate-950/45" />
          <div className="absolute inset-0 flex items-end p-12">
            <div className="max-w-xl text-white">
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-orange-200">Mavingue</p>
              <h1 className="mt-4 text-4xl font-bold tracking-tight">Acesso organizado para clientes, equipa e administracao.</h1>
              <p className="mt-4 text-sm leading-7 text-slate-200">
                Entre com email ou numero de celular. O sistema mostra apenas o que a sua conta pode realmente usar.
              </p>
            </div>
          </div>
        </section>

        <section className="flex items-center justify-center px-6 py-10">
          <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 shadow-xl shadow-slate-900/5">
            <div className="mb-8">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-orange-600">Entrar</p>
              <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-900">Bem-vindo de volta</h2>
              <p className="mt-2 text-sm leading-6 text-slate-500">
                Use o email ou o numero de telefone associado a sua conta.
              </p>
            </div>

            {error && !pendingMessage && (
              <div className="mb-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}

            {pendingMessage && (
              <div className="mb-5 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                {pendingMessage}
              </div>
            )}

            <form onSubmit={submit} className="space-y-5">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">Email ou telefone</label>
                <div className="relative">
                  {identifier.includes("@") ? (
                    <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  ) : (
                    <Phone className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  )}
                  <input
                    value={identifier}
                    onChange={(event) => setIdentifier(event.target.value)}
                    placeholder="exemplo@email.com ou 84 123 4567"
                    className="h-12 w-full rounded-2xl border border-slate-200 bg-white pl-10 pr-4 text-sm text-slate-900 outline-none transition focus:border-orange-400 focus:ring-4 focus:ring-orange-100"
                  />
                </div>
                <InputError message={fieldErrors.identifier} />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">Senha</label>
                <div className="relative">
                  <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder="Introduza a sua senha"
                    className="h-12 w-full rounded-2xl border border-slate-200 bg-white pl-10 pr-11 text-sm text-slate-900 outline-none transition focus:border-orange-400 focus:ring-4 focus:ring-orange-100"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((current) => !current)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-slate-700"
                    aria-label="Mostrar ou esconder senha"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                <InputError message={fieldErrors.password} />
              </div>

              <div className="flex items-center justify-between gap-4 text-sm">
                <a href="/auth/forgot-password" className="font-medium text-slate-500 transition hover:text-orange-600">
                  Esqueceu a senha?
                </a>
                <a href="/auth/confirm-email" className="font-medium text-slate-500 transition hover:text-orange-600">
                  Confirmar conta
                </a>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="h-12 w-full rounded-2xl bg-orange-600 text-sm font-semibold text-white transition hover:bg-orange-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? "A entrar..." : "Entrar no sistema"}
              </button>
            </form>

            <p className="mt-8 text-center text-sm text-slate-500">
              Ainda nao tem conta?{" "}
              <a href="/auth/register" className="font-semibold text-orange-600 transition hover:text-orange-700">
                Criar conta
              </a>
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
