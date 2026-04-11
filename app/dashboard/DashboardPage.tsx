'use client';

import { useState, useEffect } from 'react';
import Sidebar from '@/components/ui/Sidebar';
import Card, { CardHeader, CardContent } from '@/components/ui/Card';
import MetricsBar from '@/components/dashboard/MetricsBar';
import StudentTable from '@/components/dashboard/StudentTable';
import InsightsPanel from '@/components/dashboard/InsightsPanel';
import StudentQuickView from '@/components/dashboard/StudentQuickView';
import { calculateClassMetrics } from '@/lib/analysis';
import { Student, StudentExtended } from '@/lib/types';
import { Search } from 'lucide-react';
import { Loader2, AlertTriangle } from 'lucide-react';

export default function DashboardPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedStudent, setSelectedStudent] = useState<StudentExtended | null>(null);
  const [quickViewOpen, setQuickViewOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetch('/api/students')
      .then(res => {
        if (!res.ok) throw new Error('Failed to load students');
        return res.json();
      })
      .then(data => {
        setStudents(data);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  const metrics = students.length > 0 ? calculateClassMetrics(students) : null;

  // Extend students with additional data
  const extendedStudents: StudentExtended[] = students.map(s => ({
    ...s,
    isAtRisk: s.Grade === 'D' || s.Grade === 'F' || s.Total_Score < 60,
    trend: s.Total_Score > 75 ? 'up' : s.Total_Score < 60 ? 'down' : 'stable',
  }));

  // Filter students based on search
  const filteredStudents = extendedStudents.filter(s => {
    const fullName = `${s.First_Name} ${s.Last_Name}`.toLowerCase();
    const id = s.Student_ID.toLowerCase();
    const query = searchQuery.toLowerCase();
    return fullName.includes(query) || id.includes(query);
  });

  const handleStudentClick = (student: StudentExtended) => {
    setSelectedStudent(student);
    setQuickViewOpen(true);
  };

  if (loading) {
    return (
      <div className="flex min-h-screen bg-slate-50">
        <Sidebar />
        <main className="flex-1 p-8 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin text-indigo-500 mx-auto mb-4" />
            <p className="text-slate-500">Loading student data...</p>
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen bg-slate-50">
        <Sidebar />
        <main className="flex-1 p-8 flex items-center justify-center">
          <Card className="max-w-md">
            <CardContent className="text-center py-8">
              <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-slate-900 mb-2">Error Loading Data</h3>
              <p className="text-slate-500">{error}</p>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />

      <main className="flex-1 p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-900">Class Overview</h1>
          <p className="text-slate-500 mt-1">
            Monitor student performance and identify areas for intervention • {students.length} students
          </p>
        </div>

        {/* Metrics Bar */}
        {metrics && (
          <MetricsBar
            avgScore={metrics.avgScore}
            avgAttendance={metrics.avgAttendance}
            atRiskCount={metrics.atRiskCount}
            avgStress={metrics.avgStress}
          />
        )}

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Student Table - Takes 2 columns */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-slate-900">Student Performance</h2>
                  <p className="text-sm text-slate-500 mt-0.5">{students.length} students enrolled</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Search students..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <StudentTable
                  students={filteredStudents}
                  onStudentClick={handleStudentClick}
                />
              </CardContent>
            </Card>
          </div>

          {/* Insights Panel - Takes 1 column */}
          <div className="lg:col-span-1">
            <InsightsPanel
              students={students}
              selectedStudent={selectedStudent}
            />
          </div>
        </div>
      </main>

      {/* Student Quick View Modal */}
      <StudentQuickView
        student={selectedStudent}
        isOpen={quickViewOpen}
        onClose={() => {
          setQuickViewOpen(false);
          setSelectedStudent(null);
        }}
        students={students}
      />
    </div>
  );
}
