'use client';

import { RadarChart as RechartsRadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer, Legend } from 'recharts';
import { Student } from '@/lib/types';

interface RadarChartProps {
  student: Student;
  classAvg: {
    Midterm_Score: number;
    Final_Score: number;
    Assignments_Avg: number;
    Quizzes_Avg: number;
    Participation_Score: number;
    Projects_Score: number;
    Attendance: number;
  };
}

export default function PerformanceRadar({ student, classAvg }: RadarChartProps) {
  const data = [
    { subject: 'Midterm', student: student.Midterm_Score, classAvg: Math.round(classAvg.Midterm_Score) },
    { subject: 'Final', student: student.Final_Score, classAvg: Math.round(classAvg.Final_Score) },
    { subject: 'Assignments', student: student.Assignments_Avg, classAvg: Math.round(classAvg.Assignments_Avg) },
    { subject: 'Quizzes', student: student.Quizzes_Avg, classAvg: Math.round(classAvg.Quizzes_Avg) },
    { subject: 'Participation', student: student.Participation_Score, classAvg: Math.round(classAvg.Participation_Score) },
    { subject: 'Projects', student: student.Projects_Score, classAvg: Math.round(classAvg.Projects_Score) },
    { subject: 'Attendance', student: student.Attendance, classAvg: Math.round(classAvg.Attendance) },
  ];

  return (
    <div className="h-80">
      <ResponsiveContainer width="100%" height="100%">
        <RechartsRadarChart cx="50%" cy="50%" outerRadius="70%">
          <PolarGrid stroke="#e2e8f0" />
          <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 12 }} />
          <Radar
            name="Student"
            dataKey="student"
            stroke="#6366f1"
            fill="#6366f1"
            fillOpacity={0.4}
            strokeWidth={2}
          />
          <Radar
            name="Class Avg"
            dataKey="classAvg"
            stroke="#94a3b8"
            fill="#94a3b8"
            fillOpacity={0.2}
            strokeWidth={2}
            strokeDasharray="5 5"
          />
          <Legend wrapperStyle={{ fontSize: 12 }} />
        </RechartsRadarChart>
      </ResponsiveContainer>
    </div>
  );
}