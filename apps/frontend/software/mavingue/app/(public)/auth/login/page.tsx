"use client";

import { useState } from "react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { useSearchParams } from "next/navigation";
import { setSession } from "@/lib/auth/session";

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div style={{ display: "grid", gap: 6 }}>
      <label style={{ fontSize: 14 }}>{label}</label>
      {children}
      {error && <div style={{ color: "crimson", fontSize: 13 }}>{error}</div>}
    </div>
  );
}

function dashboardForRole(role: string) {
  if (role === "ADMIN") return "/admin";
  if (role === "FUNCIONARIO" || role === "STAFF") return "/staff";
  if (role === "CLIENTE") return "/cliente";
  return "/";
}

export default function LoginPage() {
  const sp = useSearchParams();
  const nextParam = sp.get("next"); 
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [fe, setFe] = useState<Record<string, string>>({});

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  function validate() {
    const e: Record<string, string> = {};
    if (!email.trim()) e.email = "Email é obrigatório";
    if (!password.trim()) e.password = "Senha é obrigatória";
    setFe(e);
    return Object.keys(e).length === 0;
  }

  async function submit(ev: React.FormEvent) {
    ev.preventDefault();
    setErr("");
    setFe({});

    if (!validate()) return;

    setLoading(true);
    try {
      // 1) login -> token
      const res = await fetch("/api/proxy/api/auth/login", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), password }),
      });

      if (!res.ok) {
        const txt = await res.text().catch(() => "");
        try {
          const j = JSON.parse(txt);
          if (j && typeof j === "object" && !Array.isArray(j) && !j.message) {
            setFe(j);
            setErr("Campos inválidos.");
            return;
          }
          if (j?.message) {
            setErr(String(j.message));
            return;
          }
        } catch {}
        setErr(txt || `Erro HTTP ${res.status}`);
        return;
      }

      const data = await res.json();
      const token = data?.token ?? data;

      // 2) guarda token temporário
      setSession(token, "CLIENTE");

      // 3) busca /me -> role e nome
      let role = "CLIENTE";
      try {
        const meRes = await fetch("/api/proxy/api/auth/me", { method: "GET", credentials: "include" });
        if (meRes.ok) {
          const me = await meRes.json();
          role = me?.role ?? "CLIENTE";
          setSession(token, role);

          const nome = me?.nome ?? "";
          if (nome) localStorage.setItem("me_name", nome);
        }
      } catch {
        // se falhar, fica CLIENTE
      }

      // 4) redirect correto
      const defaultDash = dashboardForRole(role);

      // se next vier vazio ou for "/" ou for página pública -> ignora e manda pro dashboard
      const next =
        nextParam && nextParam.startsWith("/") && nextParam !== "/" && !nextParam.startsWith("/auth")
          ? nextParam
          : defaultDash;

      location.href = next;
    } catch (e: any) {
      setErr(e?.message ?? "Falha ao comunicar com o servidor");
    } finally {
      setLoading(false);
    }
  }

  return (
<div  style={{ maxWidth: 420, margin: "40px auto", border: "1px solid #ddd", borderRadius: 10, padding: 16, background: "white" }}>
   

      {err && (
        <div style={{ marginTop: 10, padding: 10, border: "1px solid #f5b5b5", background: "#fff2f2", color: "#b00020", borderRadius: 8 }}>
          {err}
        </div>
      )}
      {/* Card lateral */}

      <div> 
        <h2 style={{ color: "black", fontSize: "24px", fontWeight: "bold", marginBottom: "30px", letterSpacing: "-0.5px", textAlign: "center" }}>Login</h2>
        <form onSubmit={submit} style={{ display: "grid", gap: 12, marginTop: 12 }}>
        <Field label="Email" error={fe.email}>
          <Input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="ex: cliente@mail.com" autoComplete="email"
          className="outline-none " />
        </Field>

        <Field label="Senha" error={fe.password}>
          <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" style={{ 
  color: "gray", 
  fontSize: "24px", 
  fontWeight: "bold", 
  marginBottom: "30px", 
  letterSpacing: "-0.5px",
  outline: "none" 
}}/>
        </Field>

        <Button type="submit" disabled={loading} style={{background:"orangered"}}>
          {loading ? "A entrar..." : "Entrar"}
        </Button>
      </form>
      </div>

      
    </div>
  );
}


