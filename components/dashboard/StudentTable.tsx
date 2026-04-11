'use client';

import { Student, StudentExtended } from '@/lib/types';
import Table from '@/components/ui/Table';
import Badge from '@/components/ui/Badge';

interface StudentTableProps {
  students: Student[];
  onStudentClick: (student: StudentExtended) => void;
}

export default function StudentTable({ students, onStudentClick }: StudentTableProps) {
  const columns = [
    {
      key: 'Student_ID',
      header: 'ID',
      sortable: true,
      render: (row: Student) => (
        <span className="font-mono text-xs text-slate-500">{row.Student_ID}</span>
      ),
    },
    {
      key: 'First_Name',
      header: 'Name',
      sortable: true,
      render: (row: Student) => (
        <div>
          <p className="font-medium text-slate-900">{row.First_Name} {row.Last_Name}</p>
          <p className="text-xs text-slate-500">{row.Email}</p>
        </div>
      ),
    },
    {
      key: 'Department',
      header: 'Department',
      sortable: true,
    },
    {
      key: 'Total_Score',
      header: 'Score',
      sortable: true,
      render: (row: Student) => (
        <div className="text-center">
          <span className={`font-semibold ${
            row.Total_Score >= 90 ? 'text-emerald-600' :
            row.Total_Score >= 80 ? 'text-blue-600' :
            row.Total_Score >= 70 ? 'text-amber-600' :
            row.Total_Score >= 60 ? 'text-orange-600' : 'text-red-600'
          }`}>
            {row.Total_Score}%
          </span>
        </div>
      ),
    },
    {
      key: 'Grade',
      header: 'Grade',
      render: (row: Student) => {
        const variant = row.Grade as 'A' | 'B' | 'C' | 'D' | 'F';
        return <Badge variant={variant}>{row.Grade}</Badge>;
      },
    },
    {
      key: 'Attendance',
      header: 'Attendance',
      sortable: true,
      render: (row: Student) => (
        <div className="flex items-center gap-2">
          <div className="w-16 h-2 bg-slate-200 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full ${
                row.Attendance >= 90 ? 'bg-emerald-500' :
                row.Attendance >= 80 ? 'bg-blue-500' :
                row.Attendance >= 70 ? 'bg-amber-500' : 'bg-red-500'
              }`}
              style={{ width: `${row.Attendance}%` }}
            />
          </div>
          <span className="text-sm text-slate-600">{row.Attendance}%</span>
        </div>
      ),
    },
    {
      key: 'Stress_Level',
      header: 'Stress',
      render: (row: Student) => {
        const level = row.Stress_Level;
        return (
          <div className="flex items-center gap-1">
            <div className={`w-2 h-2 rounded-full ${
              level <= 4 ? 'bg-emerald-500' :
              level <= 6 ? 'bg-amber-500' : 'bg-red-500'
            }`} />
            <span className="text-sm text-slate-600">{level}/10</span>
          </div>
        );
      },
    },
  ];

  return (
    <div>
      <Table
        columns={columns}
        data={students}
        onRowClick={(row) => onStudentClick(row as StudentExtended)}
        pageSize={10}
      />
    </div>
  );
}