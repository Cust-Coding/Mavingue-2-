"use client";

import { useState } from "react";
import { Mail, AlertCircle, CheckCircle, ArrowRight } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email.trim()) {
      setError("Email é obrigatório");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/proxy/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });

      if (res.ok) {
        setSuccess(true);
      } else {
        const text = await res.text();
        setError(text || "Erro ao enviar código");
      }
    } catch (e) {
      setError("Falha ao comunicar com o servidor");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#EF6A44]/10 via-white to-[#EF6A44]/5 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl shadow-[#EF6A44]/10 p-8 text-center">
          <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Código Enviado!
          </h1>
          <p className="text-gray-600 mb-6">
            Enviamos um código de verificação para seu email. Use-o para redefinir sua senha.
          </p>
          <button
            onClick={() => window.location.href = `/auth/reset-password?email=${encodeURIComponent(email)}`}
            className="w-full bg-[#EF6A44] text-white font-bold py-3 px-6 rounded-xl hover:bg-[#EF6A44]/90 transition-colors flex items-center justify-center gap-2"
          >
            Ir para Redefinição
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#EF6A44]/10 via-white to-[#EF6A44]/5 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl shadow-[#EF6A44]/10 p-8">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Esqueceu a Senha?
          </h1>
          <p className="text-gray-600">
            Digite seu email para receber um código de verificação.
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-red-700">
            <AlertCircle className="w-5 h-5" />
            <span className="text-sm">{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <div className="relative">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#EF6A44]/20 focus:border-[#EF6A44] transition-all"
                placeholder="seu@email.com"
              />
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#EF6A44] text-white font-bold py-3 px-6 rounded-xl hover:bg-[#EF6A44]/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? "Enviando..." : "Enviar Código"}
          </button>
        </form>

        <div className="text-center mt-6">
          <button
            onClick={() => window.location.href = "/auth/login"}
            className="text-[#EF6A44] hover:underline"
          >
            Voltar ao Login
          </button>
        </div>
      </div>
    </div>
  );
}