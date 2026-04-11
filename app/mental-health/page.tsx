'use client';

import { useState, useEffect } from 'react';
import Sidebar from '@/components/ui/Sidebar';
import Card, { CardHeader, CardContent } from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import { analyzeMentalHealth } from '@/lib/mentalHealth';
import { analyzeStudent, getClassAverages } from '@/lib/analysis';
import { Student } from '@/lib/types';
import {
  Search,
  Heart,
  AlertTriangle,
  Shield,
  TrendingDown,
  Brain,
  Moon,
  Wallet,
  Wifi,
  Users,
  Activity,
  Lightbulb,
  CheckCircle2,
  Loader2,
  AlertOctagon
} from 'lucide-react';

function WellbeingGauge({ score }: { score: number }) {
  const getColor = (s: number) => {
    if (s >= 70) return 'text-emerald-500';
    if (s >= 50) return 'text-amber-500';
    if (s >= 30) return 'text-orange-500';
    return 'text-red-500';
  };

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-32 h-32">
        <svg className="w-full h-full transform -rotate-90">
          <circle cx="64" cy="64" r="56" stroke="currentColor" strokeWidth="10" fill="none" className="text-slate-100" />
          <circle
            cx="64"
            cy="64"
            r="56"
            stroke="currentColor"
            strokeWidth="10"
            fill="none"
            strokeDasharray={`${(score / 100) * 352} 352`}
            strokeLinecap="round"
            className={getColor(score)}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={`text-2xl font-bold ${getColor(score)}`}>{score}</span>
          <span className="text-xs text-slate-500">Score</span>
        </div>
      </div>
    </div>
  );
}

function FailingProbabilityGauge({ probability }: { probability: number }) {
  const getColor = (p: number) => {
    if (p >= 70) return 'text-red-500';
    if (p >= 50) return 'text-orange-500';
    if (p >= 25) return 'text-amber-500';
    return 'text-emerald-500';
  };

  const getBgColor = (p: number) => {
    if (p >= 70) return 'stroke-red-500';
    if (p >= 50) return 'stroke-orange-500';
    if (p >= 25) return 'stroke-amber-500';
    return 'stroke-emerald-500';
  };

  const getLabel = (p: number) => {
    if (p >= 70) return 'Critical';
    if (p >= 50) return 'High';
    if (p >= 25) return 'Moderate';
    return 'Low';
  };

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-32 h-32">
        <svg className="w-full h-full transform -rotate-90">
          <circle cx="64" cy="64" r="56" stroke="currentColor" strokeWidth="10" fill="none" className="text-slate-100" />
          <circle
            cx="64"
            cy="64"
            r="56"
            stroke="currentColor"
            strokeWidth="10"
            fill="none"
            strokeDasharray={`${(probability / 100) * 352} 352`}
            strokeLinecap="round"
            className={getBgColor(probability)}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={`text-2xl font-bold ${getColor(probability)}`}>{probability}%</span>
          <span className="text-xs text-slate-500">Fail Risk</span>
        </div>
      </div>
      <span className={`mt-2 px-3 py-1 rounded-full text-xs font-bold ${
        probability >= 70 ? 'bg-red-100 text-red-700' :
        probability >= 50 ? 'bg-orange-100 text-orange-700' :
        probability >= 25 ? 'bg-amber-100 text-amber-700' :
        'bg-emerald-100 text-emerald-700'
      }`}>
        {getLabel(probability)} Risk
      </span>
    </div>
  );
}

