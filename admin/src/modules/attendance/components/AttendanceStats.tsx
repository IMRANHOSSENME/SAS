import React from 'react';
import { Card, CardContent } from '../../../components/ui/Card';
import { Users, Briefcase, AlertCircle, Clock } from 'lucide-react';

export function AttendanceStats() {
  const stats = [
    {
      title: 'Total Employee',
      value: '264',
      change: '+3%',
      isPositive: true,
      icon: Users,
    },
    {
      title: 'Present',
      value: '210',
      change: '+6%',
      isPositive: true,
      icon: Briefcase,
    },
    {
      title: 'Absent',
      value: '54',
      change: '-1%',
      isPositive: false,
      icon: AlertCircle,
    },
    {
      title: 'Request Paid Leave',
      value: '60',
      change: '+10%',
      isPositive: true,
      icon: Clock,
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
      {stats.map((stat, i) => {
        const Icon = stat.icon;
        return (
          <Card key={i}>
            <CardContent className="p-6 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center border border-slate-100">
                  <Icon size={20} className="text-slate-700" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${stat.isPositive ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                      {stat.isPositive ? '↑' : '↓'} {stat.change}
                    </span>
                  </div>
                  <p className="text-sm text-slate-500 font-medium">{stat.title}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
