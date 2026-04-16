export type Role = "ADMIN" | "STAFF" | "CLIENTE";

export function setSession(token: string, role: Role) {
  if (typeof window === "undefined") return;

  localStorage.setItem("token", token);
  localStorage.setItem("role", role);

  document.cookie = `token=${encodeURIComponent(token)}; path=/; SameSite=Lax`;
  document.cookie = `role=${encodeURIComponent(role)}; path=/; SameSite=Lax`;
}

export function clearSession() {
  if (typeof window === "undefined") return;

  localStorage.removeItem("token");
  localStorage.removeItem("role");

  document.cookie = "token=; path=/; Max-Age=0";
  document.cookie = "role=; path=/; Max-Age=0";
}

export function getRole(): Role | null {
  if (typeof window === "undefined") return null;
  return (localStorage.getItem("role") as Role | null) ?? null;
}