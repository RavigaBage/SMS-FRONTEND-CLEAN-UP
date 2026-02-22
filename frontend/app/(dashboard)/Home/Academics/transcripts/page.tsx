'use client';

import Link from 'next/link';
import Image from 'next/image';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { fetchWithAuth } from '@/src/lib/apiClient';
import { Pagination } from '@/src/assets/components/management/Pagination';

/* ── Types (unchanged) ────────────────────────────────────────────────────── */
type StudentRow  = { id: number; full_name: string; student_id: string; class_name: string; status: 'active' | 'on_leave'; };
type SummaryRow  = { total: number; active: number; on_leave: number; };
export interface UserInfo  { id: string; email: string; first_name: string; last_name: string; role: string; is_active: boolean; is_staff: boolean; created_at: string; }
export interface Teacher   { id: number; user: UserInfo; first_name: string; last_name: string; specialization: string; }
export interface ClassData { id: number; class_name: string; teachers: Teacher[]; }
export interface ClassesBase { count: number; next: string | null; previous: string | null; results: ClassData[]; }

const generateAcademicYears = (startYear: number, count: number): string[] =>
  Array.from({ length: count }, (_, i) => { const y = startYear - i; return `${y}-${y + 1}`; });

const DEFAULT_RESULTS_PER_PAGE = 10;

