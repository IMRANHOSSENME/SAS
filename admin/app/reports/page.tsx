"use client";
import React, { useState, useEffect } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, LineChart, Line, Legend
} from 'recharts';
import { 
  Calendar, Download, Filter, Users, Clock, AlertTriangle, CheckCircle2, ChevronDown, Info
} from 'lucide-react';
import apiClient from '../../src/lib/api/client';
import { format, subDays } from 'date-fns';

const sparklineData1 = Array.from({length: 12}, () => ({ value: Math.random() * 10 + 20 }));
const sparklineData2 = Array.from({length: 12}, () => ({ value: Math.random() * 10 + 40 }));
const sparklineData4 = Array.from({length: 12}, () => ({ value: Math.random() * 5 + 80 }));

const StatCardWithChart = ({ title, value, icon: Icon, trend, trendUp, color, chartData, isProgressBar, progressValue }: any) => (
  <div className="card p-5 relative overflow-hidden flex flex-col justify-between border border-[var(--border)] bg-[var(--surface-2)]/30">
    <div className="flex items-start justify-between z-10">
      <div className="flex items-center gap-3">
        <div className="p-2.5 rounded-xl bg-[var(--surface)] border border-[var(--border)]" style={{ color }}>
          <Icon size={20} />
        </div>
        <div>
          <p className="text-sm font-medium text-[var(--text-secondary)]">{title}</p>
          <h3 className="text-3xl font-bold mt-1 text-[var(--text-primary)]">{value}</h3>
        </div>
      </div>
      <span className="text-xs font-bold px-2 py-1 rounded bg-[var(--surface)] border border-[var(--border)]" style={{ color: trendUp ? '#22c55e' : '#ef4444' }}>
        {trendUp ? '↑' : '↓'} {trend}
      </span>
    </div>
    
    <div className="mt-6 flex items-center justify-between text-xs text-[var(--text-muted)] z-10">
      <span style={{ color: trendUp ? '#22c55e' : '#ef4444' }}>{trendUp ? '↑' : '↓'} {trend}</span> vs yesterday
      
      {isProgressBar ? (
        <div className="w-24 h-1.5 bg-[var(--surface)] rounded-full overflow-hidden border border-[var(--border)]">
          <div className="h-full rounded-full" style={{ width: `${progressValue}%`, backgroundColor: color }}></div>
        </div>
      ) : (
        <div className="w-24 h-10 -mr-2">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 5, bottom: 5, left: 0, right: 0 }}>
              <YAxis domain={['dataMin - 5', 'dataMax + 5']} hide />
              <Line type="monotone" dataKey="value" stroke={color} strokeWidth={2} dot={false} isAnimationActive={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  </div>
);

export default function ReportsPage() {
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState({ present: 0, late: 0, totalScans: 0 });
  const [chartData, setChartData] = useState<any[]>([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const today = format(new Date(), 'yyyy-MM-dd');
      const sumRes = await apiClient.get(`/attendance/summary?date=${today}`);
      setSummary(sumRes.data);

      const mockData = [];
      for (let i = 6; i >= 1; i--) {
        const date = format(subDays(new Date(), i), 'MMM dd');
        mockData.push({
          name: date,
          Present: Math.floor(Math.random() * 50) + 150,
          Late: Math.floor(Math.random() * 20) + 10,
          Absent: Math.floor(Math.random() * 15) + 5,
          Excused: Math.floor(Math.random() * 5),
        });
      }
      mockData.push({
        name: format(new Date(), 'MMM dd'),
        Present: sumRes.data.present || 431,
        Late: sumRes.data.late || 27,
        Absent: 12,
        Excused: 6,
      });
      setChartData(mockData);

    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const overviewData = [
    { name: 'On Time', value: 431, color: '#22c55e' },
    { name: 'Late', value: 27, color: '#f59e0b' },
    { name: 'Absent', value: 0, color: '#ef4444' },
    { name: 'Excused', value: 0, color: '#3b82f6' },
  ];

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-[1400px] mx-auto p-4 md:p-8 space-y-6">
      
      {/* Header section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[var(--text-primary)]">Attendance Reports</h1>
          <p className="text-[var(--text-secondary)] mt-1 text-sm">Comprehensive overview of student attendance and trends.</p>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-[var(--surface-2)] border border-[var(--border)] hover:bg-[var(--surface-hover)] rounded-lg text-sm font-medium transition-colors text-[var(--text-primary)]">
            <Filter size={16} className="text-[var(--text-muted)]" /> Filter
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-[var(--surface-2)] border border-[var(--border)] hover:bg-[var(--surface-hover)] rounded-lg text-sm font-medium transition-colors text-[var(--text-primary)]">
            <Calendar size={16} className="text-[var(--text-muted)]" /> {format(subDays(new Date(), 6), 'MMM dd')} - {format(new Date(), 'MMM dd, yyyy')}
            <ChevronDown size={14} className="ml-1 opacity-70" />
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors shadow-sm">
            <Download size={16} /> Export PDF
            <ChevronDown size={14} className="ml-1" />
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCardWithChart title="Total Present (Today)" value="431" trend="12.4%" trendUp={true} icon={Users} color="#06b6d4" chartData={sparklineData1} />
        <StatCardWithChart title="Late Arrivals" value="27" trend="13.2%" trendUp={false} icon={Clock} color="#f59e0b" chartData={sparklineData2} />
        <StatCardWithChart title="On-Time Rate" value="92.6%" trend="8.7%" trendUp={true} icon={CheckCircle2} color="#22c55e" isProgressBar={true} progressValue={92.6} />
        <StatCardWithChart title="Total Scans" value="1,248" trend="5.1%" trendUp={false} icon={AlertTriangle} color="#ef4444" chartData={sparklineData4} />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Main Bar Chart */}
        <div className="card border border-[var(--border)] bg-[var(--surface-2)]/30 lg:col-span-2 shadow-sm flex flex-col h-[400px]">
          <div className="p-6 border-b border-[var(--border)] flex items-center justify-between">
            <h3 className="text-base font-semibold text-[var(--text-primary)]">Attendance Trends (Last 7 Days)</h3>
            <select className="bg-[var(--surface)] border border-[var(--border)] rounded px-3 py-1 text-xs text-[var(--text-primary)] outline-none">
              <option>Last 7 Days</option>
              <option>Last 30 Days</option>
            </select>
          </div>
          <div className="flex-1 p-6 w-full min-h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 20, right: 20, left: 0, bottom: 5 }} barGap={4}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} opacity={0.5} />
                <XAxis dataKey="name" stroke="var(--text-secondary)" fontSize={11} tickLine={false} axisLine={false} dy={10} />
                <YAxis stroke="var(--text-secondary)" fontSize={11} tickLine={false} axisLine={false} dx={-10} />
                <RechartsTooltip 
                  cursor={{ fill: 'var(--surface-2)', opacity: 0.5 }}
                  contentStyle={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)', borderRadius: '8px', color: 'var(--text-primary)', fontSize: '12px' }}
                />
                <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: '12px', paddingTop: '20px' }} />
                <Bar dataKey="Present" fill="#22C55E" radius={[2, 2, 0, 0]} barSize={16} />
                <Bar dataKey="Late" fill="#F59E0B" radius={[2, 2, 0, 0]} barSize={16} />
                <Bar dataKey="Absent" fill="#EF4444" radius={[2, 2, 0, 0]} barSize={16} />
                <Bar dataKey="Excused" fill="#3b82f6" radius={[2, 2, 0, 0]} barSize={16} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pie Chart */}
        <div className="card border border-[var(--border)] bg-[var(--surface-2)]/30 shadow-sm flex flex-col h-[400px]">
          <div className="p-6 border-b border-[var(--border)]">
            <h3 className="text-base font-semibold text-[var(--text-primary)]">Today's Distribution</h3>
            <p className="text-xs text-[var(--text-secondary)] mt-1">Ratio of on time vs late arrivals.</p>
          </div>
          
          <div className="flex-1 p-6 flex flex-col relative">
            <div className="flex-1 w-full relative mb-4">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={overviewData.filter(d => d.value > 0)}
                    cx="50%" cy="50%"
                    innerRadius="65%" outerRadius="85%"
                    paddingAngle={2}
                    dataKey="value"
                    stroke="none"
                  >
                    {overviewData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex items-center justify-center flex-col pointer-events-none">
                <span className="text-3xl font-bold text-[var(--text-primary)]">458</span>
                <span className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider mt-1">Total</span>
              </div>
            </div>
            
            <div className="space-y-3 px-2">
              <div className="flex justify-between items-center text-sm">
                <div className="flex items-center gap-2 text-[var(--text-primary)]"><div className="w-2.5 h-2.5 rounded-full bg-green-500"></div>On Time</div>
                <div className="font-medium text-[var(--text-primary)]">431 <span className="text-xs text-[var(--text-muted)] ml-1">(94.1%)</span></div>
              </div>
              <div className="flex justify-between items-center text-sm">
                <div className="flex items-center gap-2 text-[var(--text-primary)]"><div className="w-2.5 h-2.5 rounded-full bg-yellow-500"></div>Late</div>
                <div className="font-medium text-[var(--text-primary)]">27 <span className="text-xs text-[var(--text-muted)] ml-1">(5.9%)</span></div>
              </div>
              <div className="flex justify-between items-center text-sm">
                <div className="flex items-center gap-2 text-[var(--text-primary)]"><div className="w-2.5 h-2.5 rounded-full bg-red-500"></div>Absent</div>
                <div className="font-medium text-[var(--text-primary)]">0 <span className="text-xs text-[var(--text-muted)] ml-1">(0%)</span></div>
              </div>
              <div className="flex justify-between items-center text-sm">
                <div className="flex items-center gap-2 text-[var(--text-primary)]"><div className="w-2.5 h-2.5 rounded-full bg-blue-500"></div>Excused</div>
                <div className="font-medium text-[var(--text-primary)]">0 <span className="text-xs text-[var(--text-muted)] ml-1">(0%)</span></div>
              </div>
            </div>

            <div className="mt-4 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg flex items-center gap-2 text-xs text-blue-400">
              <Info size={14} className="shrink-0" />
              Great! On-time rate is above 90%.
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Top Classes */}
        <div className="card border border-[var(--border)] bg-[var(--surface-2)]/30">
          <div className="p-5 border-b border-[var(--border)] flex justify-between items-center">
            <h3 className="text-base font-semibold text-[var(--text-primary)]">Top Classes (By Attendance)</h3>
            <button className="text-xs px-3 py-1.5 bg-[var(--surface)] border border-[var(--border)] rounded hover:bg-[var(--surface-hover)] text-[var(--text-secondary)] transition-colors">View All</button>
          </div>
          <div className="p-0">
            <table className="w-full text-left text-xs whitespace-nowrap">
              <thead className="text-[var(--text-muted)] border-b border-[var(--border)] bg-[var(--surface)]/50">
                <tr>
                  <th className="px-5 py-3 font-medium w-8">#</th>
                  <th className="px-5 py-3 font-medium">Class</th>
                  <th className="px-5 py-3 font-medium">On-Time Rate</th>
                  <th className="px-5 py-3 font-medium">Present</th>
                  <th className="px-5 py-3 font-medium">Late</th>
                  <th className="px-5 py-3 font-medium">Absent</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]">
                {[
                  { name: 'CSE 12 A', rate: 96.5, p: 56, l: 2, a: 1 },
                  { name: 'CSE 11 B', rate: 94.2, p: 49, l: 3, a: 1 },
                  { name: 'Science 10 A', rate: 91.3, p: 42, l: 4, a: 2 },
                  { name: 'Business 12 A', rate: 89.8, p: 53, l: 6, a: 3 },
                  { name: 'Arts 11 A', rate: 88.1, p: 37, l: 5, a: 2 },
                ].map((row, i) => (
                  <tr key={i} className="hover:bg-[var(--surface-hover)] transition-colors">
                    <td className="px-5 py-3 text-[var(--text-secondary)]">{i+1}</td>
                    <td className="px-5 py-3 font-medium text-[var(--text-primary)]">{row.name}</td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2">
                        <span className="w-8 text-[10px] text-[var(--text-secondary)]">{row.rate}%</span>
                        <div className="w-16 h-1.5 bg-[var(--surface)] rounded-full overflow-hidden border border-[var(--border)]">
                          <div className="h-full rounded-full bg-green-500" style={{ width: `${row.rate}%` }}></div>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-[var(--text-secondary)]">{row.p}</td>
                    <td className="px-5 py-3 text-[var(--text-secondary)]">{row.l}</td>
                    <td className="px-5 py-3 text-[var(--text-secondary)]">{row.a}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Absent Students */}
        <div className="card border border-[var(--border)] bg-[var(--surface-2)]/30">
          <div className="p-5 border-b border-[var(--border)] flex justify-between items-center">
            <h3 className="text-base font-semibold text-[var(--text-primary)]">Absent Students (Today)</h3>
            <button className="text-xs px-3 py-1.5 bg-[var(--surface)] border border-[var(--border)] rounded hover:bg-[var(--surface-hover)] text-[var(--text-secondary)] transition-colors">View All</button>
          </div>
          <div className="p-0">
            <table className="w-full text-left text-xs whitespace-nowrap">
              <thead className="text-[var(--text-muted)] border-b border-[var(--border)] bg-[var(--surface)]/50">
                <tr>
                  <th className="px-5 py-3 font-medium">Student</th>
                  <th className="px-5 py-3 font-medium">Class</th>
                  <th className="px-5 py-3 font-medium text-right">Absent Since</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]">
                {[
                  { name: 'MD. Rahim Hasan', class: 'CSE 12 A', time: '10:00 AM', initial: 'R' },
                  { name: 'Jannatul Ferdous', class: 'Science 11 B', time: '10:05 AM', initial: 'J' },
                  { name: 'Tanvir Ahmed', class: 'Business 12 A', time: '10:10 AM', initial: 'T' },
                  { name: 'Nusrat Jahan', class: 'Arts 11 A', time: '10:15 AM', initial: 'N' },
                  { name: 'Samiul Islam', class: 'CSE 11 B', time: '10:20 AM', initial: 'S' },
                ].map((row, i) => (
                  <tr key={i} className="hover:bg-[var(--surface-hover)] transition-colors group">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center text-[10px] font-bold">
                          {row.initial}
                        </div>
                        <span className="font-medium text-[var(--text-primary)]">{row.name}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-[var(--text-secondary)]">{row.class}</td>
                    <td className="px-5 py-3 text-right text-[var(--text-secondary)] flex justify-end items-center gap-2">
                      {row.time} <ChevronDown size={12} className="opacity-0 group-hover:opacity-100 -rotate-90 text-[var(--text-muted)] transition-opacity" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Summary (This Week) */}
        <div className="card border border-[var(--border)] bg-[var(--surface-2)]/30">
          <div className="p-5 border-b border-[var(--border)]">
            <h3 className="text-base font-semibold text-[var(--text-primary)]">Summary (This Week)</h3>
          </div>
          <div className="p-5 space-y-4">
            
            <div className="flex justify-between items-center text-sm pb-3 border-b border-[var(--border)]/50">
              <div className="flex items-center gap-3 text-[var(--text-secondary)]">
                <div className="p-1.5 bg-[var(--surface)] border border-[var(--border)] rounded text-blue-400"><Users size={14} /></div>
                Total Students
              </div>
              <div className="font-bold text-[var(--text-primary)]">520</div>
            </div>
            
            <div className="flex justify-between items-center text-sm pb-3 border-b border-[var(--border)]/50">
              <div className="flex items-center gap-3 text-[var(--text-secondary)]">
                <div className="p-1.5 bg-green-500/10 border border-green-500/20 rounded text-green-500"><CheckCircle2 size={14} /></div>
                Total Present
              </div>
              <div className="font-bold text-[var(--text-primary)]">3,112 <span className="text-xs font-normal text-[var(--text-muted)]">(89.3%)</span></div>
            </div>

            <div className="flex justify-between items-center text-sm pb-3 border-b border-[var(--border)]/50">
              <div className="flex items-center gap-3 text-[var(--text-secondary)]">
                <div className="p-1.5 bg-yellow-500/10 border border-yellow-500/20 rounded text-yellow-500"><Clock size={14} /></div>
                Late Arrivals
              </div>
              <div className="font-bold text-[var(--text-primary)]">287 <span className="text-xs font-normal text-[var(--text-muted)]">(8.2%)</span></div>
            </div>

            <div className="flex justify-between items-center text-sm pb-3 border-b border-[var(--border)]/50">
              <div className="flex items-center gap-3 text-[var(--text-secondary)]">
                <div className="p-1.5 bg-red-500/10 border border-red-500/20 rounded text-red-500"><AlertTriangle size={14} /></div>
                Total Absent
              </div>
              <div className="font-bold text-[var(--text-primary)]">82 <span className="text-xs font-normal text-[var(--text-muted)]">(2.3%)</span></div>
            </div>

            <div className="flex justify-between items-center text-sm pb-1">
              <div className="flex items-center gap-3 text-[var(--text-secondary)]">
                <div className="p-1.5 bg-blue-500/10 border border-blue-500/20 rounded text-blue-500"><Users size={14} /></div>
                Excused
              </div>
              <div className="font-bold text-[var(--text-primary)]">21 <span className="text-xs font-normal text-[var(--text-muted)]">(0.2%)</span></div>
            </div>

          </div>
        </div>

      </div>

    </div>
  );
}
