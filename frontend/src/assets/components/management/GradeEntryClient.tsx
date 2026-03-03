"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { gradeApi, ResultType } from "@/src/lib/gradeApi";
import { ErrorMessage, extractErrorDetail } from "@/components/ui/ErrorExtract";
import "@/styles/grades_student.css";

export default function GradeEntry() {
  const searchParams = useSearchParams();

  const studentId = searchParams.get("studentId");
  const classId = searchParams.get("classId");
  const subjectId = searchParams.get("subjectId") || searchParams.get("subject");
  const academicYear = searchParams.get("academicYear");
  const term = searchParams.get("term");
  const studentName = searchParams.get("studentName");
  const className = searchParams.get("className");

  const [grade, setGrade] = useState<ResultType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState("");
  const [saveErrorDetail, setSaveErrorDetail] = useState<any>(null);
  const [isNewGrade, setIsNewGrade] = useState(false);
  const [remarks, setRemarks] = useState("");
  const [assessmentScore, setAssessmentScore] = useState(0);
  const [assessmentTotal, setAssessmentTotal] = useState(0);
  const [testScore, setTestScore] = useState(0);
  const [testTotal, setTestTotal] = useState(0);
  const [examScore, setExamScore] = useState(0);
  const [examTotal, setExamTotal] = useState(0);

  const [asmtWeight, setAsmtWeight] = useState(30);
  const examWeight = 100 - asmtWeight;

  const getGradeClass = (gradeLetter: string): string => {
    const grade = gradeLetter.toLowerCase().replace("+", "p");
    if (grade.startsWith("a")) return "a";
    if (grade.startsWith("b")) return "b";
    if (grade.startsWith("c")) return "c";
    if (grade.startsWith("d")) return "d";
    return "f";
  };

  useEffect(() => {
    async function fetchGrade() {
      if (!studentId || !classId || !subjectId || !academicYear || !term) {
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

        if (data) {
          setGrade(data);
          setIsNewGrade(false);
          setAssessmentScore(data.assessment_score ?? 0);
          setAssessmentTotal(data.assessment_total ?? 0);
          setTestScore(data.test_score ?? 0);
          setTestTotal(data.test_total ?? 0);
          setExamScore(data.exam_score ?? 0);
          setExamTotal(data.exam_total ?? 0);
          setRemarks(data.remarks ?? "");
        } else {
          setGrade(null);
          setIsNewGrade(true);
          setAssessmentScore(0);
          setAssessmentTotal(0);
          setTestScore(0);
          setTestTotal(0);
          setExamScore(0);
          setExamTotal(0);
          setRemarks("");
        }
      } catch (err) {
        setError(extractErrorDetail(err) || "Failed to fetch grade.");
        setGrade(null);
        setIsNewGrade(true);
      } finally {
        setLoading(false);
      }
    }

    fetchGrade();
  }, [studentId, classId, subjectId, academicYear, term]);

  const WEIGHTS = {
    TEST: 30,
    ASSESSMENT: 20,
    EXAM: 50,
  };

  const getWeighted = (score: number, total: number, weight: number): number => {
    if (!total || total === 0) return 0;
    return Number(((score / total) * weight).toFixed(2));
  };

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
  };

  const handleSaveGrades = async () => {
    if (!studentId || !classId || !subjectId || !academicYear || !term) {
      setSaveStatus("Error: Missing required parameters");
      return;
    }

    setIsSaving(true);
    setSaveStatus("");
    setSaveErrorDetail(null);

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
      setSaveErrorDetail(null);
      setTimeout(() => setSaveStatus(""), 3000);
    } catch (err) {
      setSaveStatus("Error");
      console.log(err);
      setSaveErrorDetail(extractErrorDetail(err) || "Failed to save grades");
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <div style={{ background: "linear-gradient(135deg, #ffffff 0%, #f8fafb 100%)", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ marginBottom: "16px", display: "flex", justifyContent: "center", gap: "8px" }}>
            <div style={{ width: "8px", height: "8px", background: "#9ca3af", borderRadius: "50%", animation: "pulse 2s infinite" }}></div>
          </div>
          <p style={{ color: "#6b7280", fontSize: "14px", fontWeight: 500 }}>Loading grade data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ background: "linear-gradient(135deg, #ffffff 0%, #f8fafb 100%)", minHeight: "100vh", padding: "40px 20px" }}>
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Crimson+Text:wght@400;600&family=Inter:wght@400;500;600;700&display=swap');
          * { font-family: 'Inter', sans-serif; }
          h1, h2, h3 { font-family: 'Crimson Text', serif; }
        `}</style>
        <div style={{ maxWidth: "600px", margin: "0 auto", textAlign: "center" }}>
          <h2 style={{ fontSize: "28px", fontWeight: 600, color: "#1f2937", marginBottom: "12px" }}>Error</h2>
          <ErrorMessage errorDetail={error} className="mt-4 text-left" />
        </div>
      </div>
    );
  }

  return (
    <div style={{ background: "linear-gradient(135deg, #ffffff 0%, #f8fafb 100%)", minHeight: "100vh", paddingBottom: "40px" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Crimson+Text:wght@400;600&family=Inter:wght@400;500;600;700&display=swap');
        
        * { font-family: 'Inter', sans-serif; }
        h1, h2, h3, h4 { font-family: 'Crimson Text', serif; }

        .grade-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 40px 20px;
        }

        .header-section {
          margin-bottom: 40px;
        }

        .breadcrumb {
          font-size: 13px;
          color: #9ca3af;
          margin-bottom: 16px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          font-weight: 600;
        }

        .page-title {
          font-size: 44px;
          font-weight: 600;
          color: #1f2937;
          margin: 0 0 12px 0;
          letter-spacing: -1px;
          line-height: 1.1;
        }

        .page-subtitle {
          font-size: 14px;
          color: #6b7280;
          margin: 0;
        }

        .student-info-card {
          background: white;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          padding: 24px;
          margin-bottom: 32px;
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 32px;
        }

        .info-item {
          display: flex;
          flex-direction: column;
        }

        .info-label {
          font-size: 11px;
          font-weight: 700;
          color: #9ca3af;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin-bottom: 8px;
        }

        .info-value {
          font-size: 16px;
          font-weight: 600;
          color: #1f2937;
        }

        .alert-box {
          background: #f0f9ff;
          border-left: 4px solid #3b82f6;
          border-radius: 6px;
          padding: 16px;
          margin-bottom: 32px;
          display: flex;
          gap: 12px;
        }

        .alert-icon {
          color: #3b82f6;
          flex-shrink: 0;
          margin-top: 2px;
          font-size: 18px;
        }

        .alert-content {
          flex: 1;
        }

        .alert-title {
          font-size: 13px;
          font-weight: 600;
          color: #1e40af;
          margin: 0 0 4px 0;
        }

        .alert-text {
          font-size: 13px;
          color: #1e40af;
          margin: 0;
        }

        .main-grid {
          display: grid;
          grid-template-columns: 1fr 380px;
          gap: 32px;
          align-items: start;
        }

        @media (max-width: 1024px) {
          .main-grid {
            grid-template-columns: 1fr;
          }
        }

        .input-sections {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 24px;
        }

        .card {
          background: white;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          overflow: hidden;
        }

        .card-header {
          padding: 20px 24px;
          border-bottom: 1px solid #f3f4f6;
          background: #fafbfc;
        }

        .card-header h3 {
          font-size: 18px;
          font-weight: 600;
          color: #1f2937;
          margin: 0;
          letter-spacing: -0.3px;
        }

        .card-content {
          padding: 24px;
        }

        .input-group {
          margin-bottom: 20px;
        }

        .input-group:last-child {
          margin-bottom: 0;
        }

        .input-label {
          display: block;
          font-size: 13px;
          font-weight: 600;
          color: #374151;
          margin-bottom: 8px;
        }

        .input-field {
          position: relative;
        }

        .score-input {
          width: 100%;
          padding: 10px 12px;
          font-size: 14px;
          border: 1px solid #e5e7eb;
          border-radius: 6px;
          background: white;
          color: #1f2937;
          transition: all 0.2s ease;
          font-family: 'Inter', sans-serif;
        }

        .score-input:hover {
          border-color: #d1d5db;
        }

        .score-input:focus {
          outline: none;
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }

        .textarea-field {
          width: 100%;
          padding: 12px 14px;
          font-size: 13px;
          border: 1px solid #e5e7eb;
          border-radius: 6px;
          background: white;
          color: #1f2937;
          font-family: 'Inter', sans-serif;
          resize: vertical;
          min-height: 100px;
          transition: all 0.2s ease;
          line-height: 1.6;
        }

        .textarea-field:hover {
          border-color: #d1d5db;
        }

        .textarea-field:focus {
          outline: none;
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }

        .char-count {
          font-size: 11px;
          color: #9ca3af;
          margin-top: 6px;
          text-align: right;
        }

        .char-count.warning {
          color: #ef4444;
        }

        .summary-section {
          background: white;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          padding: 24px;
          margin-bottom: 24px;
        }

        .summary-title {
          font-size: 16px;
          font-weight: 600;
          color: #1f2937;
          margin: 0 0 20px 0;
        }

        .summary-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px 0;
          border-bottom: 1px solid #f3f4f6;
          font-size: 13px;
        }

        .summary-item:last-child {
          border-bottom: none;
        }

        .summary-label {
          color: #6b7280;
          font-weight: 500;
        }

        .summary-value {
          font-weight: 600;
          color: #1f2937;
        }

        .summary-score-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
          margin-bottom: 24px;
        }

        .score-box {
          background: #f9fafb;
          border: 1px solid #e5e7eb;
          border-radius: 6px;
          padding: 16px;
          text-align: center;
        }

        .score-box-label {
          font-size: 11px;
          font-weight: 700;
          color: #9ca3af;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin-bottom: 8px;
        }

        .score-box-value {
          font-size: 18px;
          font-weight: 700;
          color: #1f2937;
        }

        .score-box.total {
          grid-column: 1 / -1;
          background: linear-gradient(135deg, #f0f9ff 0%, #f0fdf4 100%);
          border-color: #bfdbfe;
        }

        .score-box.total .score-box-value {
          color: #0369a1;
          font-size: 24px;
        }

        .grade-pill {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 48px;
          height: 48px;
          border-radius: 6px;
          font-size: 16px;
          font-weight: 700;
          color: white;
        }

        .grade-pill.a {
          background: #10b981;
        }

        .grade-pill.b {
          background: #3b82f6;
        }

        .grade-pill.c {
          background: #f59e0b;
        }

        .grade-pill.d {
          background: #ef5350;
        }

        .grade-pill.f {
          background: #dc2626;
        }

        .action-button {
          width: 100%;
          padding: 12px 16px;
          background: #3b82f6;
          color: white;
          border: none;
          border-radius: 6px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
          margin-bottom: 16px;
        }

        .action-button:hover:not(:disabled) {
          background: #2563eb;
          box-shadow: 0 4px 12px rgba(37, 99, 235, 0.2);
        }

        .action-button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .save-status {
          padding: 12px 14px;
          border-radius: 6px;
          font-size: 13px;
          font-weight: 500;
        }

        .save-status.success {
          background: #d1fae5;
          border-left: 4px solid #10b981;
          color: #065f46;
        }

        .save-status.error {
          background: #fee2e2;
          border-left: 4px solid #ef4444;
          color: #7f1d1d;
        }
      `}</style>

      <div className="grade-container">
        <div className="header-section">
          <div className="breadcrumb">Academic / Grade Calculation</div>
          <h1 className="page-title">Grade Entry</h1>
          <p className="page-subtitle">Enter and calculate student grades</p>
        </div>

        <div className="student-info-card">
          <div className="info-item">
            <span className="info-label">Student Name</span>
            <span className="info-value">{studentName || "N/A"}</span>
          </div>
          <div className="info-item">
            <span className="info-label">Student ID</span>
            <span className="info-value">{studentId || "N/A"}</span>
          </div>
          <div className="info-item">
            <span className="info-label">Class</span>
            <span className="info-value">{className || "N/A"}</span>
          </div>
          <div className="info-item">
            <span className="info-label">Academic Year</span>
            <span className="info-value">{academicYear || "N/A"}</span>
          </div>
          <div className="info-item">
            <span className="info-label">Term</span>
            <span className="info-value">{term ? term.charAt(0).toUpperCase() + term.slice(1) : "N/A"}</span>
          </div>
        </div>

        {isNewGrade && (
          <div className="alert-box">
            <div className="alert-icon">ℹ️</div>
            <div className="alert-content">
              <div className="alert-title">New Grade Entry</div>
              <div className="alert-text">No existing grade found. Fill in the scores below to create a new grade record.</div>
            </div>
          </div>
        )}

        <div className="main-grid">
          <div className="input-sections">
            <div className="card">
              <div className="card-header">
                <h3>Continuous Assessment</h3>
              </div>
              <div className="card-content">
                <div className="input-group">
                  <label className="input-label">Assessment Score</label>
                  <input
                    type="number"
                    value={assessmentScore}
                    onChange={(e) => setAssessmentScore(Number(e.target.value) || 0)}
                    className="score-input"
                    step="0.01"
                    placeholder="0"
                  />
                </div>
                <div className="input-group">
                  <label className="input-label">Total Marks</label>
                  <input
                    type="number"
                    value={assessmentTotal}
                    onChange={(e) => setAssessmentTotal(Number(e.target.value) || 0)}
                    className="score-input"
                    step="0.01"
                    placeholder="0"
                  />
                </div>
              </div>
            </div>

            <div className="card">
              <div className="card-header">
                <h3>Test Scores</h3>
              </div>
              <div className="card-content">
                <div className="input-group">
                  <label className="input-label">Test Score</label>
                  <input
                    type="number"
                    value={testScore}
                    onChange={(e) => setTestScore(Number(e.target.value) || 0)}
                    className="score-input"
                    step="0.01"
                    placeholder="0"
                  />
                </div>
                <div className="input-group">
                  <label className="input-label">Total Marks</label>
                  <input
                    type="number"
                    value={testTotal}
                    onChange={(e) => setTestTotal(Number(e.target.value) || 0)}
                    className="score-input"
                    step="0.01"
                    placeholder="0"
                  />
                </div>
              </div>
            </div>

            <div className="card">
              <div className="card-header">
                <h3>Examination Scores</h3>
              </div>
              <div className="card-content">
                <div className="input-group">
                  <label className="input-label">Exam Score</label>
                  <input
                    type="number"
                    value={examScore}
                    onChange={(e) => setExamScore(Number(e.target.value) || 0)}
                    className="score-input"
                    step="0.01"
                    placeholder="0"
                  />
                </div>
                <div className="input-group">
                  <label className="input-label">Total Marks</label>
                  <input
                    type="number"
                    value={examTotal}
                    onChange={(e) => setExamTotal(Number(e.target.value) || 0)}
                    className="score-input"
                    step="0.01"
                    placeholder="0"
                  />
                </div>
              </div>
            </div>

            <div className="card" style={{ gridColumn: "1 / -1" }}>
              <div className="card-header">
                <h3>Teacher's Remarks</h3>
              </div>
              <div className="card-content">
                <div className="input-group">
                  <textarea
                    value={remarks}
                    onChange={(e) => setRemarks(e.target.value)}
                    placeholder="Add any notes or remarks about this student's performance…"
                    className="textarea-field"
                    maxLength={500}
                  />
                  <div className={`char-count ${remarks.length > 400 ? "warning" : ""}`}>
                    {remarks.length} / 500
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div>
            <div className="summary-section">
              <h4 className="summary-title">Weighted Scores</h4>
              <div className="summary-item">
                <span className="summary-label">Assessment (20%)</span>
                <span className="summary-value">{w_assessment || 0}</span>
              </div>
              <div className="summary-item">
                <span className="summary-label">Test (30%)</span>
                <span className="summary-value">{w_test || 0}</span>
              </div>
              <div className="summary-item">
                <span className="summary-label">Exam (50%)</span>
                <span className="summary-value">{w_exam || 0}</span>
              </div>
            </div>

            <div className="summary-score-grid">
              <div className="score-box">
                <div className="score-box-label">Assessment</div>
                <div className="score-box-value">{assessmentScore}/{assessmentTotal}</div>
              </div>
              <div className="score-box">
                <div className="score-box-label">Test</div>
                <div className="score-box-value">{testScore}/{testTotal}</div>
              </div>
              <div className="score-box">
                <div className="score-box-label">Exam</div>
                <div className="score-box-value">{examScore}/{examTotal}</div>
              </div>
              <div className="score-box total">
                <div className="score-box-label">Overall Total</div>
                <div className="score-box-value">{displayScore || 0}</div>
              </div>
            </div>

            <div className="summary-section" style={{ textAlign: "center" }}>
              <h4 className="summary-title">Grade Letter</h4>
              <div className={`grade-pill ${getGradeClass(get_letter_grade(displayScore))}`}>
                {get_letter_grade(displayScore)}
              </div>
            </div>

            <button className="action-button" onClick={handleSaveGrades} disabled={isSaving}>
              {isSaving ? "Saving..." : isNewGrade ? "Create Grade" : "Update Grades"}
            </button>

            {saveStatus && (
              <div className={`save-status ${saveStatus.includes("Error") ? "error" : "success"}`}>
                {saveStatus.includes("Error") ? "Failed to save grade." : saveStatus}
              </div>
            )}
            {saveStatus.includes("Error") && (
              <ErrorMessage errorDetail={saveErrorDetail} className="mt-3" />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