/* ── Styles ───────────────────────────────────────────────────────────────── */
const css = `
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Inconsolata:wght@400;500;600&display=swap');

.th-root {
  --th-ink:     #111827;
  --th-soft:    #4b5563;
  --th-ghost:   #9ca3af;
  --th-surface: #ffffff;
  --th-bg:      #f9fafb;
  --th-border:  #e5e7eb;
  --th-accent:  #2563eb;
  --th-accent2: #7c3aed;
  --th-green:   #059669;
  --th-amber:   #d97706;
  --th-head:    'Plus Jakarta Sans', sans-serif;
  --th-mono:    'Inconsolata', monospace;
  font-family: var(--th-head);
  background: var(--th-bg);
  min-height: 100vh;
  color: var(--th-ink);
}

/* HEADER */
.th-header {
  background: #0f172a;
  padding: 0 44px;
  display: flex;
  align-items: stretch;
  min-height: 120px;
  position: relative;
  overflow: hidden;
}
.th-header-stripe {
  position: absolute; left: 0; top: 0; bottom: 0; width: 4px;
  background: linear-gradient(180deg, #2563eb, #7c3aed);
}
.th-header-noise {
  position: absolute; inset: 0; opacity: .04;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E");
  pointer-events: none;
}
.th-header-inner {
  position: relative;
  display: flex; align-items: center; gap: 32px;
  width: 100%; padding: 28px 0;
}
.th-header-eyebrow {
  font-family: var(--th-mono); font-size: 10px; font-weight: 600;
  letter-spacing: .15em; text-transform: uppercase;
  color: #60a5fa; margin-bottom: 8px;
}
.th-header-title {
  font-family: var(--th-head); font-size: 1.9rem; font-weight: 800;
  color: #fff; letter-spacing: -.025em; margin: 0 0 5px;
}
.th-header-sub { font-size: 13px; color: #64748b; margin: 0; }
.th-header-meta {
  margin-left: auto; display: flex; flex-direction: column;
  align-items: flex-end; gap: 6px;
}
.th-header-chip {
  font-family: var(--th-mono); font-size: 11px;
  padding: 5px 14px; border-radius: 99px;
  background: rgba(255,255,255,.07); border: 1px solid rgba(255,255,255,.12);
  color: rgba(255,255,255,.55);
}
.th-header-chip.lit { background: rgba(37,99,235,.3); border-color: #3b82f6; color: #93c5fd; }

/* FILTER BAR */
.th-filters {
  background: var(--th-surface);
  border-bottom: 1px solid var(--th-border);
  padding: 14px 44px;
  display: flex; align-items: center; gap: 12px; flex-wrap: wrap;
}
.th-filter-block { display: flex; flex-direction: column; gap: 4px; }
.th-filter-label {
  font-size: 10px; font-weight: 700; text-transform: uppercase;
  letter-spacing: .09em; color: var(--th-ghost);
}
.th-sel-wrap { position: relative; }
.th-sel-icon { position: absolute; left: 10px; top: 50%; transform: translateY(-50%); pointer-events: none; color: var(--th-ghost); }
.th-sel-caret { position: absolute; right: 9px; top: 50%; transform: translateY(-50%); pointer-events: none; color: var(--th-ghost); }
.th-select {
  appearance: none; font-family: var(--th-head); font-size: 13px; font-weight: 500;
  color: var(--th-ink); background: var(--th-bg);
  border: 1.5px solid var(--th-border); border-radius: 10px;
  padding: 9px 32px 9px 32px; cursor: pointer; min-width: 180px;
  transition: border-color .15s, box-shadow .15s;
}
.th-select:focus { outline: none; border-color: var(--th-accent); box-shadow: 0 0 0 3px #2563eb18; }
.th-divider { width: 1px; height: 36px; background: var(--th-border); margin: 0 6px; align-self: flex-end; }
.th-search-wrap { position: relative; margin-left: auto; }
.th-search-icon { position: absolute; left: 12px; top: 50%; transform: translateY(-50%); color: var(--th-ghost); }
.th-search {
  font-family: var(--th-head); font-size: 13px; color: var(--th-ink);
  background: var(--th-bg); border: 1.5px solid var(--th-border); border-radius: 10px;
  padding: 9px 14px 9px 36px; width: 260px;
  transition: border-color .15s, box-shadow .15s;
}
.th-search:focus { outline: none; border-color: var(--th-accent); box-shadow: 0 0 0 3px #2563eb18; }
.th-search::placeholder { color: var(--th-ghost); }

/* BODY */
.th-body { padding: 24px 44px 48px; display: flex; flex-direction: column; gap: 20px; }

/* STAT CARDS */
.th-stats { display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; }
.th-stat {
  background: var(--th-surface); border: 1.5px solid var(--th-border);
  border-radius: 14px; padding: 18px 22px;
  display: flex; align-items: center; gap: 16px;
}
.th-stat-icon {
  width: 42px; height: 42px; border-radius: 12px; flex-shrink: 0;
  display: flex; align-items: center; justify-content: center; font-size: 1.1rem;
}
.th-stat-icon.blue  { background: #dbeafe; }
.th-stat-icon.green { background: #d1fae5; }
.th-stat-icon.slate { background: #f1f5f9; }
.th-stat-text { display: flex; flex-direction: column; gap: 2px; }
.th-stat-label { font-size: 10px; font-weight: 700; letter-spacing: .1em; text-transform: uppercase; color: var(--th-ghost); }
.th-stat-value { font-family: var(--th-head); font-size: 1.7rem; font-weight: 800; color: var(--th-ink); line-height: 1; }
.th-stat-sub { font-size: 11px; color: var(--th-amber); margin-top: 2px; }

/* TABLE CARD */
.th-card { background: var(--th-surface); border: 1.5px solid var(--th-border); border-radius: 16px; overflow: hidden; }
.th-card-head {
  padding: 16px 22px; border-bottom: 1px solid var(--th-border);
  display: flex; align-items: center; gap: 10px;
}
.th-card-title { font-family: var(--th-head); font-size: 14px; font-weight: 700; }
.th-card-chip {
  margin-left: auto; font-family: var(--th-mono); font-size: 11px;
  padding: 3px 10px; border-radius: 99px;
  background: var(--th-bg); border: 1px solid var(--th-border); color: var(--th-ghost);
}

/* TABLE */
.th-scroll { overflow-x: auto; }
.th-table { width: 100%; border-collapse: collapse; font-size: 13px; min-width: 700px; }
.th-table thead tr { background: #f8fafc; border-bottom: 1.5px solid var(--th-border); }
.th-table th {
  padding: 11px 16px; text-align: left;
  font-family: var(--th-mono); font-size: 10px; font-weight: 600;
  text-transform: uppercase; letter-spacing: .1em; color: var(--th-ghost);
}
.th-table th:last-child { text-align: right; }
.th-table tbody tr { border-bottom: 1px solid var(--th-border); transition: background .1s; }
.th-table tbody tr:last-child { border-bottom: none; }
.th-table tbody tr:hover { background: #f8fafc; }
.th-table td { padding: 13px 16px; }
.th-table td:last-child { text-align: right; }
.th-mono { font-family: var(--th-mono); font-size: 12px; color: var(--th-soft); }

/* avatar */
.th-av-wrap { display: flex; align-items: center; gap: 11px; }
.th-av { width: 36px; height: 36px; border-radius: 50%; overflow: hidden; flex-shrink: 0; border: 2px solid var(--th-border); }
.th-name { font-weight: 600; color: var(--th-ink); }

/* status */
.th-badge {
  display: inline-flex; align-items: center; gap: 5px;
  padding: 4px 10px; border-radius: 99px;
  font-family: var(--th-mono); font-size: 11px; font-weight: 600;
}
.th-badge::before { content: ''; width: 6px; height: 6px; border-radius: 50%; flex-shrink: 0; }
.th-badge.active  { background: #d1fae5; color: #065f46; }
.th-badge.active::before  { background: #059669; }
.th-badge.on_leave { background: #fef3c7; color: #92400e; }
.th-badge.on_leave::before { background: #d97706; }

/* action btn */
.th-btn {
  display: inline-flex; align-items: center; gap: 6px;
  padding: 7px 16px; border-radius: 9px;
  background: var(--th-ink); color: #fff;
  font-family: var(--th-head); font-size: 12px; font-weight: 600;
  text-decoration: none; transition: opacity .15s, transform .1s;
  border: none; cursor: pointer;
}
.th-btn:hover { opacity: .85; transform: translateY(-1px); }

/* empty / loading */
.th-center-msg {
  padding: 56px; text-align: center; color: var(--th-ghost); font-size: 14px;
}
.th-center-msg .icon { font-size: 2rem; margin-bottom: 10px; }
.th-error { color: #dc2626; }

/* footer */
.th-table-foot {
  padding: 14px 22px; border-top: 1px solid var(--th-border); background: var(--th-bg);
  display: flex; align-items: center; justify-content: space-between; gap: 12px; flex-wrap: wrap;
}
.th-foot-info { font-family: var(--th-mono); font-size: 11px; color: var(--th-ghost); }
`;

