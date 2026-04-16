"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Lock, Eye, EyeOff, AlertCircle, CheckCircle } from "lucide-react";

export default function ResetPasswordPage() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const validate = () => {
    if (!password.trim()) return "Senha é obrigatória";
    if (password.length < 6) return "Senha deve ter pelo menos 6 caracteres";
    if (password !== confirmPassword) return "Senhas não coincidem";
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    if (!token) {
      setError("Token inválido");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/proxy/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token,
          newPassword: password,
        }),
      });

      if (res.ok) {
        setSuccess(true);
      } else {
        const text = await res.text();
        setError(text || "Erro ao redefinir senha");
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
            Senha Redefinida!
          </h1>
          <p className="text-gray-600 mb-6">
            Sua senha foi alterada com sucesso. Agora você pode fazer login.
          </p>
          <button
            onClick={() => window.location.href = "/auth/login"}
            className="w-full bg-[#EF6A44] text-white font-bold py-3 px-6 rounded-xl hover:bg-[#EF6A44]/90 transition-colors"
          >
            Ir para Login
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
            Redefinir Senha
          </h1>
          <p className="text-gray-600">
            Digite sua nova senha abaixo.
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
              Nova Senha
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#EF6A44]/20 focus:border-[#EF6A44] transition-all"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Confirmar Senha
            </label>
            <div className="relative">
              <input
                type={showConfirm ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#EF6A44]/20 focus:border-[#EF6A44] transition-all"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#EF6A44] text-white font-bold py-3 px-6 rounded-xl hover:bg-[#EF6A44]/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? "Redefinindo..." : "Redefinir Senha"}
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