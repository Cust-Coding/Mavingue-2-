import type { Role } from "@/lib/auth/session";

export function hasRole(userRole: Role, allowed: Role[]) {
  return allowed.includes(userRole);
}

export function hasPermission(perms: string[] | undefined, required: string) {
  if (!perms) return false;
  return perms.includes(required);
}
