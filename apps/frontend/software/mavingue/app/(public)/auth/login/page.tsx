"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { http } from "@/lib/http/client";
import { endpoints } from "@/lib/http/endpoints";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [senha, setSenha] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const router = useRouter();
  const sp = useSearchParams();
  const next = sp.get("next") || "/";

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setLoading(true);
    try {
      await http(`/api/proxy${endpoints.auth.login}`, {
        method: "POST",
        body: { username, senha },
      });
      router.push(next);
    } catch (e: any) {
      setErr(e?.message || "Falha no login");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
      <form onSubmit={onSubmit} className="w-full max-w-sm bg-white rounded-2xl shadow p-6">
        <h1 className="text-xl font-bold text-slate-900">Entrar</h1>

        <label className="block mt-4 text-sm text-slate-600">Utilizador</label>
        <input
          className="w-full mt-1 border rounded-lg px-3 py-2"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />

        <label className="block mt-4 text-sm text-slate-600">Senha</label>
        <input
          className="w-full mt-1 border rounded-lg px-3 py-2"
          type="password"
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
          required
        />

        {err && <p className="mt-3 text-sm text-red-600">{err}</p>}

        <button
          disabled={loading}
          className="mt-5 w-full rounded-lg bg-blue-600 text-white py-2 font-semibold disabled:opacity-60"
        >
          {loading ? "A entrar..." : "Entrar"}
        </button>
      </form>
    </div>
  );
}
