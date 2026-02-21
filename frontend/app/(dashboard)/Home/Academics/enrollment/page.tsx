"use client";

import React, { useState, useRef, useEffect } from 'react';
import EnrollPopup from "@/components/ui/enrollmentPopup";
import SkeletonTable from '@/components/ui/SkeletonLoader';
import { fetchWithAuth } from "@/src/lib/apiClient";
import Pagination from '@/src/assets/components/dashboard/Pagnation';
import { ErrorState } from '@/src/assets/components/dashboard/ErrorState';

// ─── Types (unchanged) ───────────────────────────────────────────────────────

export interface UserInfo {
  id: string; email: string; first_name: string; last_name: string;
  role: string; is_active: boolean; is_staff: boolean; created_at: string;
}
export interface Parent { id: number; user: UserInfo; phone_number?: string | null; address?: string | null; }
export interface Student { id: number; user: UserInfo; parent: Parent | null; first_name: string; last_name: string; date_of_birth: string; status: string; }
export interface Teacher { id: number; user: UserInfo; first_name: string; last_name: string; specialization: string; }
export interface ClassData { id: number; class_name: string; teachers: Teacher[]; }
export interface EnrollmentData { id: number; student: Student; class_obj: ClassData; enrollment_date: string; status_display: string; }
export interface EnrollmentApiResponse { count: number; next: string | null; previous: string | null; results: EnrollmentData[]; }
export interface ClassesBase { count: number; next: string | null; previous: string | null; results: ClassData[]; }
interface PaginatedResponse<T> { count: number; next: string | null; previous: string | null; results: T[]; }

// ─── Status config ────────────────────────────────────────────────────────────

const STATUS_STYLES: Record<string, { badge: string; dot: string }> = {
  active:    { badge: "bg-emerald-50 text-emerald-700 border border-emerald-200", dot: "bg-emerald-500" },
  inactive:  { badge: "bg-slate-100  text-slate-500  border border-slate-200",   dot: "bg-slate-400"   },
  pending:   { badge: "bg-amber-50   text-amber-700  border border-amber-200",   dot: "bg-amber-500"   },
  graduated: { badge: "bg-blue-50    text-blue-700   border border-blue-200",    dot: "bg-blue-500"    },
  suspended: { badge: "bg-rose-50    text-rose-700   border border-rose-200",    dot: "bg-rose-500"    },
};

function getStatusStyle(status: string) {
  return STATUS_STYLES[status.toLowerCase()] ?? STATUS_STYLES.inactive;
}

// ─── Highlight search match ───────────────────────────────────────────────────

function Highlight({ text, query }: { text: string; query: string }) {
  if (!query) return <>{text}</>;
  const idx = text.toLowerCase().indexOf(query.toLowerCase());
  if (idx === -1) return <>{text}</>;
  return (
    <>
      {text.slice(0, idx)}
      <mark className="bg-yellow-200 text-yellow-900 rounded px-0.5">{text.slice(idx, idx + query.length)}</mark>
      {text.slice(idx + query.length)}
    </>
  );
}

// ─── Three-dot action menu ────────────────────────────────────────────────────

