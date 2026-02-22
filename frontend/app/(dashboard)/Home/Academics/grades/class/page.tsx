"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { fetchWithAuth } from "@/src/lib/apiClient";
import Pagination from '@/src/assets/components/dashboard/Pagnation';

/* ── All interfaces & types unchanged ─────────────────────────────────────── */
interface ClassApiResponse {
  count: number; next: string | null; previous: string | null;
  results: { id: number; class_name: string; academic_year: string }[];
}
interface SubjectApiResponse {
  count: number; next: string | null; previous: string | null;
  results: { id: number; subject_name: string; subject_code: string }[];
}
export interface YearsModel {
  end_date: string
  id: number
  is_current: boolean
  start_date: string
  year_name: string
}

interface ClassType { id: number; name: string; }
interface SubjectType { id: number; name: string; subject_code: string; }
interface UserType {
  id: string; email: string; first_name: string; last_name: string;
  role: "student" | "teacher" | "admin" | string;
  is_active: boolean; is_staff: boolean; created_at: string;
}
interface StudentType {
  id: number; user: UserType; parent: number | null;
  first_name: string; last_name: string; date_of_birth: string;
  status: "active" | "inactive" | "graduated" | string;
}
interface ResultType {
  id: number; student: StudentType;
  assessment_score: number; assessment_total: number;
  test_score: number; test_total: number;
  exam_score: number; exam_total: number;
  weighted_assessment: number; weighted_test: number; weighted_exam: number;
  total_score: number; grade_letter: string; grade_date: string; subject_rank: string;
}
interface StudentWithGrade { student: StudentType; grade: ResultType | null; }
interface PaginatedResponse<T> {
  count: number; next: string | null; previous: string | null; results: T[];
}

/* ── API layer unchanged ───────────────────────────────────────────────────── */
const api = {
  getTeacherAssignments: async () => {
    const res = await fetchWithAuth(`${process.env.NEXT_PUBLIC_API_URL}/classes/`);
    if (!res.ok) throw new Error("Failed to fetch classes");
    return res.json();
  },
  getSubjects: async () => {
    const res = await fetchWithAuth(`${process.env.NEXT_PUBLIC_API_URL}/subjects/`);
    if (!res.ok) throw new Error("Failed to fetch subjects");
    return res.json();
  },
  getSubjectsForClass: async (classId: number) => {
    const res = await fetchWithAuth(`${process.env.NEXT_PUBLIC_API_URL}/classes/${classId}/subjects/`);
    if (!res.ok) throw new Error("Failed to fetch subjects for class");
    return res.json();
  },
  getClassesForSubject: async (subjectId: number) => {
    const res = await fetchWithAuth(`${process.env.NEXT_PUBLIC_API_URL}/subjects/${subjectId}/classes/`);
    if (!res.ok) throw new Error("Failed to fetch classes for subject");
    return res.json();
  },
  getResults: async ({ classId, subjectId, academicYear, term }: {
    classId: number; subjectId: number; academicYear: string; term: string;
  }) => {
    const res = await fetchWithAuth(
      `${process.env.NEXT_PUBLIC_API_URL}/grades/?class=${classId}&subject=${subjectId}&academic_year=${academicYear}&term=${term}`
    );
    if (!res.ok) throw new Error("Failed to fetch results");
    return res.json();
  },
  getStudentsInClass: async (classId: number, page: number = 1) => {
    const res = await fetchWithAuth(
      `${process.env.NEXT_PUBLIC_API_URL}/classes/${classId}/students/?page=${page}`
    );
    if (!res.ok) throw new Error("Failed to fetch students");
    return res.json();
  },
};

/* ── Helpers ───────────────────────────────────────────────────────────────── */
function getInitials(first: string, last: string) {
  return `${first[0] ?? ""}${last[0] ?? ""}`.toUpperCase();
}

