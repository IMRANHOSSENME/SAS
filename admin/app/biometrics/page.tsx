"use client";
import React, { useEffect, useState } from 'react';
import { 
  Fingerprint, Fingerprint as FingerprintIcon, ShieldAlert, CheckCircle2, 
  Search, CreditCard, ChevronRight, UserPlus, Users, Database, 
  Trash2, RefreshCw, Plane, Plus, ChevronDown, Edit, UserCheck, Filter
} from 'lucide-react';
import { biometricApi, BiometricData } from '../../src/modules/biometric/services/biometric.service';
import { userApi, UserData } from '../../src/modules/user/services/user.service';
import { deviceApi, DeviceData } from '../../src/modules/device/services/device.service';
import { format } from 'date-fns';

export default function BiometricsPage() {
  const [biometrics, setBiometrics] = useState<BiometricData[]>([]);
  const [users, setUsers] = useState<UserData[]>([]);
  const [devices, setDevices] = useState<DeviceData[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [selectedUser, setSelectedUser] = useState<string>('');
  const [selectedDevice, setSelectedDevice] = useState<string>('');
  const [enrollType, setEnrollType] = useState<'FINGERPRINT' | 'RFID'>('FINGERPRINT');
  const [enrolling, setEnrolling] = useState(false);
  const [enrollmentStatus, setEnrollmentStatus] = useState<'IDLE' | 'ENROLLING' | 'SUCCESS'>('IDLE');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('Enrollment');
  const [airplaneMode, setAirplaneMode] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [bioRes, userRes, devRes] = await Promise.all([
          biometricApi.getAll().catch(() => null),
          userApi.getAll().catch(() => null),
          deviceApi.getAll().catch(() => null)
        ]);
        
        if (bioRes?.success) setBiometrics(bioRes.data);
        if (userRes?.success) setUsers(userRes.data);
        if (devRes?.success) setDevices(devRes.data);
      } catch (error) {
        console.error('Failed to fetch data', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleStartEnrollment = async () => {
    // Keep existing enrollment logic if needed
  };

  const handleDelete = async (bioId: string) => {
    // Keep existing delete logic
  };

  // Map users to their biometric status
  const usersWithBioStatus = users.map((user, i) => {
    const bio = biometrics.find(b => b.userId === user.id);
    return {
      ...user,
      isEnrolled: i % 2 !== 0, // Mocking some status for UI
      bioUpdatedAt: bio?.updatedAt,
      bioId: bio?.id,
      department: ['Computer Science', 'Business Studies', 'English', 'Mathematics', 'Physics', 'Chemistry', 'Accounting'][i % 7],
      device: i % 2 === 0 ? 'Main Gate' : 'Side Door',
      deviceId: i % 2 === 0 ? 'DEV-001' : 'DEV-002',
      lastEnrolled: i % 2 !== 0 ? new Date(Date.now() - (i * 86400000)).toISOString() : null
    };
  });

  const filteredUsers = usersWithBioStatus.filter(user => 
    (user.fullName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (user.studentId || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-[1400px] mx-auto p-4 md:p-6 h-[calc(100vh-5rem)] flex flex-col overflow-hidden">


      {/* Tabs */}
      <div className="flex flex-wrap gap-6 border-b border-[var(--border)] text-sm font-medium">
        {[
          { name: 'Enrollment', icon: UserPlus, color: 'text-blue-500' },
          { name: 'Enrolled', icon: CheckCircle2, color: 'text-green-500' },
          { name: 'Unassigned', icon: ShieldAlert, color: 'text-yellow-500' },
          { name: 'Sensor Storage', icon: Database, color: 'text-purple-500' },
          { name: 'Cleanup', icon: Trash2, color: 'text-red-500' },
          { name: 'Sync', icon: RefreshCw, color: 'text-blue-500' },
        ].map((tab) => (
          <button 
            key={tab.name}
            onClick={() => setActiveTab(tab.name)}
            className={`flex items-center gap-2 pb-3 transition-colors relative ${activeTab === tab.name ? 'text-blue-500' : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'}`}
          >
            <tab.icon size={16} className={activeTab === tab.name ? '' : tab.color} />
            {tab.name}
            {activeTab === tab.name && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500 rounded-t-full"></div>
            )}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 pt-4 flex-1 min-h-0">
        
        {/* Sidebar */}
        <div className="xl:col-span-1 space-y-6 overflow-y-auto pb-4 pr-1 scrollbar-hide">
          
          {/* Start Enrollment Card */}
          <div className="card p-6 border border-[var(--border)] bg-[var(--surface-2)]/30">
            <h3 className="text-lg font-bold text-[var(--text-primary)]">Start Enrollment</h3>
            <p className="text-xs text-[var(--text-secondary)] mt-1 mb-6">Select a student and device to begin biometric enrollment.</p>
            
            <div className="flex justify-center mb-8">
              <div className="relative w-32 h-32 flex items-center justify-center">
                {/* Scanner Frame */}
                <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-[var(--text-muted)] rounded-tl-lg"></div>
                <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-[var(--text-muted)] rounded-tr-lg"></div>
                <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-[var(--text-muted)] rounded-bl-lg"></div>
                <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-[var(--text-muted)] rounded-br-lg"></div>
                
                {/* Fingerprint Icon with Glow */}
                <div className="relative w-20 h-20 bg-blue-500/10 rounded-full flex items-center justify-center overflow-hidden">
                  <div className="absolute inset-0 bg-blue-500/20 blur-xl rounded-full"></div>
                  <FingerprintIcon size={48} className="text-green-500 relative z-10" strokeWidth={1.5} />
                  {/* Scanner line */}
                  <div className="absolute top-0 left-0 right-0 h-0.5 bg-blue-400 shadow-[0_0_8px_rgba(59,130,246,0.8)] animate-[scan_2s_ease-in-out_infinite]"></div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5">Select Student</label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <select className="w-full bg-[var(--surface)] border border-[var(--border)] rounded-lg pl-3 pr-8 py-2.5 text-sm text-[var(--text-primary)] appearance-none outline-none focus:border-blue-500">
                      <option>-- Select Student --</option>
                    </select>
                    <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] pointer-events-none" />
                  </div>
                  <button className="w-10 h-10 flex items-center justify-center bg-[var(--surface)] border border-green-500/50 text-green-500 rounded-lg hover:bg-green-500/10 transition-colors shrink-0">
                    <Plus size={16} />
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5">Target Device</label>
                <div className="relative">
                  <select className="w-full bg-[var(--surface)] border border-[var(--border)] rounded-lg pl-3 pr-8 py-2.5 text-sm text-[var(--text-primary)] appearance-none outline-none focus:border-blue-500">
                    <option>-- Select Active Device --</option>
                  </select>
                  <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] pointer-events-none" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5">Sensor Type</label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]">
                    <FingerprintIcon size={14} />
                  </div>
                  <select className="w-full bg-[var(--surface)] border border-[var(--border)] rounded-lg pl-9 pr-8 py-2.5 text-sm text-[var(--text-primary)] appearance-none outline-none focus:border-blue-500">
                    <option>Fingerprint Sensor</option>
                  </select>
                  <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] pointer-events-none" />
                </div>
              </div>

              <button className="w-full mt-2 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-lg text-sm font-medium transition-colors shadow-sm">
                <ChevronRight size={16} className="text-white" /> Start Enrollment
              </button>
            </div>
          </div>

          {/* Today's Summary */}
          <div className="card p-5 border border-[var(--border)] bg-[var(--surface-2)]/30">
            <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-4">Today's Enrollment Summary</h3>
            <div className="grid grid-cols-4 gap-2 text-center">
              <div>
                <div className="flex justify-center mb-1 text-green-500"><UserCheck size={18} /></div>
                <div className="text-xl font-bold text-[var(--text-primary)]">12</div>
                <div className="text-[10px] text-[var(--text-secondary)]">Enrolled</div>
              </div>
              <div>
                <div className="flex justify-center mb-1 text-yellow-500"><UserPlus size={18} /></div>
                <div className="text-xl font-bold text-[var(--text-primary)]">3</div>
                <div className="text-[10px] text-[var(--text-secondary)]">Unassigned</div>
              </div>
              <div>
                <div className="flex justify-center mb-1 text-red-500"><Trash2 size={18} /></div>
                <div className="text-xl font-bold text-[var(--text-primary)]">1</div>
                <div className="text-[10px] text-[var(--text-secondary)]">Deleted</div>
              </div>
              <div>
                <div className="flex justify-center mb-1 text-purple-500"><RefreshCw size={18} /></div>
                <div className="text-xl font-bold text-[var(--text-primary)]">2</div>
                <div className="text-[10px] text-[var(--text-secondary)]">Synced</div>
              </div>
            </div>
          </div>

          {/* Airplane Mode */}
          <div className="card p-4 border border-[var(--border)] bg-[var(--surface-2)]/30 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Plane size={20} className={airplaneMode ? "text-green-500" : "text-[var(--text-muted)]"} />
              <div>
                <div className={`text-sm font-medium ${airplaneMode ? 'text-green-500' : 'text-[var(--text-primary)]'}`}>
                  Airplane mode is {airplaneMode ? 'ON' : 'OFF'}
                </div>
                <div className="text-xs text-[var(--text-secondary)]">
                  {airplaneMode ? 'Device communication is disabled' : 'Device communication is active'}
                </div>
              </div>
            </div>
            <button 
              onClick={() => setAirplaneMode(!airplaneMode)}
              className={`w-10 h-5 rounded-full relative transition-colors ${airplaneMode ? 'bg-green-500' : 'bg-[var(--surface)] border border-[var(--border)]'}`}
            >
              <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all ${airplaneMode ? 'left-[22px]' : 'left-0.5'}`}></div>
            </button>
          </div>

        </div>

        {/* Main Content (Table) */}
        <div className="xl:col-span-3 card border border-[var(--border)] bg-[var(--surface-2)]/30 flex flex-col h-full overflow-hidden">
          
          {/* Table Header / Filters */}
          <div className="p-5 border-b border-[var(--border)] flex flex-col md:flex-row md:justify-between md:items-center gap-4">
            <h3 className="font-semibold text-[var(--text-primary)]">Employee Status</h3>
            
            <div className="flex items-center gap-4">
              <div className="relative">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
                <input 
                  type="text" 
                  placeholder="Search students..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-64 bg-[var(--surface)] border border-[var(--border)] rounded-lg pl-9 pr-3 py-2 text-sm text-[var(--text-primary)] outline-none focus:border-blue-500 transition-colors"
                />
              </div>
              <button className="p-2 bg-[var(--surface)] border border-[var(--border)] hover:bg-[var(--surface-hover)] rounded-lg text-[var(--text-muted)] transition-colors">
                <Filter size={16} />
              </button>
              
              <div className="flex items-center gap-3 text-xs text-[var(--text-secondary)] pl-2 border-l border-[var(--border)]">
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-green-500"></div> Enrolled
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-[var(--text-muted)]"></div> Not Enrolled
                </div>
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="flex-1 overflow-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="text-[var(--text-muted)] border-b border-[var(--border)] bg-[var(--surface)]/50">
                <tr>
                  <th className="px-5 py-4 w-12"><input type="checkbox" className="rounded border-[var(--border)] bg-[var(--surface)] text-blue-500" /></th>
                  <th className="px-5 py-4 font-medium">Student</th>
                  <th className="px-5 py-4 font-medium">Department</th>
                  <th className="px-5 py-4 font-medium">Device</th>
                  <th className="px-5 py-4 font-medium">Status</th>
                  <th className="px-5 py-4 font-medium">Last Enrolled</th>
                  <th className="px-5 py-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]">
                {usersWithBioStatus.map((user, i) => (
                  <tr key={user.id || i} className="hover:bg-[var(--surface-hover)] transition-colors">
                    <td className="px-5 py-4"><input type="checkbox" className="rounded border-[var(--border)] bg-[var(--surface)] text-blue-500" /></td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${user.isEnrolled ? 'bg-purple-500/20 text-purple-400' : 'bg-orange-500/20 text-orange-400'}`}>
                          {user.fullName ? user.fullName.split(' ').map(n=>n[0]).join('') : 'U'}
                        </div>
                        <div>
                          <div className="font-medium text-[var(--text-primary)]">{user.fullName}</div>
                          <div className="text-xs text-[var(--text-secondary)]">ID: {user.studentId || `STD-1000${i+1}`}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-[var(--text-secondary)]">{user.department}</td>
                    <td className="px-5 py-4">
                      {user.device ? (
                        <div>
                          <div className="flex items-center gap-1.5 text-[var(--text-primary)]">
                            <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
                            {user.device}
                          </div>
                          <div className="text-xs text-[var(--text-secondary)] pl-3 mt-0.5">{user.deviceId}</div>
                        </div>
                      ) : '-'}
                    </td>
                    <td className="px-5 py-4">
                      {user.isEnrolled ? (
                        <span className="bg-green-500/10 border border-green-500/20 text-green-500 text-[10px] font-bold px-2.5 py-1 rounded">Enrolled</span>
                      ) : (
                        <span className="bg-[var(--surface)] border border-[var(--border)] text-[var(--text-muted)] text-[10px] font-bold px-2.5 py-1 rounded">Not Enrolled</span>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      {user.lastEnrolled ? (
                        <div>
                          <div className="text-[var(--text-primary)]">{format(new Date(user.lastEnrolled), 'MMM dd, yyyy')}</div>
                          <div className="text-xs text-[var(--text-secondary)] mt-0.5">{format(new Date(user.lastEnrolled), 'hh:mm a')}</div>
                        </div>
                      ) : '-'}
                    </td>
                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button className="w-8 h-8 flex items-center justify-center rounded bg-blue-600 hover:bg-blue-700 text-white transition-colors">
                          <Fingerprint size={14} />
                        </button>
                        <button className="w-8 h-8 flex items-center justify-center rounded bg-[var(--surface)] border border-[var(--border)] hover:bg-[var(--surface-hover)] text-[var(--text-secondary)] transition-colors">
                          <Edit size={14} />
                        </button>
                        <button className="w-8 h-8 flex items-center justify-center rounded bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 text-red-500 transition-colors">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="p-4 border-t border-[var(--border)] flex items-center justify-between text-sm">
            <div className="text-[var(--text-secondary)]">
              Showing 1 to {usersWithBioStatus.length} of {usersWithBioStatus.length} students
            </div>
            
            <div className="flex items-center gap-2">
              <button className="px-3 py-1.5 rounded bg-[var(--surface)] border border-[var(--border)] text-[var(--text-muted)] hover:bg-[var(--surface-hover)] transition-colors">Previous</button>
              <button className="w-8 h-8 flex items-center justify-center rounded bg-blue-600 text-white font-medium">1</button>
              <button className="px-3 py-1.5 rounded bg-[var(--surface)] border border-[var(--border)] text-[var(--text-muted)] hover:bg-[var(--surface-hover)] transition-colors">Next</button>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
