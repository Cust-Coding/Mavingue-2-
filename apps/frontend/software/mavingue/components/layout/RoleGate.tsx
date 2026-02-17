"use client";

import { hasPermission, hasRole } from "@/lib/auth/rbac";
import type { Role } from "@/lib/auth/session";

type Props = {
  role?: Role;
  permissions?: string[];
  allowRoles?: Role[];
  allowPermission?: string;
  children: React.ReactNode;
  fallback?: React.ReactNode;
};

export function RoleGate({
  role,
  permissions,
  allowRoles,
  allowPermission,
  children,
  fallback = null,
}: Props) {
  const okRole = allowRoles ? (role ? hasRole(role, allowRoles) : false) : true;
  const okPerm = allowPermission ? hasPermission(permissions, allowPermission) : true;

  if (!okRole || !okPerm) return <>{fallback}</>;
  return <>{children}</>;
}
