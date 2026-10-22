from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import HTMLResponse
from pydantic import BaseModel, Field
from typing import Optional
import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestClassifier, RandomForestRegressor
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_absolute_error
import joblib
import warnings
from pathlib import Path

warnings.filterwarnings('ignore')

app = FastAPI(
    title="Student Risk & Marks Prediction API",
    description="Predicts at-risk status AND future academic marks",
    version="2.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Global State ---
clf_model = None  # Classification model
reg_model = None  # Regression model
df = None

# Classification features (existing)
clf_features = [
    'Midterm_Score', 'Final_Score', 'Assignments_Avg',
    'Participation_Contribution', 'Parent_Edu_Ordinal', 'Projects_Score'
]

# Regression features (predicting Final_Score without data leakage)
reg_features = [
    'Midterm_Score', 'Assignments_Avg', 'Quizzes_Avg', 'Participation_Score',
    'Projects_Score', 'Attendance (%)', 'Study_Hours_per_Week', 'Parent_Edu_Ordinal'
]

edu_order = {
    'Unknown': 0, 'Highschool Dropout': 0, 'Highschool Graduate': 1,
    'College Dropout': 2, "Bachelor's Degree": 2, "Master's Degree": 3, 'PhD': 4
}

grade_map = [(90, 'A'), (80, 'B'), (70, 'C'), (60, 'D'), (0, 'F')]

# --- Pydantic Models ---
class StudentIDRequest(BaseModel):
    student_id: str = Field(..., description="Student ID to lookup")

class ClassificationResponse(BaseModel):
    student_id: str
    student_name: str
    prediction: str
    risk_probability: float
    safe_probability: float
    confidence: str

class RegressionResponse(BaseModel):
    student_id: str
    student_name: str
    predicted_final_score: float
    projected_grade: str
    performance_tier: str
    study_recommendation: str

class ManualPredictionRequest(BaseModel):
    midterm_score: float = Field(..., ge=0, le=100)
    final_score: float = Field(..., ge=0, le=100)
    assignments_avg: float = Field(..., ge=0, le=100)
    participation_score: float = Field(..., ge=0, le=100)
    projects_score: float = Field(..., ge=0, le=100)
    parent_education_level: str

class ManualPredictionResponse(BaseModel):
    prediction: str
    risk_probability: float
    safe_probability: float
    confidence: str

# --- Helper Functions ---
def get_confidence(prob: float) -> str:
    if prob >= 90: return "Very High"
    elif prob >= 75: return "High"
    elif prob >= 60: return "Moderate"
    elif prob >= 40: return "Low"
    return "Very Low"

def get_grade(score: float) -> str:
    for threshold, grade in grade_map:
        if score >= threshold: return grade
    return 'F'

def get_performance_tier(score: float) -> str:
    if score >= 90: return "🌟 Excellent"
    elif score >= 80: return "📈 Strong"
    elif score >= 70: return "📊 Average"
    elif score >= 60: return "⚠️ Below Average"
    return "🔴 Critical"

def get_recommendation(score: float) -> str:
    if score >= 85: return "Maintain excellent study habits & consider advanced modules"
    elif score >= 70: return "Focus on weak areas & increase practice tests"
    elif score >= 60: return "Schedule tutoring & improve assignment consistency"
    return "Urgent academic intervention & study plan required"

def preprocess_clf(row: pd.Series) -> pd.DataFrame:
    part = row['Participation_Score'] * 10 if row['Participation_Score'] <= 10 else row['Participation_Score']
    return pd.DataFrame([{
        'Midterm_Score': row['Midterm_Score'],
        'Final_Score': row['Final_Score'],
        'Assignments_Avg': row['Assignments_Avg'],
        'Participation_Contribution': part * 0.05,
        'Parent_Edu_Ordinal': edu_order.get(row['Parent_Education_Level'], 0),
        'Projects_Score': row['Projects_Score']
    }], columns=clf_features)

def preprocess_reg(row: pd.Series) -> pd.DataFrame:
    part = row.get('Participation_Score', 0)
    part_scaled = part * 10 if part <= 10 else part
    return pd.DataFrame([{
        'Midterm_Score': row.get('Midterm_Score', 0),
        'Assignments_Avg': row.get('Assignments_Avg', 0),
        'Quizzes_Avg': row.get('Quizzes_Avg', 0),
        'Participation_Score': part_scaled,
        'Projects_Score': row.get('Projects_Score', 0),
        'Attendance (%)': row.get('Attendance (%)', 0),
        'Study_Hours_per_Week': float(row.get('Study_Hours_per_Week', 10)),
        'Parent_Edu_Ordinal': edu_order.get(str(row.get('Parent_Education_Level', 'Unknown')), 0)
    }], columns=reg_features)

# --- Training Function (Auto-runs if model missing) ---
def train_regression_model():
    global reg_model, df
    print("🔄 Training regression model (predicting Final_Score)...")
    df['Parent_Edu_Ordinal'] = df['Parent_Education_Level'].map(edu_order).fillna(0)
    df['Participation_Score'] = df['Participation_Score'].apply(lambda x: x * 10 if x <= 10 else x)
    
    X = df[reg_features]
    y = df['Final_Score']
    
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    reg_model = RandomForestRegressor(n_estimators=100, max_depth=10, random_state=42, n_jobs=-1)
    reg_model.fit(X_train, y_train)
    
    mae = mean_absolute_error(y_test, reg_model.predict(X_test))
    joblib.dump(reg_model, Path(_file_).parent / "student_marks_model.pkl")
    print(f"✅ Regression model trained & saved | Test MAE: {mae:.2f}")

# --- Startup: Load Data & Models ---
@app.on_event("startup")
async def startup_event():
    global df, clf_model, reg_model
    
    # Load dataset
    csv_path = Path(__file__).parent / "DATA_SECONDARY.csv"
    if csv_path.exists():
        df = pd.read_csv(csv_path)
        df['Parent_Education_Level'] = df['Parent_Education_Level'].fillna('Unknown')
        print(f"✅ Dataset loaded: {len(df)} students")
    else:
        print("⚠️ DATA_SECONDARY.csv not found")
        return
        
    # Load classification model
    clf_path = Path(__file__).parent / "student_risk_model.pkl"
    if clf_path.exists():
        clf_model = joblib.load(clf_path)
        print("✅ Classification model loaded")
    else:
        print("⚠️ Classification model not found")

    # Load or train regression model
    reg_path = Path(__file__).parent / "student_marks_model.pkl"
    if reg_path.exists():
        reg_model = joblib.load(reg_path)
        print("✅ Regression model loaded")
    else:
        train_regression_model()

# --- Endpoints ---
@app.get("/", response_class=HTMLResponse)
async def serve_frontend():
    html_file = Path(__file__).parent / "index.html"
    return html_file.read_text(encoding="utf-8") if html_file.exists() else {"message": "Frontend not found"}
# Add near other endpoints in main.py
@app.get("/students")
async def list_students():
    """Return list of student IDs and names from loaded dataset"""
    global df
    if df is None:
        raise HTTPException(503, "Dataset not loaded")
    
    # Return unique student IDs with names (adjust column names to match your CSV)
    students = df[['Student_ID', 'First_Name', 'Last_Name']].drop_duplicates().to_dict('records')
    return [
        {
            "id": str(s['Student_ID']),
            "name": f"{s['First_Name']} {s['Last_Name']}".strip()
        }
        for s in students
    ]

@app.post("/predict-by-id", response_model=ClassificationResponse)
async def predict_classification(req: StudentIDRequest):
    if df is None or clf_model is None:
        raise HTTPException(503, "Classification system not ready")
        
    student = df[df['Student_ID'].astype(str) == str(req.student_id)]
    if student.empty:
        raise HTTPException(404, f"Student ID '{req.student_id}' not found")
        
    row = student.iloc[0]
    required = ['Midterm_Score', 'Final_Score', 'Assignments_Avg', 'Participation_Score', 'Projects_Score', 'Parent_Education_Level']
    if row[required].isnull().any():
        raise HTTPException(400, "Incomplete student data in database")
        
    input_df = preprocess_clf(row)
    pred = clf_model.predict(input_df)[0]
    proba = clf_model.predict_proba(input_df)[0]
    
    return ClassificationResponse(
        student_id=str(row['Student_ID']),
        student_name=f"{row['First_Name']} {row['Last_Name']}",
        prediction="At-Risk" if pred == 1 else "Safe",
        risk_probability=round(float(proba[1] * 100), 2),
        safe_probability=round(float(proba[0] * 100), 2),
        confidence=get_confidence(max(float(proba[1] * 100), float(proba[0] * 100)))
    )

@app.post("/predict-marks", response_model=RegressionResponse)
async def predict_marks(req: StudentIDRequest):
    if df is None or reg_model is None:
        raise HTTPException(503, "Regression system not ready")
        
    student = df[df['Student_ID'].astype(str) == str(req.student_id)]
    if student.empty:
        raise HTTPException(404, f"Student ID '{req.student_id}' not found")
        
    row = student.iloc[0]
    input_df = preprocess_reg(row)
    
    pred_score = float(reg_model.predict(input_df)[0])
    pred_score = max(0.0, min(100.0, pred_score))  # Clamp to valid range
    
    return RegressionResponse(
        student_id=str(row['Student_ID']),
        student_name=f"{row['First_Name']} {row['Last_Name']}",
        predicted_final_score=round(pred_score, 2),
        projected_grade=get_grade(pred_score),
        performance_tier=get_performance_tier(pred_score),
        study_recommendation=get_recommendation(pred_score)
    )

@app.post("/predict", response_model=ManualPredictionResponse)
async def predict_manual(request: ManualPredictionRequest):
    if clf_model is None:
        raise HTTPException(503, "Classification model not loaded")
    input_df = preprocess_features(
        request.midterm_score, request.final_score, request.assignments_avg,
        request.participation_score, request.projects_score, request.parent_education_level
    )
    pred = clf_model.predict(input_df)[0]
    proba = clf_model.predict_proba(input_df)[0]
    return ManualPredictionResponse(
        prediction="At-Risk" if pred == 1 else "Safe",
        risk_probability=round(float(proba[1] * 100), 2),
        safe_probability=round(float(proba[0] * 100), 2),
        confidence=get_confidence(max(float(proba[1] * 100), float(proba[0] * 100)))
    )

@app.get("/health")
async def health_check():
    return {
        "status": "ready",
        "classification_loaded": clf_model is not None,
        "regression_loaded": reg_model is not None,
        "dataset_loaded": df is not None
    }