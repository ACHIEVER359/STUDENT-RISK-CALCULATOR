'use client';

import { Student } from '@/lib/types';

interface FactorAnalysisProps {
  student: Student;
  classAvg: {
    Study_Hours_per_Week: number;
    Sleep_Hours_per_Night: number;
    Stress_Level: number;
    Attendance: number;
  };
}

export default function FactorAnalysis({ student, classAvg }: FactorAnalysisProps) {
  const factors = [
    {
      name: 'Study Hours/Week',
      studentValue: student.Study_Hours_per_Week,
      classAvg: classAvg.Study_Hours_per_Week,
      maxValue: 25,
      unit: 'hrs',
      color: student.Study_Hours_per_Week < classAvg.Study_Hours_per_Week ? 'bg-amber-500' : 'bg-emerald-500',
    },
    {
      name: 'Sleep/Night',
      studentValue: student.Sleep_Hours_per_Night,
      classAvg: classAvg.Sleep_Hours_per_Night,
      maxValue: 10,
      unit: 'hrs',
      color: student.Sleep_Hours_per_Night < 7 ? 'bg-red-500' : student.Sleep_Hours_per_Night < classAvg.Sleep_Hours_per_Night ? 'bg-amber-500' : 'bg-emerald-500',
    },
    {
      name: 'Stress Level',
      studentValue: student.Stress_Level,
      classAvg: classAvg.Stress_Level,
      maxValue: 10,
      unit: '/10',
      invert: true, // Lower stress is better
      color: student.Stress_Level > 7 ? 'bg-red-500' : student.Stress_Level > classAvg.Stress_Level ? 'bg-amber-500' : 'bg-emerald-500',
    },
    {
      name: 'Attendance',
      studentValue: student.Attendance,
      classAvg: classAvg.Attendance,
      maxValue: 100,
      unit: '%',
      color: student.Attendance < 80 ? 'bg-red-500' : student.Attendance < classAvg.Attendance ? 'bg-amber-500' : 'bg-emerald-500',
    },
  ];

  return (
    <div className="space-y-4">
      {factors.map((factor) => {
        const studentPercent = (factor.studentValue / factor.maxValue) * 100;
        const classAvgPercent = (factor.classAvg / factor.maxValue) * 100;

        return (
          <div key={factor.name} className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="font-medium text-slate-700">{factor.name}</span>
              <div className="flex items-center gap-3">
                <span className="text-slate-900 font-semibold">
                  {factor.studentValue}{factor.unit}
                </span>
                <span className="text-slate-400 text-xs">
                  Avg: {Math.round(factor.classAvg)}{factor.unit}
                </span>
              </div>
            </div>
            <div className="relative">
              {/* Class average marker */}
              <div
                className="absolute top-0 bottom-0 w-0.5 bg-slate-400 z-10"
                style={{ left: `${classAvgPercent}%` }}
              />
              {/* Student bar */}
              <div className="h-6 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className={`h-full ${factor.color} transition-all duration-500`}
                  style={{ width: `${studentPercent}%` }}
                />
              </div>
            </div>
          </div>
        );
      })}

      <div className="flex items-center gap-4 pt-4 border-t border-slate-100">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-emerald-500 rounded-full" />
          <span className="text-xs text-slate-500">At or above average</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-amber-500 rounded-full" />
          <span className="text-xs text-slate-500">Slightly below</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-red-500 rounded-full" />
          <span className="text-xs text-slate-500">Needs attention</span>
        </div>
      </div>
    </div>
  );
}