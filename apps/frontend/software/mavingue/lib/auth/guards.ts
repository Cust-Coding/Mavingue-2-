"use client";

import { useAuthStore } from "@/store/auth.store";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { Role, hasRole } from "./rbac";

export function useRequireAuth(allowedRoles?: Role[]) {
  const router = useRouter();
  const pathname = usePathname();
  const token = useAuthStore((s) => s.token);
  const role = useAuthStore((s) => s.role);

  useEffect(() => {
    if (!token) {
      router.replace(`/auth/login?next=${encodeURIComponent(pathname)}`);
      return;
    }
    if (allowedRoles && role && !hasRole(role, allowedRoles)) {
      router.replace("/forbidden");
    }
  }, [token, role, allowedRoles, router, pathname]);

  return { token, role };
}
