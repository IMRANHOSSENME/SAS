"use client";
import React, { useEffect, useState } from 'react';
import { CalendarDays, Filter, Download, Users, Clock, CheckCircle2, AlertCircle } from 'lucide-react';
import { attendanceApi } from '../../src/modules/attendance/services/attendance.service';

export default function AttendancePage() {
  const [liveFeed, setLiveFeed] = useState<any[]>([]);
  const [summary, setSummary] = useState({ present: 0, late: 0, totalScans: 0 });
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [feedRes, summaryRes] = await Promise.all([
          attendanceApi.getLiveFeed(selectedDate).catch(() => null),
          attendanceApi.getSummary(selectedDate).catch(() => null)
        ]);
        
        if (feedRes) setLiveFeed(feedRes);
        if (summaryRes) setSummary(summaryRes);
      } catch (error) {
        console.error('Failed to fetch attendance', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 5000); // Poll every 5s for live feed
    return () => clearInterval(interval);
  }, [selectedDate]);

  return (
    <div className="max-w-[1400px] mx-auto p-4 md:p-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-[var(--text-primary)]">Live Attendance Feed</h2>
          <p className="text-sm text-[var(--text-muted)] mt-1">
            Real-time biometric scans and daily attendance tracking.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <input 
              type="date" 
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="bg-[var(--surface-2)] border border-[var(--border)] rounded-lg px-3 py-2 text-sm text-[var(--text-primary)]"
            />
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-[var(--surface-2)] hover:bg-[var(--border)] border border-[var(--border)] rounded-lg text-sm font-medium transition-colors">
            <Download size={16} />
            Export
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card p-6 flex items-center gap-4 border-l-4 border-blue-500">
          <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500">
            <Users size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-[var(--text-muted)]">Total Scans</p>
            <h3 className="text-2xl font-bold text-[var(--text-primary)]">{summary.totalScans}</h3>
          </div>
        </div>
        
        <div className="card p-6 flex items-center gap-4 border-l-4 border-green-500">
          <div className="w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center text-green-500">
            <CheckCircle2 size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-[var(--text-muted)]">Present on Time</p>
            <h3 className="text-2xl font-bold text-[var(--text-primary)]">{summary.present}</h3>
          </div>
        </div>
        
        <div className="card p-6 flex items-center gap-4 border-l-4 border-yellow-500">
          <div className="w-12 h-12 rounded-full bg-yellow-500/10 flex items-center justify-center text-yellow-500">
            <Clock size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-[var(--text-muted)]">Late Arrivals</p>
            <h3 className="text-2xl font-bold text-[var(--text-primary)]">{summary.late}</h3>
          </div>
        </div>
      </div>

      <div className="card p-1">
        <div className="overflow-x-auto rounded-lg bg-[var(--surface)]">
          <table className="w-full text-sm text-left">
            <thead className="text-xs uppercase bg-[var(--surface-2)] text-[var(--text-muted)] border-b border-[var(--border)]">
              <tr>
                <th className="px-6 py-4 font-medium">Student Name</th>
                <th className="px-6 py-4 font-medium">Device UID</th>
                <th className="px-6 py-4 font-medium">Check In</th>
                <th className="px-6 py-4 font-medium">Check Out</th>
                <th className="px-6 py-4 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {liveFeed.map((record) => (
                <tr key={record.id} className="hover:bg-[var(--surface-2)]/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-semibold text-[var(--text-primary)]">{record.user?.fullName || 'Unknown User'}</div>
                    <div className="text-xs text-[var(--text-muted)]">{record.user?.studentId || ''}</div>
                  </td>
                  <td className="px-6 py-4 text-[var(--text-secondary)] font-mono text-xs">
                    {record.device?.name || record.deviceId}
                  </td>
                  <td className="px-6 py-4 font-medium text-[var(--text-primary)]">
                    {record.checkIn ? record.checkIn : '--'}
                  </td>
                  <td className="px-6 py-4 text-[var(--text-secondary)]">
                    {record.checkOut ? record.checkOut : '--'}
                  </td>
                  <td className="px-6 py-4">
                    {record.status === 'PRESENT' && <span className="badge-active">✅ Present</span>}
                    {record.status === 'LATE' && <span className="badge-pending">⚠️ Late</span>}
                  </td>
                </tr>
              ))}
              {liveFeed.length === 0 && !loading && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center text-[var(--text-muted)]">
                      <Clock size={32} className="mb-2 opacity-50" />
                      <p>No scans recorded for this date yet.</p>
                      <p className="text-xs mt-1">Live feed updates automatically when a device scans a finger.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
