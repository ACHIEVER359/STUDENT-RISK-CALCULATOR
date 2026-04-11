'use client';

import { TrendingUp, Users, AlertTriangle, Moon } from 'lucide-react';
import Card from '@/components/ui/Card';

interface MetricsBarProps {
  avgScore: number;
  avgAttendance: number;
  atRiskCount: number;
  avgStress: number;
}

export default function MetricsBar({ avgScore, avgAttendance, atRiskCount, avgStress }: MetricsBarProps) {
  const metrics = [
    {
      label: 'Average Score',
      value: `${avgScore}%`,
      icon: <TrendingUp className="w-5 h-5" />,
      color: 'text-indigo-600',
      bg: 'bg-indigo-50',
      change: '+2.3%',
    },
    {
      label: 'Attendance Rate',
      value: `${avgAttendance}%`,
      icon: <Users className="w-5 h-5" />,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50',
      change: '+1.5%',
    },
    {
      label: 'At-Risk Students',
      value: atRiskCount.toString(),
      icon: <AlertTriangle className="w-5 h-5" />,
      color: 'text-amber-600',
      bg: 'bg-amber-50',
      change: '-1',
    },
    {
      label: 'Avg Stress Level',
      value: `${avgStress}/10`,
      icon: <Moon className="w-5 h-5" />,
      color: 'text-violet-600',
      bg: 'bg-violet-50',
      change: '-0.5',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {metrics.map((metric, idx) => (
        <Card key={idx} className="p-5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-slate-500 font-medium">{metric.label}</p>
              <p className="text-2xl font-bold text-slate-900 mt-1">{metric.value}</p>
              <p className={`text-xs font-medium mt-2 ${metric.color}`}>{metric.change}</p>
            </div>
            <div className={`p-3 rounded-xl ${metric.bg}`}>
              <div className={metric.color}>{metric.icon}</div>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}