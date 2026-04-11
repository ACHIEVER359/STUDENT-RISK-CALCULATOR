'use client';

import { PreExamAnalysis as PreExamAnalysisType } from '@/lib/types';
import {
  AlertTriangle,
  TrendingDown,
  BookOpen,
  Clock,
  Brain,
  Users,
  CheckCircle2,
  AlertCircle,
  Target,
  Zap,
  Bot,
  Shield,
  ShieldAlert,
  Loader2
} from 'lucide-react';

interface MLPrediction {
  prediction: 'At-Risk' | 'Safe';
  risk_probability: number;
  safe_probability: number;
  confidence: string;
}

interface PreExamAnalysisPanelProps {
  analysis: PreExamAnalysisType;
  mlPrediction?: MLPrediction | null;
  mlLoading?: boolean;
  mlError?: string | null;
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

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-32 h-32">
        <svg className="w-full h-full transform -rotate-90">
          <circle
            cx="64"
            cy="64"
            r="56"
            stroke="currentColor"
            strokeWidth="10"
            fill="none"
            className="text-slate-100"
          />
          <circle
            cx="64"
            cy="64"
            r="56"
            stroke="currentColor"
            strokeWidth="10"
            fill="none"
            strokeDasharray={`${(probability / 100) * 352} 352`}
            strokeLinecap="round"
            className={`${getBgColor(probability)} transition-all duration-500`}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={`text-2xl font-bold ${getColor(probability)}`}>{probability}%</span>
          <span className="text-xs text-slate-500">Fail Risk</span>
        </div>
      </div>
    </div>
  );
}

function RiskLevelBadge({ level }: { level: PreExamAnalysis['riskLevel'] }) {
  const config = {
    critical: { bg: 'bg-red-100', text: 'text-red-700', label: 'CRITICAL RISK' },
    high: { bg: 'bg-orange-100', text: 'text-orange-700', label: 'HIGH RISK' },
    medium: { bg: 'bg-amber-100', text: 'text-amber-700', label: 'MEDIUM RISK' },
    low: { bg: 'bg-emerald-100', text: 'text-emerald-700', label: 'LOW RISK' },
  };

  const { bg, text, label } = config[level];

  return (
    <span className={`px-3 py-1 rounded-full text-xs font-bold ${bg} ${text}`}>
      {label}
    </span>
  );
}

function ContributingFactorCard({ factor }: { factor: PreExamAnalysis['contributingFactors'][0] }) {
  return (
    <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg border border-slate-100">
      <div className="flex-shrink-0 w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
        <TrendingDown className="w-4 h-4 text-red-600" />
      </div>
      <div className="flex-1">
        <div className="flex items-center justify-between mb-1">
          <span className="font-medium text-slate-900 text-sm">{factor.factor}</span>
          <span className="text-xs font-bold text-red-600">+{factor.impact}%</span>
        </div>
        <p className="text-xs text-slate-600">{factor.description}</p>
      </div>
    </div>
  );
}

function RecommendationCard({ rec }: { rec: PreExamAnalysis['recommendations'][0] }) {
  const priorityConfig = {
    immediate: { bg: 'bg-red-50 border-red-200', badge: 'bg-red-500 text-white', label: 'IMMEDIATE' },
    high: { bg: 'bg-orange-50 border-orange-200', badge: 'bg-orange-500 text-white', label: 'HIGH' },
    medium: { bg: 'bg-blue-50 border-blue-200', badge: 'bg-blue-500 text-white', label: 'MEDIUM' },
  };

  const config = priorityConfig[rec.priority];

  return (
    <div className={`p-3 rounded-lg border ${config.bg}`}>
      <div className="flex items-center gap-2 mb-2">
        <span className={`px-2 py-0.5 rounded text-xs font-bold text-white ${config.badge}`}>
          {config.label}
        </span>
      </div>
      <p className="font-medium text-slate-900 text-sm mb-1">{rec.action}</p>
      <p className="text-xs text-slate-600 mb-2">{rec.reason}</p>
      <div className="flex items-center gap-1 text-xs text-indigo-600">
        <BookOpen className="w-3 h-3" />
        <span>{rec.resources}</span>
      </div>
    </div>
  );
}

interface PreExamAnalysisPanelProps {
  analysis: PreExamAnalysisType;
  mlPrediction?: MLPrediction | null;
  mlLoading?: boolean;
  mlError?: string | null;
}

