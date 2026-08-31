import React from 'react';
import { Card } from '../../../components/ui/Card';
import { Badge } from '../../../components/ui/Badge';
import { Avatar, AvatarFallback, AvatarImage } from '../../../components/ui/Avatar';
import { Button } from '../../../components/ui/Button';

const MOCK_DATA = [
  { id: 1, date: '22/12', employee: 'Zaire Vetrovs', email: 'zaire@example.com', role: 'Product designer', type: 'FULL-TIME', status: 'PRESENT', in: '09:00 AM', out: '05:00 PM', overtime: '0h', avatar: 'https://i.pravatar.cc/150?u=1' },
  { id: 2, date: '22/12', employee: 'Alfredo Calzoni', email: 'alfredo@example.com', role: 'Software Engineer', type: 'FULL-TIME', status: 'PRESENT', in: '09:00 AM', out: '06:30 PM', overtime: '1.5h', avatar: 'https://i.pravatar.cc/150?u=2' },
  { id: 3, date: '22/12', employee: 'Justin Septimus', email: 'justin@example.com', role: 'Marketing Executive', type: 'FULL-TIME', status: 'ABSENT', in: '-', out: '-', overtime: '0h', avatar: 'https://i.pravatar.cc/150?u=3' },
  { id: 4, date: '22/12', employee: 'Miracle Rosser', email: 'miracle@example.com', role: 'Financial Analyst', type: 'PART-TIME', status: 'PRESENT', in: '09:00 AM', out: '05:00 PM', overtime: '0h', avatar: 'https://i.pravatar.cc/150?u=4' },
  { id: 5, date: '22/12', employee: 'Kadin Botosh', email: 'kadin@example.com', role: 'Sales Manager', type: 'FULL-TIME', status: 'PRESENT', in: '09:00 AM', out: '07:00 PM', overtime: '2h', avatar: 'https://i.pravatar.cc/150?u=5' },
  { id: 6, date: '22/12', employee: 'Makenna Vaccaro', email: 'makenna@example.com', role: 'Product designer', type: 'FULL-TIME', status: 'LATE', in: '10:45 AM', out: '05:00 PM', overtime: '0h', avatar: 'https://i.pravatar.cc/150?u=6' },
  { id: 7, date: '22/12', employee: 'Ruben Workman', email: 'ruben@example.com', role: 'HR Manager', type: 'FULL-TIME', status: 'PRESENT', in: '09:00 AM', out: '05:00 PM', overtime: '0h', avatar: 'https://i.pravatar.cc/150?u=7' },
  { id: 8, date: '22/12', employee: 'Cooper Rhiel Madsen', email: 'cooper@example.com', role: 'Project Manager', type: 'FULL-TIME', status: 'ABSENT', in: '-', out: '-', overtime: '0h', avatar: 'https://i.pravatar.cc/150?u=8' },
  { id: 9, date: '22/12', employee: 'Leo Philips', email: 'leo@example.com', role: 'Sr Product designer', type: 'FULL-TIME', status: 'PRESENT', in: '09:00 AM', out: '05:00 PM', overtime: '0h', avatar: 'https://i.pravatar.cc/150?u=9' },
];

export function AttendanceTable() {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PRESENT': return <Badge variant="success">PRESENT</Badge>;
      case 'ABSENT': return <Badge variant="destructive">ABSENT</Badge>;
      case 'LATE': return <Badge variant="warning">LATE</Badge>;
      default: return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getTypeBadge = (type: string) => {
    return <Badge variant="outline" className="text-pink-600 border-pink-200 bg-pink-50">{type}</Badge>;
  };

  return (
    <Card className="overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-200">
            <tr>
              <th className="px-6 py-4 font-medium">Date</th>
              <th className="px-6 py-4 font-medium">Employee</th>
              <th className="px-6 py-4 font-medium">Role</th>
              <th className="px-6 py-4 font-medium">Employment type</th>
              <th className="px-6 py-4 font-medium">Status</th>
              <th className="px-6 py-4 font-medium">Check In</th>
              <th className="px-6 py-4 font-medium">Check Out</th>
              <th className="px-6 py-4 font-medium">Over Time</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {MOCK_DATA.map((row) => (
              <tr key={row.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4 text-slate-600">{row.date}</td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage src={row.avatar} />
                      <AvatarFallback>{row.employee.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <span className="font-medium text-slate-900">{row.employee}</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-slate-600">{row.role}</td>
                <td className="px-6 py-4">{getTypeBadge(row.type)}</td>
                <td className="px-6 py-4">{getStatusBadge(row.status)}</td>
                <td className="px-6 py-4 text-slate-600">{row.in}</td>
                <td className="px-6 py-4 text-slate-600">{row.out}</td>
                <td className="px-6 py-4 text-slate-600">{row.overtime}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="px-6 py-4 border-t border-slate-200 flex items-center justify-between">
        <Button variant="outline" className="text-slate-400" disabled>Previous</Button>
        <span className="text-sm text-slate-500">Page 1 of 30</span>
        <Button variant="outline">Next</Button>
      </div>
    </Card>
  );
}