function GradePill({ letter }: { letter?: string }) {
  if (!letter) return <span style={styles.dash}>—</span>;
  const l = letter[0].toUpperCase();
  const map: Record<string, { bg: string; color: string }> = {
    A: { bg: "#d1fae5", color: "#065f46" },
    B: { bg: "#dbeafe", color: "#1e40af" },
    C: { bg: "#fef9c3", color: "#854d0e" },
    D: { bg: "#ffe4e6", color: "#9f1239" },
    F: { bg: "#fee2e2", color: "#991b1b" },
  };
  const c = map[l] ?? { bg: "#f1f5f9", color: "#475569" };
  return (
    <span style={{
      display: "inline-block", padding: "4px 10px", borderRadius: 8,
      background: c.bg, color: c.color,
      fontFamily: "var(--cr-mono)", fontWeight: 700, fontSize: 13,
      minWidth: 32, textAlign: "center",
    }}>
      {letter}
    </span>
  );
}

function RankBadge({ rankStr }: { rankStr?: string | null }) {
  if (!rankStr) return <span style={styles.dash}>—</span>;
  const n = parseInt(rankStr, 10);
  if (isNaN(n)) return <span style={styles.dash}>—</span>;
  const suffix = n === 1 ? "st" : n === 2 ? "nd" : n === 3 ? "rd" : "th";
  const configs: Record<number, { bg: string; color: string; border: string }> = {
    1: { bg: "linear-gradient(135deg,#ffd700,#fdb931)", color: "#78350f", border: "#b45309" },
    2: { bg: "#1d4ed8",  color: "#fff", border: "#3b82f6" },
    3: { bg: "#92400e",  color: "#fff", border: "#d97706" },
  };
  const cfg = configs[n];
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", justifyContent: "center",
      padding: "4px 10px", borderRadius: 8, minWidth: 44,
      fontFamily: "var(--cr-mono)", fontWeight: 700, fontSize: 12,
      background: cfg?.bg ?? "#f1f5f9",
      color: cfg?.color ?? "#475569",
      border: `1px solid ${cfg?.border ?? "#e2e8f0"}`,
      boxShadow: n <= 3 ? "0 2px 6px rgba(0,0,0,.12)" : "none",
    }}>
      {n}{suffix}
    </span>
  );
}

function ScoreBar({ value }: { value?: number }) {
  if (value == null) return <span style={styles.dash}>—</span>;
  const pct = Math.min(100, value);
  const color = pct >= 70 ? "#059669" : pct >= 50 ? "#d97706" : "#dc2626";
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <span style={{ fontFamily: "var(--cr-mono)", fontSize: 12, fontWeight: 600, minWidth: 32 }}>
        {value}
      </span>
      <div style={{ flex: 1, height: 5, background: "#e2e8f0", borderRadius: 99, overflow: "hidden", minWidth: 40 }}>
        <div style={{ height: "100%", width: `${pct}%`, background: color, borderRadius: 99 }} />
      </div>
    </div>
  );
}

const styles = {
  dash: { color: "#94a3b8", fontFamily: "var(--cr-mono)", fontSize: 13 } as React.CSSProperties,
};

