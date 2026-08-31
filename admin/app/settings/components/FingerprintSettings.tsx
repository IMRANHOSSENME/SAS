import React, { useState, useEffect } from 'react';
import apiClient from '../../../src/lib/api/client';
import { Fingerprint, AlertCircle, RefreshCw, Trash2, Users } from 'lucide-react';

export default function FingerprintSettings() {
  const [devices, setDevices] = useState<any[]>([]);
  const [selectedDevice, setSelectedDevice] = useState<string>('');
  const [orphansData, setOrphansData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

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
      alert('Sync triggered. The device will scan its sensor and update the database shortly. Please refresh in a few seconds.');
    } catch (e) {
      console.error(e);
      alert('Failed to trigger sync');
    }
  };

  const deleteOrphan = async (fingerprintId: number) => {
    if (!confirm(`Are you sure you want to delete orphan fingerprint ID ${fingerprintId} from the sensor?`)) return;
    
    try {
      await apiClient.delete(`/biometrics/orphans/${selectedDevice}/${fingerprintId}`);
      // Optimistically update UI
      setOrphansData({
        ...orphansData,
        orphans: orphansData.orphans.filter((id: number) => id !== fingerprintId),
        total: orphansData.total - 1
      });
    } catch (e) {
      console.error(e);
      alert('Failed to delete orphan');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold text-[var(--text-primary)]">Fingerprint Management</h2>
          <p className="text-sm text-[var(--text-muted)]">Manage sensor storage, clean up orphans, and sync devices.</p>
        </div>
        
        <div className="flex gap-4">
          <select 
            value={selectedDevice}
            onChange={(e) => setSelectedDevice(e.target.value)}
            className="bg-[var(--surface-2)] border border-[var(--border)] rounded-lg px-3 py-2 text-sm outline-none"
          >
            {devices.map(d => (
              <option key={d.id} value={d.id}>{d.name} ({d.deviceUid})</option>
            ))}
          </select>
          <button 
            onClick={triggerSync}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm transition-colors"
          >
            <RefreshCw size={16} /> Scan Sensor
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card p-6 flex flex-col items-center justify-center text-center space-y-2">
          <div className="p-3 bg-blue-500/20 text-blue-500 rounded-full">
            <Fingerprint size={24} />
          </div>
          <h3 className="text-2xl font-bold text-[var(--text-primary)]">
            {loading ? '...' : orphansData?.total || 0} <span className="text-sm font-normal text-[var(--text-muted)]">/ 1000</span>
          </h3>
          <p className="text-sm text-[var(--text-secondary)]">Sensor Capacity Used</p>
        </div>

        <div className="card p-6 flex flex-col items-center justify-center text-center space-y-2">
          <div className="p-3 bg-green-500/20 text-green-500 rounded-full">
            <Users size={24} />
          </div>
          <h3 className="text-2xl font-bold text-[var(--text-primary)]">
            {loading ? '...' : orphansData?.registered || 0}
          </h3>
          <p className="text-sm text-[var(--text-secondary)]">Registered to Students</p>
        </div>

        <div className="card p-6 flex flex-col items-center justify-center text-center space-y-2 border border-red-500/30 bg-red-500/5">
          <div className="p-3 bg-red-500/20 text-red-500 rounded-full">
            <AlertCircle size={24} />
          </div>
          <h3 className="text-2xl font-bold text-red-500">
            {loading ? '...' : orphansData?.orphans?.length || 0}
          </h3>
          <p className="text-sm text-red-500/80">Orphan Fingerprints</p>
        </div>
      </div>

      {orphansData?.orphans?.length > 0 && (
        <div className="card p-6">
          <h3 className="text-lg font-medium border-b border-[var(--border)] pb-2 mb-4">Orphan Cleanup</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[var(--border)] text-sm text-[var(--text-muted)]">
                  <th className="pb-3 font-medium">Fingerprint ID</th>
                  <th className="pb-3 font-medium">Status</th>
                  <th className="pb-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {orphansData.orphans.map((id: number) => (
                  <tr key={id} className="border-b border-[var(--border)] last:border-0 hover:bg-[var(--surface-hover)] transition-colors">
                    <td className="py-3 font-medium text-[var(--text-primary)]">#{id}</td>
                    <td className="py-3"><span className="px-2 py-1 bg-yellow-500/20 text-yellow-500 rounded text-xs font-medium">Orphan</span></td>
                    <td className="py-3 text-right">
                      <button 
                        onClick={() => deleteOrphan(id)}
                        className="text-red-500 hover:text-red-400 p-2 rounded-lg hover:bg-red-500/10 transition-colors"
                        title="Delete from Sensor"
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
