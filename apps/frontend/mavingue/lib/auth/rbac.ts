export type Role = "ADMIN" | "STAFF" | "CLIENTE";

export function hasRole(userRole: Role | null, allowed: Role[]) {
  if (!userRole) return false;
  return allowed.includes(userRole);
}
