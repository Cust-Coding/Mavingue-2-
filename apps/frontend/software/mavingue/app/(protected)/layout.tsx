import { ReactNode } from "react";
import { getMe } from "@/lib/auth/session";
import { redirect } from "next/navigation";

export default async function ProtectedLayout({ children }: { children: ReactNode }) {
  let me;
  try {
    me = await getMe();
  } catch {
    redirect("/auth/login");
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Aqui podes colocar provider/context */}
      {children}
    </div>
  );
}
