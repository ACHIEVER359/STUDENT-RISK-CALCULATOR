import { NextResponse } from 'next/server';
import Papa from 'papaparse';
import fs from 'fs';
import path from 'path';

interface RawStudent {
  Student_ID: string;
  First_Name: string;
  Last_Name: string;
  Email: string;
  Gender: string;
  Age: string;
  Department: string;
  'Attendance (%)': string;
  Midterm_Score: string;
  Final_Score: string;
  Assignments_Avg: string;
  Quizzes_Avg: string;
  Participation_Score: string;
  Projects_Score: string;
  Total_Score: string;
  Grade: string;
  Study_Hours_per_Week: string;
  Extracurricular_Activities: string;
  Internet_Access_at_Home: string;
  Parent_Education_Level: string;
  Family_Income_Level: string;
  'Stress_Level (1-10)': string;
  Sleep_Hours_per_Night: string;
}

export async function GET() {
  try {
    const csvPath = path.join(process.cwd(), '..', 'components', 'Lumina_rows.csv');
    const csvFile = fs.readFileSync(csvPath, 'utf-8');

    const result = Papa.parse<RawStudent>(csvFile, {
      header: true,
      skipEmptyLines: true,
    });

    const students = result.data.map((row) => ({
      Student_ID: row.Student_ID?.trim() || '',
      First_Name: row.First_Name?.trim() || '',
      Last_Name: row.Last_Name?.trim() || '',
      Email: row.Email?.trim() || '',
      Gender: row.Gender?.trim() || '',
      Age: parseInt(row.Age) || 0,
      Department: row.Department?.trim() || '',
      Attendance: parseFloat(row['Attendance (%)']) || 0,
      Midterm_Score: parseFloat(row.Midterm_Score) || 0,
      Final_Score: parseFloat(row.Final_Score) || 0,
      Assignments_Avg: parseFloat(row.Assignments_Avg) || 0,
      Quizzes_Avg: parseFloat(row.Quizzes_Avg) || 0,
      Participation_Score: parseFloat(row.Participation_Score) || 0,
      Projects_Score: parseFloat(row.Projects_Score) || 0,
      Total_Score: parseFloat(row.Total_Score) || 0,
      Grade: row.Grade?.trim() || 'F',
      Study_Hours_per_Week: parseFloat(row.Study_Hours_per_Week) || 0,
      Extracurricular_Activities: row.Extracurricular_Activities?.trim() || '',
      Internet_Access_at_Home: row.Internet_Access_at_Home?.trim().toLowerCase() === 'yes',
      Parent_Education_Level: row.Parent_Education_Level?.trim() || '',
      Family_Income_Level: row.Family_Income_Level?.trim() || '',
      Stress_Level: parseInt(row['Stress_Level (1-10)']) || 0,
      Sleep_Hours_per_Night: parseFloat(row.Sleep_Hours_per_Night) || 0,
    }));

    return NextResponse.json(students);
  } catch (error) {
    console.error('Error loading CSV:', error);
    return NextResponse.json({ error: 'Failed to load students' }, { status: 500 });
  }
}
