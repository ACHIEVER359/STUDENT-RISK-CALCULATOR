-- Scholar Sense Database Schema
-- Run this in your Supabase SQL editor

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create students table
CREATE TABLE students (
  Student_ID TEXT PRIMARY KEY,
  First_Name TEXT NOT NULL,
  Last_Name TEXT NOT NULL,
  Email TEXT NOT NULL UNIQUE,
  Gender TEXT NOT NULL CHECK (Gender IN ('Male', 'Female', 'Other')),
  Age INTEGER NOT NULL CHECK (Age >= 13 AND Age <= 25),
  Department TEXT NOT NULL,
  Attendance DECIMAL(5,2) NOT NULL CHECK (Attendance >= 0 AND Attendance <= 100),
  Midterm_Score DECIMAL(5,2) NOT NULL CHECK (Midterm_Score >= 0 AND Midterm_Score <= 100),
  Final_Score DECIMAL(5,2) NOT NULL CHECK (Final_Score >= 0 AND Final_Score <= 100),
  Assignments_Avg DECIMAL(5,2) NOT NULL CHECK (Assignments_Avg >= 0 AND Assignments_Avg <= 100),
  Quizzes_Avg DECIMAL(5,2) NOT NULL CHECK (Quizzes_Avg >= 0 AND Quizzes_Avg <= 100),
  Participation_Score DECIMAL(5,2) NOT NULL CHECK (Participation_Score >= 0 AND Participation_Score <= 100),
  Projects_Score DECIMAL(5,2) NOT NULL CHECK (Projects_Score >= 0 AND Projects_Score <= 100),
  Total_Score DECIMAL(5,2) NOT NULL CHECK (Total_Score >= 0 AND Total_Score <= 100),
  Grade TEXT NOT NULL CHECK (Grade IN ('A', 'B', 'C', 'D', 'F')),
  Study_Hours_per_Week DECIMAL(5,2) NOT NULL CHECK (Study_Hours_per_Week >= 0),
  Extracurricular_Activities TEXT,
  Internet_Access_at_Home BOOLEAN NOT NULL DEFAULT true,
  Parent_Education_Level TEXT CHECK (Parent_Education_Level IN ('High School', 'Some College', 'Bachelor\'s', 'Master\'s', 'PhD')),
  Family_Income_Level TEXT CHECK (Family_Income_Level IN ('Low', 'Middle', 'High')),
  Stress_Level INTEGER NOT NULL CHECK (Stress_Level >= 1 AND Stress_Level <= 10),
  Sleep_Hours_per_Night DECIMAL(4,2) NOT NULL CHECK (Sleep_Hours_per_Night >= 0 AND Sleep_Hours_per_Night <= 24),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create index on Student_ID for faster lookups
CREATE INDEX idx_students_student_id ON students(Student_ID);

-- Create index on Department for filtering
CREATE INDEX idx_students_department ON students(Department);

-- Create index on Grade for filtering
CREATE INDEX idx_students_grade ON students(Grade);

-- Enable Row Level Security (RLS)
ALTER TABLE students ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see their own data (for teacher accounts)
-- For MVP, we'll make the table publicly readable for demonstration
-- In production, uncomment and modify this policy:
-- CREATE POLICY "Users can view all students" ON students
--   FOR SELECT USING (
--     EXISTS (
--       SELECT 1 FROM auth.users
--       WHERE id = auth.uid()
--     )
--   );

-- Grant permissions
GRANT ALL ON students TO authenticated;
GRANT ALL ON students TO anon;

-- Function to update timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update updated_at
CREATE TRIGGER update_students_updated_at
  BEFORE UPDATE ON students
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Comments for documentation
COMMENT ON TABLE students IS 'Student academic and psychological metric data for Scholar Sense';
COMMENT ON COLUMN students.Student_ID IS 'Unique student identifier (e.g., STU001)';
COMMENT ON COLUMN students.Stress_Level IS 'Self-reported stress level from 1-10';
COMMENT ON COLUMN students.Family_Income_Level IS 'Family economic status classification';