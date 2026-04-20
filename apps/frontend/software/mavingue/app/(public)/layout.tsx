'use client';

import { useEffect, useState } from 'react';
import Topbar from '@/components/layout/Topbar';
import Footer from '@/components/layout/Footer';

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    const splashTimer = setTimeout(() => {
      setShowSplash(false);
    }, 700);

    return () => clearTimeout(splashTimer);
  }, []);

  // Splash Screen
  if (showSplash) {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-gradient-to-br from-orange-50 to-white dark:from-slate-950 dark:to-slate-900">
        <div className="text-center animate-in fade-in zoom-in duration-700">
          <div className="text-7xl font-black tracking-tighter text-orange-600 dark:text-orange-500 mb-4">
            M
          </div>
          <h1 className="text-2xl font-bold text-slate-700 dark:text-slate-200 mb-2">
            Materiais de Construção
          </h1>
          <div className="flex gap-2 justify-center mt-6">
            <div className="w-2 h-2 rounded-full bg-orange-600 animate-bounce [animation-delay:-0.3s]"></div>
            <div className="w-2 h-2 rounded-full bg-orange-600 animate-bounce [animation-delay:-0.15s]"></div>
            <div className="w-2 h-2 rounded-full bg-orange-600 animate-bounce"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950">
      <Topbar />
      <div className="pt-[var(--app-topbar-offset)]">{children}</div>
      <Footer />
    </div>
  );
}
