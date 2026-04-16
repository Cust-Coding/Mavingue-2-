"use client";

import React, { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Mail, CheckCircle, AlertCircle, RefreshCw, ArrowRight } from "lucide-react";

export default function ConfirmEmailPage() {
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
        setMessage("Código de verificação reenviado. Verifique sua caixa de entrada.");
      } else {
        const text = await res.text();
        setError(text || "Erro ao reenviar código.");
      }
    } catch (e) {
      setError("Falha ao comunicar com o servidor.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async () => {
    if (!code.trim()) {
      setError("Por favor, insira o código de verificação.");
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
        setMessage("Conta verificada com sucesso! Redirecionando...");
        setTimeout(() => {
          router.push("/cliente"); // Redirect to dashboard
        }, 2000);
      } else {
        const text = await res.text();
        setError(text || "Código inválido ou expirado.");
      }
    } catch (e) {
      setError("Falha ao comunicar com o servidor.");
    } finally {
      setVerifying(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#EF6A44]/10 via-white to-[#EF6A44]/5 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl shadow-[#EF6A44]/10 p-8 text-center">
        <div className="mb-6">
          <div className="w-16 h-16 bg-[#EF6A44]/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Mail className="w-8 h-8 text-[#EF6A44]" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Verifique seu Email
          </h1>
          <p className="text-gray-600 leading-relaxed">
            Enviamos um código de confirmação para{" "}
            <span className="font-semibold text-[#EF6A44]">{email || "seu email"}</span>.
            Digite o código abaixo para ativar sua conta.
          </p>
        </div>

        {message && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-xl flex items-center gap-2 text-green-700">
            <CheckCircle className="w-5 h-5" />
            <span className="text-sm">{message}</span>
          </div>
        )}

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-red-700">
            <AlertCircle className="w-5 h-5" />
            <span className="text-sm">{error}</span>
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Código de Verificação
            </label>
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              placeholder="000000"
              className="w-full px-4 py-3 text-center text-2xl font-mono tracking-widest border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#EF6A44]/20 focus:border-[#EF6A44] transition-all"
              maxLength={6}
            />
          </div>

          <button
            onClick={handleVerify}
            disabled={verifying || code.length !== 6}
            className="w-full bg-[#EF6A44] text-white font-bold py-3 px-6 rounded-xl hover:bg-[#EF6A44]/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {verifying ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <ArrowRight className="w-4 h-4" />
            )}
            Verificar Conta
          </button>

          <div className="text-center">
            <p className="text-sm text-gray-500 mb-2">
              Não recebeu o código? Verifique sua pasta de spam ou lixo eletrônico.
            </p>

            <button
              onClick={handleResend}
              disabled={loading || !email}
              className="text-[#EF6A44] hover:text-[#EF6A44]/80 font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1 mx-auto"
            >
              {loading ? (
                <RefreshCw className="w-3 h-3 animate-spin" />
              ) : (
                <RefreshCw className="w-3 h-3" />
              )}
              Reenviar Código
            </button>
          </div>

          <button
            onClick={() => window.location.href = "/auth/login"}
            className="w-full bg-gray-100 text-gray-700 font-bold py-3 px-6 rounded-xl hover:bg-gray-200 transition-colors"
          >
            Voltar ao Login
          </button>
        </div>
      </div>
    </div>
  );
}