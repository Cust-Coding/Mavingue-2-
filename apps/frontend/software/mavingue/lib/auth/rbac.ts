export type Role = "ADMIN" | "STAFF" | "FUNCIONARIO" | "CLIENTE";

export function hasRole(userRole: Role | null, allowed: Role[]) {
  if (!userRole) return false;
  if (userRole === "FUNCIONARIO" && allowed.includes("STAFF")) return true;
  if (userRole === "STAFF" && allowed.includes("FUNCIONARIO")) return true;
  return allowed.includes(userRole);
}
