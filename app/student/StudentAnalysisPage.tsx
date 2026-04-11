'use client';

import { useState, useEffect } from 'react';
import Sidebar from '@/components/ui/Sidebar';
import Card, { CardHeader, CardContent } from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import PerformanceRadar from '@/components/student/PerformanceRadar';
import FactorAnalysis from '@/components/student/FactorAnalysis';
import AIExplanation from '@/components/student/AIExplanation';
import PreExamAnalysisPanel from '@/components/student/PreExamAnalysis';
import { analyzeStudent, getClassAverages } from '@/lib/analysis';
import { analyzePreExam } from '@/lib/preExam';
import { Student, PreExamAnalysis } from '@/lib/types';
import { Search, User, BookOpen, Clock, AlertTriangle, TrendingUp, Loader2, Beaker } from 'lucide-react';

interface MLPrediction {
  prediction: 'At-Risk' | 'Safe';
  risk_probability: number;
  safe_probability: number;
  confidence: string;
}

type TabType = 'performance' | 'pre-exam';

export default function StudentAnalysisPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchId, setSearchId] = useState('');
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [searchError, setSearchError] = useState('');
  const [activeTab, setActiveTab] = useState<TabType>('performance');
  const [mlPrediction, setMlPrediction] = useState<MLPrediction | null>(null);
  const [mlLoading, setMlLoading] = useState(false);
  const [mlError, setMlError] = useState<string | null>(null);

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

  // Fetch ML prediction when student is selected
  useEffect(() => {
    if (!selectedStudent) {
      setMlPrediction(null);
      return;
    }

    const fetchMLPrediction = async () => {
      setMlLoading(true);
      setMlError(null);
      try {
        const response = await fetch('/api/predict-risk', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            studentId: selectedStudent.Student_ID,
            features: {
              Midterm_Score: selectedStudent.Midterm_Score,
              Final_Score: selectedStudent.Final_Score,
              Assignments_Avg: selectedStudent.Assignments_Avg,
              Participation_Score: selectedStudent.Participation_Score,
              Projects_Score: selectedStudent.Projects_Score,
              Parent_Education_Level: selectedStudent.Parent_Education_Level,
            },
          }),
        });

        if (response.ok) {
          const data = await response.json();
          setMlPrediction(data);
        } else {
          setMlError('ML model unavailable');
        }
      } catch (err) {
        setMlError('Failed to connect to ML model');
      } finally {
        setMlLoading(false);
      }
    };

    fetchMLPrediction();
  }, [selectedStudent]);

  const classAvg = students.length > 0 ? getClassAverages(students) : null;

  const handleSearch = () => {
    setSearchError('');
    const student = students.find(s => s.Student_ID.toLowerCase() === searchId.toLowerCase());
    if (student) {
      setSelectedStudent(student);
      setActiveTab('performance');
    } else {
      setSearchError('Student not found. Please check the ID and try again.');
    }
  };

  const handleStudentSelect = (student: Student) => {
    setSelectedStudent(student);
    setSearchId(student.Student_ID);
    setActiveTab('performance');
  };

  // Get analysis for selected student
  const analysis = selectedStudent && classAvg ? analyzeStudent(selectedStudent, classAvg) : null;
  const preExamAnalysis = selectedStudent ? analyzePreExam(selectedStudent) : null;

  // Get list of students for quick select
  const studentSuggestions = searchId
    ? students.filter(s =>
        s.Student_ID.toLowerCase().includes(searchId.toLowerCase()) ||
        `${s.First_Name} ${s.Last_Name}`.toLowerCase().includes(searchId.toLowerCase())
      ).slice(0, 5)
    : [];

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
          <h1 className="text-2xl font-bold text-slate-900">Student Analysis</h1>
          <p className="text-slate-500 mt-1">Enter a student ID or select from the list to view detailed analysis</p>
        </div>

        {/* Search Section */}
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

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Student Info & Charts */}
          <div className="lg:col-span-2 space-y-6">
            {selectedStudent ? (
              <>
                {/* Student Bio Card */}
                <Card>
                  <CardContent>
                    <div className="flex items-center gap-4">
                      <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-violet-500 rounded-2xl flex items-center justify-center text-white text-2xl font-bold">
                        {selectedStudent.First_Name[0]}{selectedStudent.Last_Name[0]}
                      </div>
                      <div className="flex-1">
                        <h2 className="text-xl font-bold text-slate-900">{selectedStudent.First_Name} {selectedStudent.Last_Name}</h2>
                        <p className="text-slate-500 flex items-center gap-2 mt-1">
                          <span className="font-mono text-sm bg-slate-100 px-2 py-0.5 rounded">{selectedStudent.Student_ID}</span>
                          <span>|</span>
                          <span>{selectedStudent.Department}</span>
                          <span>|</span>
                          <span>{selectedStudent.Gender}, {selectedStudent.Age} yrs</span>
                        </p>
                        <div className="flex items-center gap-3 mt-3">
                          <Badge variant={selectedStudent.Grade as 'A' | 'B' | 'C' | 'D' | 'F'} className="text-sm px-3 py-1">
                            Grade {selectedStudent.Grade}
                          </Badge>
                          <span className={`text-lg font-bold ${
                            selectedStudent.Total_Score >= 90 ? 'text-emerald-600' :
                            selectedStudent.Total_Score >= 80 ? 'text-blue-600' :
                            selectedStudent.Total_Score >= 70 ? 'text-amber-600' :
                            selectedStudent.Total_Score >= 60 ? 'text-orange-600' : 'text-red-600'
                          }`}>
                            {selectedStudent.Total_Score.toFixed(1)}% Overall
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Tab Navigation */}
                <Card>
                  <CardContent className="p-0">
                    <div className="flex border-b border-slate-200">
                      <button
                        onClick={() => setActiveTab('performance')}
                        className={`flex-1 px-6 py-4 text-sm font-medium transition-colors ${
                          activeTab === 'performance'
                            ? 'text-indigo-600 border-b-2 border-indigo-500 bg-indigo-50/50'
                            : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-center justify-center gap-2">
                          <TrendingUp className="w-4 h-4" />
                          Performance Analysis
                        </div>
                      </button>
                      <button
                        onClick={() => setActiveTab('pre-exam')}
                        className={`flex-1 px-6 py-4 text-sm font-medium transition-colors ${
                          activeTab === 'pre-exam'
                            ? 'text-indigo-600 border-b-2 border-indigo-500 bg-indigo-50/50'
                            : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-center justify-center gap-2">
                          <Beaker className="w-4 h-4" />
                          Pre-Exam Prediction
                        </div>
                      </button>
                    </div>

                    <div className="p-6">
                      {activeTab === 'performance' ? (
                        <div className="space-y-6">
                          {/* Performance Radar Chart */}
                          <div>
                            <h3 className="font-semibold text-slate-900 flex items-center gap-2 mb-4">
                              <TrendingUp className="w-5 h-5 text-indigo-500" />
                              Performance Breakdown
                            </h3>
                            {classAvg && <PerformanceRadar student={selectedStudent} classAvg={classAvg} />}
                          </div>

                          {/* Factor Analysis */}
                          <div>
                            <h3 className="font-semibold text-slate-900 flex items-center gap-2 mb-4">
                              <Clock className="w-5 h-5 text-violet-500" />
                              Lifestyle & Environmental Factors
                            </h3>
                            {classAvg && (
                              <FactorAnalysis
                                student={selectedStudent}
                                classAvg={{
                                  Study_Hours_per_Week: classAvg.Study_Hours_per_Week,
                                  Sleep_Hours_per_Night: classAvg.Sleep_Hours_per_Night,
                                  Stress_Level: classAvg.Stress_Level,
                                  Attendance: classAvg.Attendance,
                                }}
                              />
                            )}
                          </div>

                          {/* Additional Info */}
                          <div>
                            <h3 className="font-semibold text-slate-900 flex items-center gap-2 mb-4">
                              <BookOpen className="w-5 h-5 text-emerald-500" />
                              Additional Information
                            </h3>
                            <div className="grid grid-cols-2 gap-4">
                              <div className="p-4 bg-slate-50 rounded-lg">
                                <p className="text-xs text-slate-500 uppercase font-medium">Study Hours</p>
                                <p className="text-lg font-bold text-slate-900">{selectedStudent.Study_Hours_per_Week} hrs/week</p>
                              </div>
                              <div className="p-4 bg-slate-50 rounded-lg">
                                <p className="text-xs text-slate-500 uppercase font-medium">Sleep</p>
                                <p className="text-lg font-bold text-slate-900">{selectedStudent.Sleep_Hours_per_Night} hrs/night</p>
                              </div>
                              <div className="p-4 bg-slate-50 rounded-lg">
                                <p className="text-xs text-slate-500 uppercase font-medium">Internet at Home</p>
                                <p className="text-lg font-bold text-slate-900">{selectedStudent.Internet_Access_at_Home ? 'Yes' : 'No'}</p>
                              </div>
                              <div className="p-4 bg-slate-50 rounded-lg">
                                <p className="text-xs text-slate-500 uppercase font-medium">Parent Education</p>
                                <p className="text-lg font-bold text-slate-900">{selectedStudent.Parent_Education_Level}</p>
                              </div>
                              <div className="p-4 bg-slate-50 rounded-lg">
                                <p className="text-xs text-slate-500 uppercase font-medium">Family Income</p>
                                <p className="text-lg font-bold text-slate-900">{selectedStudent.Family_Income_Level}</p>
                              </div>
                              <div className="p-4 bg-slate-50 rounded-lg">
                                <p className="text-xs text-slate-500 uppercase font-medium">Stress Level</p>
                                <p className="text-lg font-bold text-slate-900">{selectedStudent.Stress_Level}/10</p>
                              </div>
                              <div className="p-4 bg-slate-50 rounded-lg col-span-2">
                                <p className="text-xs text-slate-500 uppercase font-medium">Extracurricular</p>
                                <p className="text-sm text-slate-900">{selectedStudent.Extracurricular_Activities || 'None'}</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div>
                          <h3 className="font-semibold text-slate-900 flex items-center gap-2 mb-4">
                            <Beaker className="w-5 h-5 text-indigo-500" />
                            Pre-Exam Analysis & Predictions
                          </h3>
                          {preExamAnalysis && (
                            <PreExamAnalysisPanel
                              analysis={preExamAnalysis}
                              mlPrediction={mlPrediction}
                              mlLoading={mlLoading}
                              mlError={mlError}
                            />
                          )}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </>
            ) : (
              <Card className="p-12 text-center">
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <User className="w-8 h-8 text-slate-400" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900">Select a Student</h3>
                <p className="text-slate-500 mt-2">Enter a student ID above or select from suggestions to view detailed analysis</p>
                <p className="text-sm text-slate-400 mt-4">Try: S1000, S1002, S1004, S1008</p>
              </Card>
            )}
          </div>

          {/* Right Column - AI Explanation */}
          <div className="lg:col-span-1">
            {selectedStudent && analysis ? (
              <Card>
                <CardHeader>
                  <h3 className="font-semibold text-slate-900">AI Analysis</h3>
                </CardHeader>
                <CardContent>
                  <AIExplanation analysis={analysis} studentName={selectedStudent.First_Name} />
                </CardContent>
              </Card>
            ) : (
              <Card className="p-6 text-center">
                <AlertTriangle className="w-8 h-8 text-amber-400 mx-auto mb-3" />
                <p className="text-sm text-slate-500">AI analysis will appear here once you select a student</p>
              </Card>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
