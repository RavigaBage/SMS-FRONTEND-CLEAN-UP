'use client';

import '@/styles/transcript_home.css';
import Link from 'next/link';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { fetchWithAuth } from '@/src/lib/apiClient';
import { Pagination } from '@/src/assets/components/management/Pagination';
import Image from "next/image";
type StudentRow = {
  id: number;
  full_name: string;
  student_id: string;
  class_name: string;
  status: 'active' | 'on_leave';
};

type SummaryRow = {
  total: number;
  active: number;
  on_leave: number;
};

export interface UserInfo {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
  is_active: boolean;
  is_staff: boolean;
  created_at: string;
}

export interface Teacher {
  id: number;
  user: UserInfo;
  first_name: string;
  last_name: string;
  specialization: string;
}

export interface ClassData {
  id: number;
  class_name: string;
  teachers: Teacher[];
}

export interface ClassesBase {
  count: number;
  next: string | null;
  previous: string | null;
  results: ClassData[];
}

// ---------- Helper to generate year strings ----------
const generateAcademicYears = (startYear: number, count: number): string[] => {
  return Array.from({ length: count }, (_, i) => {
    const year = startYear - i;
    return `${year}-${String(year + 1)}`;
  });
};

const DEFAULT_RESULTS_PER_PAGE = 10;

