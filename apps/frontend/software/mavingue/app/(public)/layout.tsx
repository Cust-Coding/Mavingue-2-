'use client';

import { useEffect, useState } from 'react';
import Topbar from '@/components/layout/Topbar';

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div>
        <div className="sticky top-0 z-50 w-full border-b border-slate-200 bg-gray-100/80 backdrop-blur-md dark:border-slate-800 dark:bg-slate-950/80">
          <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
            <div className="h-8 w-24 bg-orange-200 animate-pulse rounded dark:bg-orange-900/30"></div>
          </div>
        </div>
        {children}
      </div>
    );
  }

  return (
    <>
      <Topbar />
      {children}
    </>
  );
}