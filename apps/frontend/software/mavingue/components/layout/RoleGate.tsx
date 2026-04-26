"use client";

import { ReactNode, useEffect, useMemo, useState } from "react";
import { getRole, Role, isStaff } from "@/lib/auth/session";

type Allow = ("ADMIN" | "STAFF" | "FUNCIONARIO" | "CLIENTE")[];

export default function RoleGate({ allow, children }: { allow: Allow; children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [role, setRole] = useState<Role | null>(null);

  const allowKey = useMemo(() => allow.join("|"), [allow]);
  const allowedSet = useMemo(() => new Set(allow), [allowKey]);

  useEffect(() => {
    const currentRole = getRole();
    setRole(currentRole);
    setReady(true);

    if (!currentRole) {
      location.replace("/auth/login");
      return;
    }

    const ok =
      allowedSet.has(currentRole) ||
      (allowedSet.has("STAFF") && isStaff(currentRole)) ||
      (allowedSet.has("FUNCIONARIO") && isStaff(currentRole));

    if (!ok) {
      location.replace("/forbidden");
    }
  }, [allowedSet]);

  if (!ready) return null;

  const ok =
    role &&
    (allowedSet.has(role) ||
      (allowedSet.has("STAFF") && isStaff(role)) ||
      (allowedSet.has("FUNCIONARIO") && isStaff(role)));

  if (!ok) return null;

  return <>{children}</>;
}
