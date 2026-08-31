"use client";
import React, { useEffect, useState } from 'react';
import { 
  Users, Monitor, CalendarCheck, CalendarX, Activity, 
  ChevronDown, ArrowRight, BellRing, Settings, RefreshCw, Clock
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { dashboardApi, DashboardStats } from '../../src/modules/dashboard/services/dashboard.service';

const StatCard = ({ title, value, icon: Icon, trend, trendUp, colorClass, bgClass }: any) => (
  <div className="card p-6 flex flex-col justify-between transition-all hover:shadow-md hover:border-[var(--text-muted)] group">
    <div className="flex items-start justify-between">
      <div className={`p-3 rounded-2xl ${bgClass} ${colorClass} transition-transform group-hover:scale-110`}>
        <Icon size={24} />
      </div>
      <div className={`flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full ${trendUp ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
        {trendUp ? '↑' : '↓'} {trend}
      </div>
    </div>
    <div className="mt-6">
      <h3 className="text-3xl font-bold tracking-tight text-[var(--text-primary)]">{value}</h3>
      <p className="text-sm font-medium text-[var(--text-secondary)] mt-1">{title}</p>
    </div>
  </div>
);

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await dashboardApi.getStats();
        if (data.success) setStats(data.data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  const s = stats || {
    totalUsers: 520,
    totalDevices: 8,
    activeDevices: 7,
    presentToday: 431,
    absentToday: 89,
    recentActivity: []
  };

  const overviewData = [
    { name: 'Present', value: 431, color: '#10b981' }, // emerald-500
    { name: 'Late', value: 27, color: '#f59e0b' },    // amber-500
    { name: 'Absent', value: 62, color: '#ef4444' },   // red-500
  ];

  return (
    <div className="max-w-[1400px] mx-auto p-4 md:p-8 space-y-10">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-[var(--text-primary)]">Overview</h1>
          <p className="text-[var(--text-secondary)] mt-1 text-sm">Here's what's happening today in your organization.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2.5 bg-[var(--surface-2)] border border-[var(--border)] hover:bg-[var(--surface-hover)] rounded-xl text-sm font-medium transition-colors">
            <RefreshCw size={16} className="text-[var(--text-muted)]" />
            Sync Now
          </button>
          <button className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-medium transition-colors shadow-sm">
            <CalendarCheck size={16} /> 
            {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
            <ChevronDown size={14} className="ml-1 opacity-70" />
          </button>
        </div>
      </div>

      {/* Primary KPI Cards - Clean & Large */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Total Employees" value={s.totalUsers || 520} icon={Users} 
          trend="12%" trendUp={true} colorClass="text-blue-500" bgClass="bg-blue-500/10" 
        />
        <StatCard 
          title="Present Today" value={s.presentToday || 431} icon={CalendarCheck} 
          trend="14%" trendUp={true} colorClass="text-emerald-500" bgClass="bg-emerald-500/10" 
        />
        <StatCard 
          title="Absent Today" value={s.absentToday || 89} icon={CalendarX} 
          trend="2%" trendUp={false} colorClass="text-amber-500" bgClass="bg-amber-500/10" 
        />
        <StatCard 
          title="Active Devices" value={`${s.activeDevices || 7} / ${s.totalDevices || 8}`} icon={Monitor} 
          trend="87%" trendUp={true} colorClass="text-purple-500" bgClass="bg-purple-500/10" 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Main Feed: Recent Activity */}
        <div className="lg:col-span-2 card">
          <div className="p-6 border-b border-[var(--border)] flex justify-between items-center">
            <h2 className="text-lg font-bold text-[var(--text-primary)]">Recent Activity</h2>
            <button className="text-sm font-medium text-blue-500 hover:text-blue-400 transition-colors flex items-center gap-1">
              View All <ArrowRight size={14} />
            </button>
          </div>
          
          <div className="p-2">
            <div className="divide-y divide-[var(--border)]">
              {/* Activity Item 1 */}
              <div className="p-4 flex items-center gap-5 hover:bg-[var(--surface-2)]/50 rounded-xl transition-colors group">
                <div className="w-10 h-10 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0">
                  <Users size={18} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[var(--text-primary)] truncate">
                    Rahim Ahmed <span className="font-normal text-[var(--text-secondary)]">marked attendance</span>
                  </p>
                  <p className="text-xs text-[var(--text-muted)] mt-1">Main Gate Sensor</p>
                </div>
                <div className="text-right shrink-0">
                  <span className="inline-flex px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-500 text-[10px] font-bold uppercase tracking-wider">Present</span>
                  <p className="text-xs text-[var(--text-muted)] mt-1">10:45 AM</p>
                </div>
              </div>

              {/* Activity Item 2 */}
              <div className="p-4 flex items-center gap-5 hover:bg-[var(--surface-2)]/50 rounded-xl transition-colors group">
                <div className="w-10 h-10 rounded-full bg-amber-500/10 text-amber-500 flex items-center justify-center shrink-0">
                  <Clock size={18} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[var(--text-primary)] truncate">
                    Karim Hasan <span className="font-normal text-[var(--text-secondary)]">checked in late</span>
                  </p>
                  <p className="text-xs text-[var(--text-muted)] mt-1">Main Gate Sensor</p>
                </div>
                <div className="text-right shrink-0">
                  <span className="inline-flex px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-500 text-[10px] font-bold uppercase tracking-wider">Late</span>
                  <p className="text-xs text-[var(--text-muted)] mt-1">10:15 AM</p>
                </div>
              </div>

              {/* Activity Item 3 */}
              <div className="p-4 flex items-center gap-5 hover:bg-[var(--surface-2)]/50 rounded-xl transition-colors group">
                <div className="w-10 h-10 rounded-full bg-purple-500/10 text-purple-500 flex items-center justify-center shrink-0">
                  <Monitor size={18} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[var(--text-primary)] truncate">
                    Device 02 <span className="font-normal text-[var(--text-secondary)]">reconnected to server</span>
                  </p>
                  <p className="text-xs text-[var(--text-muted)] mt-1">Library Entrance</p>
                </div>
                <div className="text-right shrink-0">
                  <span className="inline-flex px-2.5 py-1 rounded-full bg-purple-500/10 text-purple-500 text-[10px] font-bold uppercase tracking-wider">System</span>
                  <p className="text-xs text-[var(--text-muted)] mt-1">09:30 AM</p>
                </div>
              </div>

              {/* Activity Item 4 */}
              <div className="p-4 flex items-center gap-5 hover:bg-[var(--surface-2)]/50 rounded-xl transition-colors group">
                <div className="w-10 h-10 rounded-full bg-red-500/10 text-red-500 flex items-center justify-center shrink-0">
                  <BellRing size={18} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[var(--text-primary)] truncate">
                    5 Students <span className="font-normal text-[var(--text-secondary)]">marked absent automatically</span>
                  </p>
                  <p className="text-xs text-[var(--text-muted)] mt-1">Session Closed</p>
                </div>
                <div className="text-right shrink-0">
                  <span className="inline-flex px-2.5 py-1 rounded-full bg-red-500/10 text-red-500 text-[10px] font-bold uppercase tracking-wider">Alert</span>
                  <p className="text-xs text-[var(--text-muted)] mt-1">10:30 AM</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Secondary Info: Charts & Status */}
        <div className="space-y-8">
          
          {/* Donut Chart */}
          <div className="card p-6 flex flex-col items-center">
            <h3 className="text-base font-semibold text-[var(--text-primary)] self-start w-full mb-6">Attendance Distribution</h3>
            <div className="w-56 h-56 relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={overviewData}
                    cx="50%" cy="50%"
                    innerRadius="65%" outerRadius="85%"
                    stroke="none"
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {overviewData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-4xl font-bold text-[var(--text-primary)]">520</span>
                <span className="text-xs font-semibold text-[var(--text-secondary)] tracking-widest uppercase mt-1">Total</span>
              </div>
            </div>
            
            <div className="w-full space-y-3 mt-8">
              <div className="flex justify-between items-center bg-[var(--surface-2)] px-4 py-2.5 rounded-lg">
                <div className="flex items-center gap-2 text-sm font-medium text-[var(--text-primary)]">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500"></div>Present
                </div>
                <div className="text-sm font-bold">431 <span className="text-xs font-normal text-[var(--text-muted)] ml-1">(82%)</span></div>
              </div>
              <div className="flex justify-between items-center bg-[var(--surface-2)] px-4 py-2.5 rounded-lg">
                <div className="flex items-center gap-2 text-sm font-medium text-[var(--text-primary)]">
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-500"></div>Late
                </div>
                <div className="text-sm font-bold">27 <span className="text-xs font-normal text-[var(--text-muted)] ml-1">(5%)</span></div>
              </div>
              <div className="flex justify-between items-center bg-[var(--surface-2)] px-4 py-2.5 rounded-lg">
                <div className="flex items-center gap-2 text-sm font-medium text-[var(--text-primary)]">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-500"></div>Absent
                </div>
                <div className="text-sm font-bold">62 <span className="text-xs font-normal text-[var(--text-muted)] ml-1">(13%)</span></div>
              </div>
            </div>
          </div>

        </div>
      </div>

    </div>
  );
}