function RiskFactorCard({ factor }: { factor: {
  factor: string;
  value: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  impact: string;
  recommendation: string;
  icon: string;
}}) {
  const severityConfig = {
    critical: { color: 'bg-red-50 border-red-200 text-red-700', badge: 'bg-red-100 text-red-700' },
    high: { color: 'bg-orange-50 border-orange-200 text-orange-700', badge: 'bg-orange-100 text-orange-700' },
    medium: { color: 'bg-amber-50 border-amber-200 text-amber-700', badge: 'bg-amber-100 text-amber-700' },
    low: { color: 'bg-yellow-50 border-yellow-200 text-yellow-700', badge: 'bg-yellow-100 text-yellow-700' },
  };

  const config = severityConfig[factor.severity];

  const iconMap: Record<string, React.ReactNode> = {
    moon: <Moon className="w-5 h-5" />,
    alert: <AlertTriangle className="w-5 h-5" />,
    wallet: <Wallet className="w-5 h-5" />,
    wifi: <Wifi className="w-5 h-5" />,
    users: <Users className="w-5 h-5" />,
    attendance: <Activity className="w-5 h-5" />,
    study: <Brain className="w-5 h-5" />,
  };

  return (
    <div className={`p-4 rounded-xl border ${config.color}`}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          {iconMap[factor.icon] || <AlertTriangle className="w-5 h-5" />}
          <span className="font-semibold">{factor.factor}</span>
        </div>
        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${config.badge}`}>
          {factor.severity.toUpperCase()}
        </span>
      </div>
      <p className="text-sm mb-2 opacity-80">Value: <span className="font-medium">{factor.value}</span></p>
      <p className="text-sm mb-3">{factor.impact}</p>
      <div className="p-3 bg-white/50 rounded-lg">
        <p className="text-xs font-medium mb-1">Recommendation:</p>
        <p className="text-sm">{factor.recommendation}</p>
      </div>
    </div>
  );
}

function ProtectiveFactorCard({ factor }: { factor: {
  factor: string;
  value: string;
  strength: 'strong' | 'moderate' | 'weak';
}}) {
  const strengthConfig = {
    strong: { color: 'bg-emerald-50 border-emerald-200', badge: 'bg-emerald-100 text-emerald-700' },
    moderate: { color: 'bg-blue-50 border-blue-200', badge: 'bg-blue-100 text-blue-700' },
    weak: { color: 'bg-slate-50 border-slate-200', badge: 'bg-slate-200 text-slate-600' },
  };

  const config = strengthConfig[factor.strength];

  return (
    <div className={`p-4 rounded-xl border ${config.color}`}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Shield className="w-4 h-4" />
          <span className="font-medium text-sm">{factor.factor}</span>
        </div>
        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${config.badge}`}>
          {factor.strength.toUpperCase()}
        </span>
      </div>
      <p className="text-sm text-slate-600">Value: {factor.value}</p>
    </div>
  );
}

function ActionPlanCard({ action }: { action: {
  priority: 'immediate' | 'high' | 'medium';
  action: string;
  reason: string;
  supportResource: string;
}}) {
  const priorityConfig = {
    immediate: { color: 'border-red-300 bg-red-50', badge: 'bg-red-500 text-white', label: 'IMMEDIATE' },
    high: { color: 'border-orange-300 bg-orange-50', badge: 'bg-orange-500 text-white', label: 'HIGH PRIORITY' },
    medium: { color: 'border-blue-300 bg-blue-50', badge: 'bg-blue-500 text-white', label: 'MEDIUM PRIORITY' },
  };

  const config = priorityConfig[action.priority];

  return (
    <div className={`p-4 rounded-xl border ${config.color}`}>
      <div className="flex items-center justify-between mb-3">
        <span className={`px-2 py-1 rounded-full text-xs font-bold ${config.badge}`}>
          {config.label}
        </span>
      </div>
      <p className="font-semibold text-slate-900 mb-2">{action.action}</p>
      <p className="text-sm text-slate-600 mb-3">{action.reason}</p>
      <div className="flex items-center gap-2 p-2 bg-white/70 rounded-lg">
        <Lightbulb className="w-4 h-4 text-indigo-500" />
        <span className="text-xs text-slate-500">Support: {action.supportResource}</span>
      </div>
    </div>
  );
}

function AcademicCorrelationCard({ correlation }: { correlation: {
  metric: string;
  studentValue: number;
  optimalValue: number;
  impact: 'positive' | 'negative';
  explanation: string;
}}) {
  return (
    <div className={`p-4 rounded-xl border ${
      correlation.impact === 'negative' ? 'bg-red-50 border-red-200' : 'bg-emerald-50 border-emerald-200'
    }`}>
      <div className="flex items-center justify-between mb-2">
        <span className="font-semibold text-slate-900">{correlation.metric}</span>
        {correlation.impact === 'negative' ? (
          <TrendingDown className="w-5 h-5 text-red-500" />
        ) : (
          <Activity className="w-5 h-5 text-emerald-500" />
        )}
      </div>
      <div className="flex items-center gap-4 mb-3">
        <div>
          <p className="text-xs text-slate-500">Student</p>
          <p className="text-lg font-bold">{correlation.studentValue}%</p>
        </div>
        <div className="text-slate-300">→</div>
        <div>
          <p className="text-xs text-slate-500">Optimal</p>
          <p className="text-lg font-bold text-emerald-600">{correlation.optimalValue}%</p>
        </div>
      </div>
      <p className="text-sm text-slate-600">{correlation.explanation}</p>
    </div>
  );
}

