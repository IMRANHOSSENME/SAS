"use client";
import React from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Bell, Search, LogOut } from 'lucide-react';
import { clearSession } from '../../lib/auth/session';

const PAGE_TITLES: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/users': 'Employees',
  '/devices': 'Devices',
  '/biometrics': 'Biometrics',
  '/attendance': 'Attendance',
  '/reports': 'Reports',
  '/audit': 'Audit Log',
  '/settings': 'Settings',
};

export function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const title = PAGE_TITLES[pathname] || 'SmartBio';
  
  const handleLogout = () => {
    clearSession();
    document.cookie = 'smartbio_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    router.push('/login');
  };

  return (
    <header className="h-16 flex items-center justify-between px-6 border-b border-[var(--border)] bg-[var(--surface)] sticky top-0 z-10">
      <div>
        <h1 className="text-lg font-semibold text-[var(--text-primary)]">{title}</h1>
      </div>
      
      <div className="flex items-center gap-2">
        <button className="p-2 rounded-lg text-[var(--text-secondary)] hover:bg-[var(--surface-2)] hover:text-[var(--text-primary)] transition-colors">
          <Search size={18} />
        </button>
        <button className="relative p-2 rounded-lg text-[var(--text-secondary)] hover:bg-[var(--surface-2)] hover:text-[var(--text-primary)] transition-colors">
          <Bell size={18} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-blue-500 rounded-full border-2 border-[var(--surface)]" />
        </button>
        <div className="w-px h-5 bg-[var(--border)] mx-1" />
        <button 
          onClick={handleLogout}
          className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-red-400 hover:bg-red-500/10 transition-colors"
        >
          <LogOut size={15} />
          Logout
        </button>
      </div>
    </header>
  );
}
