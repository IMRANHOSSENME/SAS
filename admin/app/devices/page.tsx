"use client";
import React, { useEffect, useState } from 'react';
import { Monitor, RefreshCw } from 'lucide-react';
import { deviceApi, DeviceData } from '../../src/modules/device/services/device.service';
import { DeviceTable } from '../../src/modules/device/components/DeviceTable';

export default function DevicesPage() {
  const [devices, setDevices] = useState<DeviceData[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDevices = async () => {
    setLoading(true);
    try {
      const data = await deviceApi.getAll();
      if (data.success) {
        setDevices(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch devices', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDevices();
  }, []);

  return (
    <div className="max-w-[1400px] mx-auto p-4 md:p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-[var(--text-primary)]">Manage Devices</h2>
          <p className="text-sm text-[var(--text-muted)] mt-1">
            View and manage biometric fingerprint scanners on your network.
          </p>
        </div>
        <button 
          onClick={fetchDevices}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-[var(--surface-2)] hover:bg-[var(--border)] border border-[var(--border)] rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
        >
          <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      <div className="card p-1">
        {loading && devices.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-4 text-[var(--text-muted)] text-sm">Loading devices...</p>
          </div>
        ) : (
          <DeviceTable devices={devices} onRefresh={fetchDevices} />
        )}
      </div>
      
      <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4 flex gap-3 text-sm text-blue-300">
        <Monitor className="flex-shrink-0" size={20} />
        <div>
          <p className="font-semibold text-blue-200">Auto-Registration Enabled</p>
          <p className="mt-1">When a new ESP8266 device sends a heartbeat to the API, it will automatically appear here as "Pending". Approve it to start accepting biometric data.</p>
        </div>
      </div>
    </div>
  );
}
