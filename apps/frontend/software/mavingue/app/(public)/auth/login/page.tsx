"use client";

import { motion } from "framer-motion";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { http } from "@/lib/http/client";
import { endpoints } from "@/lib/http/endpoints";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [senha, setSenha] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{ username?: string; senha?: string }>({});
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const sp = useSearchParams();
  const next = sp.get("next") || "/";

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setFieldErrors({});

    const errors: { username?: string; senha?: string } = {};
    if (username.trim().length < 3) errors.username = "Informe um utilizador válido.";
    if (senha.trim().length < 4) errors.senha = "A senha deve ter no mínimo 4 caracteres.";
    if (Object.keys(errors).length) {
      setFieldErrors(errors);
      return;
    }

    setLoading(true);
    try {
      await http(`/api/proxy${endpoints.auth.login}`, {
        method: "POST",
        body: { username, senha },
      });
      router.push(next);
    } catch (e: any) {
      setError(e?.message || "Falha no login");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-6">
      <motion.form
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        onSubmit={onSubmit}
        className="w-full max-w-sm rounded-2xl bg-white p-6 shadow"
      >
        <h1 className="text-xl font-bold text-slate-900">Entrar</h1>
        <p className="mt-1 text-sm text-slate-500">Use as suas credenciais para continuar.</p>

        <div className="mt-4 space-y-4">
          <Input
            label="Utilizador"
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            error={fieldErrors.username}
          />
          <Input
            label="Senha"
            type="password"
            value={senha}
            onChange={(event) => setSenha(event.target.value)}
            error={fieldErrors.senha}
          />
        </div>

        {error ? <p className="mt-3 text-sm text-red-600">{error}</p> : null}

        <Button disabled={loading} className="mt-5 w-full">
          {loading ? "A entrar..." : "Entrar"}
        </Button>
      </motion.form>
    </div>
  );
}
