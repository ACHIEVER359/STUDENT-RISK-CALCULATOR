'use client';

import { Student } from '@/lib/types';
import Modal from '@/components/ui/Modal';
import Badge from '@/components/ui/Badge';
import { calculateClassMetrics, getClassAverages, analyzeStudent } from '@/lib/analysis';
import { User, Mail, Phone, BookOpen, Clock, TrendingUp, AlertCircle } from 'lucide-react';

interface StudentQuickViewProps {
  student: Student | null;
  isOpen: boolean;
  onClose: () => void;
  students: Student[];
}

export default function StudentQuickView({ student, isOpen, onClose, students }: StudentQuickViewProps) {
  if (!student) return null;

  const classAvg = getClassAverages(students);
  const analysis = classAvg ? analyzeStudent(student, classAvg) : null;

  const factorColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'text-red-600 bg-red-50';
      case 'medium': return 'text-amber-600 bg-amber-50';
      default: return 'text-blue-600 bg-blue-50';
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Student Quick View" size="lg">
      <div className="space-y-6">
        {/* Student Header */}
        <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl">
          <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-violet-500 rounded-full flex items-center justify-center text-white text-xl font-bold">
            {student.First_Name[0]}{student.Last_Name[0]}
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-bold text-slate-900">{student.First_Name} {student.Last_Name}</h3>
            <p className="text-slate-500 flex items-center gap-2">
              <span className="font-mono text-sm">{student.Student_ID}</span>
              <span className="text-slate-300">|</span>
              <span>{student.Department}</span>
            </p>
            <div className="flex items-center gap-3 mt-2">
              <Badge variant={student.Grade as 'A' | 'B' | 'C' | 'D' | 'F'} className="text-sm px-3 py-1">
                Grade: {student.Grade}
              </Badge>
              <span className={`text-sm font-medium ${
                student.Total_Score >= 80 ? 'text-emerald-600' :
                student.Total_Score >= 60 ? 'text-amber-600' : 'text-red-600'
              }`}>
                Score: {student.Total_Score}%
              </span>
            </div>
          </div>
        </div>

        {/* Performance Metrics */}
        <div>
          <h4 className="text-sm font-semibold text-slate-500 uppercase mb-3">Performance Breakdown</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: 'Midterm', value: student.Midterm_Score },
              { label: 'Final', value: student.Final_Score },
              { label: 'Assignments', value: student.Assignments_Avg },
              { label: 'Quizzes', value: student.Quizzes_Avg },
              { label: 'Participation', value: student.Participation_Score },
              { label: 'Projects', value: student.Projects_Score },
              { label: 'Attendance', value: student.Attendance },
              { label: 'Total', value: student.Total_Score },
            ].map((metric) => (
              <div key={metric.label} className="p-3 bg-white border border-slate-200 rounded-lg">
                <p className="text-xs text-slate-500">{metric.label}</p>
                <p className="text-lg font-bold text-slate-900">{metric.value}%</p>
              </div>
            ))}
          </div>
        </div>

        {/* Lifestyle Factors */}
        <div>
          <h4 className="text-sm font-semibold text-slate-500 uppercase mb-3">Lifestyle Factors</h4>
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 bg-white border border-slate-200 rounded-lg flex items-center gap-3">
              <Clock className="w-5 h-5 text-slate-400" />
              <div>
                <p className="text-xs text-slate-500">Study Hours/Week</p>
                <p className="text-sm font-bold text-slate-900">{student.Study_Hours_per_Week}hrs</p>
              </div>
            </div>
            <div className="p-3 bg-white border border-slate-200 rounded-lg flex items-center gap-3">
              <Clock className="w-5 h-5 text-slate-400" />
              <div>
                <p className="text-xs text-slate-500">Sleep/Night</p>
                <p className="text-sm font-bold text-slate-900">{student.Sleep_Hours_per_Night}hrs</p>
              </div>
            </div>
            <div className="p-3 bg-white border border-slate-200 rounded-lg flex items-center gap-3">
              <AlertCircle className={`w-5 h-5 ${
                student.Stress_Level >= 7 ? 'text-red-500' :
                student.Stress_Level >= 5 ? 'text-amber-500' : 'text-emerald-500'
              }`} />
              <div>
                <p className="text-xs text-slate-500">Stress Level</p>
                <p className="text-sm font-bold text-slate-900">{student.Stress_Level}/10</p>
              </div>
            </div>
            <div className="p-3 bg-white border border-slate-200 rounded-lg flex items-center gap-3">
              <BookOpen className="w-5 h-5 text-slate-400" />
              <div>
                <p className="text-xs text-slate-500">Family Income</p>
                <p className="text-sm font-bold text-slate-900">{student.Family_Income_Level}</p>
              </div>
            </div>
          </div>
        </div>

        {/* AI Analysis */}
        {analysis && (
          <div>
            <h4 className="text-sm font-semibold text-slate-500 uppercase mb-3">AI Analysis</h4>
            <div className="space-y-3">
              {analysis.factorCorrelations.slice(0, 3).map((factor, idx) => (
                <div key={idx} className={`p-3 rounded-lg ${factorColor(factor.severity)}`}>
                  <p className="font-medium text-sm">{factor.factor}</p>
                  <p className="text-sm mt-1 opacity-80">{factor.impact}</p>
                </div>
              ))}
            </div>
            {analysis.recommendations.length > 0 && (
              <div className="mt-4 pt-4 border-t border-slate-200">
                <p className="text-xs font-semibold text-slate-500 uppercase mb-2">Top Recommendations</p>
                {analysis.recommendations.slice(0, 2).map((rec, idx) => (
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
        )}
      </div>
    </Modal>
  );
}