const css = `
@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&family=Fira+Code:wght@400;500&display=swap');

.cr-root {
  --cr-ink:      #0f172a;
  --cr-soft:     #475569;
  --cr-ghost:    #94a3b8;
  --cr-surface:  #ffffff;
  --cr-bg:       #f8fafc;
  --cr-border:   #e2e8f0;
  --cr-accent:   #6366f1;
  --cr-accent2:  #8b5cf6;
  --cr-head:     'Outfit', sans-serif;
  --cr-body:     'Outfit', sans-serif;
  --cr-mono:     'Fira Code', monospace;
  font-family: var(--cr-body);
  background: var(--cr-bg);
  min-height: 100vh;
  color: var(--cr-ink);
}

/* HEADER */
.cr-header {
  background: linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #4c1d95 100%);
  padding: 36px 44px 32px;
  position: relative;
  overflow: hidden;
}
.cr-header::after {
  content: '';
  position: absolute;
  inset: 0;
  background: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.03'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
  pointer-events: none;
}
.cr-header-inner { position: relative; display: flex; align-items: flex-end; gap: 24px; flex-wrap: wrap; }
.cr-header-text h1 {
  font-family: var(--cr-head);
  font-size: 2rem; font-weight: 800;
  color: #fff; letter-spacing: -.02em; margin: 0 0 6px;
}
.cr-header-text p { font-size: 14px; color: #c4b5fd; margin: 0; }
.cr-header-tags { display: flex; gap: 8px; margin-left: auto; flex-wrap: wrap; }
.cr-tag {
  font-family: var(--cr-mono); font-size: 11px;
  padding: 5px 12px; border-radius: 99px;
  background: rgba(255,255,255,.1); border: 1px solid rgba(255,255,255,.15);
  color: rgba(255,255,255,.7);
}
.cr-tag.active { background: rgba(99,102,241,.4); border-color: #818cf8; color: #e0e7ff; }

/* CONTROLS */
.cr-controls {
  background: var(--cr-surface);
  border-bottom: 1px solid var(--cr-border);
  padding: 16px 44px;
  display: flex; gap: 10px; flex-wrap: wrap; align-items: center;
}
.cr-filter-group { display: flex; align-items: center; gap: 8px; }
.cr-filter-label {
  font-size: 11px; font-weight: 600; text-transform: uppercase;
  letter-spacing: .08em; color: var(--cr-ghost);
  white-space: nowrap;
}
.cr-select-wrap { position: relative; }
.cr-select-wrap svg.icon { position: absolute; left: 10px; top: 50%; transform: translateY(-50%); pointer-events: none; color: var(--cr-ghost); }
.cr-select {
  appearance: none;
  font-family: var(--cr-body); font-size: 13px; font-weight: 500; color: var(--cr-ink);
  background: var(--cr-bg); border: 1.5px solid var(--cr-border); border-radius: 10px;
  padding: 8px 32px 8px 32px; cursor: pointer; min-width: 140px;
  transition: border-color .15s, box-shadow .15s;
}
.cr-select:focus { outline: none; border-color: var(--cr-accent); box-shadow: 0 0 0 3px #6366f118; }
.cr-select-caret { position: absolute; right: 9px; top: 50%; transform: translateY(-50%); pointer-events: none; color: var(--cr-ghost); }
.cr-divider { width: 1px; height: 28px; background: var(--cr-border); margin: 0 4px; }

/* BODY */
.cr-body { padding: 24px 44px 48px; display: flex; flex-direction: column; gap: 20px; }

/* STATS */
.cr-stats { display: flex; gap: 12px; flex-wrap: wrap; }
.cr-stat {
  background: var(--cr-surface); border: 1.5px solid var(--cr-border);
  border-radius: 12px; padding: 14px 20px;
  display: flex; flex-direction: column; gap: 3px; min-width: 120px;
}
.cr-stat-label { font-size: 10px; font-weight: 600; text-transform: uppercase; letter-spacing: .1em; color: var(--cr-ghost); }
.cr-stat-value { font-family: var(--cr-head); font-size: 1.5rem; font-weight: 700; color: var(--cr-ink); line-height: 1; }
.cr-stat.hi { border-color: #c7d2fe; background: #eef2ff; }
.cr-stat.hi .cr-stat-value { color: var(--cr-accent); }
.cr-stat.warn .cr-stat-value { color: #d97706; }

/* MESSAGE */
.cr-message {
  padding: 12px 18px; background: #eff6ff; border-left: 3px solid #6366f1;
  border-radius: 8px; font-size: 13px; color: var(--cr-soft);
}

/* CARD */
.cr-card { background: var(--cr-surface); border: 1.5px solid var(--cr-border); border-radius: 16px; overflow: hidden; }
.cr-card-top {
  padding: 16px 22px; border-bottom: 1px solid var(--cr-border);
  display: flex; align-items: center; gap: 10px;
}
.cr-card-title { font-family: var(--cr-head); font-size: 14px; font-weight: 700; color: var(--cr-ink); }
.cr-card-chip {
  margin-left: auto; font-family: var(--cr-mono); font-size: 11px;
  padding: 3px 10px; border-radius: 99px;
  background: var(--cr-bg); border: 1px solid var(--cr-border); color: var(--cr-ghost);
}

/* TABLE */
.cr-scroll { overflow-x: auto; }
.cr-table { width: 100%; border-collapse: collapse; font-size: 13px; }
.cr-table thead tr { background: #f8fafc; border-bottom: 1.5px solid var(--cr-border); }
.cr-table th {
  padding: 10px 13px; text-align: left;
  font-family: var(--cr-mono); font-size: 10px; font-weight: 500;
  text-transform: uppercase; letter-spacing: .1em; color: var(--cr-ghost);
  white-space: nowrap;
}
.cr-table th.gc {
  background: #f5f3ff; color: #7c3aed;
  border-left: 1px solid #ede9fe; border-right: 1px solid #ede9fe;
  text-align: center;
}
.cr-table tbody tr { border-bottom: 1px solid var(--cr-border); transition: background .1s; }
.cr-table tbody tr:last-child { border-bottom: none; }
.cr-table tbody tr:hover { background: #f8fafc; }
.cr-table tbody tr.cr-pending { background: #fffbeb; }
.cr-table tbody tr.cr-pending:hover { background: #fef3c7; }
.cr-table td { padding: 12px 13px; white-space: nowrap; }
.cr-table td.gcd {
  text-align: center;
  border-left: 1px solid #ede9fe; border-right: 1px solid #ede9fe;
}
.cr-table td.mono { font-family: var(--cr-mono); font-size: 12px; color: var(--cr-soft); }

/* sticky */
.cr-sticky { position: sticky; left: 0; background: inherit; z-index: 1; min-width: 170px; }

/* avatar */
.cr-avatar {
  width: 30px; height: 30px; border-radius: 50%; flex-shrink: 0;
  display: flex; align-items: center; justify-content: center;
  font-family: var(--cr-head); font-size: 11px; font-weight: 700;
}
.cr-avatar.graded { background: #ede9fe; color: #6d28d9; }
.cr-avatar.pending { background: #fef3c7; color: #92400e; }
.cr-name-cell { display: flex; align-items: center; gap: 9px; }
.cr-name-link { color: var(--cr-ink); text-decoration: none; font-weight: 600; transition: color .15s; }
.cr-name-link:hover { color: var(--cr-accent); }

/* status badge */
.cr-status {
  display: inline-flex; align-items: center; gap: 5px;
  padding: 4px 10px; border-radius: 99px;
  font-family: var(--cr-mono); font-size: 11px; font-weight: 600;
}
.cr-status.graded { background: #d1fae5; color: #065f46; }
.cr-status.pending { background: #fef3c7; color: #92400e; }

/* action btn */
.cr-btn {
  display: inline-flex; align-items: center; gap: 5px;
  padding: 6px 14px; border-radius: 8px;
  font-family: var(--cr-body); font-size: 12px; font-weight: 600;
  text-decoration: none; transition: opacity .15s, transform .1s;
  border: none; cursor: pointer;
}
.cr-btn:hover { opacity: .85; transform: translateY(-1px); }
.cr-btn.edit { background: var(--cr-accent); color: #fff; }
.cr-btn.add  { background: #0f172a; color: #fff; }

/* empty */
.cr-empty { padding: 60px; text-align: center; color: var(--cr-ghost); }
.cr-empty-icon { font-size: 2.2rem; margin-bottom: 12px; }
.cr-empty p { font-size: 14px; margin: 0; }

/* footer */
.cr-footer {
  padding: 14px 22px; border-top: 1px solid var(--cr-border);
  display: flex; align-items: center; justify-content: space-between;
  background: var(--cr-bg);
}
.cr-footer-info { font-family: var(--cr-mono); font-size: 11px; color: var(--cr-ghost); }
`;

