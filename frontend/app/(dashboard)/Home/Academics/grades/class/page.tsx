"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { fetchWithAuth } from "@/src/lib/apiClient";
import Pagination from "@/src/assets/components/dashboard/Pagnation";

interface ClassApiResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: { id: number; class_name: string; academic_year: string }[];
}
interface SubjectApiResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: { id: number; subject_name: string; subject_code: string }[];
}
export interface YearsModel {
  end_date: string;
  id: number;
  is_current: boolean;
  start_date: string;
  year_name: string;
}

interface ClassType {
  id: number;
  name: string;
}
interface SubjectType {
  id: number;
  name: string;
  subject_code: string;
}
interface UserType {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: "student" | "teacher" | "admin" | string;
  is_active: boolean;
  is_staff: boolean;
  created_at: string;
}
interface StudentType {
  id: number;
  user: UserType;
  parent: number | null;
  first_name: string;
  last_name: string;
  date_of_birth: string;
  status: "active" | "inactive" | "graduated" | string;
}
interface ResultType {
  id: number;
  student: StudentType;
  assessment_score: number;
  assessment_total: number;
  test_score: number;
  test_total: number;
  exam_score: number;
  exam_total: number;
  weighted_assessment: number;
  weighted_test: number;
  weighted_exam: number;
  total_score: number;
  grade_letter: string;
  grade_date: string;
  subject_rank: string;
}
interface StudentWithGrade {
  student: StudentType;
  grade: ResultType | null;
}
interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

const api = {
  getTeacherAssignments: async () => {
    const res = await fetchWithAuth(
      `${process.env.NEXT_PUBLIC_API_URL}/classes/`,
    );
    if (!res.ok) throw new Error("Failed to fetch classes");
    return res.json();
  },
  getSubjects: async () => {
    const res = await fetchWithAuth(
      `${process.env.NEXT_PUBLIC_API_URL}/subjects/`,
    );
    if (!res.ok) throw new Error("Failed to fetch subjects");
    return res.json();
  },
  getSubjectsForClass: async (classId: number) => {
    const res = await fetchWithAuth(
      `${process.env.NEXT_PUBLIC_API_URL}/classes/${classId}/subjects/`,
    );
    if (!res.ok) throw new Error("Failed to fetch subjects for class");
    return res.json();
  },
  getClassesForSubject: async (subjectId: number) => {
    const res = await fetchWithAuth(
      `${process.env.NEXT_PUBLIC_API_URL}/subjects/${subjectId}/classes/`,
    );
    if (!res.ok) throw new Error("Failed to fetch classes for subject");
    return res.json();
  },
  getResults: async ({
    classId,
    subjectId,
    academicYear,
    term,
  }: {
    classId: number;
    subjectId: number;
    academicYear: string;
    term: string;
  }) => {
    const res = await fetchWithAuth(
      `${process.env.NEXT_PUBLIC_API_URL}/grades/?class=${classId}&subject=${subjectId}&academic_year=${academicYear}&term=${term}`,
    );
    if (!res.ok) throw new Error("Failed to fetch results");
    return res.json();
  },
  getStudentsInClass: async (classId: number, page: number = 1) => {
    const res = await fetchWithAuth(
      `${process.env.NEXT_PUBLIC_API_URL}/classes/${classId}/students/?page=${page}`,
    );
    if (!res.ok) throw new Error("Failed to fetch students");
    return res.json();
  },
};

function getInitials(first: string, last: string) {
  return `${first[0] ?? ""}${last[0] ?? ""}`.toUpperCase();
}

function GradePill({ letter }: { letter?: string }) {
  if (!letter) return <span style={{ color: "#94a3b8", fontSize: "13px" }}>-</span>;
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
    <span
      style={{
        display: "inline-block",
        padding: "4px 10px",
        borderRadius: 8,
        background: c.bg,
        color: c.color,
        fontFamily: "monospace",
        fontWeight: 700,
        fontSize: 13,
        minWidth: 32,
        textAlign: "center",
      }}
    >
      {letter}
    </span>
  );
}

