import React, { useState } from 'react';
import { MoreHorizontal, ShieldCheck, ShieldAlert, Trash2, PowerOff, Power, Fingerprint, Nfc } from 'lucide-react';
import { DeviceData, deviceApi } from '../services/device.service';

interface DeviceTableProps {
  devices: DeviceData[];
  onRefresh: () => void;
}

export function DeviceTable({ devices, onRefresh }: DeviceTableProps) {
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const handleStatusChange = async (device: DeviceData) => {
    try {
      setLoadingId(device.id);
      if (device.status === 'ACTIVE') {
        await deviceApi.disable(device.id);
      } else {
        await deviceApi.enable(device.id);
      }
      onRefresh();
    } catch (error) {
      console.error('Failed to update status', error);
    } finally {
      setLoadingId(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this device?')) return;
    try {
      setLoadingId(id);
      await deviceApi.remove(id);
      onRefresh();
    } catch (error) {
      console.error('Failed to delete device', error);
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <div className="overflow-x-auto rounded-lg border border-[var(--border)] bg-[var(--surface)]">
      <table className="w-full text-sm text-left">
        <thead className="text-xs uppercase bg-[var(--surface-2)] text-[var(--text-muted)] border-b border-[var(--border)]">
          <tr>
            <th className="px-6 py-4 font-medium">Device Name / UID</th>
            <th className="px-6 py-4 font-medium">Location</th>
            <th className="px-6 py-4 font-medium">Status</th>
            <th className="px-6 py-4 font-medium">Sensors</th>
            <th className="px-6 py-4 font-medium">Last Seen</th>
            <th className="px-6 py-4 font-medium">Firmware</th>
            <th className="px-6 py-4 font-medium text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[var(--border)]">
          {devices.map((device) => (
            <tr key={device.id} className="hover:bg-[var(--surface-2)]/50 transition-colors">
              <td className="px-6 py-4">
                <div className="flex flex-col">
                  <span className="font-semibold text-[var(--text-primary)]">{device.name}</span>
                  <span className="text-xs text-[var(--text-muted)] font-mono mt-0.5">{device.deviceUid}</span>
                </div>
              </td>
              <td className="px-6 py-4 text-[var(--text-secondary)]">
                {device.location || 'Unassigned'}
              </td>
              <td className="px-6 py-4">
                {device.status === 'ACTIVE' && <span className="badge-active flex items-center gap-1 w-max"><ShieldCheck size={12}/> Active</span>}
                {device.status === 'PENDING' && <span className="badge-pending flex items-center gap-1 w-max"><ShieldAlert size={12}/> Pending</span>}
                {device.status === 'DISABLED' && <span className="badge-inactive flex items-center gap-1 w-max"><PowerOff size={12}/> Disabled</span>}
              </td>
              <td className="px-6 py-4">
                <div className="flex gap-2">
                  {device.activeSensors?.includes('FINGERPRINT') && (
                    <div className="p-1.5 bg-blue-500/10 text-blue-400 rounded-md" title="Fingerprint Sensor Active">
                      <Fingerprint size={14} />
                    </div>
                  )}
                  {device.activeSensors?.includes('RFID') && (
                    <div className="p-1.5 bg-indigo-500/10 text-indigo-400 rounded-md" title="RFID Sensor Active">
                      <Nfc size={14} />
                    </div>
                  )}
                  {(!device.activeSensors || device.activeSensors.length === 0) && (
                    <span className="text-xs text-[var(--text-muted)]">None</span>
                  )}
                </div>
              </td>
              <td className="px-6 py-4 text-[var(--text-secondary)]">
                {device.lastSeen ? new Date(device.lastSeen).toLocaleString() : 'Never'}
              </td>
              <td className="px-6 py-4 text-[var(--text-secondary)]">
                {device.firmwareVersion || 'Unknown'}
              </td>
              <td className="px-6 py-4 text-right space-x-2">
                {device.status === 'PENDING' ? (
                  <>
                    <button 
                      onClick={() => handleStatusChange(device)}
                      disabled={loadingId === device.id}
                      className="p-1.5 text-green-500 hover:text-green-400 hover:bg-green-500/10 rounded transition-colors disabled:opacity-50"
                      title="Approve Device"
                    >
                      <ShieldCheck size={16} />
                    </button>
                    <button 
                      onClick={() => handleDelete(device.id)}
                      disabled={loadingId === device.id}
                      className="p-1.5 text-red-500 hover:text-red-400 hover:bg-red-500/10 rounded transition-colors disabled:opacity-50"
                      title="Reject Device"
                    >
                      <Trash2 size={16} />
                    </button>
                  </>
                ) : (
                  <>
                    <button 
                      onClick={() => handleStatusChange(device)}
                      disabled={loadingId === device.id}
                      className="p-1.5 text-[var(--text-muted)] hover:text-blue-400 hover:bg-blue-500/10 rounded transition-colors disabled:opacity-50"
                      title={device.status === 'ACTIVE' ? 'Disable Device' : 'Enable Device'}
                    >
                      <Power size={16} />
                    </button>
                    <button 
                      onClick={() => handleDelete(device.id)}
                      disabled={loadingId === device.id}
                      className="p-1.5 text-[var(--text-muted)] hover:text-red-400 hover:bg-red-500/10 rounded transition-colors disabled:opacity-50"
                      title="Delete Device"
                    >
                      <Trash2 size={16} />
                    </button>
                  </>
                )}
              </td>
            </tr>
          ))}
          {devices.length === 0 && (
            <tr>
              <td colSpan={7} className="px-6 py-8 text-center text-[var(--text-muted)]">
                No devices found. New devices will appear here automatically when they connect.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
