'use client';

import { Student } from '@/lib/types';
import { getClassAverages, analyzeStudent } from '@/lib/analysis';
import Card from '@/components/ui/Card';
import { AlertTriangle, TrendingDown, Lightbulb, Target } from 'lucide-react';

interface InsightsPanelProps {
  students: Student[];
  selectedStudent: Student | null;
}

export default function InsightsPanel({ students, selectedStudent }: InsightsPanelProps) {
  const classAvg = getClassAverages(students);

  if (!classAvg || students.length === 0) {
    return (
      <Card className="p-6">
        <p className="text-slate-500 text-center">No data available</p>
      </Card>
    );
  }

  // Get class-level insights
  const lowAttendanceCount = students.filter(s => s.Attendance < 80).length;
  const highStressCount = students.filter(s => s.Stress_Level >= 7).length;
  const lowSleepCount = students.filter(s => s.Sleep_Hours_per_Night < 6).length;

  // Calculate class performance distribution
  const gradeDistribution = {
    A: students.filter(s => s.Grade === 'A').length,
    B: students.filter(s => s.Grade === 'B').length,
    C: students.filter(s => s.Grade === 'C').length,
    D: students.filter(s => s.Grade === 'D').length,
    F: students.filter(s => s.Grade === 'F').length,
  };

  const insights = [
    {
      icon: <AlertTriangle className="w-5 h-5 text-amber-500" />,
      title: 'Attendance Concerns',
      desc: `${lowAttendanceCount} students (${Math.round(lowAttendanceCount / students.length * 100)}%) have attendance below 80%`,
      severity: 'high' as const,
    },
    {
      icon: <TrendingDown className="w-5 h-5 text-orange-500" />,
      title: 'Sleep Deprivation',
      desc: `${lowSleepCount} students sleep less than 6 hours per night`,
      severity: 'medium' as const,
    },
    {
      icon: <Target className="w-5 h-5 text-violet-500" />,
      title: 'High Stress Levels',
      desc: `${highStressCount} students report stress level 7 or above`,
      severity: 'medium' as const,
    },
  ];

  return (
    <div className="space-y-4">
      {/* Selected Student Insights */}
      {selectedStudent && (
        <Card className="p-5">
          <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-indigo-500" />
            Analysis: {selectedStudent.First_Name}
          </h3>
          {(() => {
            const analysis = analyzeStudent(selectedStudent, classAvg);
            return (
              <div className="space-y-3">
                {analysis.insights.map((insight, idx) => (
                  <div key={idx} className="p-3 bg-slate-50 rounded-lg">
                    <p className="text-sm text-slate-700">{insight}</p>
                  </div>
                ))}
                {analysis.recommendations.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-slate-200">
                    <p className="text-xs font-semibold text-slate-500 uppercase mb-2">Recommendations</p>
                    {analysis.recommendations.slice(0, 3).map((rec, idx) => (
                      <div key={idx} className="flex items-start gap-2 mb-2">
                        <span className={`px-2 py-0.5 text-xs font-medium rounded ${
                          rec.priority === 'high' ? 'bg-red-100 text-red-700' :
                          rec.priority === 'medium' ? 'bg-amber-100 text-amber-700' :
                          'bg-blue-100 text-blue-700'
                        }`}>
                          {rec.priority}
                        </span>
                        <p className="text-sm text-slate-600">{rec.action}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })()}
        </Card>
      )}

      {/* Class-Level Insights */}
      <Card className="p-5">
        <h3 className="font-semibold text-slate-900 mb-4">Class Overview</h3>
        <div className="space-y-3">
          {insights.map((insight, idx) => (
            <div key={idx} className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg">
              <div className="mt-0.5">{insight.icon}</div>
              <div>
                <p className="font-medium text-slate-800">{insight.title}</p>
                <p className="text-sm text-slate-600">{insight.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Grade Distribution */}
      <Card className="p-5">
        <h3 className="font-semibold text-slate-900 mb-4">Grade Distribution</h3>
        <div className="flex items-center gap-2">
          {Object.entries(gradeDistribution).map(([grade, count]) => (
            <div key={grade} className="flex-1 text-center">
              <div className={`h-20 rounded-t-lg ${
                grade === 'A' ? 'bg-emerald-500' :
                grade === 'B' ? 'bg-blue-500' :
                grade === 'C' ? 'bg-amber-500' :
                grade === 'D' ? 'bg-orange-500' : 'bg-red-500'
              }`} style={{ height: `${(count / students.length) * 80}px` }} />
              <p className="text-xs font-medium text-slate-600 mt-1">{grade}</p>
              <p className="text-xs text-slate-400">{count}</p>
            </div>
          ))}
        </div>
      </Card>

      {/* Key Metrics */}
      <Card className="p-5">
        <h3 className="font-semibold text-slate-900 mb-4">Class Averages</h3>
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm text-slate-600">Study Hours/Week</span>
            <span className="text-sm font-medium text-slate-900">{classAvg.Study_Hours_per_Week.toFixed(1)}hrs</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-slate-600">Sleep Hours/Night</span>
            <span className="text-sm font-medium text-slate-900">{classAvg.Sleep_Hours_per_Night.toFixed(1)}hrs</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-slate-600">Stress Level</span>
            <span className="text-sm font-medium text-slate-900">{classAvg.Stress_Level.toFixed(1)}/10</span>
          </div>
        </div>
      </Card>
    </div>
  );
}