export default function MentalHealthPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchId, setSearchId] = useState('');
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [searchError, setSearchError] = useState('');

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

  const classAvg = students.length > 0 ? getClassAverages(students) : null;

  const handleSearch = () => {
    setSearchError('');
    const student = students.find(s => s.Student_ID.toLowerCase() === searchId.toLowerCase());
    if (student) {
      setSelectedStudent(student);
    } else {
      setSearchError('Student not found. Please check the ID and try again.');
    }
  };

  const handleStudentSelect = (student: Student) => {
    setSelectedStudent(student);
    setSearchId(student.Student_ID);
  };

  const studentSuggestions = searchId && students.length > 0
    ? students.filter(s =>
        s.Student_ID.toLowerCase().includes(searchId.toLowerCase()) ||
        `${s.First_Name} ${s.Last_Name}`.toLowerCase().includes(searchId.toLowerCase())
      ).slice(0, 5)
    : [];

  const mentalHealthAnalysis = selectedStudent && classAvg
    ? analyzeMentalHealth(selectedStudent, { avgStress: classAvg.Stress_Level, avgSleep: classAvg.Sleep_Hours_per_Night, avgIncome: 'Middle' })
    : null;

  const studentAnalysis = selectedStudent && classAvg
    ? analyzeStudent(selectedStudent, classAvg)
    : null;

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
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-900">Mental Health Analysis</h1>
          <p className="text-slate-500 mt-1">
            Understand the psychological factors affecting student performance • {students.length} students loaded
          </p>
        </div>

        <Card className="mb-6">
          <CardContent>
            <div className="flex gap-4">
              <div className="flex-1 relative">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Enter Student ID (e.g., S1000)"
                    value={searchId}
                    onChange={(e) => {
                      setSearchId(e.target.value);
                      setSearchError('');
                    }}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    className="w-full pl-12 pr-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                {studentSuggestions.length > 0 && searchId && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-lg shadow-lg z-20 max-h-60 overflow-y-auto">
                    {studentSuggestions.map((student) => (
                      <button
                        key={student.Student_ID}
                        onClick={() => handleStudentSelect(student)}
                        className="w-full px-4 py-3 text-left hover:bg-slate-50 flex items-center justify-between border-b border-slate-100 last:border-0"
                      >
                        <div>
                          <p className="font-medium text-slate-900">{student.First_Name} {student.Last_Name}</p>
                          <p className="text-sm text-slate-500">{student.Student_ID}</p>
                        </div>
                        <Badge variant={student.Grade as 'A' | 'B' | 'C' | 'D' | 'F'}>{student.Grade}</Badge>
                      </button>
                    ))}
                  </div>
                )}
                {searchError && <p className="text-sm text-red-500 mt-2">{searchError}</p>}
              </div>
              <button
                onClick={handleSearch}
                className="px-6 py-3 bg-indigo-500 text-white font-medium rounded-lg hover:bg-indigo-600 transition-colors"
              >
                Search
              </button>
            </div>
          </CardContent>
        </Card>

        {selectedStudent && mentalHealthAnalysis ? (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
              <Card className="lg:col-span-1">
                <CardContent className="flex flex-col items-center py-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-violet-500 rounded-2xl flex items-center justify-center text-white text-xl font-bold mb-4">
                    {selectedStudent.First_Name[0]}{selectedStudent.Last_Name[0]}
                  </div>
                  <h3 className="font-bold text-slate-900 text-center">{selectedStudent.First_Name} {selectedStudent.Last_Name}</h3>
                  <p className="text-sm text-slate-500 font-mono">{selectedStudent.Student_ID}</p>
                  <div className="mt-3 flex items-center gap-2">
                    <Badge variant={selectedStudent.Grade as 'A' | 'B' | 'C' | 'D' | 'F'}>{selectedStudent.Grade}</Badge>
                  </div>
                  <p className="text-sm text-slate-600 mt-2 text-center">
                    {selectedStudent.Department} • {selectedStudent.Total_Score}%
                  </p>
                </CardContent>
              </Card>

              <Card className="lg:col-span-2">
                <CardHeader className="pb-0">
                  <h3 className="font-semibold text-slate-900 flex items-center gap-2">
                    <Heart className="w-5 h-5 text-pink-500" />
                    Wellbeing Score
                  </h3>
                </CardHeader>
                <CardContent className="flex flex-col items-center py-4">
                  <WellbeingGauge score={mentalHealthAnalysis.wellbeingScore} />
                  <div className={`mt-4 px-4 py-2 rounded-full text-sm font-medium ${
                    mentalHealthAnalysis.overallMentalWellbeing === 'Critical' ? 'bg-red-100 text-red-700' :
                    mentalHealthAnalysis.overallMentalWellbeing === 'At-Risk' ? 'bg-orange-100 text-orange-700' :
                    mentalHealthAnalysis.overallMentalWellbeing === 'Moderate' ? 'bg-amber-100 text-amber-700' :
                    'bg-emerald-100 text-emerald-700'
                  }`}>
                    {mentalHealthAnalysis.overallMentalWellbeing} Mental Health
                  </div>
                </CardContent>
              </Card>

              <Card className="lg:col-span-2">
                <CardHeader className="pb-0">
                  <h3 className="font-semibold text-slate-900 flex items-center gap-2">
                    <AlertOctagon className="w-5 h-5 text-red-500" />
                    Failing Probability
                  </h3>
                </CardHeader>
                <CardContent className="flex flex-col items-center py-4">
                  <FailingProbabilityGauge probability={mentalHealthAnalysis.failingProbability} />
                  <div className="mt-4 text-center">
                    <p className="text-sm text-slate-600">
                      Based on mental health factors, attendance, study habits, and stress levels
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <h3 className="font-semibold text-slate-900 flex items-center gap-2">
                  <Brain className="w-5 h-5 text-indigo-500" />
                  AI Analysis Summary
                </h3>
              </CardHeader>
              <CardContent>
                <p className="text-slate-700 leading-relaxed">{mentalHealthAnalysis.summary}</p>
                {studentAnalysis && studentAnalysis.recommendations.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-slate-100">
                    <p className="text-sm font-medium text-slate-900 mb-2">Academic Recommendations:</p>
                    <ul className="space-y-2">
                      {studentAnalysis.recommendations.slice(0, 3).map((rec, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-slate-600">
                          <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                          <span>{rec.action}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>

            {mentalHealthAnalysis.riskFactors.length > 0 && (
              <Card>
                <CardHeader>
                  <h3 className="font-semibold text-slate-900 flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-red-500" />
                    Risk Factors Identified ({mentalHealthAnalysis.riskFactors.length})
                  </h3>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {mentalHealthAnalysis.riskFactors.map((factor, i) => (
                      <RiskFactorCard key={i} factor={factor} />
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {mentalHealthAnalysis.protectiveFactors.length > 0 && (
              <Card>
                <CardHeader>
                  <h3 className="font-semibold text-slate-900 flex items-center gap-2">
                    <Shield className="w-5 h-5 text-emerald-500" />
                    Protective Factors ({mentalHealthAnalysis.protectiveFactors.length})
                  </h3>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {mentalHealthAnalysis.protectiveFactors.map((factor, i) => (
                      <ProtectiveFactorCard key={i} factor={factor} />
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {mentalHealthAnalysis.academicCorrelation.length > 0 && (
              <Card>
                <CardHeader>
                  <h3 className="font-semibold text-slate-900 flex items-center gap-2">
                    <TrendingDown className="w-5 h-5 text-violet-500" />
                    Academic Impact Analysis
                  </h3>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {mentalHealthAnalysis.academicCorrelation.map((correlation, i) => (
                      <AcademicCorrelationCard key={i} correlation={correlation} />
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {mentalHealthAnalysis.actionPlan.length > 0 && (
              <Card className="border-indigo-200 bg-gradient-to-br from-indigo-50 to-violet-50">
                <CardHeader>
                  <h3 className="font-semibold text-slate-900 flex items-center gap-2">
                    <Heart className="w-5 h-5 text-indigo-500" />
                    Recommended Action Plan
                  </h3>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {mentalHealthAnalysis.actionPlan.map((action, i) => (
                      <ActionPlanCard key={i} action={action} />
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        ) : (
          <Card className="p-12 text-center">
            <div className="w-16 h-16 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Heart className="w-8 h-8 text-pink-400" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900">Mental Health Analysis</h3>
            <p className="text-slate-500 mt-2 max-w-md mx-auto">
              Enter a student ID above to analyze psychological factors affecting their academic performance.
              This includes stress levels, sleep patterns, financial stress, and protective factors.
            </p>
            {students.length > 0 && (
              <p className="text-sm text-slate-400 mt-4">
                Try: S1000, S1002, S1004, S1008, S1012
              </p>
            )}
          </Card>
        )}
      </main>
    </div>
  );
}