export default function PreExamAnalysisPanel({ analysis, mlPrediction, mlLoading, mlError }: PreExamAnalysisPanelProps) {
  const { student, predictedFinalScore, failingProbability, riskLevel, contributingFactors, recommendations } = analysis;

  return (
    <div className="space-y-6">
      {/* ML Model Prediction */}
      <div className="bg-gradient-to-br from-violet-50 to-indigo-50 p-4 rounded-xl border border-violet-100">
        <div className="flex items-center gap-2 mb-3">
          <Bot className="w-5 h-5 text-violet-500" />
          <span className="text-sm font-semibold text-violet-700">ML Model Prediction</span>
          <span className="text-xs text-violet-500 bg-violet-100 px-2 py-0.5 rounded">Random Forest</span>
        </div>
        {mlLoading ? (
          <div className="flex items-center gap-2 text-violet-600">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span className="text-sm">Analyzing with ML model...</span>
          </div>
        ) : mlError ? (
          <div className="flex items-center gap-2 text-amber-600">
            <AlertCircle className="w-4 h-4" />
            <span className="text-sm">{mlError}</span>
          </div>
        ) : mlPrediction ? (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {mlPrediction.prediction === 'At-Risk' ? (
                  <ShieldAlert className="w-6 h-6 text-red-500" />
                ) : (
                  <Shield className="w-6 h-6 text-emerald-500" />
                )}
                <span className={`text-lg font-bold ${
                  mlPrediction.prediction === 'At-Risk' ? 'text-red-600' : 'text-emerald-600'
                }`}>
                  {mlPrediction.prediction}
                </span>
              </div>
              <span className={`text-xs font-medium px-2 py-1 rounded ${
                mlPrediction.confidence === 'Very High' ? 'bg-emerald-100 text-emerald-700' :
                mlPrediction.confidence === 'High' ? 'bg-blue-100 text-blue-700' :
                mlPrediction.confidence === 'Moderate' ? 'bg-amber-100 text-amber-700' :
                'bg-slate-100 text-slate-600'
              }`}>
                {mlPrediction.confidence} Confidence
              </span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white/60 p-3 rounded-lg">
                <p className="text-xs text-slate-500 mb-1">At-Risk Probability</p>
                <p className="text-xl font-bold text-red-600">{mlPrediction.risk_probability}%</p>
              </div>
              <div className="bg-white/60 p-3 rounded-lg">
                <p className="text-xs text-slate-500 mb-1">Safe Probability</p>
                <p className="text-xl font-bold text-emerald-600">{mlPrediction.safe_probability}%</p>
              </div>
            </div>
          </div>
        ) : (
          <p className="text-sm text-slate-500">Select a student to see ML prediction</p>
        )}
      </div>

      {/* Header Stats */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-gradient-to-br from-indigo-50 to-violet-50 p-4 rounded-xl border border-indigo-100">
          <div className="flex items-center gap-2 mb-2">
            <Target className="w-4 h-4 text-indigo-500" />
            <span className="text-xs text-indigo-600 font-medium uppercase">Predicted Score</span>
          </div>
          <p className="text-2xl font-bold text-indigo-700">{predictedFinalScore}%</p>
          <p className="text-xs text-indigo-500 mt-1">Expected final grade</p>
        </div>

        <div className="flex flex-col items-center justify-center">
          <FailingProbabilityGauge probability={failingProbability} />
          <div className="mt-2">
            <RiskLevelBadge level={riskLevel} />
          </div>
        </div>
      </div>

      {/* Current Standing */}
      <div className="bg-slate-50 p-4 rounded-lg">
        <h4 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
          <Zap className="w-4 h-4" />
          Current Academic Standing
        </h4>
        <div className="grid grid-cols-3 gap-3">
          <div className="text-center">
            <p className="text-xs text-slate-500">Total Score</p>
            <p className={`text-lg font-bold ${
              student.Total_Score >= 70 ? 'text-emerald-600' :
              student.Total_Score >= 60 ? 'text-amber-600' : 'text-red-600'
            }`}>{student.Total_Score}%</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-slate-500">Midterm</p>
            <p className={`text-lg font-bold ${
              student.Midterm_Score >= 70 ? 'text-emerald-600' :
              student.Midterm_Score >= 60 ? 'text-amber-600' : 'text-red-600'
            }`}>{student.Midterm_Score}%</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-slate-500">Grade</p>
            <p className={`text-lg font-bold ${
              student.Grade === 'A' || student.Grade === 'B' ? 'text-emerald-600' :
              student.Grade === 'C' ? 'text-amber-600' : 'text-red-600'
            }`}>{student.Grade}</p>
          </div>
        </div>
      </div>

      {/* Contributing Factors */}
      {contributingFactors.length > 0 && (
        <div>
          <h4 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-red-500" />
            Risk Factors ({contributingFactors.length})
          </h4>
          <div className="space-y-2">
            {contributingFactors.map((factor, i) => (
              <ContributingFactorCard key={i} factor={factor} />
            ))}
          </div>
        </div>
      )}

      {/* Recommendations */}
      {recommendations.length > 0 && (
        <div>
          <h4 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            Recommended Actions
          </h4>
          <div className="space-y-2">
            {recommendations.slice(0, 4).map((rec, i) => (
              <RecommendationCard key={i} rec={rec} />
            ))}
          </div>
        </div>
      )}

      {/* Quick Tips */}
      <div className="bg-indigo-50 p-3 rounded-lg border border-indigo-100">
        <div className="flex items-start gap-2">
          <Brain className="w-4 h-4 text-indigo-500 mt-0.5" />
          <div className="text-xs text-indigo-700">
            <p className="font-medium mb-1">Pre-Exam Strategy</p>
            <p className="text-indigo-600">
              Focus on identified weak areas. Prioritize sleep before exams.
              Attend all remaining classes to maximize attendance score.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
