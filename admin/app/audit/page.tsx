"use client";
import React, { useState, useEffect, useMemo } from 'react';
import { 
  Search, Filter, Clock, Download, FileText, 
  FileBox, FilePlus, FileEdit, Trash2, LogIn,
  RefreshCcw, Eye, MapPin, ChevronLeft, ChevronRight, ChevronDown
} from 'lucide-react';
import apiClient from '../../src/lib/api/client';
import { format } from 'date-fns';

const StatCard = ({ title, value, trend, icon: Icon, colorClass, bgClass, trendUp }: any) => (
  <div className="card p-5 flex flex-col justify-between">
    <div className="flex items-start justify-between">
      <div>
        <p className="text-sm font-medium text-[var(--text-secondary)]">{title}</p>
        <h3 className="text-3xl font-bold mt-2 text-[var(--text-primary)]">{value}</h3>
      </div>
      <div className={`p-3 rounded-xl ${bgClass} ${colorClass}`}>
        <Icon size={20} />
      </div>
    </div>
    <div className="mt-4 flex items-center gap-2">
      <span className={`text-xs font-bold ${trendUp ? 'text-green-500' : 'text-red-500'}`}>
        {trendUp ? '↑' : '↓'} {trend}
      </span>
      <span className="text-xs text-[var(--text-muted)]">vs last 30 days</span>
    </div>
  </div>
);

