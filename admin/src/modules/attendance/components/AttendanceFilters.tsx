import React from 'react';
import { Input } from '../../../components/ui/Input';
import { Button } from '../../../components/ui/Button';
import { Search, Filter, Calendar } from 'lucide-react';

export function AttendanceFilters() {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6">
      <div className="flex items-center gap-2 w-full sm:w-auto flex-1 max-w-md">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <Input 
            placeholder="Search by name, role, department..." 
            className="pl-9 w-full bg-white"
          />
        </div>
        <Button variant="outline" className="px-3">
          Filter <Filter size={14} className="ml-2" />
        </Button>
      </div>

      <div className="flex items-center gap-3 w-full sm:w-auto">
        <select className="h-9 px-3 py-1 rounded-md border border-slate-200 bg-white text-sm text-slate-700 focus:outline-none focus:ring-1 focus:ring-slate-950">
          <option>All Departments</option>
          <option>Engineering</option>
          <option>Marketing</option>
          <option>Sales</option>
          <option>HR</option>
        </select>
        
        <div className="relative">
          <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <Input 
            defaultValue="22 Dec, 2025"
            className="pl-9 w-36 bg-white cursor-pointer"
            readOnly
          />
        </div>
      </div>
    </div>
  );
}
