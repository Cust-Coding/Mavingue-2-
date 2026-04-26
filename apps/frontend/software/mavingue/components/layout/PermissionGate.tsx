"use client";

import { ReactNode, useEffect, useMemo, useState } from "react";
import { getSessionUser, hasAnyPermission } from "@/lib/auth/session";

type PermissionGateProps = {
  permissions: string[];
  children: ReactNode;
};

export default function PermissionGate({ permissions, children }: PermissionGateProps) {
  const [ready, setReady] = useState(false);
  const user = useMemo(() => getSessionUser(), []);

  useEffect(() => {
    if (!user) {
      location.replace("/auth/login");
      return;
    }

    if (permissions.length > 0 && user.role !== "ADMIN" && !hasAnyPermission(permissions)) {
      location.replace("/forbidden");
      return;
    }

    setReady(true);
  }, [permissions, user]);

  if (!ready) return null;

  return <>{children}</>;
}