export default function AuditPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAction, setSelectedAction] = useState('ALL');
  const [selectedResource, setSelectedResource] = useState('ALL');

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      const res = await apiClient.get('/audit');
      if (res.data && res.data.length > 0) {
        setLogs(res.data);
      } else {
        // Fallback mock data matching the screenshot style + extra items for pagination testing
        const mock = [];
        for (let i = 0; i < 45; i++) {
          mock.push({ 
            id: `mock_${i}`, 
            action: i % 3 === 0 ? 'POST' : i % 2 === 0 ? 'UPDATE' : 'DELETE', 
            resource: i % 2 === 0 ? '/api/v1/devices/sync' : '/api/v1/users/auth', 
            resourceType: i % 2 === 0 ? 'Devices Sync' : 'User', 
            admin: { fullName: 'Super Admin', email: 'admin@smartbio.local' }, 
            createdAt: new Date(Date.now() - (i * 3600000)).toISOString(), 
            ipAddress: '::1' 
          });
        }
        setLogs(mock);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const getActionBadge = (action: string) => {
    switch (action.toUpperCase()) {
      case 'POST': 
      case 'CREATE': 
        return <span className="bg-blue-500/10 text-blue-500 text-[10px] font-bold px-3 py-1 rounded border border-blue-500/20">POST</span>;
      case 'DELETE': 
        return <span className="bg-red-500/10 text-red-500 text-[10px] font-bold px-3 py-1 rounded border border-red-500/20">DELETE</span>;
      case 'UPDATE': 
      case 'PUT':
      case 'PATCH':
        return <span className="bg-yellow-500/10 text-yellow-500 text-[10px] font-bold px-3 py-1 rounded border border-yellow-500/20">UPDATE</span>;
      default: 
        return <span className="bg-gray-500/10 text-gray-400 text-[10px] font-bold px-3 py-1 rounded border border-gray-500/20">{action}</span>;
    }
  };

  const filteredLogs = useMemo(() => {
    return logs.filter(log => {
      const matchesSearch = 
        log.admin?.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) || 
        log.admin?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.resource.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.action.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesAction = selectedAction === 'ALL' || log.action === selectedAction;
      const matchesResource = selectedResource === 'ALL' || log.resourceType === selectedResource;
      
      return matchesSearch && matchesAction && matchesResource;
    });
  }, [logs, searchTerm, selectedAction, selectedResource]);

  const totalPages = Math.ceil(filteredLogs.length / rowsPerPage);
  const paginatedLogs = filteredLogs.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Calculate stats dynamically if using real data
  const createActions = logs.filter(l => l.action === 'POST' || l.action === 'CREATE').length;
  const updateActions = logs.filter(l => l.action === 'UPDATE' || l.action === 'PUT' || l.action === 'PATCH').length;
  const deleteActions = logs.filter(l => l.action === 'DELETE').length;

  return (
    <div className="max-w-[1400px] mx-auto p-4 md:p-8 space-y-6">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[var(--text-primary)]">Audit Logs</h1>
          <p className="text-[var(--text-secondary)] mt-1 text-sm">Track administrative actions and system security events.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-[var(--surface-2)] border border-[var(--border)] hover:bg-[var(--surface-hover)] rounded-lg text-sm font-medium transition-colors text-[var(--text-primary)]">
            <Clock size={16} className="text-[var(--text-muted)]" />
            Last 30 Days
            <ChevronDown size={14} className="ml-1 opacity-70" />
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-[var(--surface-2)] border border-[var(--border)] hover:bg-[var(--surface-hover)] rounded-lg text-sm font-medium transition-colors text-[var(--text-primary)]">
            <Download size={16} /> Export CSV
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors shadow-sm">
            <FileText size={16} /> Export PDF
          </button>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        <StatCard title="Total Logs" value={logs.length} trend="18.5%" trendUp={true} icon={FileBox} colorClass="text-blue-500" bgClass="bg-blue-500/10" />
        <StatCard title="Create Actions" value={createActions} trend="14.2%" trendUp={true} icon={FilePlus} colorClass="text-green-500" bgClass="bg-green-500/10" />
        <StatCard title="Update Actions" value={updateActions} trend="9.8%" trendUp={true} icon={FileEdit} colorClass="text-yellow-500" bgClass="bg-yellow-500/10" />
        <StatCard title="Delete Actions" value={deleteActions} trend="6.3%" trendUp={false} icon={Trash2} colorClass="text-red-500" bgClass="bg-red-500/10" />
        <StatCard title="Login Events" value="0" trend="22.7%" trendUp={true} icon={LogIn} colorClass="text-purple-500" bgClass="bg-purple-500/10" />
      </div>

      {/* Data Table Area */}
      <div className="card bg-[var(--surface)] border border-[var(--border)] rounded-2xl overflow-hidden">
        
        {/* Filters Bar */}
        <div className="p-4 border-b border-[var(--border)] flex flex-wrap gap-4 items-center bg-[var(--surface-2)]/30">
          <div className="relative flex-1 min-w-[250px]">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
            <input 
              type="text" 
              placeholder="Search by user, action, resource or ID..."
              value={searchTerm}
              onChange={e => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              className="w-full bg-[var(--surface)] border border-[var(--border)] rounded-lg pl-9 pr-4 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none text-[var(--text-primary)] transition-colors"
            />
          </div>
          
          <select 
            value={selectedAction} 
            onChange={e => { setSelectedAction(e.target.value); setCurrentPage(1); }}
            className="bg-[var(--surface)] border border-[var(--border)] rounded-lg px-4 py-2 text-sm text-[var(--text-primary)] outline-none focus:border-blue-500"
          >
            <option value="ALL">All Actions</option>
            <option value="POST">POST</option>
            <option value="UPDATE">UPDATE</option>
            <option value="DELETE">DELETE</option>
          </select>

          <button className="flex items-center gap-2 px-4 py-2 bg-[var(--surface)] border border-[var(--border)] hover:bg-[var(--surface-hover)] rounded-lg text-sm text-[var(--text-primary)] transition-colors">
            <Filter size={14} /> More Filters
          </button>
          
          <button onClick={() => { setSearchTerm(''); setSelectedAction('ALL'); setCurrentPage(1); }} className="flex items-center gap-2 px-4 py-2 text-sm text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors ml-auto">
            <RefreshCcw size={14} /> Reset
          </button>
        </div>

        {/* Table */}
        <div className="overflow-x-auto min-h-[300px]">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-[var(--surface-2)]/50 text-[var(--text-muted)] border-b border-[var(--border)]">
              <tr>
                <th className="px-6 py-4 font-medium w-16">#</th>
                <th className="px-6 py-4 font-medium">User</th>
                <th className="px-6 py-4 font-medium">Action <ChevronDown size={12} className="inline ml-1 opacity-50" /></th>
                <th className="px-6 py-4 font-medium">Resource</th>
                <th className="px-6 py-4 font-medium">IP Address</th>
                <th className="px-6 py-4 font-medium">Date & Time <ChevronDown size={12} className="inline ml-1 opacity-50" /></th>
                <th className="px-6 py-4 font-medium text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {paginatedLogs.map((log, i) => (
                <tr key={log.id} className="hover:bg-[var(--surface-hover)] transition-colors">
                  <td className="px-6 py-4 text-[var(--text-secondary)]">{(currentPage - 1) * rowsPerPage + i + 1}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center font-bold text-xs shrink-0">
                        {log.admin?.fullName?.split(' ').map((n:any)=>n[0]).join('') || 'SA'}
                      </div>
                      <div>
                        <div className="font-medium text-[var(--text-primary)]">{log.admin?.fullName || 'Super Admin'}</div>
                        <div className="text-xs text-[var(--text-secondary)]">{log.admin?.email || 'admin@smartbio.local'}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {getActionBadge(log.action)}
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-xs text-[var(--text-primary)] max-w-md truncate">
                      {log.resource}
                    </div>
                    {log.resourceType && <div className="text-xs text-[var(--text-secondary)] mt-1">{log.resourceType}</div>}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-xs text-[var(--text-secondary)]">
                      {log.ipAddress} <MapPin size={12} className="text-[var(--text-muted)]" />
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-xs text-[var(--text-primary)]">{format(new Date(log.createdAt), 'MMM dd, yyyy')}</div>
                    <div className="text-xs text-[var(--text-secondary)] mt-1">{format(new Date(log.createdAt), 'hh:mm a')}</div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="inline-flex items-center gap-2 px-3 py-1.5 bg-[var(--surface-2)] border border-[var(--border)] hover:bg-[var(--surface-hover)] hover:text-blue-400 rounded text-xs font-medium text-[var(--text-muted)] transition-colors">
                      <Eye size={14} /> View
                    </button>
                  </td>
                </tr>
              ))}
              {paginatedLogs.length === 0 && (
                 <tr>
                    <td colSpan={7} className="text-center py-12 text-[var(--text-muted)]">No logs found matching your criteria.</td>
                 </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="p-4 border-t border-[var(--border)] flex flex-col md:flex-row gap-4 items-center justify-between bg-[var(--surface-2)]/30 text-sm">
          <div className="text-[var(--text-secondary)]">
            Showing {Math.min((currentPage - 1) * rowsPerPage + 1, filteredLogs.length)} to {Math.min(currentPage * rowsPerPage, filteredLogs.length)} of {filteredLogs.length} results
          </div>
          
          <div className="flex items-center gap-1">
            <button 
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="w-8 h-8 flex items-center justify-center rounded hover:bg-[var(--surface)] text-[var(--text-muted)] disabled:opacity-50 transition-colors"
            >
              <ChevronLeft size={16} />
            </button>
            
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              // Simple pagination display logic
              let pageNum = i + 1;
              if (totalPages > 5 && currentPage > 3) {
                 pageNum = currentPage - 2 + i;
                 if (pageNum > totalPages) return null; // Avoid showing out of bounds pages at the end
              }
              
              if (pageNum > totalPages) return null;

              return (
                <button 
                  key={pageNum}
                  onClick={() => handlePageChange(pageNum)}
                  className={`w-8 h-8 flex items-center justify-center rounded transition-colors ${
                    currentPage === pageNum 
                      ? 'bg-blue-600 text-white font-medium' 
                      : 'hover:bg-[var(--surface)] text-[var(--text-primary)]'
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}
            
            {totalPages > 5 && currentPage < totalPages - 2 && (
              <>
                <span className="px-2 text-[var(--text-muted)]">...</span>
                <button 
                  onClick={() => handlePageChange(totalPages)}
                  className="w-8 h-8 flex items-center justify-center rounded hover:bg-[var(--surface)] text-[var(--text-primary)] transition-colors"
                >
                  {totalPages}
                </button>
              </>
            )}
            
            <button 
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages || totalPages === 0}
              className="w-8 h-8 flex items-center justify-center rounded hover:bg-[var(--surface)] text-[var(--text-muted)] disabled:opacity-50 transition-colors"
            >
              <ChevronRight size={16} />
            </button>
          </div>

          <div className="flex items-center gap-2 text-[var(--text-secondary)]">
            Rows per page
            <select 
              value={rowsPerPage} 
              onChange={e => { setRowsPerPage(Number(e.target.value)); setCurrentPage(1); }}
              className="bg-[var(--surface)] border border-[var(--border)] rounded px-2 py-1 text-xs outline-none focus:border-blue-500 text-[var(--text-primary)]"
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
            </select>
          </div>
        </div>

      </div>
    </div>
  );
}