function ActionMenu({ onEdit, onDelete }: { onEdit: () => void; onDelete: () => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={ref} className="relative flex justify-center">
      <button
        onClick={() => setOpen((p) => !p)}
        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
      >
        <svg xmlns="http://www.w3.org/2000/svg" height="20" viewBox="0 -960 960 960" width="20" fill="currentColor">
          <path d="M480-160q-33 0-56.5-23.5T400-240q0-33 23.5-56.5T480-320q33 0 56.5 23.5T560-240q0 33-23.5 56.5T480-160Zm0-240q-33 0-56.5-23.5T400-480q0-33 23.5-56.5T480-560q33 0 56.5 23.5T560-480q0 33-23.5 56.5T480-400Zm0-240q-33 0-56.5-23.5T400-720q0-33 23.5-56.5T480-800q33 0 56.5 23.5T560-720q0 33-23.5 56.5T480-640Z"/>
        </svg>
      </button>

      {open && (
        <div className="absolute right-0 top-8 z-20 w-36 bg-white border border-slate-200 rounded-xl shadow-lg overflow-hidden">
          <button
            onClick={() => { onEdit(); setOpen(false); }}
            className="w-full text-left px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition flex items-center gap-2"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
            Edit
          </button>
          <button
            onClick={() => { onDelete(); setOpen(false); }}
            className="w-full text-left px-4 py-2.5 text-sm font-semibold text-rose-600 hover:bg-rose-50 transition flex items-center gap-2"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
            Delete
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function EnrollmentsManagement() {
  const [enrollmentData, setEnrollmentData] = useState<EnrollmentData[]>([]);
  const [formData, setFormData]             = useState<Record<string, any>>({ student: "", class_obj: "", status: "", roll_number: "" });
  const [Classes, setClasses]               = useState<ClassData[]>([]);
  const [ClassFilter, setClassFilter]       = useState("");
  const [selectedClassId, setSelectedClassId] = useState("");
  const [active, setActive]                 = useState(false);
  const [selectedId, setSelectedId]         = useState<number | null>(null);
  const [searchTerm, setSearchTerm]         = useState("");
  const [searchQuery, setSearchQuery]       = useState("");
  const [isSearching, setIsSearching]       = useState(false);
  const [isLoading, setIsLoading]           = useState(true);
  const [pagination, setPagination]         = useState<PaginatedResponse<EnrollmentData> | null>(null);
  const [page, setPage]                     = useState(1);

  const fetchEnrollmentData = async (filterClassId?: string) => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (filterClassId)                        params.append("class_id", filterClassId);
      if (searchQuery && searchQuery.trim())    params.append("search", searchQuery.trim());
      const qs  = params.toString();
      const url = `${process.env.NEXT_PUBLIC_API_URL}/enrollments/${qs ? `?${qs}` : ""}`;
      const res  = await fetchWithAuth(url, { headers: { "Content-Type": "application/json" } });
      const data: EnrollmentApiResponse = await res.json();
      setEnrollmentData(data.results || []);
      setPagination(data);
      setPage(1);
    } catch (err) {
      console.error("Failed to load enrollment data", err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchClasses = async () => {
    try {
      const res  = await fetchWithAuth(`${process.env.NEXT_PUBLIC_API_URL}/classes/`, { headers: { "Content-Type": "application/json" } });
      const data: ClassesBase = await res.json();
      if (data?.results) setClasses(data.results);
    } catch (err) { console.error("Failed to load Classes:", err); }
  };

  useEffect(() => { fetchEnrollmentData(); fetchClasses(); }, []);
  useEffect(() => { fetchEnrollmentData(selectedClassId); }, [selectedClassId, searchQuery]);

  const handleDelete = async (id: number) => {
    if (!window.confirm("Are you sure you want to remove this enrollment?")) return;
    try {
      const res = await fetchWithAuth(`${process.env.NEXT_PUBLIC_API_URL}/enrollments/${id}/`, {
        method: "DELETE", headers: { "Content-Type": "application/json" },
      });
      if (res.ok) setEnrollmentData((prev) => prev.filter((item) => item.id !== id));
    } catch (err) { console.error("Error deleting:", err); }
  };

  const handleStartEdit = (item: EnrollmentData) => {
    setSelectedId(item.id);
    setFormData((f) => ({ ...f, student: item.student, class_obj: item.class_obj }));
    setActive(true);
  };

  const handlePopup = () => {
    if (active) setSelectedId(null);
    setActive((p) => !p);
  };

  const handleSearch = (e?: React.FormEvent) => {
    e?.preventDefault();
    setSearchQuery(searchTerm.trim());
    setIsSearching(!!searchTerm.trim());
  };

  const handleClassFilter = (val: string) => {
    setClassFilter(val);
    setSelectedClassId(val);
  };

  const resetSearch = () => { setSearchTerm(""); setSearchQuery(""); setIsSearching(false); };

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">

        <EnrollPopup
          active={active}
          togglePopup={handlePopup}
          formData={formData}
          fieldNames={["student", "class_obj"]}
          setFormData={(field, val) => setFormData((f) => ({ ...f, [field]: val }))}
          selectedIM={selectedId}
          onSuccess={() => fetchEnrollmentData(selectedClassId)}
        />

        {/* ── Header ────────────────────────────────────────────────────── */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Enrollments</h1>
            <p className="text-sm text-slate-500 mt-1">Track and manage student enrollments across academic years.</p>
          </div>
          <button
            onClick={() => { setFormData({ student: "", class_obj: "" }); setActive(true); }}
            className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white text-sm font-bold px-4 py-2.5 rounded-xl shadow-sm transition"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            Enroll Student
          </button>
        </div>

        {/* ── Stats strip ───────────────────────────────────────────────── */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: "Total Enrollments", value: pagination?.count ?? 0, color: "text-slate-900" },
            { label: "Active",   value: enrollmentData.filter(e => e.status_display.toLowerCase() === "active").length,  color: "text-emerald-600" },
            { label: "Inactive", value: enrollmentData.filter(e => e.status_display.toLowerCase() !== "active").length,  color: "text-rose-500"    },
          ].map(({ label, value, color }) => (
            <div key={label} className="bg-white rounded-2xl border border-slate-200 px-5 py-4 shadow-sm">
              <div className={`text-2xl font-bold ${color}`}>{value}</div>
              <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">{label}</div>
            </div>
          ))}
        </div>

        {/* ── Toolbar ───────────────────────────────────────────────────── */}
        <div className="flex items-center gap-3 flex-wrap">
          {/* Search */}
          <form onSubmit={handleSearch} className="relative flex-1 min-w-60">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input
              type="text"
              placeholder="Search by student or class…"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 text-sm bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 transition shadow-sm"
            />
            {searchTerm && (
              <button type="button" onClick={resetSearch} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            )}
          </form>

          {/* Class filter */}
          <div className="relative">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/>
            </svg>
            <select
              value={ClassFilter}
              onChange={(e) => handleClassFilter(e.target.value)}
              className="pl-8 pr-8 py-2.5 text-sm bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 transition shadow-sm appearance-none cursor-pointer"
            >
              <option value="">All Classes</option>
              {Classes.map((c) => <option key={c.id} value={c.id}>{c.class_name}</option>)}
            </select>
          </div>

          {/* Reset filters */}
          {(ClassFilter || isSearching) && (
            <button
              onClick={() => { handleClassFilter(""); resetSearch(); }}
              className="px-3 py-2.5 text-sm font-semibold text-slate-500 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition shadow-sm"
            >
              Reset
            </button>
          )}
        </div>

        {/* Active search label */}
        {isSearching && searchQuery && (
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            Showing results for <span className="font-semibold text-slate-800">"{searchQuery}"</span>
            <button onClick={resetSearch} className="ml-1 text-xs font-bold text-rose-500 hover:underline">Clear</button>
          </div>
        )}

        {/* ── Table ─────────────────────────────────────────────────────── */}
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
          {isLoading ? (
            <div className="p-6"><SkeletonTable rows={5} columns={5} /></div>
          ) : (
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  {["Student", "Class", "Enrolled On", "Status", "Actions"].map((h) => (
                    <th key={h} className="px-6 py-3.5 text-[10px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {enrollmentData.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-20 text-center">
                      <ErrorState code={6} message="No Student Enrollments Found" />
                    </td>
                  </tr>
                ) : (
                  enrollmentData.map((item, idx) => {
                    const name   = `${item.student.first_name} ${item.student.last_name}`;
                    const status = item.status_display;
                    const style  = getStatusStyle(status);
                    return (
                      <tr
                        key={item.id}
                        className="hover:bg-slate-50/60 transition-colors group"
                        style={{ animation: `fadeUp 0.25s ease forwards`, animationDelay: `${idx * 30}ms`, opacity: 0 }}
                      >
                        {/* Student */}
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-600 shrink-0">
                              {item.student.first_name[0]}{item.student.last_name[0]}
                            </div>
                            <span className="font-semibold text-slate-800">
                              <Highlight text={name} query={searchQuery} />
                            </span>
                          </div>
                        </td>

                        {/* Class */}
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-slate-100 text-slate-600 text-xs font-semibold rounded-full">
                            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
                            {item.class_obj.class_name}
                          </span>
                        </td>

                        {/* Date */}
                        <td className="px-6 py-4 text-slate-500 tabular-nums">
                          {new Date(item.enrollment_date).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}
                        </td>

                        {/* Status */}
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider ${style.badge}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`} />
                            {status}
                          </span>
                        </td>

                        {/* Actions */}
                        <td className="px-6 py-4">
                          <ActionMenu
                            onEdit={() => handleStartEdit(item)}
                            onDelete={() => handleDelete(item.id)}
                          />
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          )}

          {/* Footer */}
          {!isLoading && enrollmentData.length > 0 && (
            <div className="px-6 py-3 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between text-xs text-slate-400">
              <span>Showing {enrollmentData.length} of {pagination?.count ?? 0} enrollments</span>
              {pagination && (
                <Pagination
                  count={pagination.count}
                  next={pagination.next}
                  previous={pagination.previous}
                  currentPage={page}
                  onPageChange={(p) => setPage(p)}
                />
              )}
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(4px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}