/* ── ICON helpers ─────────────────────────────────────────────────────────── */
const IC = {
  cal: <svg className="icon" width="13" height="13" viewBox="0 0 16 16" fill="none"><rect x="2" y="3" width="12" height="11" rx="2" stroke="currentColor" strokeWidth="1.4"/><path d="M5 1v4M11 1v4M2 7h12" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/></svg>,
  clock: <svg className="icon" width="13" height="13" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.4"/><path d="M8 5v3l2 1.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/></svg>,
  home: <svg className="icon" width="13" height="13" viewBox="0 0 16 16" fill="none"><path d="M2 13V5.5L8 2l6 3.5V13" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/><rect x="5.5" y="8" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.4"/></svg>,
  book: <svg className="icon" width="13" height="13" viewBox="0 0 16 16" fill="none"><path d="M3 2h10a1 1 0 011 1v10a1 1 0 01-1 1H3a1 1 0 01-1-1V3a1 1 0 011-1z" stroke="currentColor" strokeWidth="1.4"/><path d="M5 6h6M5 9h4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/></svg>,
  down: <svg className="cr-select-caret" width="13" height="13" viewBox="0 0 16 16" fill="none"><path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  list: <svg width="15" height="15" viewBox="0 0 16 16" fill="none"><path d="M2 4h12M2 8h12M2 12h8" stroke="#6366f1" strokeWidth="1.5" strokeLinecap="round"/></svg>,
  edit: <svg width="11" height="11" viewBox="0 0 16 16" fill="none"><path d="M11.5 2.5L13.5 4.5L5 13H3V11L11.5 2.5Z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"/></svg>,
  plus: <svg width="11" height="11" viewBox="0 0 16 16" fill="none"><path d="M8 3v10M3 8h10" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>,
};

