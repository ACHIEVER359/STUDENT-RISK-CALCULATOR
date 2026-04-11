import { Student, PreExamAnalysis, DepartmentStats } from './types';

/**
 * Calculate failing probability based on multiple risk factors
 */
function calculateFailingProbability(student: Student): number {
  let probability = 5; // Base 5% probability

  // Current score impact (strongest predictor)
  if (student.Total_Score < 50) {
    probability += 45;
  } else if (student.Total_Score < 60) {
    probability += 30;
  } else if (student.Total_Score < 70) {
    probability += 15;
  } else if (student.Total_Score < 80) {
    probability += 5;
  }

  // Midterm score as indicator
  if (student.Midterm_Score < 50) {
    probability += 15;
  } else if (student.Midterm_Score < 60) {
    probability += 8;
  }

  // Attendance impact
  if (student.Attendance < 60) {
    probability += 20;
  } else if (student.Attendance < 75) {
    probability += 12;
  } else if (student.Attendance < 85) {
    probability += 5;
  }

  // Study hours
  if (student.Study_Hours_per_Week < 5) {
    probability += 12;
  } else if (student.Study_Hours_per_Week < 10) {
    probability += 6;
  }

  // Sleep deprivation
  if (student.Sleep_Hours_per_Night < 5) {
    probability += 10;
  } else if (student.Sleep_Hours_per_Night < 6) {
    probability += 5;
  }

  // High stress
  if (student.Stress_Level >= 8) {
    probability += 8;
  } else if (student.Stress_Level >= 7) {
    probability += 4;
  }

  // Financial stress
  if (student.Family_Income_Level === 'Low') {
    probability += 5;
  }

  // No internet access
  if (!student.Internet_Access_at_Home) {
    probability += 5;
  }

  // Assignment completion (if low)
  if (student.Assignments_Avg < 60) {
    probability += 8;
  }

  // Quiz performance
  if (student.Quizzes_Avg < 60) {
    probability += 6;
  }

  return Math.min(100, Math.max(0, probability));
}

/**
 * Predict final exam score based on current metrics
 */
function predictFinalScore(student: Student): number {
  // Weight different factors for prediction
  const weights = {
    midterm: 0.25,
    attendance: 0.15,
    assignments: 0.15,
    quizzes: 0.10,
    participation: 0.05,
    projects: 0.10,
    studyHours: 0.10,
    sleep: 0.05,
    stress: 0.05,
  };

  // Calculate expected final score based on current trajectory
  let predicted = 0;

  // Midterm is a strong indicator
  predicted += student.Midterm_Score * weights.midterm;

  // Attendance affects learning
  predicted += (student.Attendance / 100 * 100) * weights.attendance;

  // Assignment performance
  predicted += student.Assignments_Avg * weights.assignments;

  // Quiz performance
  predicted += student.Quizzes_Avg * weights.quizzes;

  // Participation
  predicted += student.Participation_Score * weights.participation;

  // Projects
  predicted += student.Projects_Score * weights.projects;

  // Study hours adjustment (normalized to 0-100 scale, where 15+ is optimal)
  const studyFactor = Math.min(100, (student.Study_Hours_per_Week / 20) * 100);
  predicted += studyFactor * weights.studyHours;

  // Sleep adjustment (7-8 hours is optimal)
  const sleepFactor = student.Sleep_Hours_per_Night >= 7 ? 100 :
                      student.Sleep_Hours_per_Night >= 6 ? 80 :
                      student.Sleep_Hours_per_Night >= 5 ? 60 : 40;
  predicted += sleepFactor * weights.sleep;

  // Stress adjustment (lower is better)
  const stressFactor = student.Stress_Level <= 4 ? 100 :
                       student.Stress_Level <= 6 ? 85 :
                       student.Stress_Level <= 8 ? 65 : 45;
  predicted += stressFactor * weights.stress;

  return Math.round(predicted * 10) / 10;
}

/**
 * Analyze student for pre-exam predictions
 */
