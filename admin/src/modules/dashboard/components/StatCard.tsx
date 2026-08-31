import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: string;
  trendUp?: boolean;
  colorClass?: string;
}

export function StatCard({ title, value, icon: Icon, trend, trendUp, colorClass = "text-blue-500" }: StatCardProps) {
  return (
    <div className="stat-card">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-[var(--text-secondary)]">{title}</p>
          <h3 className="text-2xl font-bold mt-2 text-[var(--text-primary)]">{value}</h3>
        </div>
        <div className={`p-3 rounded-xl bg-[var(--surface-2)] ${colorClass}`}>
          <Icon size={20} />
        </div>
      </div>
      
      {trend && (
        <div className="mt-4 flex items-center gap-2">
          <span className={`text-xs font-medium ${trendUp ? 'text-green-500' : 'text-red-500'}`}>
            {trendUp ? '↑' : '↓'} {trend}
          </span>
          <span className="text-xs text-[var(--text-muted)]">vs last month</span>
        </div>
      )}
    </div>
  );
}
