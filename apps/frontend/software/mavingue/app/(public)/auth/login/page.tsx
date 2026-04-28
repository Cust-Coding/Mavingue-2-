"use client";

import { FormEvent, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  Eye,
  EyeOff,
  Lock,
  Mail,
  Phone,
  Sparkles,
} from "lucide-react";
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
    <p className="mt-2 flex items-center gap-1 text-xs font-medium text-red-600 dark:text-red-400">
      <AlertCircle className="h-3.5 w-3.5 shrink-0" />
      <span>{message}</span>
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
      setSession(login.token, {
        id: 0,
        nome: "",
        email: null,
        phone: "",
        role: "CLIENTE",
        status: "ATIVO",
        permissions: [],
      });

      const me = await apiGet<SessionUser>(endpoints.auth.me);
      setSession(login.token, me);

      localStorage.setItem("me_name", me.nome);

      const fallback = dashboardForRole(me.role);
      const next =
        nextParam && nextParam.startsWith("/") && !nextParam.startsWith("/auth")
          ? nextParam
          : fallback;

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
    <div className="min-h-screen overflow-hidden bg-slate-100 dark:bg-slate-950">
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
                Acesso ao sistema
              </div>

              <h1 className="mt-5 text-4xl font-black tracking-tight lg:text-5xl">
                Acesso organizado para clientes, equipa e administração.
              </h1>

              <p className="mt-4 max-w-lg text-sm leading-7 text-slate-200 lg:text-base">
                Entre com email ou número de telefone. O sistema mostra apenas o que a sua conta pode realmente usar.
              </p>

              <div className="mt-8 grid max-w-md gap-3 text-sm text-slate-200">
                <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 backdrop-blur-md">
                  <CheckCircle2 className="h-4 w-4 text-orange-300" />
                  Login com email ou telefone
                </div>
                <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 backdrop-blur-md">
                  <CheckCircle2 className="h-4 w-4 text-orange-300" />
                  Redirecionamento por perfil
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
                Entrar
              </p>
              <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-900 dark:text-white sm:text-4xl">
                Bem-vindo de volta
              </h2>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500 dark:text-slate-400">
                Use o email ou o número de telefone associado à sua conta.
              </p>
            </div>

            {error && !pendingMessage && (
              <div className="mb-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/60 dark:bg-red-950/30 dark:text-red-300">
                {error}
              </div>
            )}

            {pendingMessage && (
              <div className="mb-5 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-900/40 dark:bg-amber-950/20 dark:text-amber-300">
                {pendingMessage}
              </div>
            )}

            <form onSubmit={submit} className="space-y-6">
              <div className="grid gap-5">
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
                    Email ou telefone
                  </label>
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
                      className="h-12 w-full rounded-2xl border border-slate-200 bg-white pl-10 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-orange-400 focus:ring-4 focus:ring-orange-100 dark:border-slate-800 dark:bg-slate-950 dark:text-white dark:placeholder:text-slate-500 dark:focus:border-orange-500 dark:focus:ring-orange-500/20"
                    />
                  </div>
                  <InputError message={fieldErrors.identifier} />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
                    Senha
                  </label>
                  <div className="relative">
                    <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      placeholder="Introduza a sua senha"
                      className="h-12 w-full rounded-2xl border border-slate-200 bg-white pl-10 pr-11 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-orange-400 focus:ring-4 focus:ring-orange-100 dark:border-slate-800 dark:bg-slate-950 dark:text-white dark:placeholder:text-slate-500 dark:focus:border-orange-500 dark:focus:ring-orange-500/20"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((current) => !current)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-slate-700 dark:hover:text-slate-200"
                      aria-label="Mostrar ou esconder senha"
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                  <InputError message={fieldErrors.password} />
                </div>
              </div>

              <div className="flex items-center justify-between gap-4 text-sm">
                <a
                  href="/auth/forgot-password"
                  className="font-medium text-slate-500 transition hover:text-orange-600 dark:text-slate-400 dark:hover:text-orange-400"
                >
                  Esqueceu a senha?
                </a>
                <a
                  href="/auth/confirm-email"
                  className="font-medium text-slate-500 transition hover:text-orange-600 dark:text-slate-400 dark:hover:text-orange-400"
                >
                  Confirmar conta
                </a>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-orange-600 text-sm font-semibold text-white shadow-lg shadow-orange-600/20 transition hover:-translate-y-0.5 hover:bg-orange-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? "A entrar..." : "Entrar no sistema"}
                {!loading && <ArrowRight className="h-4 w-4" />}
              </button>
            </form>

            <p className="mt-8 text-center text-sm text-slate-500 dark:text-slate-400">
              Ainda nao tem conta?{" "}
              <a
                href="/auth/register"
                className="font-semibold text-orange-600 transition hover:text-orange-700 dark:text-orange-400 dark:hover:text-orange-300"
              >
                Criar conta
              </a>
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
