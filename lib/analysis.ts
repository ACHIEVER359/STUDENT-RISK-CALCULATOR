import { Student, ClassMetrics, StudentAnalysis } from './types';

export function calculateClassMetrics(students: Student[]): ClassMetrics {
  if (students.length === 0) {
    return { avgScore: 0, avgAttendance: 0, atRiskCount: 0, avgStress: 0 };
  }

  const avgScore = students.reduce((sum, s) => sum + s.Total_Score, 0) / students.length;
  const avgAttendance = students.reduce((sum, s) => sum + s.Attendance, 0) / students.length;
  const avgStress = students.reduce((sum, s) => sum + s.Stress_Level, 0) / students.length;
  const atRiskCount = students.filter(s => s.Grade === 'D' || s.Grade === 'F' || s.Total_Score < 60).length;

  return {
    avgScore: Math.round(avgScore * 10) / 10,
    avgAttendance: Math.round(avgAttendance * 10) / 10,
    atRiskCount,
    avgStress: Math.round(avgStress * 10) / 10,
  };
}

export function getClassAverages(students: Student[]) {
  if (students.length === 0) return null;

  return {
    Attendance: students.reduce((sum, s) => sum + s.Attendance, 0) / students.length,
    Midterm_Score: students.reduce((sum, s) => sum + s.Midterm_Score, 0) / students.length,
    Final_Score: students.reduce((sum, s) => sum + s.Final_Score, 0) / students.length,
    Assignments_Avg: students.reduce((sum, s) => sum + s.Assignments_Avg, 0) / students.length,
    Quizzes_Avg: students.reduce((sum, s) => sum + s.Quizzes_Avg, 0) / students.length,
    Participation_Score: students.reduce((sum, s) => sum + s.Participation_Score, 0) / students.length,
    Projects_Score: students.reduce((sum, s) => sum + s.Projects_Score, 0) / students.length,
    Study_Hours_per_Week: students.reduce((sum, s) => sum + s.Study_Hours_per_Week, 0) / students.length,
    Sleep_Hours_per_Night: students.reduce((sum, s) => sum + s.Sleep_Hours_per_Night, 0) / students.length,
    Stress_Level: students.reduce((sum, s) => sum + s.Stress_Level, 0) / students.length,
  };
}

