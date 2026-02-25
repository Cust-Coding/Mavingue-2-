"use client";

export type Role = "ADMIN" | "STAFF" | "FUNCIONARIO" | "CLIENTE";

const COOKIE_BASE = "Path=/; SameSite=Lax";

function setCookie(name: string, value: string, maxAgeSeconds = 60 * 60 * 24 * 7) {
  document.cookie = `${name}=${encodeURIComponent(value)}; ${COOKIE_BASE}; Max-Age=${maxAgeSeconds}`;
}

function delCookie(name: string) {
  // precisa repetir Path/SameSite senão às vezes não apaga
  document.cookie = `${name}=; ${COOKIE_BASE}; Max-Age=0`;
}

export function setSession(token: string, role: Role | string) {
  if (typeof window === "undefined") return;

  // aceita STAFF ou FUNCIONARIO (ou qualquer string do backend)
  const r = String(role) as Role;

  localStorage.setItem("token", token);
  localStorage.setItem("role", r);

  setCookie("token", token);
  setCookie("role", r);
}

export function clearSession() {
  if (typeof window === "undefined") return;

  localStorage.removeItem("token");
  localStorage.removeItem("role");

  delCookie("token");
  delCookie("role");
}

export function getRole(): Role | null {
  if (typeof window === "undefined") return null;

  const r = localStorage.getItem("role");
  if (!r) return null;

  // garante compatibilidade se vier FUNCIONARIO
  if (r === "ADMIN" || r === "STAFF" || r === "FUNCIONARIO" || r === "CLIENTE") return r;
  return null;
}

export function isStaff(role: Role | null) {
  return role === "STAFF" || role === "FUNCIONARIO";
}