/* ── Icon helpers ─────────────────────────────────────────────────────────── */
const Down = () => (
  <svg className="th-sel-caret" width="13" height="13" viewBox="0 0 16 16" fill="none">
    <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

/* ── COMPONENT ────────────────────────────────────────────────────────────── */
export default function TranscriptHome() {
  const [students,       setStudents]       = useState<any[]>([]);
  const [classes,        setClasses]        = useState<ClassData[]>([]);
  const [summary,        setSummary]        = useState<SummaryRow>({ total: 0, active: 0, on_leave: 0 });
  const current_date_now                    = new Date().getFullYear();
  const [selectedClassId, setSelectedClassId] = useState<number | ''>('');
  const [selectedYear,    setSelectedYear]    = useState<string>(generateAcademicYears(current_date_now, 10)[0]);
  const [search,          setSearch]          = useState<string>('');
  const [currentPage,     setCurrentPage]     = useState<number>(1);
  const [resultsPerPage]                      = useState<number>(DEFAULT_RESULTS_PER_PAGE);
  const [loading,         setLoading]         = useState(false);
  const [classesLoading,  setClassesLoading]  = useState(false);
  const [error,           setError]           = useState<string | null>(null);
  const [totalResults,    setTotalResults]    = useState<number>(0);
  const abortRef          = useRef<AbortController | null>(null);
  const searchDebounceRef = useRef<number | null>(null);
  const academicYears     = generateAcademicYears(2030, 10);

  const fetchClasses = useCallback(async () => {
    setClassesLoading(true);
    try {
      const res = await fetchWithAuth(`${process.env.NEXT_PUBLIC_API_URL}/classes/`, { headers: { 'Content-Type': 'application/json' } });
      if (!res.ok) throw new Error(`Server error: ${res.status}`);
      const data: ClassesBase = await res.json();
      setClasses(data.results || []);
      if (data.results?.length > 0 && selectedClassId === '') setSelectedClassId(data.results[0].id);
    } catch (err: any) {
      console.error('Failed to load Classes:', err);
      setError('Failed to load classes. Please refresh or contact admin.');
    } finally { setClassesLoading(false); }
  }, [selectedClassId]);

  useEffect(() => { fetchClasses(); }, []);

  const fetchStudents = useCallback(async (opts?: { page?: number; classId?: number | ''; year?: string; q?: string }) => {
    const page    = opts?.page    ?? currentPage;
    const classId = opts?.classId ?? selectedClassId;
    const year    = opts?.year    ?? selectedYear;
    const q       = opts?.q       ?? search;
    if (abortRef.current) abortRef.current.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    setLoading(true); setError(null);
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL?.replace(/\/+$/, '') || '';
      const params  = new URLSearchParams();
      if (classId) params.append('class_id', String(classId));
      if (year)    params.append('academic_year', String(year));
      if (q)       params.append('search', q);
      params.append('page', String(page));
      params.append('page_size', String(resultsPerPage));
      const res = await fetchWithAuth(`${baseUrl}/enrollments/?${params.toString()}`, {
        signal: controller.signal, headers: { 'Content-Type': 'application/json' },
      });
      if (!res.ok) {
        if (res.status === 404) { setStudents([]); setTotalResults(0); setSummary({ total: 0, active: 0, on_leave: 0 }); return; }
        throw new Error(`Server returned ${res.status}`);
      }
      const data    = await res.json();
      const results = data.results || [];
      setStudents(results);
      setTotalResults(data.count || results.length || 0);
      setSummary({
        total:    data.count || results.length || 0,
        active:   results.filter((r: any) => (r.student?.status || r.status) === 'active').length,
        on_leave: results.filter((r: any) => (r.student?.status || r.status) === 'on_leave').length,
      });
    } catch (err: any) {
      if (err.name === 'AbortError') return;
      console.error('Error fetching students:', err);
      setError('Failed to load students. Please try again.');
    } finally { setLoading(false); }
  }, [currentPage, resultsPerPage, search, selectedClassId, selectedYear]);

  useEffect(() => { setCurrentPage(1); fetchStudents({ page: 1, classId: selectedClassId, year: selectedYear, q: search }); }, [selectedClassId, selectedYear]);
  useEffect(() => { fetchStudents({ page: currentPage, classId: selectedClassId, year: selectedYear, q: search }); }, [currentPage]);
  useEffect(() => {
    if (searchDebounceRef.current) window.clearTimeout(searchDebounceRef.current);
    searchDebounceRef.current = window.setTimeout(() => {
      setCurrentPage(1);
      fetchStudents({ page: 1, classId: selectedClassId, year: selectedYear, q: search });
    }, 400);
    return () => { if (searchDebounceRef.current) window.clearTimeout(searchDebounceRef.current); };
  }, [search]);
  useEffect(() => () => { if (abortRef.current) abortRef.current.abort(); }, []);

  const totalPages    = Math.max(1, Math.ceil(totalResults / resultsPerPage));
  const findClassName = (id: number | '') => { if (!id) return '—'; return classes.find(x => x.id === id)?.class_name ?? String(id); };
  const showFrom      = (currentPage - 1) * resultsPerPage + 1;
  const showTo        = Math.min(currentPage * resultsPerPage, totalResults);

  return (
    <div className="th-root">
      <style>{css}</style>

      {/* ── HEADER ── */}
      <header className="th-header">
        <div className="th-header-stripe" />
        <div className="th-header-noise" />
        <div className="th-header-inner">
          <div>
            <div className="th-header-eyebrow">Academic · Records</div>
            <h1 className="th-header-title">Transcript Management</h1>
            <p className="th-header-sub">Manage student transcripts for each class</p>
          </div>
          <div className="th-header-meta">
            <span className={`th-header-chip ${selectedClassId ? "lit" : ""}`}>
              {selectedClassId ? findClassName(selectedClassId) : "All classes"}
            </span>
            <span className="th-header-chip">{selectedYear}</span>
          </div>
        </div>
      </header>

      {/* ── FILTERS ── */}
      <div className="th-filters">
        {/* Class */}
        <div className="th-filter-block">
          <span className="th-filter-label">Class</span>
          <div className="th-sel-wrap">
            <svg className="th-sel-icon" width="13" height="13" viewBox="0 0 16 16" fill="none">
              <path d="M2 13V5.5L8 2l6 3.5V13" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
              <rect x="5.5" y="8" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.4"/>
            </svg>
            <select
              className="th-select"
              value={selectedClassId}
              onChange={e => setSelectedClassId(e.target.value ? Number(e.target.value) : '')}
            >
              <option value="">All classes</option>
              {classes.map(c => <option key={c.id} value={c.id}>{c.class_name}</option>)}
            </select>
            <Down />
          </div>
        </div>

        <div className="th-divider" />

        {/* Year */}
        <div className="th-filter-block">
          <span className="th-filter-label">Academic Year</span>
          <div className="th-sel-wrap">
            <svg className="th-sel-icon" width="13" height="13" viewBox="0 0 16 16" fill="none">
              <rect x="2" y="3" width="12" height="11" rx="2" stroke="currentColor" strokeWidth="1.4"/>
              <path d="M5 1v4M11 1v4M2 7h12" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
            </svg>
            <select className="th-select" style={{ minWidth: 140 }} value={selectedYear} onChange={e => setSelectedYear(e.target.value)}>
              {academicYears.map(y => <option key={y} value={y}>{y}</option>)}
            </select>
            <Down />
          </div>
        </div>

        {/* Search */}
        <div className="th-search-wrap">
          <svg className="th-search-icon" width="14" height="14" viewBox="0 0 16 16" fill="none">
            <circle cx="6.5" cy="6.5" r="4.5" stroke="currentColor" strokeWidth="1.4"/>
            <path d="M10.5 10.5L14 14" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
          </svg>
          <input
            className="th-search"
            placeholder="Search name or admission #…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* ── BODY ── */}
      <div className="th-body">

        {/* Stats */}
        <div className="th-stats">
          <div className="th-stat">
            <div className="th-stat-icon blue">👥</div>
            <div className="th-stat-text">
              <span className="th-stat-label">Total Students</span>
              <span className="th-stat-value">{summary.total}</span>
            </div>
          </div>
          <div className="th-stat">
            <div className="th-stat-icon green">✓</div>
            <div className="th-stat-text">
              <span className="th-stat-label">Active</span>
              <span className="th-stat-value">{summary.active}</span>
              {summary.on_leave > 0 && <span className="th-stat-sub">{summary.on_leave} on leave</span>}
            </div>
          </div>
          <div className="th-stat">
            <div className="th-stat-icon slate">📅</div>
            <div className="th-stat-text">
              <span className="th-stat-label">Academic Year</span>
              <span className="th-stat-value" style={{ fontSize: "1.3rem" }}>{selectedYear}</span>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="th-card">
          <div className="th-card-head">
            <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
              <path d="M2 4h12M2 8h12M2 12h8" stroke="#2563eb" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            <span className="th-card-title">Student List</span>
            <span className="th-card-chip">{totalResults} students</span>
          </div>

          <div className="th-scroll">
            <table className="th-table">
              <thead>
                <tr>
                  <th>Student</th>
                  <th>Admission #</th>
                  <th>Class</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={5}>
                      <div className="th-center-msg">
                        <div className="icon">⏳</div>
                        Loading students…
                      </div>
                    </td>
                  </tr>
                ) : error ? (
                  <tr>
                    <td colSpan={5}>
                      <div className="th-center-msg th-error">{error}</div>
                    </td>
                  </tr>
                ) : students.length === 0 ? (
                  <tr>
                    <td colSpan={5}>
                      <div className="th-center-msg">
                        <div className="icon">📋</div>
                        No students found for this selection.
                      </div>
                    </td>
                  </tr>
                ) : (
                  students.map((enrollment: any) => {
                    const s      = enrollment.student ?? enrollment;
                    const status = s.status || enrollment.status;
                    return (
                      <tr key={enrollment.id ?? s.id}>

                        {/* name + avatar */}
                        <td>
                          <div className="th-av-wrap">
                            <div className="th-av">
                              <Image
                                alt={`${s.first_name} ${s.last_name}`}
                                src={`https://ui-avatars.com/api/?name=${encodeURIComponent(`${s.first_name} ${s.last_name}`)}&background=random`}
                                width={36} height={36}
                                style={{ width: "100%", height: "100%", objectFit: "cover" }}
                              />
                            </div>
                            <span className="th-name">{s.first_name} {s.last_name}</span>
                          </div>
                        </td>

                        <td><span className="th-mono">{s.admission_number ?? '—'}</span></td>
                        <td><span className="th-mono">{findClassName(selectedClassId)}</span></td>

                        {/* status */}
                        <td>
                          <span className={`th-badge ${status === 'active' ? 'active' : 'on_leave'}`}>
                            {status === 'active' ? 'Active' : 'On Leave'}
                          </span>
                        </td>

                        {/* action */}
                        <td>
                          <Link href={`/Home/Academics/transcripts/student/${s.id}`} className="th-btn">
                            <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
                              <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                            View Transcript
                          </Link>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination footer */}
          <div className="th-table-foot">
            <span className="th-foot-info">
              {totalResults > 0 ? `Showing ${showFrom}–${showTo} of ${totalResults}` : "No results"}
            </span>
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={p => setCurrentPage(p)}
              totalResults={totalResults}
              resultsPerPage={resultsPerPage}
            />
          </div>
        </div>

      </div>
    </div>
  );
}