function SelectField({ icon, value, onChange, children, minWidth = 140 }: any) {
  return (
    <div className="cr-select-wrap">
      {icon}
      <select className="cr-select" style={{ minWidth }} value={value} onChange={onChange}>{children}</select>
      {IC.down}
    </div>
  );
}

export default function ClassResults() {
  const [assignedClasses,   setAssignedClasses]   = useState<ClassType[]>([]);
  const [assignedSubjects,  setAssignedSubjects]  = useState<SubjectType[]>([]);
  const [availableClasses,  setAvailableClasses]  = useState<ClassType[]>([]);
  const [availableSubjects, setAvailableSubjects] = useState<SubjectType[]>([]);
  const [selectedClass,     setSelectedClass]     = useState<ClassType | null>(null);
  const [selectedSubject,   setSelectedSubject]   = useState<SubjectType | null>(null);
  const [academicYear,      setAcademicYear]      = useState<string>("2025-26");
  const [term,              setTerm]              = useState<string>("first");
  const [studentsWithGrades, setStudentsWithGrades] = useState<StudentWithGrade[]>([]);
  const [loading,            setLoading]           = useState(false);
  const [message,            setMessage]           = useState("");
  const [selectedYear,       setSelectedYear]      = useState("2025-26");
  const [pagination,         setPagination]        = useState<PaginatedResponse<StudentWithGrade> | null>(null);
  const [page,               setPage]              = useState(1);

  const generateAcademicYears = (): any => {
    const currentYear = new Date().getFullYear();
    const startYear   = 2000;

    return Array.from(
      { length: currentYear - startYear + 1 },
      (_, i) => {
        const year = currentYear - i;        
        return {
          end_date:   `${year}-${year + 1}`,
          start_date:  year,
          id:          i,
          is_current:  year === currentYear,
          year_name:  `${year}-${year + 1}`,
        };
      }
    );
  };
  const academicYears = generateAcademicYears();

  useEffect(() => {
    async function initAssignments() {
      const classRes: ClassApiResponse = await api.getTeacherAssignments();
      const classes: ClassType[] = classRes.results.map(c => ({ id: c.id, name: c.class_name }));
      setAssignedClasses(classes); setAvailableClasses(classes);
      const subRes: SubjectApiResponse = await api.getSubjects();
      const subjects: SubjectType[] = subRes.results.map(s => ({ id: s.id, name: s.subject_name, subject_code: s.subject_code }));
      setAssignedSubjects(subjects); setAvailableSubjects(subjects);
      if (!classes.length && !subjects.length) setMessage("You are not yet assigned to any class or subject.");
      else if (!subjects.length) setMessage("No subjects available yet.");
      else if (!classes.length) setMessage("No classes assigned yet.");
    }
    initAssignments();
  }, []);

  useEffect(() => {
    async function loadSubjects() {
      if (!selectedClass) return;
      if (!assignedSubjects.length) setAvailableSubjects(await api.getSubjectsForClass(selectedClass.id));
      fetchResults();
    }
    loadSubjects();
  }, [selectedClass]);

  useEffect(() => { fetchResults(); }, [academicYear, term, page]);

  useEffect(() => {
    async function loadClasses() {
      if (!selectedSubject) return;
      if (!assignedClasses.length) setAvailableClasses(await api.getClassesForSubject(selectedSubject.id));
      fetchResults();
    }
    loadClasses();
  }, [selectedSubject]);

  const handleYearSelect = (val: string) => { setSelectedYear(val); setAcademicYear(val); };

  async function fetchResults() {
    if (!selectedClass || !selectedSubject) return;
    setLoading(true);
    try {
      const [studentsData, gradesData] = await Promise.all([
        api.getStudentsInClass(selectedClass.id, page),
        api.getResults({ classId: selectedClass.id, subjectId: selectedSubject.id, academicYear, term }),
      ]);
      const students: StudentType[] = studentsData.results || studentsData;
      const grades: ResultType[] = gradesData.results || [];
      const gradeMap = new Map<number, ResultType>();
      grades.forEach(g => gradeMap.set(g.student.id, g));
      const merged: StudentWithGrade[] = students.map(s => ({ student: s, grade: gradeMap.get(s.id) || null }));
      setStudentsWithGrades(merged);
      setPagination({ count: studentsData.count, next: studentsData.next, previous: studentsData.previous, results: merged });
    } catch (err) {
      console.error("Error fetching results:", err);
      setStudentsWithGrades([]); setPagination(null);
    } finally {
      setLoading(false);
    }
  }

  const handlePageChange = (newPage: number) => setPage(newPage);

  const gradedCount  = studentsWithGrades.filter(r => r.grade).length;
  const pendingCount = studentsWithGrades.length - gradedCount;
  const avgScore     = studentsWithGrades.length
    ? (studentsWithGrades.reduce((s, r) => s + (r.grade?.total_score ?? 0), 0) / studentsWithGrades.length).toFixed(1)
    : null;

  const gradeQuery = (student: StudentType) => ({
    studentId: student.id,
    studentName: `${student.first_name} ${student.last_name}`,
    classId: selectedClass?.id,
    className: selectedClass?.name,
    academicYear,
    subjectId: selectedSubject?.id,
    term,
  });

  return (
    <div className="cr-root">
      <style>{css}</style>

      {/* ── HEADER ── */}
      <header className="cr-header">
        <div className="cr-header-inner">
          <div className="cr-header-text">
            <h1>Grade Management</h1>
            <p>Student-level academic grades per class and subject</p>
          </div>
          <div className="cr-header-tags">
            <span className="cr-tag">{selectedYear}</span>
            <span className={`cr-tag ${selectedClass ? "active" : ""}`}>
              {selectedClass?.name ?? "No class selected"}
            </span>
            <span className={`cr-tag ${selectedSubject ? "active" : ""}`}>
              {selectedSubject ? `${selectedSubject.name} · ${selectedSubject.subject_code}` : "No subject"}
            </span>
          </div>
        </div>
      </header>

      {/* ── FILTER BAR ── */}
      <div className="cr-controls">
        <span className="cr-filter-label">Filters</span>
        <div className="cr-divider" />

        <SelectField icon={IC.cal} value={selectedYear} onChange={(e: any) => handleYearSelect(e.target.value)}>
          {academicYears.map((y: any) => <option key={y.id} value={y.year_name}>{y.year_name}</option>)}
        </SelectField>

        <SelectField icon={IC.clock} value={term} onChange={(e: any) => setTerm(e.target.value)}>
          <option value="first">First Term</option>
          <option value="second">Second Term</option>
          <option value="third">Third Term</option>
        </SelectField>

        <SelectField icon={IC.home} value={selectedClass?.id || ""} onChange={(e: any) => {
          setSelectedClass(availableClasses.find(c => c.id === Number(e.target.value)) || null);
          setPage(1);
        }}>
          <option value="">Select Class</option>
          {availableClasses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </SelectField>

        <SelectField icon={IC.book} value={selectedSubject?.id || ""} minWidth={170} onChange={(e: any) => {
          setSelectedSubject(availableSubjects.find(s => s.id === Number(e.target.value)) || null);
          setPage(1);
        }}>
          <option value="">Select Subject</option>
          {availableSubjects.map(s => <option key={s.id} value={s.id}>{s.name} · {s.subject_code}</option>)}
        </SelectField>
      </div>

      <div className="cr-body">

        {message && <div className="cr-message">{message}</div>}

        {studentsWithGrades.length > 0 && (
          <div className="cr-stats">
            <div className="cr-stat">
              <span className="cr-stat-label">Total</span>
              <span className="cr-stat-value">{studentsWithGrades.length}</span>
            </div>
            <div className="cr-stat hi">
              <span className="cr-stat-label">Graded</span>
              <span className="cr-stat-value">{gradedCount}</span>
            </div>
            <div className={`cr-stat ${pendingCount > 0 ? "warn" : ""}`}>
              <span className="cr-stat-label">Pending</span>
              <span className="cr-stat-value">{pendingCount}</span>
            </div>
            {avgScore && (
              <div className="cr-stat">
                <span className="cr-stat-label">Avg Score</span>
                <span className="cr-stat-value">{avgScore}</span>
              </div>
            )}
          </div>
        )}

        <div className="cr-card">
          <div className="cr-card-top">
            {IC.list}
            <span className="cr-card-title">Grade Sheet</span>
            {studentsWithGrades.length > 0 && (
              <span className="cr-card-chip">{studentsWithGrades.length} students</span>
            )}
          </div>

          {loading ? (
            <div className="cr-empty">
              <div className="cr-empty-icon">⏳</div>
              <p>Loading results…</p>
            </div>
          ) : studentsWithGrades.length > 0 ? (
            <div className="cr-scroll">
              <table className="cr-table">
                <thead>
                  <tr>
                    <th className="cr-sticky">Student</th>
                    <th>Status</th>
                    <th className="gc" colSpan={2}>Assessment</th>
                    <th className="gc" colSpan={2}>Class Test</th>
                    <th className="gc" colSpan={2}>Exam</th>
                    <th>Asmt 20%</th>
                    <th>Test 30%</th>
                    <th>Exam 50%</th>
                    <th>Total</th>
                    <th>Grade</th>
                    <th>Rank</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {studentsWithGrades.map(({ student, grade }) => (
                    <tr key={student.id} className={!grade ? "cr-pending" : ""}>

                      {/* name */}
                      <td className="cr-sticky">
                        <div className="cr-name-cell">
                          <div className={`cr-avatar ${grade ? "graded" : "pending"}`}>
                            {getInitials(student.first_name, student.last_name)}
                          </div>
                          <Link href={{ pathname: `/Home/Academics/grades/student`, query: gradeQuery(student) }} className="cr-name-link">
                            {student.first_name} {student.last_name}
                          </Link>
                        </div>
                      </td>

                      {/* status */}
                      <td>
                        <span className={`cr-status ${grade ? "graded" : "pending"}`}>
                          {grade ? "✓ Graded" : "○ Pending"}
                        </span>
                      </td>

                      {/* assessment */}
                      <td className="mono gcd">{grade?.assessment_score ?? "—"}</td>
                      <td className="mono gcd">{grade?.assessment_total ?? "—"}</td>

                      {/* test */}
                      <td className="mono gcd">{grade?.test_score ?? "—"}</td>
                      <td className="mono gcd">{grade?.test_total ?? "—"}</td>

                      {/* exam */}
                      <td className="mono gcd">{grade?.exam_score ?? "—"}</td>
                      <td className="mono gcd">{grade?.exam_total ?? "—"}</td>

                      {/* weighted */}
                      <td className="mono">{grade?.weighted_assessment ?? "—"}</td>
                      <td className="mono">{grade?.weighted_test ?? "—"}</td>
                      <td className="mono">{grade?.weighted_exam ?? "—"}</td>

                      {/* total */}
                      <td style={{ minWidth: 110 }}><ScoreBar value={grade?.total_score} /></td>

                      {/* grade */}
                      <td><GradePill letter={grade?.grade_letter} /></td>

                      {/* rank */}
                      <td><RankBadge rankStr={grade?.subject_rank} /></td>

                      {/* action */}
                      <td>
                        <Link
                          href={{ pathname: `/Home/Academics/grades/student`, query: gradeQuery(student) }}
                          className={`cr-btn ${grade ? "edit" : "add"}`}
                        >
                          {grade ? <>{IC.edit} Edit</> : <>{IC.plus} Add</>}
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="cr-empty">
              <div className="cr-empty-icon">📋</div>
              <p>
                {selectedClass && selectedSubject
                  ? "No students found in this class"
                  : "Select a class and subject to view the grade sheet"}
              </p>
            </div>
          )}

          {pagination && pagination.count > 0 && (
            <div className="cr-footer">
              <span className="cr-footer-info">Page {page} · {pagination.count} students total</span>
              <Pagination
                count={pagination.count}
                next={pagination.next}
                previous={pagination.previous}
                currentPage={page}
                onPageChange={handlePageChange}
              />
            </div>
          )}
        </div>

      </div>
    </div>
  );
}