function RankBadge({ rankStr }: { rankStr?: string | null }) {
  if (!rankStr) return <span style={{ color: "#94a3b8", fontSize: "13px" }}>-</span>;
  const n = parseInt(rankStr, 10);
  if (isNaN(n)) return <span style={{ color: "#94a3b8", fontSize: "13px" }}>-</span>;
  const suffix = n === 1 ? "st" : n === 2 ? "nd" : n === 3 ? "rd" : "th";
  const configs: Record<number, { bg: string; color: string; border: string }> = {
    1: { bg: "linear-gradient(135deg,#ffd700,#fdb931)", color: "#78350f", border: "#b45309" },
    2: { bg: "#1d4ed8", color: "#fff", border: "#3b82f6" },
    3: { bg: "#92400e", color: "#fff", border: "#d97706" },
  };
  const cfg = configs[n];
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "4px 10px",
        borderRadius: 8,
        minWidth: 44,
        fontFamily: "monospace",
        fontWeight: 700,
        fontSize: 12,
        background: cfg?.bg ?? "#f1f5f9",
        color: cfg?.color ?? "#475569",
        border: `1px solid ${cfg?.border ?? "#e2e8f0"}`,
        boxShadow: n <= 3 ? "0 2px 6px rgba(0,0,0,.12)" : "none",
      }}
    >
      {n}
      {suffix}
    </span>
  );
}

function ScoreBar({ value }: { value?: number }) {
  if (value == null) return <span style={{ color: "#94a3b8", fontSize: "13px" }}>-</span>;
  const pct = Math.min(100, value);
  const color = pct >= 70 ? "#059669" : pct >= 50 ? "#d97706" : "#dc2626";
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 100 }}>
      <span style={{ fontFamily: "monospace", fontSize: 12, fontWeight: 600, minWidth: 32 }}>
        {value}
      </span>
      <div style={{ flex: 1, height: 5, background: "#e2e8f0", borderRadius: 99, overflow: "hidden", minWidth: 40 }}>
        <div style={{ height: "100%", width: `${pct}%`, background: color, borderRadius: 99 }} />
      </div>
    </div>
  );
}

