import React, { useState } from 'react';
import { Trash2, Edit2, Shield, User } from 'lucide-react';
import { UserData, userApi } from '../services/user.service';

interface UserTableProps {
  users: UserData[];
  onRefresh: () => void;
  onEdit: (user: UserData) => void;
}

export function UserTable({ users, onRefresh, onEdit }: UserTableProps) {
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this student?')) return;
    try {
      setLoadingId(id);
      await userApi.remove(id);
      onRefresh();
    } catch (error) {
      console.error('Failed to delete user', error);
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <div className="overflow-x-auto rounded-lg border border-[var(--border)] bg-[var(--surface)]">
      <table className="w-full text-sm text-left">
        <thead className="text-xs uppercase bg-[var(--surface-2)] text-[var(--text-muted)] border-b border-[var(--border)]">
          <tr>
            <th className="px-6 py-4 font-medium">Student ID</th>
            <th className="px-6 py-4 font-medium">Name</th>
            <th className="px-6 py-4 font-medium">Department</th>
            <th className="px-6 py-4 font-medium">Status</th>
            <th className="px-6 py-4 font-medium text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[var(--border)]">
          {users.map((user) => (
            <tr key={user.id} className="hover:bg-[var(--surface-2)]/50 transition-colors">
              <td className="px-6 py-4 font-mono text-[var(--text-secondary)]">
                {user.studentId}
              </td>
              <td className="px-6 py-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-[var(--text-primary)]">
                    {user.fullName ? user.fullName.charAt(0).toUpperCase() : 'S'}
                  </div>
                  <div className="flex flex-col">
                    <span className="font-semibold text-[var(--text-primary)]">{user.fullName}</span>
                    <span className="text-xs text-[var(--text-muted)]">{user.email || 'No email'}</span>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 text-[var(--text-secondary)]">
                {user.department || 'N/A'}
              </td>
              <td className="px-6 py-4">
                {user.status === 'ACTIVE' ? (
                  <span className="badge-active flex items-center gap-1 w-max"><Shield size={12}/> Active</span>
                ) : (
                  <span className="badge-offline flex items-center gap-1 w-max"><User size={12}/> Inactive</span>
                )}
              </td>
              <td className="px-6 py-4 text-right space-x-2">
                <button 
                  onClick={() => onEdit(user)}
                  disabled={loadingId === user.id}
                  className="p-1.5 text-[var(--text-muted)] hover:text-blue-400 hover:bg-blue-500/10 rounded transition-colors disabled:opacity-50"
                  title="Edit"
                >
                  <Edit2 size={16} />
                </button>
                <button 
                  onClick={() => handleDelete(user.id)}
                  disabled={loadingId === user.id}
                  className="p-1.5 text-[var(--text-muted)] hover:text-red-400 hover:bg-red-500/10 rounded transition-colors disabled:opacity-50"
                  title="Delete"
                >
                  <Trash2 size={16} />
                </button>
              </td>
            </tr>
          ))}
          {users.length === 0 && (
            <tr>
              <td colSpan={5} className="px-6 py-8 text-center text-[var(--text-muted)]">
                No students found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
