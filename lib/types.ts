export interface Student {
  Student_ID: string;
  First_Name: string;
  Last_Name: string;
  Email: string;
  Gender: string;
  Age: number;
  Department: string;
  Attendance: number;
  Midterm_Score: number;
  Final_Score: number;
  Assignments_Avg: number;
  Quizzes_Avg: number;
  Participation_Score: number;
  Projects_Score: number;
  Total_Score: number;
  Grade: string;
  Study_Hours_per_Week: number;
  Extracurricular_Activities: string;
  Internet_Access_at_Home: boolean;
  Parent_Education_Level: string;
  Family_Income_Level: string;
  Stress_Level: number;
  Sleep_Hours_per_Night: number;
}

export interface ClassMetrics {
  avgScore: number;
  avgAttendance: number;
  atRiskCount: number;
  avgStress: number;
}

export interface StudentAnalysis {
  belowAverageMetrics: { name: string; value: number; classAvg: number }[];
  factorCorrelations: { factor: string; impact: string; severity: 'low' | 'medium' | 'high' }[];
  insights: string[];
  recommendations: { priority: 'high' | 'medium' | 'low'; action: string; reason: string }[];
}

export type Grade = 'A' | 'B' | 'C' | 'D' | 'F';

export interface StudentExtended extends Student {
  isAtRisk?: boolean;
  trend?: 'up' | 'down' | 'stable';
}

export interface MentalHealthAnalysis {
  studentId: string;
  studentName: string;
  overallMentalWellbeing: 'Critical' | 'At-Risk' | 'Moderate' | 'Good';
  riskFactors: {
    factor: string;
  value: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  impact: string;
  recommendation: string;
  icon: string;
  }[];
  protectiveFactors: {
    factor: string;
    value: string;
    strength: 'strong' | 'moderate' | 'weak';
  }[];
  academicCorrelation: {
    metric: string;
    studentValue: number;
    optimalValue: number;
    impact: 'positive' | 'negative';
    explanation: string;
  }[];
  summary: string;
  actionPlan: {
    priority: 'immediate' | 'high' | 'medium';
    action: string;
    reason: string;
    supportResource: string;
  }[];
  wellbeingScore: number;
  failingProbability: number;
}

export interface PreExamAnalysis {
  student: Student;
  predictedFinalScore: number;
  failingProbability: number;
  riskLevel: 'critical' | 'high' | 'medium' | 'low';
  contributingFactors: {
    factor: string;
    impact: number;
    description: string;
  }[];
  recommendations: {
    priority: 'immediate' | 'high' | 'medium';
    action: string;
    reason: string;
    resources: string;
  }[];
}

export interface DepartmentStats {
  name: string;
  totalStudents: number;
  avgScore: number;
  atRiskCount: number;
  criticalStudents: PreExamAnalysis[];
}