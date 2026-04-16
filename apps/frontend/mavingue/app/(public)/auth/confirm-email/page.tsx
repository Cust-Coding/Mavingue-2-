"use client";

import React, { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Mail, CheckCircle, AlertCircle, RefreshCw } from "lucide-react";

export default function ConfirmEmailPage() {
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "";

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

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
        setMessage("Email de verificação reenviado. Verifique sua caixa de entrada.");
      } else {
        const text = await res.text();
        setError(text || "Erro ao reenviar email.");
      }
    } catch (e) {
      setError("Falha ao comunicar com o servidor.");
    } finally {
      setLoading(false);
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
            Enviamos um link de confirmação para{" "}
            <span className="font-semibold text-[#EF6A44]">{email || "seu email"}</span>.
            Clique no link para ativar sua conta.
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

        <div className="space-y-3">
          <p className="text-sm text-gray-500">
            Não recebeu o email? Verifique sua pasta de spam ou lixo eletrônico.
          </p>

          <button
            onClick={handleResend}
            disabled={loading || !email}
            className="w-full bg-[#EF6A44] text-white font-bold py-3 px-6 rounded-xl hover:bg-[#EF6A44]/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <RefreshCw className="w-4 h-4" />
            )}
            Reenviar Email de Confirmação
          </button>

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