"use client";
import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  LayoutDashboard, Users, Monitor, Fingerprint, 
  CalendarDays, FileBarChart2, Settings, LogOut, 
  Shield, Activity 
} from 'lucide-react';
import { clearSession } from '../../lib/auth/session';

const NAV_ITEMS = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Students', href: '/users', icon: Users },
  { name: 'Devices', href: '/devices', icon: Monitor },
  { name: 'Biometrics', href: '/biometrics', icon: Fingerprint },
  { name: 'Attendance', href: '/attendance', icon: CalendarDays },
  { name: 'Reports', href: '/reports', icon: FileBarChart2 },
  { name: 'Audit Log', href: '/audit', icon: Shield },
  { name: 'Settings', href: '/settings', icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = () => {
    clearSession();
    document.cookie = 'smartbio_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    router.push('/login');
  };

  return (
    <aside className="w-64 flex-shrink-0 flex flex-col h-screen fixed left-0 top-0 bg-[var(--surface)] border-r border-[var(--border)]">
      {/* Logo */}
      <div className="h-16 flex items-center px-5 border-b border-[var(--border)]">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/25">
            <Fingerprint size={16} className="text-white" />
          </div>
          <span className="font-bold text-lg text-white tracking-tight">SmartBio</span>
        </div>
      </div>
      
      {/* Nav */}
      <nav className="flex-1 py-4 px-3 space-y-0.5 overflow-y-auto">
        <p className="px-3 py-2 text-[10px] font-semibold text-[var(--text-muted)] uppercase tracking-widest">Main Menu</p>
        {NAV_ITEMS.slice(0, 5).map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link key={item.name} href={item.href}>
              <div className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 cursor-pointer ${
                isActive 
                  ? 'bg-blue-600/15 text-blue-400 border border-blue-500/20' 
                  : 'text-[var(--text-secondary)] hover:bg-[var(--surface-2)] hover:text-[var(--text-primary)]'
              }`}>
                <Icon size={17} className={isActive ? 'text-blue-400' : ''} />
                {item.name}
                {isActive && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-blue-400" />}
              </div>
            </Link>
          );
        })}

        <p className="px-3 pt-4 pb-2 text-[10px] font-semibold text-[var(--text-muted)] uppercase tracking-widest">System</p>
        {NAV_ITEMS.slice(5).map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link key={item.name} href={item.href}>
              <div className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 cursor-pointer ${
                isActive 
                  ? 'bg-blue-600/15 text-blue-400 border border-blue-500/20' 
                  : 'text-[var(--text-secondary)] hover:bg-[var(--surface-2)] hover:text-[var(--text-primary)]'
              }`}>
                <Icon size={17} className={isActive ? 'text-blue-400' : ''} />
                {item.name}
              </div>
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-3 border-t border-[var(--border)]">
        <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-[var(--surface-2)] transition-colors mb-1">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
            SA
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-[var(--text-primary)] truncate">Super Admin</p>
            <p className="text-xs text-[var(--text-muted)] truncate">admin@smartbio.local</p>
          </div>
        </div>
        <button 
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer"
        >
          <LogOut size={17} />
          Logout
        </button>
      </div>
    </aside>
  );
}
