"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { clearSession, getRole } from "@/lib/auth/session";

function firstName(full?: string) {
  if (!full) return "";
  const t = full.trim().split(/\s+/);
  return t[0] ?? "";
}

function PersonIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="currentColor"
        d="M12 12c2.76 0 5-2.46 5-5.5S14.76 1 12 1 7 3.46 7 6.5 9.24 12 12 12Zm0 2c-4.42 0-8 2.24-8 5v2h16v-2c0-2.76-3.58-5-8-5Z"
      />
    </svg>
  );
}

export default function Topbar() {
  const role = getRole();
  const [meName, setMeName] = useState<string>("");
  const [open, setOpen] = useState(false);
  const boxRef = useRef<HTMLDivElement | null>(null);

  // buscar /me só se estiver logado
  useEffect(() => {
    if (!role) {
      setMeName("");
      return;
    }

    // cache rápido (evita flicker)
    const cached = localStorage.getItem("me_name");
    if (cached) setMeName(cached);

    (async () => {
      try {
        const res = await fetch("/api/proxy/api/auth/me", { method: "GET", credentials: "include" });
        if (!res.ok) return;
        const me = await res.json();

        // teu MeResponse: (id, nome, email, role)
        const nome = me?.nome ?? me?.name ?? "";
        if (nome) {
          setMeName(nome);
          localStorage.setItem("me_name", nome);
        }
      } catch {
        // ignora
      }
    })();
  }, [role]);

  // fechar dropdown ao clicar fora
  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (!boxRef.current) return;
      if (!boxRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  const displayName = firstName(meName) || (role ? "Conta" : "");

  const profileHref =
    role === "ADMIN"
      ? "/admin"
      : role === "CLIENTE"
      ? "/cliente/perfil"
      : role === "FUNCIONARIO" || role === "STAFF"
      ? "/staff"
      : "/";

  return (
    <div style={{ borderBottom: "1px solid #ddd", background: "white" }}>
      <div
        style={{
          maxWidth: 1100,
          margin: "0 auto",
          padding: 12,
          display: "flex",
          justifyContent: "space-between",
          gap: 12,
          alignItems: "center",
        }}
      >
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <Link href="/" style={{ fontWeight: 700 }}>
            Mavingue
          </Link>
          <Link href="/catalogo">Catálogo</Link>
        </div>

        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          {!role ? (
            <>
              <Link href="/auth/register">Criar conta</Link>
              <Link href="/auth/login">Login</Link>
            </>
          ) : (
            <div ref={boxRef} style={{ position: "relative", display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ fontSize: 14, color: "#111" }}>{displayName}</span>

              <button
                type="button"
                onClick={() => setOpen((v) => !v)}
                aria-label="Conta"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: 36,
                  height: 36,
                  borderRadius: 10,
                  border: open ? "1px solid #111" : "1px solid #ddd",
                  background: open ? "#f5f5f5" : "white",
                  cursor: "pointer",
                }}
              >
                <PersonIcon />
              </button>

              {open && (
                <div
                  style={{
                    position: "absolute",
                    right: 0,
                    top: 44,
                    width: 190,
                    border: "1px solid #ddd",
                    borderRadius: 10,
                    background: "white",
                    boxShadow: "0 10px 30px rgba(0,0,0,.08)",
                    overflow: "hidden",
                  }}
                >
                  <Link
                    href={profileHref}
                    onClick={() => setOpen(false)}
                    style={{ display: "block", padding: "10px 12px", fontSize: 14 }}
                  >
                    Perfil
                  </Link>

                  <button
                    type="button"
                    onClick={() => {
                      setOpen(false);
                      clearSession();
                      localStorage.removeItem("me_name");
                      location.href = "/";
                    }}
                    style={{
                      width: "100%",
                      textAlign: "left",
                      padding: "10px 12px",
                      fontSize: 14,
                      border: "0",
                      background: "white",
                      cursor: "pointer",
                      borderTop: "1px solid #eee",
                    }}
                  >
                    Sair
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}