const css = `
@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&family=Fira+Code:wght@400;500&display=swap');

.gr-root {
  --gr-ink: #0f172a;
  --gr-soft: #475569;
  --gr-ghost: #94a3b8;
  --gr-surface: #ffffff;
  --gr-bg: #f8fafc;
  --gr-border: #e2e8f0;
  --gr-accent: #6366f1;
  font-family: 'Outfit', sans-serif;
  background: var(--gr-bg);
  min-height: 100vh;
  color: var(--gr-ink);
}

.gr-header {
  background: linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #4c1d95 100%);
  padding: 32px 0;
  position: relative;
  overflow: hidden;
}

.gr-header-inner {
  max-width: calc(100vw - 320px);
  margin: 0 auto;
  padding: 0 24px;
  display: flex;
  align-items: flex-end;
  gap: 24px;
  flex-wrap: wrap;
  position: relative;
  z-index: 1;
}

@media (max-width: 1024px) {
  .gr-header-inner {
    max-width: 100%;
  }
}

.gr-header-text h1 {
  font-size: 2rem;
  font-weight: 800;
  color: #fff;
  letter-spacing: -0.02em;
  margin: 0 0 6px 0;
}

.gr-header-text p {
  font-size: 14px;
  color: #c4b5fd;
  margin: 0;
}

.gr-header-tags {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  margin-left: auto;
}

.gr-tag {
  font-family: 'Fira Code', monospace;
  font-size: 11px;
  padding: 5px 12px;
  border-radius: 99px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.15);
  color: rgba(255, 255, 255, 0.7);
}

.gr-tag.active {
  background: rgba(99, 102, 241, 0.4);
  border-color: #818cf8;
  color: #e0e7ff;
}

.gr-controls {
  background: var(--gr-surface);
  border-bottom: 1px solid var(--gr-border);
  padding: 16px 24px;
  max-width: calc(100vw - 320px);
  margin: 0 auto;
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  align-items: center;
  overflow-x: auto;
}

@media (max-width: 1024px) {
  .gr-controls {
    max-width: 100%;
  }
}

.gr-filter-label {
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--gr-ghost);
  white-space: nowrap;
}

.gr-select-wrap {
  position: relative;
  flex-shrink: 0;
}

.gr-select {
  appearance: none;
  font-family: 'Outfit', sans-serif;
  font-size: 13px;
  font-weight: 500;
  color: var(--gr-ink);
  background: var(--gr-bg);
  border: 1.5px solid var(--gr-border);
  border-radius: 10px;
  padding: 8px 32px 8px 12px;
  cursor: pointer;
  min-width: 140px;
  transition: border-color 0.15s, box-shadow 0.15s;
}

.gr-select:focus {
  outline: none;
  border-color: var(--gr-accent);
  box-shadow: 0 0 0 3px #6366f118;
}

.gr-select-caret {
  position: absolute;
  right: 9px;
  top: 50%;
  transform: translateY(-50%);
  pointer-events: none;
  color: var(--gr-ghost);
}

.gr-divider {
  width: 1px;
  height: 28px;
  background: var(--gr-border);
  margin: 0 4px;
  flex-shrink: 0;
}

.gr-body {
  max-width: calc(100vw - 320px);
  margin: 0 auto;
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 20px;
  overflow: hidden;
}

@media (max-width: 1024px) {
  .gr-body {
    max-width: 100%;
  }
}

.gr-stats {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.gr-stat {
  background: var(--gr-surface);
  border: 1.5px solid var(--gr-border);
  border-radius: 12px;
  padding: 14px 20px;
  display: flex;
  flex-direction: column;
  gap: 3px;
  min-width: 120px;
}

.gr-stat-label {
  font-size: 10px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: var(--gr-ghost);
}

.gr-stat-value {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--gr-ink);
  line-height: 1;
}

.gr-stat.hi {
  border-color: #c7d2fe;
  background: #eef2ff;
}

.gr-stat.hi .gr-stat-value {
  color: var(--gr-accent);
}

.gr-stat.warn .gr-stat-value {
  color: #d97706;
}

.gr-message {
  padding: 12px 18px;
  background: #eff6ff;
  border-left: 3px solid #6366f1;
  border-radius: 8px;
  font-size: 13px;
  color: var(--gr-soft);
}

.gr-card {
  background: var(--gr-surface);
  border: 1.5px solid var(--gr-border);
  border-radius: 16px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.gr-card-top {
  padding: 16px 22px;
  border-bottom: 1px solid var(--gr-border);
  display: flex;
  align-items: center;
  gap: 10px;
  background: var(--gr-bg);
  flex-shrink: 0;
}

.gr-card-title {
  font-size: 14px;
  font-weight: 700;
  color: var(--gr-ink);
}

.gr-card-chip {
  margin-left: auto;
  font-family: 'Fira Code', monospace;
  font-size: 11px;
  padding: 3px 10px;
  border-radius: 99px;
  background: var(--gr-bg);
  border: 1px solid var(--gr-border);
  color: var(--gr-ghost);
  flex-shrink: 0;
}

.gr-scroll {
  overflow-x: auto;
  overflow-y: hidden;
  flex: 1;
  min-height: 0;
}

.gr-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
}

.gr-table thead tr {
  background: #f8fafc;
  border-bottom: 1.5px solid var(--gr-border);
}

.gr-table th {
  padding: 10px 13px;
  text-align: left;
  font-family: 'Fira Code', monospace;
  font-size: 10px;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: var(--gr-ghost);
  white-space: nowrap;
}

.gr-table th.gc {
  background: #f5f3ff;
  color: #7c3aed;
  border-left: 1px solid #ede9fe;
  border-right: 1px solid #ede9fe;
  text-align: center;
}

.gr-table tbody tr {
  border-bottom: 1px solid var(--gr-border);
  transition: background 0.1s;
}

.gr-table tbody tr:last-child {
  border-bottom: none;
}

.gr-table tbody tr:hover {
  background: #f8fafc;
}

.gr-table tbody tr.gr-pending {
  background: #fffbeb;
}

.gr-table tbody tr.gr-pending:hover {
  background: #fef3c7;
}

.gr-table td {
  padding: 12px 13px;
  white-space: nowrap;
}

.gr-table td.gcd {
  text-align: center;
  border-left: 1px solid #ede9fe;
  border-right: 1px solid #ede9fe;
}

.gr-table td.mono {
  font-family: 'Fira Code', monospace;
  font-size: 12px;
  color: var(--gr-soft);
}

.gr-sticky {
  position: sticky;
  left: 0;
  background: inherit;
  z-index: 1;
  min-width: 180px;
}

.gr-avatar {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: 'Outfit', sans-serif;
  font-size: 11px;
  font-weight: 700;
}

.gr-avatar.graded {
  background: #ede9fe;
  color: #6d28d9;
}

.gr-avatar.pending {
  background: #fef3c7;
  color: #92400e;
}

.gr-name-cell {
  display: flex;
  align-items: center;
  gap: 9px;
}

.gr-name-link {
  color: var(--gr-ink);
  text-decoration: none;
  font-weight: 600;
  transition: color 0.15s;
}

.gr-name-link:hover {
  color: var(--gr-accent);
}

.gr-status {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 4px 10px;
  border-radius: 99px;
  font-family: 'Fira Code', monospace;
  font-size: 11px;
  font-weight: 600;
}

.gr-status.graded {
  background: #d1fae5;
  color: #065f46;
}

.gr-status.pending {
  background: #fef3c7;
  color: #92400e;
}

.gr-btn {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 6px 14px;
  border-radius: 8px;
  font-family: 'Outfit', sans-serif;
  font-size: 12px;
  font-weight: 600;
  text-decoration: none;
  transition: opacity 0.15s, transform 0.1s;
  border: none;
  cursor: pointer;
  white-space: nowrap;
  flex-shrink: 0;
}

.gr-btn:hover {
  opacity: 0.85;
  transform: translateY(-1px);
}

.gr-btn.edit {
  background: var(--gr-accent);
  color: #fff;
}

.gr-btn.add {
  background: #0f172a;
  color: #fff;
}

.gr-empty {
  padding: 60px 20px;
  text-align: center;
  color: var(--gr-ghost);
  min-height: 300px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.gr-empty-icon {
  font-size: 2.2rem;
  margin-bottom: 12px;
}

.gr-empty p {
  font-size: 14px;
  margin: 0;
}

.gr-footer {
  padding: 14px 22px;
  border-top: 1px solid var(--gr-border);
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: var(--gr-bg);
  flex-shrink: 0;
}

.gr-footer-info {
  font-family: 'Fira Code', monospace;
  font-size: 11px;
  color: var(--gr-ghost);
}
`;

