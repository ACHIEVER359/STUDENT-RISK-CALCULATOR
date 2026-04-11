import { Student, MentalHealthAnalysis } from './types';

export function analyzeMentalHealth(student: Student, classAvg: { avgStress: number; avgSleep: number; avgIncome: string }): MentalHealthAnalysis {
  const studentName = `${student.First_Name} ${student.Last_Name}`;
  const riskFactors: MentalHealthAnalysis['riskFactors'] = [];
  const protectiveFactors: MentalHealthAnalysis['protectiveFactors'] = [];
  const academicCorrelation: MentalHealthAnalysis['academicCorrelation'] = [];
  const actionPlan: MentalHealthAnalysis['actionPlan'] = [];

  let wellbeingScore = 70;

  // Sleep Analysis - critical for academic performance
  if (student.Sleep_Hours_per_Night < 5) {
    riskFactors.push({
      factor: 'Severe Sleep Deprivation',
      value: `${student.Sleep_Hours_per_Night} hrs/night (critical)`,
      severity: 'critical',
      impact: `Only ${student.Sleep_Hours_per_Night} hours of sleep is critically insufficient. Sleep deprivation below 5 hours severely impairs memory consolidation, cognitive function, and emotional regulation. Students in this range show 40-50% lower academic performance and higher rates of mental health crises.`,
      recommendation: 'Immediate intervention required. Refer to student counseling and consider academic accommodations. Investigate underlying causes (social media use, anxiety, employment hours, health conditions).',
      icon: 'moon'
    });
    wellbeingScore -= 30;
  } else if (student.Sleep_Hours_per_Night < 6) {
    riskFactors.push({
      factor: 'Significant Sleep Deficit',
      value: `${student.Sleep_Hours_per_Night} hrs/night`,
      severity: 'high',
      impact: `Sleeping only ${student.Sleep_Hours_per_Night} hours per night is below the recommended 7-8 hours. This leads to impaired concentration, reduced problem-solving ability, and increased anxiety during exams.`,
      recommendation: 'Sleep hygiene counseling. Establish consistent bedtime routines. Reduce screen time before bed. Consider reduced course load if working late hours.',
      icon: 'moon'
    });
    wellbeingScore -= 20;
  } else if (student.Sleep_Hours_per_Night < 7) {
    riskFactors.push({
      factor: 'Mild Sleep Insufficiency',
      value: `${student.Sleep_Hours_per_Night} hrs/night`,
      severity: 'medium',
      impact: `Below optimal sleep duration affecting alertness and memory retention. Students with insufficient sleep often experience afternoon fatigue and difficulty concentrating in lectures.`,
      recommendation: 'Gradually increase sleep by 30-minute increments. Address sleep hygiene habits. Monitor for chronic fatigue patterns.',
      icon: 'moon'
    });
    wellbeingScore -= 10;
  } else {
    protectiveFactors.push({
      factor: 'Healthy Sleep Duration',
      value: `${student.Sleep_Hours_per_Night} hrs/night`,
      strength: 'strong'
    });
    wellbeingScore += 10;
  }

  // Stress Analysis
  if (student.Stress_Level >= 8) {
    riskFactors.push({
      factor: 'Critical Stress Levels',
      value: `${student.Stress_Level}/10`,
      severity: 'critical',
      impact: `A stress level of ${student.Stress_Level} out of 10 indicates severe psychological distress. This level of stress is associated with panic attacks, depression, substance abuse, and academic failure. Students at this level often contemplate dropping out.`,
      recommendation: 'URGENT: Immediate referral to mental health services. Consider medical withdrawal or incomplete grade options. Connect with crisis resources.',
      icon: 'alert'
    });
    wellbeingScore -= 35;
  } else if (student.Stress_Level >= 7) {
    riskFactors.push({
      factor: 'High Stress Levels',
      value: `${student.Stress_Level}/10`,
      severity: 'high',
      impact: `Stress at ${student.Stress_Level}/10 is significantly elevated. Chronic high stress impairs immune function, sleep quality, and cognitive performance. Students may experience headaches, anxiety, and difficulty focusing.`,
      recommendation: 'Stress management workshops, regular counseling sessions, and academic coaching. Consider meeting with advisor to discuss workload management.',
      icon: 'alert'
    });
    wellbeingScore -= 20;
  } else if (student.Stress_Level >= 5) {
    riskFactors.push({
      factor: 'Moderate Stress',
      value: `${student.Stress_Level}/10`,
      severity: 'medium',
      impact: `Moderate stress can be motivating but may indicate upcoming burnout if not managed. Watch for signs of declining performance during high-stress periods.`,
      recommendation: 'Teach coping strategies. Encourage regular breaks and self-care routines. Monitor during exam periods.',
      icon: 'alert'
    });
    wellbeingScore -= 5;
  } else {
    protectiveFactors.push({
      factor: 'Manageable Stress Levels',
      value: `${student.Stress_Level}/10`,
      strength: 'strong'
    });
    wellbeingScore += 5;
  }

  // Financial Hardship Analysis
  const incomeLevelMap: Record<string, number> = {
    'Low': 0,
    'Lower-Middle': 25,
    'Medium': 50,
    'Upper-Middle': 75,
    'High': 100
  };
  const incomeValue = incomeLevelMap[student.Family_Income_Level] ?? 50;

  if (incomeValue <= 25) {
    riskFactors.push({
      factor: 'Financial Hardship',
      value: `Family Income: ${student.Family_Income_Level}`,
      severity: 'critical',
      impact: `Low family income (${student.Family_Income_Level}) creates constant financial anxiety. Students may skip meals, lack textbooks, work multiple jobs, or be unable to afford transportation. This financial stress directly impacts ability to focus on studies. ${student.Internet_Access_at_Home ? '' : 'Lack of home internet further compounds educational disadvantages.'}`,
      recommendation: `Connect with Financial Aid immediately for: Emergency grants, Food bank services, Textbook assistance, ${!student.Internet_Access_at_Home ? 'Campus computer lab access, ' : ''}Scholarship programs, Work-study opportunities. Consider emergency scholarship assessment.`,
      icon: 'wallet'
    });
    wellbeingScore -= 25;
  } else if (incomeValue <= 50) {
    riskFactors.push({
      factor: 'Limited Financial Resources',
      value: `Family Income: ${student.Family_Income_Level}`,
      severity: 'medium',
      impact: `Middle-lower income level may limit access to tutoring, supplemental materials, or extracurricular opportunities. Students may experience stress about tuition and future career prospects.`,
      recommendation: 'Explore scholarship opportunities, student discount programs, and campus resources for economic support.',
      icon: 'wallet'
    });
    wellbeingScore -= 10;
  } else {
    protectiveFactors.push({
      factor: 'Stable Family Finances',
      value: `Family Income: ${student.Family_Income_Level}`,
      strength: student.Family_Income_Level === 'High' ? 'strong' : 'moderate'
    });
    wellbeingScore += student.Family_Income_Level === 'High' ? 10 : 5;
  }

  // Parent Education Level Analysis
  if (student.Parent_Education_Level === 'None' || student.Parent_Education_Level === 'High School') {
    riskFactors.push({
      factor: 'Limited Family Academic Support',
      value: `Parent Education: ${student.Parent_Education_Level}`,
      severity: 'high',
      impact: `Parents with ${student.Parent_Education_Level === 'None' ? 'no formal education' : 'only high school education'} cannot provide guidance on navigating university systems, understanding degree requirements, or supporting complex coursework. First-generation students often feel isolated and lack role models.`,
      recommendation: 'Assign dedicated academic mentor or peer tutor. Provide orientation to all campus support services. Connect with first-generation student support groups.',
      icon: 'users'
    });
    wellbeingScore -= 15;
  } else if (student.Parent_Education_Level === "Bachelor's") {
    protectiveFactors.push({
      factor: 'Moderate Family Academic Guidance',
      value: `Parent: ${student.Parent_Education_Level}`,
      strength: 'moderate'
    });
    wellbeingScore += 5;
  } else {
    protectiveFactors.push({
      factor: 'Strong Family Academic Support',
      value: `Parent: ${student.Parent_Education_Level}`,
      strength: 'strong'
    });
    wellbeingScore += 10;
  }

  // Internet Access Analysis
  if (!student.Internet_Access_at_Home) {
    riskFactors.push({
      factor: 'No Home Internet Access',
      value: 'Internet: Not Available',
      severity: 'high',
      impact: 'Without home internet, students cannot complete online assignments, research, participate in virtual learning, or access learning platforms outside of campus hours. This creates a significant homework gap and dependence on campus resources.',
      recommendation: 'Provide campus computer lab access schedules, mobile data stipends, internet cafe vouchers, or community WiFi hotspot locations. Consider technology grant applications.',
      icon: 'wifi'
    });
    wellbeingScore -= 15;
  } else {
    protectiveFactors.push({
      factor: 'Home Internet Access',
      value: 'Available',
      strength: 'strong'
    });
    wellbeingScore += 5;
  }

  // Attendance Analysis
  if (student.Attendance < 60) {
    riskFactors.push({
      factor: 'Critical Attendance Issues',
      value: `${student.Attendance}% attendance`,
      severity: 'critical',
      impact: `Only ${student.Attendance}% attendance is a major red flag. This suggests possible disengagement, employment conflicts, transportation issues, mental health struggles, or family obligations. Students missing this many classes often fail or withdraw.`,
      recommendation: 'Immediate meeting with student to identify barriers. Coordinate with student affairs for support services. Consider attendance accommodation plans.',
      icon: 'attendance'
    });
    wellbeingScore -= 25;
  } else if (student.Attendance < 75) {
    riskFactors.push({
      factor: 'Poor Attendance Pattern',
      value: `${student.Attendance}% attendance`,
      severity: 'high',
      impact: `${student.Attendance}% attendance suggests inconsistent engagement. Each missed class creates knowledge gaps that compound over time. This often correlates with declining grades in the second half of semesters.`,
      recommendation: 'Monitor attendance weekly. Connect with academic advisor to address underlying issues. Consider tutoring for missed content.',
      icon: 'attendance'
    });
    wellbeingScore -= 15;
  } else if (student.Attendance < 85) {
    riskFactors.push({
      factor: 'Below Average Attendance',
      value: `${student.Attendance}% attendance`,
      severity: 'medium',
      impact: `${student.Attendance}% attendance, while not critical, is below the optimal 90%+ and may indicate emerging disengagement or external time commitments.`,
      recommendation: 'Regular check-ins. Identify scheduling conflicts or motivation issues early.',
      icon: 'attendance'
    });
    wellbeingScore -= 5;
  } else {
    protectiveFactors.push({
      factor: 'Consistent Class Attendance',
      value: `${student.Attendance}% attendance`,
      strength: 'strong'
    });
    wellbeingScore += 10;
  }

  // Study Hours Analysis
  if (student.Study_Hours_per_Week < 5) {
    riskFactors.push({
      factor: 'Severely Insufficient Study Time',
      value: `${student.Study_Hours_per_Week} hrs/week`,
      severity: 'high',
      impact: `Only ${student.Study_Hours_per_Week} hours of study per week is far below the recommended 15+ hours for college students. This explains low assignment scores and poor exam performance. Students may be overwhelmed, unmotivated, or spending time on non-academic activities.`,
      recommendation: 'Academic coaching to improve time management. Reduce course load if overwhelmed. Investigate time use patterns.',
      icon: 'study'
    });
    wellbeingScore -= 20;
  } else if (student.Study_Hours_per_Week < 10) {
    riskFactors.push({
      factor: 'Below Recommended Study Hours',
      value: `${student.Study_Hours_per_Week} hrs/week`,
      severity: 'medium',
      impact: `${student.Study_Hours_per_Week} hours of study weekly is below optimal levels. This may explain average or below-average performance in assignments and quizzes.`,
      recommendation: 'Gradually increase study time by 2-3 hours per week. Encourage use of study groups and campus tutoring.',
      icon: 'study'
    });
    wellbeingScore -= 10;
  } else if (student.Study_Hours_per_Week >= 15) {
    protectiveFactors.push({
      factor: 'Dedicated Study Habits',
      value: `${student.Study_Hours_per_Week} hrs/week`,
      strength: 'strong'
    });
    wellbeingScore += 10;
  }

  // Extracurricular Analysis
  if (!student.Extracurricular_Activities || student.Extracurricular_Activities === 'No') {
    protectiveFactors.push({
      factor: 'Social/Extracurricular Engagement',
      value: 'None reported',
      strength: 'weak'
    });
    // Not adding negative score here as it could be by choice or due to work obligations
  } else {
    protectiveFactors.push({
      factor: 'Active Extracurricular Participation',
      value: student.Extracurricular_Activities,
      strength: 'strong'
    });
    wellbeingScore += 5;
  }

  // Academic Correlation Analysis
  if (student.Attendance < 80) {
    academicCorrelation.push({
      metric: 'Attendance vs Performance',
      studentValue: student.Attendance,
      optimalValue: 90,
      impact: 'negative',
      explanation: `The ${student.Attendance}% attendance rate correlates with the ${student.Total_Score.toFixed(1)}% overall score. Students with attendance below 80% are 3x more likely to fail courses. The pattern suggests disengagement or external barriers.`
    });
  }

  if (student.Study_Hours_per_Week < 8 && student.Total_Score < 70) {
    academicCorrelation.push({
      metric: 'Study Hours vs Score',
      studentValue: student.Study_Hours_per_Week,
      optimalValue: 15,
      impact: 'negative',
      explanation: `${student.Study_Hours_per_Week} hours/week of study cannot support a passing grade in most courses. The low study time is a primary factor in the ${student.Total_Score.toFixed(1)}% performance.`
    });
  }

  if (student.Midterm_Score < 60 && student.Final_Score < 70) {
    academicCorrelation.push({
      metric: 'Exam Performance Pattern',
      studentValue: (student.Midterm_Score + student.Final_Score) / 2,
      optimalValue: 75,
      impact: 'negative',
      explanation: `Consistently low exam scores (Midterm: ${student.Midterm_Score}%, Final: ${student.Final_Score}%) indicate knowledge gaps, test anxiety, or insufficient preparation. This is a key driver of the current grade.`
    });
  }

  // Determine overall wellbeing
  let overallMentalWellbeing: MentalHealthAnalysis['overallMentalWellbeing'];
  if (wellbeingScore < 30) {
    overallMentalWellbeing = 'Critical';
  } else if (wellbeingScore < 50) {
    overallMentalWellbeing = 'At-Risk';
  } else if (wellbeingScore < 70) {
    overallMentalWellbeing = 'Moderate';
  } else {
    overallMentalWellbeing = 'Good';
  }

  // Generate action plan based on critical factors
  const criticalFactors = riskFactors.filter(f => f.severity === 'critical' || f.severity === 'high');

  for (const factor of criticalFactors) {
    if (factor.factor.includes('Sleep')) {
      actionPlan.push({
        priority: factor.severity === 'critical' ? 'immediate' : 'high',
        action: 'Sleep & Wellness Assessment',
        reason: 'Sleep deprivation is a critical barrier to learning and cognitive function',
        supportResource: 'Student Health Center | Counseling Services | Sleep Hygiene Workshop'
      });
    }
    if (factor.factor.includes('Stress') || factor.factor.includes('Critical Stress')) {
      actionPlan.push({
        priority: factor.severity === 'critical' ? 'immediate' : 'high',
        action: 'Mental Health Crisis Intervention',
        reason: 'High stress levels require professional support and potential academic accommodations',
        supportResource: 'Campus Crisis Hotline | Student Counseling | Psychiatric Services'
      });
    }
    if (factor.factor.includes('Financial')) {
      actionPlan.push({
        priority: 'high',
        action: 'Emergency Financial Support Assessment',
        reason: 'Financial hardship directly correlates with dropout rates and poor academic performance',
        supportResource: 'Financial Aid Office | Emergency Grant Fund | Food Bank | Scholarship Portal'
      });
    }
    if (factor.factor.includes('Internet')) {
      actionPlan.push({
        priority: 'high',
        action: 'Technology Access Solution',
        reason: 'Internet access is fundamental infrastructure for academic success in modern education',
        supportResource: 'Campus IT | Student Technology Fund | Computer Lab Access'
      });
    }
    if (factor.factor.includes('Attendance')) {
      actionPlan.push({
        priority: factor.severity === 'critical' ? 'immediate' : 'high',
        action: 'Attendance Intervention Plan',
        reason: 'Poor attendance is the strongest predictor of academic failure',
        supportResource: 'Academic Advisor | Student Affairs | Attendance Support Program'
      });
    }
    if (factor.factor.includes('Study Time') || factor.factor.includes('Study Hours')) {
      actionPlan.push({
        priority: 'medium',
        action: 'Academic Coaching & Time Management',
        reason: 'Improving study habits is essential for closing the performance gap',
        supportResource: 'Academic Success Center | Peer Tutoring | Study Skills Workshop'
      });
    }
    if (factor.factor.includes('Family Academic Support')) {
      actionPlan.push({
        priority: 'medium',
        action: 'First-Generation Student Support',
        reason: 'First-generation students need additional navigation support for university systems',
        supportResource: 'First-Gen Program | Peer Mentor | Academic Advisor'
      });
    }
  }

  if (actionPlan.length === 0) {
    actionPlan.push({
      priority: 'medium',
      action: 'Continued Monitoring & Support',
      reason: 'Maintain proactive support even with moderate risk factors',
      supportResource: 'Academic Advisor | Regular Check-ins | Study Groups'
    });
  }

  // Generate summary
  const summaryParts: string[] = [];

  if (overallMentalWellbeing === 'Critical') {
    summaryParts.push(`${studentName} is in CRITICAL need of support. Multiple severe risk factors are actively undermining their academic success and mental wellbeing.`);
  } else if (overallMentalWellbeing === 'At-Risk') {
    summaryParts.push(`${studentName} is showing AT-RISK indicators that require immediate attention and intervention to prevent further decline.`);
  } else if (overallMentalWellbeing === 'Moderate') {
    summaryParts.push(`${studentName} has MODERATE wellbeing with some risk factors that should be monitored and addressed.`);
  } else {
    summaryParts.push(`${studentName} is maintaining GOOD overall wellbeing with strong protective factors in place.`);
  }

  const highSeverityCount = riskFactors.filter(f => f.severity === 'critical' || f.severity === 'high').length;
  if (highSeverityCount > 0) {
    summaryParts.push(`${highSeverityCount} high-severity concern(s) identified: ${riskFactors.filter(f => f.severity !== 'low').map(f => f.factor).join(', ')}.`);
  }

  // Specific performance reason
  if (student.Total_Score < 60) {
    const reasons: string[] = [];
    if (student.Attendance < 75) reasons.push(`poor attendance (${student.Attendance}%)`);
    if (student.Study_Hours_per_Week < 10) reasons.push(`insufficient study time (${student.Study_Hours_per_Week} hrs/wk)`);
    if (student.Sleep_Hours_per_Night < 6) reasons.push(`severe sleep deprivation (${student.Sleep_Hours_per_Night} hrs/night)`);
    if (student.Stress_Level >= 8) reasons.push(`critical stress levels (${student.Stress_Level}/10)`);
    if (student.Family_Income_Level === 'Low') reasons.push(`financial hardship`);

    if (reasons.length > 0) {
      summaryParts.push(`The primary drivers of underperformance appear to be: ${reasons.join(', ')}.`);
    }
  }

  if (student.Family_Income_Level === 'Low' && student.Total_Score < 70) {
    summaryParts.push('Performance appears significantly correlated with socioeconomic factors — financial support alongside academic intervention is recommended.');
  }

  // Calculate failing probability (0-100)
  let failingProbability = 10; // Base probability

  // Adjust based on current performance
  if (student.Total_Score < 50) {
    failingProbability += 40;
  } else if (student.Total_Score < 60) {
    failingProbability += 25;
  } else if (student.Total_Score < 70) {
    failingProbability += 10;
  }

  // Adjust based on attendance
  if (student.Attendance < 60) {
    failingProbability += 25;
  } else if (student.Attendance < 75) {
    failingProbability += 15;
  } else if (student.Attendance < 85) {
    failingProbability += 5;
  }

  // Adjust based on study hours
  if (student.Study_Hours_per_Week < 5) {
    failingProbability += 15;
  } else if (student.Study_Hours_per_Week < 10) {
    failingProbability += 8;
  }

  // Adjust based on sleep
  if (student.Sleep_Hours_per_Night < 5) {
    failingProbability += 15;
  } else if (student.Sleep_Hours_per_Night < 6) {
    failingProbability += 8;
  }

  // Adjust based on stress
  if (student.Stress_Level >= 8) {
    failingProbability += 15;
  } else if (student.Stress_Level >= 7) {
    failingProbability += 8;
  }

  // Adjust based on mental health score
  if (wellbeingScore < 30) {
    failingProbability += 20;
  } else if (wellbeingScore < 50) {
    failingProbability += 10;
  }

  // Cap at 0-100
  failingProbability = Math.max(0, Math.min(100, failingProbability));

  return {
    studentId: student.Student_ID,
    studentName,
    overallMentalWellbeing,
    riskFactors,
    protectiveFactors,
    academicCorrelation,
    summary: summaryParts.join(' '),
    actionPlan,
    wellbeingScore: Math.max(0, Math.min(100, wellbeingScore)),
    failingProbability
  };
}