export default function TranscriptHome() {
  // data
  const [students, setStudents] = useState<any[]>([]);
  const [classes, setClasses] = useState<ClassData[]>([]);
  const [summary, setSummary] = useState<SummaryRow>({ total: 0, active: 0, on_leave: 0 });
  const current_date_now = new Date().getFullYear();
  const [selectedClassId, setSelectedClassId] = useState<number | ''>('');
  const [selectedYear, setSelectedYear] = useState<string>(generateAcademicYears(current_date_now, 10)[0]);
  const [search, setSearch] = useState<string>('');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [resultsPerPage] = useState<number>(DEFAULT_RESULTS_PER_PAGE);

  // state
  const [loading, setLoading] = useState(false);
  const [classesLoading, setClassesLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalResults, setTotalResults] = useState<number>(0);

  // refs: abort controllers & debounce
  const abortRef = useRef<AbortController | null>(null);
  const searchDebounceRef = useRef<number | null>(null);

  // academic years list
  const academicYears = generateAcademicYears(2030, 10);

  // ---------- Fetch classes once on mount ----------
  const fetchClasses = useCallback(async () => {
    setClassesLoading(true);
    try {
      const res = await fetchWithAuth(`${process.env.NEXT_PUBLIC_API_URL}/classes/`, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!res.ok) {
        throw new Error(`Server error: ${res.status}`);
      }

      const data: ClassesBase = await res.json();
      setClasses(data.results || []);

      // if no selected class yet, set first class as default (optional UX)
      if (data.results && data.results.length > 0 && selectedClassId === '') {
        setSelectedClassId(data.results[0].id);
      }
    } catch (err: any) {
      console.error('Failed to load Classes:', err);
      setError('Failed to load classes. Please refresh or contact admin.');
    } finally {
      setClassesLoading(false);
    }
  }, [selectedClassId]);

  useEffect(() => {
    fetchClasses();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // run once

  // ---------- Fetch students with cancellation and search debounce ----------
  const fetchStudents = useCallback(
    async (opts?: { page?: number; classId?: number | ''; year?: string; q?: string }) => {
      const page = opts?.page ?? currentPage;
      const classId = opts?.classId ?? selectedClassId;
      const year = opts?.year ?? selectedYear;
      const q = opts?.q ?? search;

      // cancel previous request
      if (abortRef.current) {
        abortRef.current.abort();
      }
      const controller = new AbortController();
      abortRef.current = controller;

      setLoading(true);
      setError(null);

      try {
        const baseUrl = process.env.NEXT_PUBLIC_API_URL?.replace(/\/+$/, '') || '';
        const params = new URLSearchParams();

        // The backend may accept class id or class name param; use id if available
        if (classId) params.append('class_id', String(classId));
        if (year) params.append('academic_year', String(year));
        if (q) params.append('search', q);
        params.append('page', String(page));
        params.append('page_size', String(resultsPerPage));

        const url = `${baseUrl}/enrollments/?${params.toString()}`;

        const res = await fetchWithAuth(url, {
          signal: controller.signal,
          headers: { 'Content-Type': 'application/json' },
        });

        if (!res.ok) {
          if (res.status === 404) {
            // fallback: return empty
            setStudents([]);
            setTotalResults(0);
            setSummary({ total: 0, active: 0, on_leave: 0 });
            return;
          }
          throw new Error(`Server returned ${res.status}`);
        }

        const data = await res.json();

        // Expecting paginated response like { count, next, previous, results: [...] }
        const results = data.results || [];

        setStudents(results);
        setTotalResults(data.count || results.length || 0);
        setSummary({
          total: data.count || results.length || 0,
          active: results.filter((r: any) => (r.student?.status || r.status) === 'active').length,
          on_leave: results.filter((r: any) => (r.student?.status || r.status) === 'on_leave').length,
        });
      } catch (err: any) {
        if (err.name === 'AbortError') {
          // aborted — ignore
          return;
        }
        console.error('Error fetching students:', err);
        setError('Failed to load students. Please try again.');
      } finally {
        setLoading(false);
      }
    },
    [currentPage, resultsPerPage, search, selectedClassId, selectedYear]
  );

  // run fetch when filters change: class, year, or page
  useEffect(() => {
    // Reset to page 1 whenever class/year changes
    setCurrentPage(1);
    fetchStudents({ page: 1, classId: selectedClassId, year: selectedYear, q: search });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedClassId, selectedYear]);

  // run when page changes
  useEffect(() => {
    fetchStudents({ page: currentPage, classId: selectedClassId, year: selectedYear, q: search });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage]);

  // debounced search input: wait 400ms after typing stops
  useEffect(() => {
    if (searchDebounceRef.current) {
      window.clearTimeout(searchDebounceRef.current);
    }
    searchDebounceRef.current = window.setTimeout(() => {
      // reset page and fetch
      setCurrentPage(1);
      fetchStudents({ page: 1, classId: selectedClassId, year: selectedYear, q: search });
    }, 400);

    return () => {
      if (searchDebounceRef.current) {
        window.clearTimeout(searchDebounceRef.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  // cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortRef.current) abortRef.current.abort();
    };
  }, []);

  const totalPages = Math.max(1, Math.ceil(totalResults / resultsPerPage));

  // small helpers
  const findClassName = (id: number | '') => {
    if (!id) return '—';
    const c = classes.find((x) => x.id === id);
    return c ? c.class_name : String(id);
  };

  return (
    <div className="dashboard-container TRANSCRIPTDATA">
      <main className="content">
        <header className="header py-6 px-4 sm:px-6">
          <div className="max-w-7xl mx-auto flex flex-col gap-1">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 tracking-tight">Transcript Management</h1>
            <p className="text-sm sm:text-base text-gray-500">Manage student transcripts for each class</p>
          </div>
        </header>

        {/* Filters bar */}
        <div className="flex items-center justify-between px-6 py-4 bg-white border-b border-gray-200 shadow-sm">
          <div className="flex items-center gap-6">
            {/* Class Filter */}
            <div className="flex flex-col gap-1 min-w-[220px]">
              <label className="text-sm font-medium text-gray-700">Select Class</label>
              <select
                value={selectedClassId}
                onChange={(e) => setSelectedClassId(e.target.value ? Number(e.target.value) : '')}
                className="block w-full px-3 py-2 text-sm bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All classes</option>
                {classes.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.class_name}
                  </option>
                ))}
              </select>
            </div>

            {/* Year Filter */}
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-700">Year</label>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                className="block w-40 px-3 py-2 text-sm bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {academicYears.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-center gap-5">
            <div className="relative">
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                type="text"
                placeholder="Search name or admission number..."
                className="w-64 px-4 py-2 text-sm border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Summary cards */}
        <section className="summary-grid px-6 py-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="stat-card p-4 bg-white rounded-lg border border-gray-100 shadow-sm">
            <label className="text-xs text-gray-500">TOTAL STUDENTS</label>
            <div className="val text-2xl font-bold mt-2">{summary?.total ?? 0}</div>
          </div>

          <div className="stat-card p-4 bg-white rounded-lg border border-gray-100 shadow-sm">
            <label className="text-xs text-gray-500">ACTIVE STUDENTS</label>
            <div className="val text-2xl font-bold mt-2">{summary?.active ?? 0}</div>
            {summary?.on_leave > 0 && <span className="sub-text text-sm text-gray-500 mt-1">{summary.on_leave} On Leave</span>}
          </div>

          <div className="stat-card p-4 bg-white rounded-lg border border-gray-100 shadow-sm">
            <label className="text-xs text-gray-500">ACADEMIC YEAR</label>
            <div className="val text-2xl font-bold mt-2">{selectedYear}</div>
          </div>
        </section>

        {/* Table */}
        <section className="table-card px-6 pb-6">
          <div className="bg-white rounded-lg border border-gray-100 shadow-sm overflow-hidden">
            <table className="student-list-table w-full min-w-[720px]">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm text-gray-600">Avatar</th>
                  <th className="px-4 py-3 text-left text-sm text-gray-600">Student Name</th>
                  <th className="px-4 py-3 text-left text-sm text-gray-600">Admission #</th>
                  <th className="px-4 py-3 text-left text-sm text-gray-600">Class</th>
                  <th className="px-4 py-3 text-left text-sm text-gray-600">Status</th>
                  <th className="px-4 py-3 text-right text-sm text-gray-600">Action</th>
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-10 text-center text-gray-500">
                      Loading students...
                    </td>
                  </tr>
                ) : error ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-10 text-center text-red-600">
                      {error}
                    </td>
                  </tr>
                ) : students.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-10 text-center text-gray-500">
                      No students found for this selection.
                    </td>
                  </tr>
                ) : (
                  students.map((enrollment: any) => {
                    const s = enrollment.student ?? enrollment;
                    return (
                      <tr key={enrollment.id ?? s.id} className="odd:bg-white even:bg-slate-50">
                        <td className="px-4 py-3">
                          <div className="student-avatar w-10 h-10 rounded-full overflow-hidden">
                            <Image
                              alt={`${s.first_name} ${s.last_name}`}
                              src={`https://ui-avatars.com/api/?name=${encodeURIComponent(
                                `${s.first_name} ${s.last_name}`
                              )}&background=random`}
                              width={200}
                              height={200}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        </td>

                        <td className="px-4 py-3">
                          <strong>
                            {s.first_name} {s.last_name}
                          </strong>
                        </td>

                        <td className="px-4 py-3">{s.admission_number ?? '—'}</td>

                        <td className="px-4 py-3">{findClassName(selectedClassId) ?? '—'}</td>

                        <td className="px-4 py-3">
                          <span
                            className={`status-pill inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${
                              (s.status || enrollment.status) === 'active' ? 'bg-green-50 text-green-700' : 'bg-yellow-50 text-yellow-700'
                            }`}
                          >
                            {(s.status || enrollment.status) === 'active' ? 'Active' : 'On Leave'}
                          </span>
                        </td>

                        <td className="px-4 py-3 text-right">
                          <Link href={`/Home/Academics/transcripts/student/${s.id}`}>
                            <button className="btn-table bg-slate-900 text-white px-3 py-1 rounded-md">View Transcript</button>
                          </Link>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>

            {/* Pagination */}
            <div className="px-4 py-3 border-t border-gray-100 bg-white flex items-center justify-between">
              <div className="text-sm text-gray-600">
                Showing {(currentPage - 1) * resultsPerPage + 1} -{' '}
                {Math.min(currentPage * resultsPerPage, totalResults)} of {totalResults} students
              </div>

              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={(p) => setCurrentPage(p)}
                totalResults={totalResults}
                resultsPerPage={resultsPerPage}
              />
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
