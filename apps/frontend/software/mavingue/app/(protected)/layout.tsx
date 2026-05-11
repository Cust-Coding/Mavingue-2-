'use client';

import Topbar from '@/components/layout/Topbar';

export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <Topbar />
      <div className="pt-[var(--app-topbar-offset)]">{children}</div>
    </div>
  );
}
