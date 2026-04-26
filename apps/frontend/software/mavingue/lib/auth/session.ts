"use client";

export type Role = "ADMIN" | "STAFF" | "FUNCIONARIO" | "CLIENTE";
export type UserStatus = "PENDENTE_VERIFICACAO" | "PENDENTE_REVISAO" | "ATIVO" | "INATIVO";

export type SessionUser = {
  id: number;
  nome: string;
  email: string | null;
  phone: string;
  role: Role;
  status: UserStatus;
  permissions: string[];
};

const COOKIE_BASE = "Path=/; SameSite=Lax";
const STORAGE_USER_KEY = "session_user";
const STORAGE_TOKEN_KEY = "token";
const STORAGE_ROLE_KEY = "role";

function setCookie(name: string, value: string, maxAgeSeconds = 60 * 60 * 24 * 7) {
  document.cookie = `${name}=${encodeURIComponent(value)}; ${COOKIE_BASE}; Max-Age=${maxAgeSeconds}`;
}

function delCookie(name: string) {
  document.cookie = `${name}=; ${COOKIE_BASE}; Max-Age=0`;
}

export function setSession(token: string, user: SessionUser) {
  if (typeof window === "undefined") return;

  localStorage.setItem(STORAGE_TOKEN_KEY, token);
  localStorage.setItem(STORAGE_ROLE_KEY, user.role);
  localStorage.setItem(STORAGE_USER_KEY, JSON.stringify(user));

  setCookie("token", token);
  setCookie("role", user.role);
}

export function updateSessionUser(user: SessionUser) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_ROLE_KEY, user.role);
  localStorage.setItem(STORAGE_USER_KEY, JSON.stringify(user));
  setCookie("role", user.role);
}

export function clearSession() {
  if (typeof window === "undefined") return;

  localStorage.removeItem(STORAGE_TOKEN_KEY);
  localStorage.removeItem(STORAGE_ROLE_KEY);
  localStorage.removeItem(STORAGE_USER_KEY);
  localStorage.removeItem("me_name");

  delCookie("token");
  delCookie("role");
}

export function getSessionUser(): SessionUser | null {
  if (typeof window === "undefined") return null;

  const raw = localStorage.getItem(STORAGE_USER_KEY);
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw) as SessionUser;
    if (!parsed?.role || !parsed?.id) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function getRole(): Role | null {
  const user = getSessionUser();
  if (user?.role) return user.role;

  if (typeof window === "undefined") return null;
  const role = localStorage.getItem(STORAGE_ROLE_KEY);
  if (role === "ADMIN" || role === "STAFF" || role === "FUNCIONARIO" || role === "CLIENTE") {
    return role;
  }
  return null;
}

export function getPermissions(): string[] {
  return getSessionUser()?.permissions ?? [];
}

export function hasPermission(permission: string) {
  const user = getSessionUser();
  if (!user) return false;
  if (user.role === "ADMIN") return true;
  return user.permissions.includes(permission);
}

export function hasAnyPermission(permissions: string[]) {
  if (!permissions.length) return true;
  return permissions.some((permission) => hasPermission(permission));
}

export function isStaff(role: Role | null) {
  return role === "STAFF" || role === "FUNCIONARIO";
}
