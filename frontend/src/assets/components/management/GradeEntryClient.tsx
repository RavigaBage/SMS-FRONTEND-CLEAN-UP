
"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { gradeApi, ResultType } from "@/src/lib/gradeApi";
import "@/styles/grades_student.css";

export default function GradeEntry() {
  const searchParams = useSearchParams();

  // Extract params from URL
  const studentId = searchParams.get("studentId");
  const classId = searchParams.get("classId");
  const subjectId = searchParams.get("subjectId") || searchParams.get("subject");
  const academicYear = searchParams.get("academicYear");
  const term = searchParams.get("term");
  const studentName = searchParams.get("studentName");
  const className = searchParams.get("className");

  // State for grade data
  const [grade, setGrade] = useState<ResultType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState("");
  const [isNewGrade, setIsNewGrade] = useState(false);
  const [remarks, setRemarks] = useState("");
  // Assessment scores (you can break these down as needed)
  const [assessmentScore, setAssessmentScore] = useState(0);
  const [assessmentTotal, setAssessmentTotal] = useState(0);
  
  const [testScore, setTestScore] = useState(0);
  const [testTotal, setTestTotal] = useState(0);
  
  const [examScore, setExamScore] = useState(0);
  const [examTotal, setExamTotal] = useState(0);

  // Weights (if you want to make them adjustable)
  const [asmtWeight, setAsmtWeight] = useState(30);
  const examWeight = 100 - asmtWeight;


  const getGradeClass = (gradeLetter: string): string => {
  const grade = gradeLetter.toLowerCase().replace('+', 'p');
  if (grade.startsWith('a')) return 'a';
  if (grade.startsWith('b')) return 'b';
  if (grade.startsWith('c')) return 'c';
  if (grade.startsWith('d')) return 'd';
  return 'f';
};


  // Fetch grade on mount
  useEffect(() => {
    async function fetchGrade() {
      if (!studentId || !classId || !subjectId || !academicYear || !term) {
        console.error("Missing params:", { studentId, classId, subjectId, academicYear, term });
        setError("Missing required parameters");
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const data = await gradeApi.getGradeByParams({
          studentId: Number(studentId),
          classId: Number(classId),
          subjectId: Number(subjectId),
          academicYear: academicYear,
          term: term,
        });

        
        setGrade(data);
        setIsNewGrade(false);

        setAssessmentScore(data.assessment_score ?? 0);
        setAssessmentTotal(data.assessment_total ?? 0);
        setTestScore(data.test_score ?? 0);
        setTestTotal(data.test_total ?? 0);
        setExamScore(data.exam_score ?? 0);
        setExamTotal(data.exam_total ?? 0);
        setRemarks(data.remarks ?? ""); 
        
      } catch (err) {
        console.error("Failed to fetch grade:", err);
        setGrade(null);
        setIsNewGrade(true);
      } finally {
        setLoading(false);
      }
    }

    fetchGrade();
  }, [studentId, classId, subjectId, academicYear, term]);

  
// 1. Define constants for weights to make it easy to change later
const WEIGHTS = {
  TEST: 30,
  ASSESSMENT: 20,
  EXAM: 50
};

const getWeighted = (score:number, total:number, weight:number): number => {
  if (!total || total === 0) return 0;
  return Number(((score / total) * weight).toFixed(2));
};

// 3. Calculation
const w_test = getWeighted(testScore, testTotal, WEIGHTS.TEST);
const w_assessment = getWeighted(assessmentScore, assessmentTotal, WEIGHTS.ASSESSMENT);
const w_exam = getWeighted(examScore, examTotal, WEIGHTS.EXAM);

const totalScore = w_test + w_assessment + w_exam;

const displayScore = Number(totalScore.toFixed(2));

const get_letter_grade = (score: number): string => {
  if (score >= 80) return "A";
  if (score >= 75) return "B+";
  if (score >= 70) return "B";
  if (score >= 65) return "C+";
  if (score >= 60) return "C";
  if (score >= 55) return "C-";
  if (score >= 50) return "D";
  if (score >= 45) return "E";
  return "F";
}

  const handleSaveGrades = async () => {
    if (!studentId || !classId || !subjectId || !academicYear || !term) {
      setSaveStatus("Error: Missing required parameters");
      return;
    }

    setIsSaving(true);
    setSaveStatus("");

    try {
      const updated = await gradeApi.saveGrade({
        studentId: Number(studentId),
        classId: Number(classId),
        subjectId: Number(subjectId),
        academicYear: academicYear,
        term: term,
        isNewGrade: isNewGrade,
        data: {
          assessment_score: assessmentScore,
          assessment_total: assessmentTotal,
          test_score: testScore,
          test_total: testTotal,
          exam_score: examScore,
          exam_total: examTotal,
          weighted_assessment: w_assessment,
          weighted_test: w_test,
          remarks: remarks, 
          weighted_exam: w_exam,
          total_score: displayScore,
          grade_letter: get_letter_grade(displayScore),
          
        },
      });

      setGrade(updated);
      setIsNewGrade(false);
      setSaveStatus(isNewGrade ? "Grade created successfully!" : "Grades updated successfully!");
      
      // Clear success message after 3 seconds
      setTimeout(() => setSaveStatus(""), 3000);
      
    } catch (err) {
      console.error("Failed to save grade:", err);
      setSaveStatus(`Error: ${err instanceof Error ? err.message : "Failed to save grades"}`);
    } finally {
      setIsSaving(false);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="dashboard-container">
        <main className="content">
          <div style={{ padding: "40px", textAlign: "center" }}>
            <p>Loading grade data...</p>
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-container STUDENT_GRADE">
        <main className="content">
          <div style={{ padding: "40px", textAlign: "center", color: "#c33" }}>
            <h2>Error</h2>
            <p>{error}</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="dashboard-container STUDENT_GRADE">
      <main className="content">
        <header className="main-header">
          <div className="breadcrumb">
            Academic / <strong>Grade Calculation</strong>
          </div>
          <div className="header-right">
            <div className="search-box">
              <input type="text" placeholder="Search student..." />
            </div>
            <div className="avatar-small"></div>
          </div>
        </header>

        {/* Show notice if this is a new grade entry */}
        {isNewGrade && (
          <div style={{
            margin: '20px 0',
            padding: '15px',
            backgroundColor: '#e3f2fd',
            border: '1px solid #2196f3',
            borderRadius: '8px',
            color: '#1565c0'
          }}>
            <strong>New Grade Entry:</strong> No existing grade found. Enter the scores below to create a new grade record.
          </div>
        )}

        {/* TOP INFO CARD - Dynamic Data */}
        <section className="info-card">
          <div className="info-group">
            <label>STUDENT NAME</label>
            <p>{studentName || "N/A"}</p>
          </div>
          <div className="info-group">
            <label>STUDENT ID</label>
            <p>{studentId || "N/A"}</p>
          </div>
          <div className="info-group">
            <label>CLASS</label>
            <p>{className || "N/A"}</p>
          </div>
          <div className="info-group">
            <label>ACADEMIC YEAR</label>
            <p>{academicYear || "N/A"}</p>
          </div>
          <div className="info-group">
            <label>TERM</label>
            <p>{term ? term.charAt(0).toUpperCase() + term.slice(1) : "N/A"}</p>
          </div>
        </section>

        {/* MAIN GRID AREA */}
        <div className="main-grid">
          
          {/* LEFT COLUMN: RECORDS */}
          <div className="records-column">
            <div className="card">
              <div className="card-header">
                <h3>Continuous Assessment</h3>
              </div>
              <div className="exam-inputs" style={{ padding: "20px" }}>
                <div className="input-field">
                  <label>Assessment Score</label>
                  <input 
                    type="number" 
                    value={assessmentScore} 
                    onChange={(e) => setAssessmentScore(Number(e.target.value) || 0)}
                    className="score-input"
                    step="0.01"
                  />
                </div>
                <div className="input-field">
                  <label>Assessment Total</label>
                  <input 
                    type="number" 
                    value={assessmentTotal} 
                    onChange={(e) => setAssessmentTotal(Number(e.target.value) || 0)}
                    className="score-input"
                    step="0.01"
                  />
                </div>
              </div>
            </div>

            <div className="card">
              <div className="card-header">
                <h3>Test Scores</h3>
              </div>
              <div className="exam-inputs" style={{ padding: "20px" }}>
                <div className="input-field">
                  <label>Test Score</label>
                  <input 
                    type="number" 
                    value={testScore} 
                    onChange={(e) => setTestScore(Number(e.target.value) || 0)}
                    className="score-input"
                    step="0.01"
                  />
                </div>
                <div className="input-field">
                  <label>Test Total</label>
                  <input 
                    type="number" 
                    value={testTotal} 
                    onChange={(e) => setTestTotal(Number(e.target.value) || 0)}
                    className="score-input"
                    step="0.01"
                  />
                </div>
              </div>
            </div>

            <div className="card exam-section">
              <div className="card-header">
                <h3>Examination Scores</h3>
              </div>
              <div className="exam-inputs">
                <div className="input-field">
                  <label>Exam Score</label>
                  <input 
                    type="number" 
                    placeholder="0-100" 
                    value={examScore}
                    onChange={(e) => setExamScore(Number(e.target.value) || 0)}
                    step="0.01"
                  />
                </div>
                <div className="input-field">
                  <label>Exam Total</label>
                  <input 
                    type="number" 
                    placeholder="0-100" 
                    value={examTotal}
                    onChange={(e) => setExamTotal(Number(e.target.value) || 0)}
                    step="0.01"
                  />
                </div>
              </div>
            </div>

            <div className="card">
            <div className="card-header">
              <h3>Remarks</h3>
            </div>
            <div style={{ padding: "20px" }}>
              <div className="input-field">
                <label>Teacher's Remarks</label>
                <textarea
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  placeholder="Add any notes or remarks about this student's performance..."
                  rows={4}
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    fontSize: "14px",
                    fontFamily: "inherit",
                    color: "#0f172a",
                    background: "#f8fafc",
                    border: "1px solid #e2e8f0",
                    outline: "none",
                    resize: "vertical",
                    lineHeight: 1.6,
                    transition: "border-color 0.2s",
                    boxSizing: "border-box",
                  }}
                  onFocus={(e) => e.target.style.borderColor = "#1a56db"}
                  onBlur={(e) => e.target.style.borderColor = "#e2e8f0"}
                />
              </div>

              {/* character count */}
              <p style={{
                marginTop: 6, textAlign: "right",
                fontSize: 11, color: remarks.length > 400 ? "#ef4444" : "#94a3b8",
              }}>
                {remarks.length} / 500
              </p>
            </div>
          </div>

          </div>
          {/* RIGHT COLUMN: SUMMARY & SETTINGS */}
          <div className="summary-column">
            <div className="card settings-card">
              <div className="card-header">
                <h3>Current Grade Information</h3>
              </div>
              <div style={{ padding: "20px" }}>
                <div className="setting-item">
                  <div className="setting-label">
                    <span>Weighted Assessment (20%)</span> 
                    <span>{w_assessment || 0}</span>
                  </div>
                </div>
                <div className="setting-item">
                  <div className="setting-label">
                    <span>Weighted Test (30%)</span> 
                    <span>{w_test || 0}</span>
                  </div>
                </div>
                <div className="setting-item">
                  <div className="setting-label">
                    <span>Weighted Exam (50%)</span> 
                    <span>{w_exam || 0}</span>
                  </div>
                </div>
                <div className="setting-item">
                  <div className="setting-label">
                    <span>Grade Letter</span> 
                    <span className={`grade-pill ${getGradeClass(get_letter_grade(displayScore))}`}>
                      {get_letter_grade(displayScore)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="summary-grid">
              <div className="sum-box">
                <label>Assessment</label>
                <div className="val">{assessmentScore}/{assessmentTotal}</div>
              </div>
              <div className="sum-box">
                <label>Test</label>
                <div className="val">{testScore}/{testTotal}</div>
              </div>
              <div className="sum-box">
                <label>Exam</label>
                <div className="val">{examScore}/{examTotal}</div>
              </div>
              <div className="sum-box final">
                <label>OVERALL TOTAL</label>
                <div className="val">{displayScore || 0}</div>
              </div>
            </div>

            <div className="action-area">
              <button 
                className="btn-primary" 
                onClick={handleSaveGrades}
                disabled={isSaving}
              >
                {isSaving ? 'Saving...' : isNewGrade ? 'Create Grade' : 'Update Grades'}
              </button>
              
              {saveStatus && (
                <div style={{
                  marginTop: '10px',
                  padding: '10px',
                  borderRadius: '4px',
                  backgroundColor: saveStatus.includes('Error') ? '#fee' : '#efe',
                  color: saveStatus.includes('Error') ? '#c33' : '#363'
                }}>
                  {saveStatus}
                </div>
              )}
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
