"use client";

import { useAuthStore } from "@/store/auth.store";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { Role, hasRole } from "./rbac";

export function useRequireAuth(allowedRoles?: Role[]) {
  const router = useRouter();
  const pathname = usePathname();
  const session = useAuthStore((s) => s.session);

  useEffect(() => {
    if (!session) {
      router.replace(`/auth/login?next=${encodeURIComponent(pathname)}`);
      return;
    }
    if (allowedRoles && !hasRole(session.role, allowedRoles)) {
      router.replace("/forbidden");
    }
  }, [session, allowedRoles, router, pathname]);

  return session;
}