const IC = {
  cal: (
    <svg className="icon" width="13" height="13" viewBox="0 0 16 16" fill="none">
      <rect x="2" y="3" width="12" height="11" rx="2" stroke="currentColor" strokeWidth="1.4" />
      <path d="M5 1v4M11 1v4M2 7h12" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  ),
  clock: (
    <svg className="icon" width="13" height="13" viewBox="0 0 16 16" fill="none">
      <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.4" />
      <path d="M8 5v3l2 1.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  ),
  home: (
    <svg className="icon" width="13" height="13" viewBox="0 0 16 16" fill="none">
      <path d="M2 13V5.5L8 2l6 3.5V13" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
      <rect x="5.5" y="8" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.4" />
    </svg>
  ),
  book: (
    <svg className="icon" width="13" height="13" viewBox="0 0 16 16" fill="none">
      <path d="M3 2h10a1 1 0 011 1v10a1 1 0 01-1 1H3a1 1 0 01-1-1V3a1 1 0 011-1z" stroke="currentColor" strokeWidth="1.4" />
      <path d="M5 6h6M5 9h4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  ),
  down: (
    <svg className="gr-select-caret" width="13" height="13" viewBox="0 0 16 16" fill="none">
      <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  list: (
    <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
      <path d="M2 4h12M2 8h12M2 12h8" stroke="#6366f1" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  ),
  edit: (
    <svg width="11" height="11" viewBox="0 0 16 16" fill="none">
      <path d="M11.5 2.5L13.5 4.5L5 13H3V11L11.5 2.5Z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
    </svg>
  ),
  plus: (
    <svg width="11" height="11" viewBox="0 0 16 16" fill="none">
      <path d="M8 3v10M3 8h10" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  ),
};

function SelectField({ icon, value, onChange, children, minWidth = 140 }: any) {
  return (
    <div className="gr-select-wrap">
      {icon}
      <select className="gr-select" style={{ minWidth }} value={value} onChange={onChange}>
        {children}
      </select>
      {IC.down}
    </div>
  );
}

export default function ClassResults() {

  const [assignedClasses, setAssignedClasses] = useState<ClassType[]>([]);
  const [assignedSubjects, setAssignedSubjects] = useState<SubjectType[]>([]);
  const [availableClasses, setAvailableClasses] = useState<ClassType[]>([]);
  const [availableSubjects, setAvailableSubjects] = useState<SubjectType[]>([]);
  const [selectedClass, setSelectedClass] = useState<ClassType | null>(null);
  const [selectedSubject, setSelectedSubject] = useState<SubjectType | null>(null);
  const [academicYear, setAcademicYear] = useState<string>("");
  const [term, setTerm] = useState<string>("");
  const [studentsWithGrades, setStudentsWithGrades] = useState<StudentWithGrade[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [selectedYear, setSelectedYear] = useState("");
  const [pagination, setPagination] = useState<PaginatedResponse<StudentWithGrade> | null>(null);
  const [page, setPage] = useState(1);
  const [isInitialized, setIsInitialized] = useState(false);
  const STORAGE_KEY = 'grades_page_state';
  
  const generateAcademicYears = (): any => {
    const currentYear = new Date().getFullYear();
    const startYear = 2000;

    return Array.from({ length: currentYear - startYear + 1 }, (_, i) => {
      const year = currentYear - i;
      return {
        end_date: `${year}-${year + 1}`,
        start_date: year,
        id: i,
        is_current: year === currentYear,
        year_name: `${year}-${year + 1}`,
      };
    });
  };
  const getSavedState = () => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  };
  const academicYears = generateAcademicYears();

  useEffect(() => {
    if (!isInitialized) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      selectedYear,
      term,
      selectedClass,
      selectedSubject,
    }));
  }, [selectedYear, term, selectedClass, selectedSubject]);

  useEffect(() => {
    async function initAssignments() {
      try {
        const classRes: ClassApiResponse = await api.getTeacherAssignments();
        const classes: ClassType[] = classRes.results.map((c) => ({ id: c.id, name: c.class_name }));
        setAssignedClasses(classes);
        setAvailableClasses(classes);

        const subRes: SubjectApiResponse = await api.getSubjects();
        const subjects: SubjectType[] = subRes.results.map((s) => ({
          id: s.id,
          name: s.subject_name,
          subject_code: s.subject_code,
        }));
        setAssignedSubjects(subjects);
        setAvailableSubjects(subjects);

        const saved = getSavedState();
        if (saved) {
          const validClass = saved.selectedClass
            ? (classes.find((c) => c.id === saved.selectedClass.id) ?? null)
            : null;
          const validSubject = saved.selectedSubject
            ? (subjects.find((s) => s.id === saved.selectedSubject.id) ?? null)
            : null;

          if (validClass) setSelectedClass(validClass);
          if (validSubject) setSelectedSubject(validSubject);
          if (saved.term) setTerm(saved.term);
          if (saved.selectedYear) {
            setSelectedYear(saved.selectedYear);
            setAcademicYear(saved.selectedYear);
          }
        }

        if (!classes.length && !subjects.length) setMessage("You are not yet assigned to any class or subject.");
        else if (!subjects.length) setMessage("No subjects available yet.");
        else if (!classes.length) setMessage("No classes assigned yet.");

      } finally {
        setIsInitialized(true);
      }
    }
    initAssignments();
  }, []);

useEffect(() => {
  if (!isInitialized || !selectedClass || assignedSubjects.length) return;
  api.getSubjectsForClass(selectedClass.id).then(setAvailableSubjects);
}, [selectedClass, isInitialized]);

useEffect(() => {
  if (!isInitialized) return;
  fetchResults();
}, [isInitialized, selectedClass, selectedSubject, academicYear, term, page]);

useEffect(() => {
  if (!isInitialized || !selectedSubject || assignedClasses.length) return;
  api.getClassesForSubject(selectedSubject.id).then(setAvailableClasses);
}, [selectedSubject, isInitialized]);


  const handleYearSelect = (val: string) => {
    setSelectedYear(val);
    setAcademicYear(val);
  };

async function fetchResults(overrides?: {
  classObj?: ClassType | null;
  subjectObj?: SubjectType | null;
  year?: string;
  termVal?: string;
  pageNum?: number;
}) {
   

  const classObj = overrides?.classObj !== undefined ? overrides.classObj : selectedClass;
  const subjectObj = overrides?.subjectObj !== undefined ? overrides.subjectObj : selectedSubject;
  const year = overrides?.year !== undefined ? overrides.year : academicYear;
  const termVal = overrides?.termVal !== undefined ? overrides.termVal : term;
  const pageNum = overrides?.pageNum !== undefined ? overrides.pageNum : page;

  console.log(selectedClass);

  if (!classObj || !subjectObj) return;
  setLoading(true);
  try {
    const studentsData = await api.getStudentsInClass(classObj.id, pageNum);
    let grades: ResultType[] = [];
    try {
      const gradesData = await api.getResults({
        classId: classObj.id,
        subjectId: subjectObj.id,
        academicYear: year,
        term: termVal,
      });
      grades = Array.isArray(gradesData)
        ? gradesData
        : Array.isArray(gradesData?.results)
          ? gradesData.results
          : [];
      setMessage("");
    } catch {
      setMessage("No grade records found for these filters yet.");
    }
    const students: StudentType[] = studentsData.results || studentsData;
    const gradeMap = new Map<number, ResultType>();
    grades.forEach((g) => gradeMap.set(g.student.id, g));
    const merged: StudentWithGrade[] = students.map((s) => ({
      student: s,
      grade: gradeMap.get(s.id) || null,
    }));
    setStudentsWithGrades(merged);
    setPagination({
      count: studentsData.count ?? students.length,
      next: studentsData.next ?? null,
      previous: studentsData.previous ?? null,
      results: merged,
    });
  } catch {
    setStudentsWithGrades([]);
    setPagination(null);
  } finally {
    setLoading(false);
  }
}
  const handlePageChange = (newPage: number) => setPage(newPage);

  const gradedCount = studentsWithGrades.filter((r) => r.grade).length;
  const pendingCount = studentsWithGrades.length - gradedCount;
  const avgScore = studentsWithGrades.length
    ? (
        studentsWithGrades.reduce(
          (s, r) => s + Number(r.grade?.total_score ?? 0),
          0,
        ) / studentsWithGrades.length
      ).toFixed(1)
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
    <div className="gr-root">
      <style>{css}</style>

      <header className="gr-header">
        <div className="gr-header-inner">
          <div className="gr-header-text">
            <h1>Grade Management</h1>
            <p>Student-level academic grades per class and subject</p>
          </div>
          <div className="gr-header-tags">
            <span className="gr-tag">{selectedYear}</span>
            <span className={`gr-tag ${selectedClass ? "active" : ""}`}>
              {selectedClass?.name ?? "No class"}
            </span>
            <span className={`gr-tag ${selectedSubject ? "active" : ""}`}>
              {selectedSubject ? `${selectedSubject.name} · ${selectedSubject.subject_code}` : "No subject"}
            </span>
          </div>
        </div>
      </header>

      <div className="gr-controls">
        <span className="gr-filter-label">Filters</span>
        <div className="gr-divider" />

        <SelectField icon={IC.cal} value={selectedYear} onChange={(e: any) => handleYearSelect(e.target.value)}>
          <option>select year</option>
          {academicYears.map((y: any) => (
            <option key={y.id} value={y.year_name}>
              {y.year_name}
            </option>
          ))}
        </SelectField>

        <SelectField icon={IC.clock} value={term} onChange={(e: any) => setTerm(e.target.value)}>
          <option>select Term</option>
          <option value="first">First Term</option>
          <option value="second">Second Term</option>
          <option value="third">Third Term</option>
        </SelectField>

        <SelectField
          icon={IC.home}
          value={selectedClass?.id || ""}
          onChange={(e: any) => {
            setSelectedClass(
              availableClasses.find((c) => c.id === Number(e.target.value)) || null,
            );
            setPage(1);
          }}
        >
          <option value="">Select Class</option>
          {availableClasses.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </SelectField>

        <SelectField
          icon={IC.book}
          value={selectedSubject?.id || ""}
          minWidth={170}
          onChange={(e: any) => {
            setSelectedSubject(
              availableSubjects.find((s) => s.id === Number(e.target.value)) || null,
            );
            setPage(1);
          }}
        >
          <option value="">Select Subject</option>
          {availableSubjects.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name} · {s.subject_code}
            </option>
          ))}
        </SelectField>
      </div>

      <div className="gr-body">
        {message && <div className="gr-message">{message}</div>}

        {studentsWithGrades.length > 0 && (
          <div className="gr-stats">
            <div className="gr-stat">
              <span className="gr-stat-label">Total</span>
              <span className="gr-stat-value">{studentsWithGrades.length}</span>
            </div>
            <div className="gr-stat hi">
              <span className="gr-stat-label">Graded</span>
              <span className="gr-stat-value">{gradedCount}</span>
            </div>
            <div className={`gr-stat ${pendingCount > 0 ? "warn" : ""}`}>
              <span className="gr-stat-label">Pending</span>
              <span className="gr-stat-value">{pendingCount}</span>
            </div>
            {avgScore && (
              <div className="gr-stat">
                <span className="gr-stat-label">Avg Score</span>
                <span className="gr-stat-value">{avgScore}</span>
              </div>
            )}
          </div>
        )}

        <div className="gr-card">
          <div className="gr-card-top">
            {IC.list}
            <span className="gr-card-title">Grade Sheet</span>
            {studentsWithGrades.length > 0 && (
              <span className="gr-card-chip">{studentsWithGrades.length} students</span>
            )}
          </div>

          {loading ? (
            <div className="gr-empty">
              <div className="gr-empty-icon">⏳</div>
              <p>Loading results…</p>
            </div>
          ) : studentsWithGrades.length > 0 ? (
            <>
              <div className="gr-scroll">
                <table className="gr-table">
                  <thead>
                    <tr>
                      <th className="gr-sticky">Student</th>
                      <th>Status</th>
                      <th className="gc">Asmt</th>
                      <th className="gc">/</th>
                      <th className="gc">Test</th>
                      <th className="gc">/</th>
                      <th className="gc">Exam</th>
                      <th className="gc">/</th>
                      <th>W-Asmt</th>
                      <th>W-Test</th>
                      <th>W-Exam</th>
                      <th>Total</th>
                      <th>Grade</th>
                      <th>Rank</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {studentsWithGrades.map(({ student, grade }) => {
                      const hasPersistedGrade = !!grade?.id;
                      return (
                        <tr key={student.id} className={!hasPersistedGrade ? "gr-pending" : ""}>
                          <td className="gr-sticky">
                            <div className="gr-name-cell">
                              <div className={`gr-avatar ${hasPersistedGrade ? "graded" : "pending"}`}>
                                {getInitials(student.first_name, student.last_name)}
                              </div>
                              <Link
                                href={{
                                  pathname: `/Home/Academics/grades/student`,
                                  query: gradeQuery(student),
                                }}
                                className="gr-name-link"
                              >
                                {student.first_name} {student.last_name}
                              </Link>
                            </div>
                          </td>

                          <td>
                            <span className={`gr-status ${hasPersistedGrade ? "graded" : "pending"}`}>
                              {hasPersistedGrade ? "Graded" : "Pending"}
                            </span>
                          </td>

                          <td className="mono gcd">{grade?.assessment_score ?? "-"}</td>
                          <td className="mono gcd">{grade?.assessment_total ?? "-"}</td>

                          <td className="mono gcd">{grade?.test_score ?? "-"}</td>
                          <td className="mono gcd">{grade?.test_total ?? "-"}</td>

                          <td className="mono gcd">{grade?.exam_score ?? "-"}</td>
                          <td className="mono gcd">{grade?.exam_total ?? "-"}</td>

                          <td className="mono">{grade?.weighted_assessment ?? "-"}</td>
                          <td className="mono">{grade?.weighted_test ?? "-"}</td>
                          <td className="mono">{grade?.weighted_exam ?? "-"}</td>

                          <td>
                            <ScoreBar value={grade?.total_score} />
                          </td>

                          <td>
                            <GradePill letter={grade?.grade_letter} />
                          </td>

                          <td>
                            <RankBadge rankStr={grade?.subject_rank} />
                          </td>

                          <td>
                            <Link
                              href={{
                                pathname: `/Home/Academics/grades/student`,
                                query: gradeQuery(student),
                              }}
                              className={`gr-btn ${hasPersistedGrade ? "edit" : "add"}`}
                            >
                              {hasPersistedGrade ? <>{IC.edit} Edit</> : <>{IC.plus} Add</>}
                            </Link>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {pagination && pagination.count > 0 && (
                <div className="gr-footer">
                  <span className="gr-footer-info">
                    Page {page} · {pagination.count} students total
                  </span>
                  <Pagination
                    count={pagination.count}
                    next={pagination.next}
                    previous={pagination.previous}
                    currentPage={page}
                    onPageChange={handlePageChange}
                  />
                </div>
              )}
            </>
          ) : (
            <div className="gr-empty">
              <div className="gr-empty-icon">" "</div>
              <p>
                {selectedClass && selectedSubject
                  ? "No students found in this class"
                  : "Select a class and subject to view the grade sheet"}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