export function analyzePreExam(student: Student): PreExamAnalysis {
  const predictedFinalScore = predictFinalScore(student);
  const failingProbability = calculateFailingProbability(student);

  // Determine risk level
  let riskLevel: PreExamAnalysis['riskLevel'];
  if (failingProbability >= 70) {
    riskLevel = 'critical';
  } else if (failingProbability >= 50) {
    riskLevel = 'high';
  } else if (failingProbability >= 25) {
    riskLevel = 'medium';
  } else {
    riskLevel = 'low';
  }

  // Identify contributing factors
  const contributingFactors: PreExamAnalysis['contributingFactors'] = [];

  if (student.Attendance < 75) {
    contributingFactors.push({
      factor: 'Low Attendance',
      impact: 15 + Math.round((75 - student.Attendance) / 5),
      description: `${student.Attendance}% attendance is limiting learning exposure. Each missed class creates knowledge gaps.`,
    });
  }

  if (student.Study_Hours_per_Week < 10) {
    contributingFactors.push({
      factor: 'Insufficient Study Time',
      impact: 10 + Math.round((10 - student.Study_Hours_per_Week) / 2),
      description: `Only ${student.Study_Hours_per_Week} hrs/week is below recommended 15+ hours. Insufficient preparation time.`,
    });
  }

  if (student.Sleep_Hours_per_Night < 6) {
    contributingFactors.push({
      factor: 'Sleep Deprivation',
      impact: 8 + Math.round((6 - student.Sleep_Hours_per_Night) * 5),
      description: `${student.Sleep_Hours_per_Night} hrs/night impairs memory consolidation and cognitive function during exams.`,
    });
  }

  if (student.Stress_Level >= 7) {
    contributingFactors.push({
      factor: 'High Exam Anxiety',
      impact: 5 + student.Stress_Level,
      description: `Stress level ${student.Stress_Level}/10 may cause test anxiety, racing thoughts, and poor recall during exams.`,
    });
  }

  if (student.Midterm_Score < 60) {
    contributingFactors.push({
      factor: 'Weak Midterm Performance',
      impact: 10 + Math.round((60 - student.Midterm_Score) / 5),
      description: `Midterm score of ${student.Midterm_Score}% indicates foundational gaps that must be addressed before finals.`,
    });
  }

  if (student.Assignments_Avg < 65) {
    contributingFactors.push({
      factor: 'Poor Assignment Completion',
      impact: 8,
      description: `Assignment average of ${student.Assignments_Avg}% suggests incomplete understanding of course material.`,
    });
  }

  if (student.Quizzes_Avg < 65) {
    contributingFactors.push({
      factor: 'Quiz Performance Issues',
      impact: 6,
      description: `Quiz average of ${student.Quizzes_Avg}% indicates topics that need reinforcement before final exam.`,
    });
  }

  if (student.Family_Income_Level === 'Low' && !student.Internet_Access_at_Home) {
    contributingFactors.push({
      factor: 'Resource Limitations',
      impact: 7,
      description: `Limited internet access and financial constraints reduce study resources and practice opportunities.`,
    });
  }

  // Generate recommendations
  const recommendations: PreExamAnalysis['recommendations'] = [];

  if (failingProbability >= 50) {
    recommendations.push({
      priority: 'immediate',
      action: 'Emergency Tutoring Sessions',
      reason: `Failing probability of ${failingProbability}% requires intensive intervention`,
      resources: 'Campus Tutoring Center | Peer Study Groups | Professor Office Hours'
    });
  }

  if (student.Attendance < 80) {
    recommendations.push({
      priority: 'high',
      action: 'Attendance Improvement Plan',
      reason: `Improving attendance to 90%+ could improve final score by 10-15%`,
      resources: 'Academic Advisor | Attendance Support Services'
    });
  }

  if (student.Study_Hours_per_Week < 12) {
    recommendations.push({
      priority: 'high',
      action: 'Study Schedule Restructure',
      reason: `Need ${15 - student.Study_Hours_per_Week}+ additional hours/week for adequate exam preparation`,
      resources: 'Study Skills Workshop | Time Management Counseling'
    });
  }

  if (student.Midterm_Score < 60) {
    recommendations.push({
      priority: 'high',
      action: 'Targeted Review Sessions',
      reason: `Focus on midterm gap topics identified in ${student.Midterm_Score}% midterm performance`,
      resources: 'Subject-specific Tutor | Review Sessions | Online Resources'
    });
  }

  if (student.Sleep_Hours_per_Night < 7) {
    recommendations.push({
      priority: 'medium',
      action: 'Sleep Optimization',
      reason: `Increase sleep to 7-8 hours for optimal memory consolidation before exams`,
      resources: 'Sleep Hygiene Resources | Health Services'
    });
  }

  if (student.Stress_Level >= 7) {
    recommendations.push({
      priority: 'medium',
      action: 'Stress Management Techniques',
      reason: `Learn coping strategies to manage ${student.Stress_Level}/10 stress level during exam period`,
      resources: 'Counseling Services | Relaxation Workshops | Peer Support'
    });
  }

  if (!student.Internet_Access_at_Home) {
    recommendations.push({
      priority: 'medium',
      action: 'Campus Resource Access',
      reason: `Schedule regular computer lab time for online practice tests and study materials`,
      resources: 'Computer Labs | Library Study Rooms'
    });
  }

  return {
    student,
    predictedFinalScore,
    failingProbability,
    riskLevel,
    contributingFactors,
    recommendations,
  };
}

/**
 * Get department statistics and worst performers
 */
export function getDepartmentStats(students: Student[]): DepartmentStats[] {
  const departments = ['CS', 'Mathematics', 'Business', 'Engineering', 'Arts'];

  return departments.map(dept => {
    const deptStudents = students.filter(s => s.Department === dept);

    if (deptStudents.length === 0) {
      return {
        name: dept,
        totalStudents: 0,
        avgScore: 0,
        atRiskCount: 0,
        criticalStudents: [],
      };
    }

    // Analyze each student
    const analyzedStudents = deptStudents.map(s => analyzePreExam(s));

    // Sort by failing probability (highest first) and take worst 5
    const criticalStudents = analyzedStudents
      .sort((a, b) => b.failingProbability - a.failingProbability)
      .slice(0, 5);

    const avgScore = deptStudents.reduce((sum, s) => sum + s.Total_Score, 0) / deptStudents.length;
    const atRiskCount = analyzedStudents.filter(s => s.failingProbability >= 50).length;

    return {
      name: dept,
      totalStudents: deptStudents.length,
      avgScore: Math.round(avgScore * 10) / 10,
      atRiskCount,
      criticalStudents,
    };
  });
}
