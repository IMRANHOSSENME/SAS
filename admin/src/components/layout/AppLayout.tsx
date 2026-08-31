"use client";

import React from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { usePathname } from 'next/navigation';

export function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  
  // Don't show layout on login page
  if (pathname === '/login') {
    return <>{children}</>;
  }

  return (
    <div className="flex min-h-screen bg-[var(--background)]">
      <Sidebar />
      <div className="flex-1 flex flex-col pl-64">
        {/* We add pl-64 to offset the fixed sidebar width of 64 (16rem) */}
        <Header />
        <main className="flex-1 p-8 pt-4">
          {children}
        </main>
      </div>
    </div>
  );
}