export function analyzeStudent(student: Student, classAvg: ReturnType<typeof getClassAverages>): StudentAnalysis {
  if (!classAvg) {
    return {
      belowAverageMetrics: [],
      factorCorrelations: [],
      insights: [],
      recommendations: [],
    };
  }

  const academicMetrics = [
    { name: 'Midterm Score', key: 'Midterm_Score' as const, value: student.Midterm_Score, classAvg: classAvg.Midterm_Score },
    { name: 'Final Score', key: 'Final_Score' as const, value: student.Final_Score, classAvg: classAvg.Final_Score },
    { name: 'Assignments Avg', key: 'Assignments_Avg' as const, value: student.Assignments_Avg, classAvg: classAvg.Assignments_Avg },
    { name: 'Quizzes Avg', key: 'Quizzes_Avg' as const, value: student.Quizzes_Avg, classAvg: classAvg.Quizzes_Avg },
    { name: 'Participation', key: 'Participation_Score' as const, value: student.Participation_Score, classAvg: classAvg.Participation_Score },
    { name: 'Projects', key: 'Projects_Score' as const, value: student.Projects_Score, classAvg: classAvg.Projects_Score },
    { name: 'Attendance', key: 'Attendance' as const, value: student.Attendance, classAvg: classAvg.Attendance },
  ];

  const belowAverageMetrics = academicMetrics
    .filter(m => m.value < m.classAvg - 5)
    .map(m => ({
      name: m.name,
      value: Math.round(m.value * 10) / 10,
      classAvg: Math.round(m.classAvg * 10) / 10,
    }));

  const factorCorrelations: StudentAnalysis['factorCorrelations'] = [];

  // Sleep analysis
  if (student.Sleep_Hours_per_Night < classAvg.Sleep_Hours_per_Night - 1) {
    factorCorrelations.push({
      factor: 'Sleep Deprivation',
      impact: `Student sleeps ${Math.round((classAvg.Sleep_Hours_per_Night - student.Sleep_Hours_per_Night) * 10) / 10}hrs less than average. This significantly impacts memory consolidation and cognitive performance.`,
      severity: student.Sleep_Hours_per_Night < 6 ? 'high' : 'medium',
    });
  }

  // Stress analysis
  if (student.Stress_Level > classAvg.Stress_Level + 1) {
    factorCorrelations.push({
      factor: 'High Stress Levels',
      impact: `Student reports stress level of ${student.Stress_Level}/10 vs class average of ${Math.round(classAvg.Stress_Level)}. Elevated stress impairs concentration and information retention.`,
      severity: student.Stress_Level >= 8 ? 'high' : 'medium',
    });
  }

  // Study hours analysis
  if (student.Study_Hours_per_Week < classAvg.Study_Hours_per_Week - 3) {
    factorCorrelations.push({
      factor: 'Insufficient Study Time',
      impact: `Student studies ${Math.round((classAvg.Study_Hours_per_Week - student.Study_Hours_per_Week) * 10) / 10}hrs/week less than peers. This correlates with lower assignment and quiz scores.`,
      severity: 'medium',
    });
  }

  // Attendance analysis
  if (student.Attendance < classAvg.Attendance - 10) {
    factorCorrelations.push({
      factor: 'Poor Attendance',
      impact: `Attendance at ${student.Attendance}% vs class average of ${Math.round(classAvg.Attendance)}%. Low attendance strongly correlates with decreased exam performance.`,
      severity: 'high',
    });
  }

  // Family income correlation
  if (student.Family_Income_Level === 'Low' && student.Internet_Access_at_Home === false) {
    factorCorrelations.push({
      factor: 'Resource Limitations',
      impact: 'Student lacks home internet access which limits ability to complete online assignments and access learning resources.',
      severity: 'high',
    });
  }

  // Generate insights
  const insights: string[] = [];

  if (belowAverageMetrics.length > 0) {
    const lowest = belowAverageMetrics.sort((a, b) => a.value - b.value)[0];
    insights.push(`${student.First_Name}'s lowest performance is in ${lowest.name} (${lowest.value}) compared to class average (${lowest.classAvg}).`);
  }

  if (student.Total_Score < classAvg.Midterm_Score + classAvg.Final_Score / 2 - 10) {
    insights.push('Performance decline may be linked to accumulated gaps in foundational topics.');
  }

  if (factorCorrelations.some(f => f.factor === 'Sleep Deprivation')) {
    insights.push('Sleep deprivation is likely contributing to reduced cognitive performance and memory recall issues.');
  }

  if (factorCorrelations.some(f => f.factor === 'High Stress Levels')) {
    insights.push('Elevated stress levels may be affecting both performance and class engagement.');
  }

  // Generate recommendations
  const recommendations: StudentAnalysis['recommendations'] = [];

  if (student.Sleep_Hours_per_Night < 7) {
    recommendations.push({
      priority: 'high',
      action: 'Sleep Hygiene Consultation',
      reason: `Only ${student.Sleep_Hours_per_Night}hrs of sleep is below the recommended 7-8hrs for optimal cognitive function.`,
    });
  }

  if (student.Stress_Level >= 7) {
    recommendations.push({
      priority: 'high',
      action: 'Stress Management Program',
      reason: `Stress level of ${student.Stress_Level}/10 indicates need for coping strategies and support.`,
    });
  }

  if (student.Attendance < 80) {
    recommendations.push({
      priority: 'high',
      action: 'Attendance Improvement Plan',
      reason: `${100 - student.Attendance}% absenteeism is severely impacting learning outcomes.`,
    });
  }

  if (student.Study_Hours_per_Week < 10) {
    recommendations.push({
      priority: 'medium',
      action: 'Study Schedule Optimization',
      reason: 'Current study time is insufficient for mastery of course material.',
    });
  }

  if (!student.Internet_Access_at_Home) {
    recommendations.push({
      priority: 'medium',
      action: 'Provide Campus Internet Access',
      reason: 'Home internet limitations restrict after-hours learning opportunities.',
    });
  }

  if (student.Participation_Score < classAvg.Participation_Score - 10) {
    recommendations.push({
      priority: 'medium',
      action: 'Increase Class Engagement',
      reason: 'Low participation may indicate lack of confidence or disconnection from material.',
    });
  }

  // Sort by priority
  recommendations.sort((a, b) => {
    const order = { high: 0, medium: 1, low: 2 };
    return order[a.priority] - order[b.priority];
  });

  return {
    belowAverageMetrics,
    factorCorrelations,
    insights,
    recommendations: recommendations.slice(0, 5), // Limit to top 5
  };
}

export function getGradeColor(grade: string): string {
  switch (grade) {
    case 'A': return 'bg-emerald-500';
    case 'B': return 'bg-blue-500';
    case 'C': return 'bg-amber-500';
    case 'D': return 'bg-orange-500';
    case 'F': return 'bg-red-500';
    default: return 'bg-slate-500';
  }
}