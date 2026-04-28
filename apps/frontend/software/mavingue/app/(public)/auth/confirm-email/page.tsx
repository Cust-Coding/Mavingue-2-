"use client";

import React, { useState } from "react";
import Image from "next/image";
import { useSearchParams, useRouter } from "next/navigation";
import { useI18n } from "@/lib/i18n";
import {
  Mail,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  ArrowRight,
  Sparkles,
  ShieldCheck,
} from "lucide-react";

export default function ConfirmEmailPage() {
  const { t } = useI18n();
  const searchParams = useSearchParams();
  const router = useRouter();
  const email = searchParams.get("email") || "";

  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [code, setCode] = useState("");

  const handleResend = async () => {
    if (!email) return;
    setLoading(true);
    setError("");
    setMessage("");

    try {
      const res = await fetch("/api/proxy/api/auth/resend-token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (res.ok) {
        setMessage(t("auth.codeSent"));
      } else {
        const text = await res.text();
        setError(text || t("auth.resetError"));
      }
    } catch {
      setError(t("auth.serverError"));
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async () => {
    if (!code.trim()) {
      setError(t("auth.invalidCode"));
      return;
    }

    setVerifying(true);
    setError("");
    setMessage("");

    try {
      const res = await fetch("/api/proxy/api/auth/verify-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code: code.trim() }),
      });

      if (res.ok) {
        setMessage(t("auth.verificationSuccess"));
        setTimeout(() => {
          router.push("/cliente");
        }, 2000);
      } else {
        const text = await res.text();
        setError(text || t("auth.invalidCode"));
      }
    } catch {
      setError(t("auth.serverError"));
    } finally {
      setVerifying(false);
    }
  };

  return (
    <div className="min-h-screen overflow-hidden bg-slate-100 dark:bg-slate-950">
      <div className="grid min-h-screen lg:grid-cols-[0.95fr_1.05fr]">
        <section className="relative hidden overflow-hidden lg:block">
          <Image
            src="/intro.jpg"
            alt="Verificacao de email"
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
                Confirmacao de conta
              </div>

              <h1 className="mt-5 text-4xl font-black tracking-tight lg:text-5xl">
                Estamos a verificar o teu email.
              </h1>

              <p className="mt-4 max-w-lg text-sm leading-7 text-slate-200 lg:text-base">
                Introduz o codigo enviado para o teu email para activar a conta e
                concluir o acesso ao sistema.
              </p>

              <div className="mt-8 grid max-w-md gap-3 text-sm text-slate-200">
                <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 backdrop-blur-md">
                  <CheckCircle className="h-4 w-4 text-orange-300" />
                  Código enviado por email
                </div>
                <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 backdrop-blur-md">
                  <CheckCircle className="h-4 w-4 text-orange-300" />
                  Verificação rápida e segura
                </div>
                <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 backdrop-blur-md">
                  <CheckCircle className="h-4 w-4 text-orange-300" />
                  Acesso liberado após confirmação
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
                Verificação
              </p>
              <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-900 dark:text-white sm:text-4xl">
                Confirmar email
              </h2>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500 dark:text-slate-400">
                {t("auth.codeSentDesc").split(".")[0]}{" "}
                <span className="font-semibold text-orange-600 dark:text-orange-400">
                  {email || t("form.placeholders.email")}
                </span>
                . {t("auth.enterCodeInstructions")}
              </p>
            </div>

            {message && (
              <div className="mb-5 flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-950/30 dark:text-emerald-300">
                <CheckCircle className="mt-0.5 h-4 w-4 shrink-0" />
                <span>{message}</span>
              </div>
            )}

            {error && (
              <div className="mb-5 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/60 dark:bg-red-950/30 dark:text-red-300">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="space-y-6">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
                  {t("auth.sendCode").split(" ")[0]}
                </label>
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={code}
                    onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                    placeholder="000000"
                    inputMode="numeric"
                    className="h-12 w-full rounded-2xl border border-slate-200 bg-white pl-10 pr-4 text-center text-2xl font-mono tracking-[0.35em] text-slate-900 outline-none transition placeholder:text-slate-300 focus:border-orange-400 focus:ring-4 focus:ring-orange-100 dark:border-slate-800 dark:bg-slate-950 dark:text-white dark:placeholder:text-slate-600 dark:focus:border-orange-500 dark:focus:ring-orange-500/20"
                    maxLength={6}
                  />
                </div>
              </div>

              <button
                onClick={handleVerify}
                disabled={verifying || code.length !== 6}
                className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-orange-600 text-sm font-semibold text-white shadow-lg shadow-orange-600/20 transition hover:-translate-y-0.5 hover:bg-orange-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {verifying ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  <ArrowRight className="h-4 w-4" />
                )}
                {t("common.confirm")}
              </button>

              <div className="rounded-[28px] border border-slate-200 bg-white/70 p-5 dark:border-slate-800 dark:bg-slate-900/30">
                <div className="flex items-center gap-3">
                  <div className="rounded-2xl bg-orange-100 p-2 text-orange-600 dark:bg-orange-500/15 dark:text-orange-400">
                    <Mail className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">
                      Não recebeu o código?
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Pode reenviar o código para o mesmo email.
                    </p>
                  </div>
                </div>

                <button
                  onClick={handleResend}
                  disabled={loading || !email}
                  className="mt-4 inline-flex h-11 items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:-translate-y-0.5 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200 dark:hover:bg-slate-900"
                >
                  {loading ? (
                    <RefreshCw className="h-4 w-4 animate-spin" />
                  ) : (
                    <RefreshCw className="h-4 w-4" />
                  )}
                  {t("auth.sendCode")}
                </button>
              </div>

              <button
                onClick={() => (window.location.href = "/auth/login")}
                className="inline-flex h-12 w-full items-center justify-center rounded-2xl border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-700 transition hover:-translate-y-0.5 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200 dark:hover:bg-slate-900"
              >
                {t("common.back")}
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}