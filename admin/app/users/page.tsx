"use client";
import React, { useEffect, useState } from 'react';
import { Users, Plus, RefreshCw } from 'lucide-react';
import { userApi, UserData } from '../../src/modules/user/services/user.service';
import { UserTable } from '../../src/modules/user/components/UserTable';
import { UserModal } from '../../src/modules/user/components/UserModal';

export default function UsersPage() {
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserData | null>(null);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const data = await userApi.getAll();
      if (data.success) {
        setUsers(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch users', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleAddSubmit = async (data: Partial<UserData>) => {
    if (editingUser) {
      await userApi.update(editingUser.id, data);
    } else {
      await userApi.create(data);
    }
    fetchUsers();
  };

  const handleEdit = (user: UserData) => {
    setEditingUser(user);
    setIsModalOpen(true);
  };

  const openAddModal = () => {
    setEditingUser(null);
    setIsModalOpen(true);
  };

  return (
    <div className="max-w-[1400px] mx-auto p-4 md:p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-[var(--text-primary)]">Students Roster</h2>
          <p className="text-sm text-[var(--text-muted)] mt-1">
            Manage your students, assign departments, and track enrollment.
          </p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={fetchUsers}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-[var(--surface-2)] hover:bg-[var(--border)] border border-[var(--border)] rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            Refresh
          </button>
          <button 
            onClick={openAddModal}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors shadow-lg shadow-blue-500/20"
          >
            <Plus size={16} />
            Add Student
          </button>
        </div>
      </div>

      <div className="card p-1">
        {loading && users.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-4 text-[var(--text-muted)] text-sm">Loading students...</p>
          </div>
        ) : (
          <UserTable users={users} onRefresh={fetchUsers} onEdit={handleEdit} />
        )}
      </div>

      <UserModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleAddSubmit}
        user={editingUser}
      />
    </div>
  );
}
