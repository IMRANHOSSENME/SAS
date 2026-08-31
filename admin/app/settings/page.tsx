"use client";
import React, { useState, useEffect } from 'react';
import { 
  Settings as SettingsIcon, Fingerprint, Clock, Shield, Database, Bell, MonitorSmartphone,
  Save, AlertTriangle, RefreshCw, Trash2, ChevronDown, CheckCircle2, Calendar, UserPlus, PlaySquare, FileText, Lock
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import apiClient from '../../src/lib/api/client';

const TABS = [
  { id: 'attendance', label: 'Attendance', icon: Clock },
  { id: 'fingerprint', label: 'Fingerprint', icon: Fingerprint },
  { id: 'devices', label: 'Devices', icon: MonitorSmartphone },
  { id: 'security', label: 'Security', icon: Shield },
  { id: 'data', label: 'Data & Cleanup', icon: Database },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'system', label: 'System', icon: SettingsIcon },
];

export default function SettingsDashboard() {
  const [activeTab, setActiveTab] = useState('attendance');
  const [loading, setLoading] = useState(false);
  const [devices, setDevices] = useState<any[]>([]);
  const [selectedDevice, setSelectedDevice] = useState<string>('');
  const [orphansData, setOrphansData] = useState<any>(null);

  // Settings State
  const [settings, setSettings] = useState({
    attendanceOpens: '09:45 AM',
    classStarts: '10:00 AM',
    lateStartsAfter: '10:10 AM',
    attendanceCloses: '10:30 AM',
    preventDuplicate: true,
    allowLate: true,
    autoMarkAbsent: true,
    allowBeforeClass: true,
    maxScanAttempts: 3,
    minTimeBetweenScans: 10,
    attendanceMethod: 'Fingerprint',
    lateStatus: 'Late',
    autoCloseSession: true,
    autoMarkMissing: true,
    allowTeacherCorrection: true,
    closeAfterMin: 30,
    missingStatus: 'Absent',
    correctionWindowHours: 24,
  });

  useEffect(() => {
    fetchDevices();
  }, []);

  useEffect(() => {
    if (selectedDevice) {
      fetchOrphans();
    }
  }, [selectedDevice]);

  const fetchDevices = async () => {
    try {
      const res = await apiClient.get('/devices');
      setDevices(res.data);
      if (res.data.length > 0) setSelectedDevice(res.data[0].id);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchOrphans = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get(`/biometrics/orphans/${selectedDevice}`);
      setOrphansData(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const triggerSync = async () => {
    if (!selectedDevice) return;
    try {
      await apiClient.post(`/devices/${selectedDevice}/sync`);
      alert('Sync command sent to device.');
    } catch (e) {
      console.error(e);
      alert('Failed to trigger sync');
    }
  };

  const deleteOrphan = async (fingerprintId: number) => {
    if (!confirm(`Are you sure you want to delete orphan fingerprint ID ${fingerprintId} from the sensor?`)) return;
    try {
      await apiClient.delete(`/biometrics/orphans/${selectedDevice}/${fingerprintId}`);
      setOrphansData({
        ...orphansData,
        orphans: orphansData.orphans.filter((id: number) => id !== fingerprintId),
        total: orphansData.total - 1
      });
    } catch (e) {
      console.error(e);
    }
  };

  // Toggle helper
  const toggleSetting = (key: keyof typeof settings) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const pieData = orphansData ? [
    { name: 'Used', value: orphansData.total || 0, color: '#3B82F6' },
    { name: 'Available', value: 1000 - (orphansData.total || 0), color: '#1F2937' },
  ] : [{ name: 'Available', value: 1000, color: '#1F2937' }];

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto p-4 md:p-8">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">System Settings</h1>
          <p className="text-sm text-[var(--text-secondary)] mt-1">Manage global configuration, security, and hardware rules.</p>
        </div>
        <button className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors shadow-[0_0_15px_rgba(37,99,235,0.3)]">
          <Save size={16} /> Save All Settings
        </button>
      </div>

      {/* Horizontal Tabs */}
      <div className="flex overflow-x-auto scrollbar-hide border-b border-[var(--border)] mt-4">
        {TABS.map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-6 py-4 text-sm font-medium whitespace-nowrap transition-colors border-b-2 ${
                isActive 
                  ? 'border-blue-500 text-blue-500 bg-blue-500/5' 
                  : 'border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-hover)]'
              }`}
            >
              <Icon size={16} />
              {tab.label}
            </button>
          );
        })}
      </div>

      <div className="pt-4">
        
        {/* =========================================
            ATTENDANCE TAB (Clean & Spaced Out)
            ========================================= */}
        {activeTab === 'attendance' && (
          <div className="space-y-8">
            
            {/* Time Window */}
            <div className="card p-8">
              <div className="flex items-center gap-2 mb-6 border-b border-[var(--border)] pb-4">
                <Clock className="text-blue-500" size={20} />
                <h2 className="text-lg font-semibold text-[var(--text-primary)]">Attendance Time Window</h2>
                <span className="text-xs text-[var(--text-secondary)] ml-auto font-normal">Configure daily attendance time window and grace periods.</span>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-[var(--text-secondary)]">Attendance Opens</label>
                  <div className="relative">
                    <input type="text" value={settings.attendanceOpens} className="w-full bg-[var(--surface-2)] border border-[var(--border)] rounded-md px-4 py-2.5 text-sm text-[var(--text-primary)] outline-none" readOnly />
                    <Clock size={14} className="absolute right-3 top-3 text-[var(--text-muted)]" />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-[var(--text-secondary)]">Class Starts</label>
                  <div className="relative">
                    <input type="text" value={settings.classStarts} className="w-full bg-[var(--surface-2)] border border-[var(--border)] rounded-md px-4 py-2.5 text-sm text-[var(--text-primary)] outline-none" readOnly />
                    <Clock size={14} className="absolute right-3 top-3 text-[var(--text-muted)]" />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-[var(--text-secondary)]">Late Starts After</label>
                  <div className="relative">
                    <input type="text" value={settings.lateStartsAfter} className="w-full bg-[var(--surface-2)] border border-yellow-500/30 rounded-md px-4 py-2.5 text-sm text-yellow-500 outline-none" readOnly />
                    <span className="absolute right-2 top-2 text-[10px] font-bold px-1.5 py-0.5 bg-yellow-500/20 rounded text-yellow-500">Late</span>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-[var(--text-secondary)]">Attendance Closes</label>
                  <div className="relative">
                    <input type="text" value={settings.attendanceCloses} className="w-full bg-[var(--surface-2)] border border-red-500/30 rounded-md px-4 py-2.5 text-sm text-red-500 outline-none" readOnly />
                    <span className="absolute right-2 top-2 text-[10px] font-bold px-1.5 py-0.5 bg-red-500/20 rounded text-red-500">Closed</span>
                  </div>
                </div>
              </div>
              
              <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4 flex gap-3 text-sm text-blue-300">
                <AlertTriangle size={18} className="shrink-0 mt-0.5" />
                <div>
                  Students can mark attendance from <strong>{settings.attendanceOpens}</strong> to <strong>{settings.attendanceCloses}</strong>.<br/>
                  After {settings.attendanceCloses}, remaining students will be marked absent automatically.
                </div>
              </div>
            </div>

            {/* Attendance Rules & Session Closing (Side by Side) */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              
              {/* Rules */}
              <div className="card p-8">
                <div className="flex items-center gap-2 mb-6 border-b border-[var(--border)] pb-4">
                  <SettingsIcon className="text-blue-500" size={20} />
                  <h2 className="text-lg font-semibold text-[var(--text-primary)]">Attendance Rules</h2>
                </div>
                
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm font-medium text-[var(--text-primary)]">Prevent Duplicate Attendance</div>
                      <div className="text-xs text-[var(--text-secondary)] mt-0.5">Block multiple attendance in same session</div>
                    </div>
                    <button onClick={() => toggleSetting('preventDuplicate')} className={`w-11 h-6 rounded-full relative transition-colors ${settings.preventDuplicate ? 'bg-blue-600' : 'bg-gray-600'}`}>
                      <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-all ${settings.preventDuplicate ? 'left-6' : 'left-1'}`}></div>
                    </button>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm font-medium text-[var(--text-primary)]">Allow Late Attendance</div>
                      <div className="text-xs text-[var(--text-secondary)] mt-0.5">Allow students to mark late attendance</div>
                    </div>
                    <button onClick={() => toggleSetting('allowLate')} className={`w-11 h-6 rounded-full relative transition-colors ${settings.allowLate ? 'bg-blue-600' : 'bg-gray-600'}`}>
                      <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-all ${settings.allowLate ? 'left-6' : 'left-1'}`}></div>
                    </button>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-t border-[var(--border)]">
                    <div>
                      <div className="text-sm font-medium text-[var(--text-primary)]">Minimum Time Between Scans</div>
                      <div className="text-xs text-[var(--text-secondary)] mt-0.5">Prevent spam scans from device</div>
                    </div>
                    <div className="w-32 relative flex items-center bg-[var(--surface-2)] border border-[var(--border)] rounded overflow-hidden text-sm">
                      <input type="number" value={settings.minTimeBetweenScans} onChange={e=>setSettings({...settings, minTimeBetweenScans: parseInt(e.target.value)})} className="w-full bg-transparent px-3 py-1.5 outline-none text-center" />
                      <span className="px-2 text-xs font-medium text-[var(--text-muted)] border-l border-[var(--border)] bg-[var(--surface)] h-full flex items-center">sec</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Session Closing Rules */}
              <div className="card p-8">
                <div className="flex items-center gap-2 mb-6 border-b border-[var(--border)] pb-4">
                  <Calendar className="text-blue-500" size={20} />
                  <h2 className="text-lg font-semibold text-[var(--text-primary)]">Session Closing Rules</h2>
                </div>
                
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm font-medium text-[var(--text-primary)]">Automatically Close Session</div>
                      <div className="text-xs text-[var(--text-secondary)] mt-0.5">Close session after grace period</div>
                    </div>
                    <button onClick={() => toggleSetting('autoCloseSession')} className={`w-11 h-6 rounded-full relative transition-colors ${settings.autoCloseSession ? 'bg-blue-600' : 'bg-gray-600'}`}>
                      <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-all ${settings.autoCloseSession ? 'left-6' : 'left-1'}`}></div>
                    </button>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm font-medium text-[var(--text-primary)]">Auto Mark Missing Students</div>
                      <div className="text-xs text-[var(--text-secondary)] mt-0.5">Mark unmarked students as absent</div>
                    </div>
                    <button onClick={() => toggleSetting('autoMarkMissing')} className={`w-11 h-6 rounded-full relative transition-colors ${settings.autoMarkMissing ? 'bg-blue-600' : 'bg-gray-600'}`}>
                      <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-all ${settings.autoMarkMissing ? 'left-6' : 'left-1'}`}></div>
                    </button>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-t border-[var(--border)]">
                    <div>
                      <div className="text-sm font-medium text-[var(--text-primary)]">Close After</div>
                      <div className="text-xs text-[var(--text-secondary)] mt-0.5">Minutes after class end to auto-close</div>
                    </div>
                    <div className="w-32 relative flex items-center bg-[var(--surface-2)] border border-[var(--border)] rounded overflow-hidden text-sm">
                      <input type="number" value={settings.closeAfterMin} onChange={e=>setSettings({...settings, closeAfterMin: parseInt(e.target.value)})} className="w-full bg-transparent px-3 py-1.5 outline-none text-center" />
                      <span className="px-2 text-xs font-medium text-[var(--text-muted)] border-l border-[var(--border)] bg-[var(--surface)] h-full flex items-center">min</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        )}

        {/* =========================================
            FINGERPRINT TAB (Clean & Focused)
            ========================================= */}
        {activeTab === 'fingerprint' && (
          <div className="space-y-8">
            <div className="flex justify-between items-center bg-[var(--surface)] p-6 rounded-2xl border border-[var(--border)]">
              <div>
                <h2 className="text-xl font-semibold text-[var(--text-primary)]">Fingerprint Sensors</h2>
                <p className="text-sm text-[var(--text-secondary)] mt-1">Select a device to view storage and clean up orphans.</p>
              </div>
              <select 
                value={selectedDevice}
                onChange={(e) => setSelectedDevice(e.target.value)}
                className="bg-[var(--surface-2)] border border-[var(--border)] rounded-lg px-6 py-3 text-sm text-[var(--text-primary)] outline-none min-w-[200px]"
              >
                {devices.map(d => (
                  <option key={d.id} value={d.id}>{d.name} ({d.deviceUid})</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              
              {/* Left Column: Storage Overview */}
              <div className="lg:col-span-4 space-y-8">
                <div className="card p-8 relative overflow-hidden h-full">
                  <div className="flex items-center gap-2 mb-8">
                    <Database className="text-blue-500" size={20} />
                    <h2 className="text-lg font-semibold text-[var(--text-primary)]">Storage Overview</h2>
                  </div>
                  
                  {/* Donut Chart */}
                  <div className="w-48 h-48 mx-auto relative mb-8">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={pieData}
                          cx="50%" cy="50%"
                          innerRadius={65} outerRadius={85}
                          stroke="none"
                          dataKey="value"
                        >
                          {pieData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                      <span className="text-4xl font-bold text-[var(--text-primary)]">{orphansData?.total || 0}</span>
                      <span className="text-xs text-[var(--text-secondary)] mt-1 font-medium">TOTAL USED</span>
                    </div>
                  </div>

                  {/* Legend & Stats */}
                  <div className="space-y-4 pt-4 border-t border-[var(--border)]">
                    <div className="flex justify-between items-center text-sm">
                      <div className="flex items-center gap-2 text-[var(--text-secondary)]"><div className="w-2 h-2 rounded-full bg-gray-500"></div>Capacity</div>
                      <div className="font-medium text-[var(--text-primary)]">1000</div>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <div className="flex items-center gap-2 text-blue-400"><div className="w-2 h-2 rounded-full bg-blue-500"></div>Used</div>
                      <div className="font-medium text-blue-400">{orphansData?.total || 0} <span className="text-xs opacity-70">({(orphansData?.total / 1000 * 100).toFixed(1)}%)</span></div>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <div className="flex items-center gap-2 text-green-400"><div className="w-2 h-2 rounded-full bg-green-500"></div>Registered</div>
                      <div className="font-medium text-green-400">{orphansData?.registered || 0} <span className="text-xs opacity-70">({(orphansData?.registered / 1000 * 100).toFixed(1)}%)</span></div>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <div className="flex items-center gap-2 text-red-400"><div className="w-2 h-2 rounded-full bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]"></div>Orphans</div>
                      <div className="font-medium text-red-400">{orphansData?.orphans?.length || 0} <span className="text-xs opacity-70">({(orphansData?.orphans?.length / 1000 * 100).toFixed(1)}%)</span></div>
                    </div>
                  </div>

                  <button onClick={triggerSync} className="w-full mt-8 flex items-center justify-center gap-2 py-3 bg-blue-600/10 hover:bg-blue-600/20 text-blue-500 border border-blue-500/20 rounded-xl text-sm font-medium transition-colors">
                    <RefreshCw size={16} /> Sync Sensor Data
                  </button>
                </div>
              </div>

              {/* Right Column: Orphan Fingerprints */}
              <div className="lg:col-span-8">
                <div className="card h-full flex flex-col">
                  <div className="p-8 flex items-center justify-between border-b border-[var(--border)]">
                    <div>
                      <div className="flex items-center gap-2">
                        <Fingerprint className="text-red-500" size={20} />
                        <h2 className="text-lg font-semibold text-[var(--text-primary)]">Orphan Fingerprints</h2>
                      </div>
                      <p className="text-sm text-[var(--text-secondary)] mt-1">Fingerprints in sensor not linked to any student.</p>
                    </div>
                    {orphansData?.orphans?.length > 0 && (
                      <span className="text-xs font-semibold bg-red-500/10 text-red-500 px-3 py-1.5 rounded-full border border-red-500/20">
                        {orphansData.orphans.length} Found
                      </span>
                    )}
                  </div>

                  <div className="p-8 flex-1 flex flex-col">
                    {orphansData?.orphans?.length > 0 ? (
                      <>
                        <div className="overflow-x-auto border border-[var(--border)] rounded-xl flex-1 max-h-[500px]">
                          <table className="w-full text-left text-sm">
                            <thead className="bg-[var(--surface-2)] text-[var(--text-muted)] border-b border-[var(--border)] sticky top-0 z-10">
                              <tr>
                                <th className="px-6 py-4 font-medium">Sensor ID</th>
                                <th className="px-6 py-4 font-medium">Device Name</th>
                                <th className="px-6 py-4 font-medium text-right">Action</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-[var(--border)]">
                              {orphansData.orphans.map((id: number) => (
                                <tr key={id} className="hover:bg-[var(--surface-hover)] transition-colors">
                                  <td className="px-6 py-4 font-semibold text-[var(--text-primary)]">#{id}</td>
                                  <td className="px-6 py-4 text-[var(--text-secondary)]">Main Gate Sensor</td>
                                  <td className="px-6 py-4 text-right">
                                    <button onClick={() => deleteOrphan(id)} className="text-red-500 hover:text-white px-3 py-1.5 bg-red-500/10 hover:bg-red-500 rounded-lg border border-red-500/20 transition-colors flex items-center gap-2 ml-auto">
                                      <Trash2 size={14} /> Delete
                                    </button>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                        <div className="flex items-center justify-between mt-6 pt-6 border-t border-[var(--border)]">
                          <label className="flex items-center gap-2 text-sm text-[var(--text-secondary)] cursor-pointer">
                            <input type="checkbox" className="w-4 h-4 rounded border-[var(--border)] bg-[var(--surface-2)] accent-blue-600" /> Select All ({orphansData.orphans.length})
                          </label>
                          <div className="flex gap-3">
                            <button className="px-4 py-2 bg-[var(--surface-2)] border border-[var(--border)] hover:bg-[var(--surface-hover)] text-[var(--text-primary)] rounded-lg text-sm font-medium transition-colors">Assign to Student</button>
                            <button className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors shadow-[0_0_15px_rgba(239,68,68,0.3)]">Delete Selected</button>
                          </div>
                        </div>
                      </>
                    ) : (
                      <div className="flex-1 flex flex-col items-center justify-center py-16 text-center">
                        <div className="w-20 h-20 bg-green-500/10 text-green-500 rounded-full flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(34,197,94,0.1)]">
                          <CheckCircle2 size={40} />
                        </div>
                        <h4 className="text-xl font-semibold text-[var(--text-primary)]">Sensor is Clean</h4>
                        <p className="text-sm text-[var(--text-secondary)] mt-2 max-w-sm">There are no orphan fingerprints in the selected sensor. All fingerprints are properly assigned to students.</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

          </div>
        )}

        {/* =========================================
            PLACEHOLDER TABS
            ========================================= */}
        {!['attendance', 'fingerprint'].includes(activeTab) && (
          <div className="card p-12 flex flex-col items-center justify-center text-center border-dashed border-2 border-[var(--border)] h-[600px]">
            <SettingsIcon size={64} className="text-[var(--text-muted)] opacity-20 mb-6" />
            <h3 className="text-2xl font-medium text-[var(--text-primary)]">
              {TABS.find(t => t.id === activeTab)?.label} Settings
            </h3>
            <p className="text-[var(--text-secondary)] mt-3">This configuration module is under development and will be available soon.</p>
          </div>
        )}

      </div>
    </div>
  );
}
