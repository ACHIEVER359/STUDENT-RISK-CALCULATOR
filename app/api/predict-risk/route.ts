import { NextResponse } from 'next/server';

const ML_API_URL = process.env.ML_API_URL || 'http://localhost:8000';

export async function POST(request: Request) {
  try {
    const { studentId, features } = await request.json();

    // If we have a student ID, use the predict-by-id endpoint
    if (studentId) {
      const response = await fetch(`${ML_API_URL}/predict-by-id`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ student_id: studentId }),
      });

      if (!response.ok) {
        const error = await response.json();
        return NextResponse.json({ error: error.detail || 'Prediction failed' }, { status: response.status });
      }

      const prediction = await response.json();
      return NextResponse.json(prediction);
    }

    // Otherwise use manual prediction with features
    if (features) {
      const response = await fetch(`${ML_API_URL}/predict`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          midterm_score: features.Midterm_Score,
          final_score: features.Final_Score,
          assignments_avg: features.Assignments_Avg,
          participation_score: features.Participation_Score,
          projects_score: features.Projects_Score,
          parent_education_level: features.Parent_Education_Level,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        return NextResponse.json({ error: error.detail || 'Prediction failed' }, { status: response.status });
      }

      const prediction = await response.json();
      return NextResponse.json(prediction);
    }

    return NextResponse.json({ error: 'Missing student_id or features' }, { status: 400 });
  } catch (error) {
    console.error('ML API error:', error);
    return NextResponse.json({ error: 'Failed to connect to ML model' }, { status: 500 });
  }
}
