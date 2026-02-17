import { ReactNode } from "react";
import { getMe } from "@/lib/auth/session";
import { redirect } from "next/navigation";

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const me = await getMe().catch(() => null);
  if (!me) redirect("/auth/login");
  if (me.role !== "ADMIN") redirect("/forbidden");

  return <>{children}</>;
}
