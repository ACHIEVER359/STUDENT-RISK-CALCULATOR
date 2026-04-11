'use client';

import { StudentAnalysis } from '@/lib/types';
import { AlertTriangle, Lightbulb, CheckCircle, ArrowRight } from 'lucide-react';

interface AIExplanationProps {
  analysis: StudentAnalysis;
  studentName: string;
}

export default function AIExplanation({ analysis, studentName }: AIExplanationProps) {
  const severityColors = {
    high: 'border-l-red-500 bg-red-50',
    medium: 'border-l-amber-500 bg-amber-50',
    low: 'border-l-blue-500 bg-blue-50',
  };

  const severityBadgeColors = {
    high: 'bg-red-100 text-red-700',
    medium: 'bg-amber-100 text-amber-700',
    low: 'bg-blue-100 text-blue-700',
  };

  return (
    <div className="space-y-6">
      {/* Key Insights */}
      <div>
        <h4 className="text-sm font-semibold text-slate-500 uppercase mb-3 flex items-center gap-2">
          <Lightbulb className="w-4 h-4 text-indigo-500" />
          AI Analysis for {studentName}
        </h4>
        {analysis.insights.length > 0 ? (
          <div className="space-y-2">
            {analysis.insights.map((insight, idx) => (
              <div key={idx} className="p-4 bg-indigo-50 border border-indigo-100 rounded-lg">
                <p className="text-sm text-indigo-900">{insight}</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-lg">
            <p className="text-sm text-emerald-700 flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              Student performance is stable with no significant concerns.
            </p>
          </div>
        )}
      </div>

      {/* Factor Analysis */}
      {analysis.factorCorrelations.length > 0 && (
        <div>
          <h4 className="text-sm font-semibold text-slate-500 uppercase mb-3 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-500" />
            Contributing Factors
          </h4>
          <div className="space-y-3">
            {analysis.factorCorrelations.map((factor, idx) => (
              <div key={idx} className={`p-4 rounded-lg border-l-4 ${severityColors[factor.severity]}`}>
                <div className="flex items-start justify-between mb-2">
                  <p className="font-medium text-slate-800">{factor.factor}</p>
                  <span className={`px-2 py-0.5 text-xs font-medium rounded ${severityBadgeColors[factor.severity]}`}>
                    {factor.severity}
                  </span>
                </div>
                <p className="text-sm text-slate-600">{factor.impact}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recommendations */}
      {analysis.recommendations.length > 0 && (
        <div>
          <h4 className="text-sm font-semibold text-slate-500 uppercase mb-3 flex items-center gap-2">
            <ArrowRight className="w-4 h-4 text-emerald-500" />
            Recommended Actions
          </h4>
          <div className="space-y-3">
            {analysis.recommendations.map((rec, idx) => (
              <div key={idx} className="flex items-start gap-3 p-4 bg-white border border-slate-200 rounded-lg">
                <span className={`px-2 py-0.5 text-xs font-semibold rounded flex-shrink-0 mt-0.5 ${
                  rec.priority === 'high' ? 'bg-red-500 text-white' :
                  rec.priority === 'medium' ? 'bg-amber-500 text-white' :
                  'bg-blue-500 text-white'
                }`}>
                  {rec.priority}
                </span>
                <div>
                  <p className="font-medium text-slate-800">{rec.action}</p>
                  <p className="text-sm text-slate-500 mt-1">{rec.reason}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}