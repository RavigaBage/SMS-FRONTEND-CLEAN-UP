"use client";

import { useState, useEffect, useRef } from "react";
import { apiRequest, fetchWithAuth } from "@/src/lib/apiClient";
import { Pagination } from "@/src/assets/components/management/Pagination";
import { u } from "framer-motion/client";

type ProgressionStatus = "pending" | "promoted" | "demoted" | "graduated" | "withheld";

interface StudentProgression {
  id: number;
  student: number;
  student_name: string;
  academic_year: string;
  from_class: string;
  to_class: string | null;
  status: ProgressionStatus;
  remarks: string | null;
  updated_by_name: string | null;
  updated_at: string;
}
interface YearsModel {
  end_date: string;
  id: number;
  is_current: boolean;
  start_date: string;
  year_name: string;
}

interface PaginatedProgressions {
  count: number;
  next: string | null;
  previous: string | null;
  results: any[];
  detail?: string;
}

export interface ClassesBase {
  count: number;
  next: string | null;
  previous: string | null;
  results: ClassData[];
}
export interface ClassData {
  id: number;
  class_name: string;
  academic_year: string;
  teacher_name: String;
  teacher: Teacher | null;
}
export interface Teacher {
  id: number;
  first_name: string;
  last_name: string;
  specialization: number;
}

interface BulkPromotePayload {
  academic_year: string;
  from_class: string;
  to_class: string;
  exclude_ids: number[];
}


const PAGE_SIZE = 20;

const STATUS_META: Record<
  ProgressionStatus,
  { label: string; color: string; bg: string; border: string; icon: string }
> = {
  pending:   { label: "Pending",   color: "#64748b", bg: "#f8fafc",                border: "#e2e8f0",               icon: "⏳" },
  promoted:  { label: "Promoted",  color: "#b45309", bg: "rgba(245,158,11,0.08)",  border: "rgba(245,158,11,0.3)",  icon: "↑" },
  demoted:   { label: "Demoted",   color: "#dc2626", bg: "rgba(248,113,113,0.08)", border: "rgba(248,113,113,0.3)", icon: "↓" },
  graduated: { label: "Graduated", color: "#059669", bg: "rgba(52,211,153,0.08)",  border: "rgba(52,211,153,0.3)",  icon: "✦" },
  withheld:  { label: "Withheld",  color: "#7c3aed", bg: "rgba(167,139,250,0.08)", border: "rgba(167,139,250,0.3)", icon: "⊘" },
};

const CLASSES = [
  "Class 1","Class 2","Class 3","Class 4","Class 5","Class 6",
  "Class 7","Class 8","Class 9","Class 10","Class 11","Class 12",
];


async function fetchProgressions(params: Record<string, string> = {}): Promise<PaginatedProgressions> {
  const searchParams = new URLSearchParams(params);
  
  if (!searchParams.get('from_class') || !searchParams.get('academic_year')) {

    return { count: 0, next: null, previous: null, results: [] };
  }

  const res = await apiRequest<PaginatedProgressions>(`/academics/studentmanager/?${searchParams.toString()}`);
  return {
    count: res?.count ?? 0,
    next: res?.next ?? null,
    previous: res?.previous ?? null,
    results: res?.results ?? [],
  };
}

const fetchClasses = async () => {
try {
    const res = await fetchWithAuth(
    `${process.env.NEXT_PUBLIC_API_URL}/classes/`,
    {
        method: "GET",
        headers: {
        "Content-Type": "application/json",
        },
    },
    );

    if (res.status === 401) {
    console.error("Access denied. Redirecting to login...");
    return;
    }

    const data: ClassesBase = await res.json();
    if (data && data.results) {
    return(data.results);
    }
} catch (err) {
    console.error("Network or Auth error:", err);
}
};

async function patchProgression(
  record:any,
  payload: { status: ProgressionStatus; to_class?: string; remarks?: string }
): Promise<StudentProgression> {
  if(record.from_class === payload.to_class){
    throw new Error("You cannot perform this operation, from_class and to_class must make a unique_set");
  }
  const res = await fetchWithAuth(
    `${process.env.NEXT_PUBLIC_API_URL}/academics/studentmanager/${record.id}/`,
    { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) }
  );
    if (!res.ok) {
    const errorData = await res.json().catch(() => ({})) as { detail?: string };

    throw new Error(errorData.detail || "Failed to update progression");
    }
  return res.json();
}

async function postBulkPromote(payload: BulkPromotePayload) {
  const res = await fetchWithAuth(
    `${process.env.NEXT_PUBLIC_API_URL}/academics/studentmanager/bulk-promote/`,
    { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) }
  );
  if (!res.ok) throw new Error("Failed to bulk promote");
  return res.json();
}


function StatusBadge({ status }: { status: ProgressionStatus }) {
  const m = STATUS_META[status];
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 5,
      padding: "4px 10px", borderRadius: 20,
      background: m.bg, color: m.color,
      fontSize: 11, fontWeight: 600, letterSpacing: "0.04em",
      border: `1px solid ${m.border}`, whiteSpace: "nowrap",
    }}>
      <span style={{ fontSize: 9 }}>{m.icon}</span>
      {m.label}
    </span>
  );
}

function StatCard({ label, value, color, delay }: { label: string; value: number; color: string; delay: number }) {
  const [displayed, setDisplayed] = useState(0);
  useEffect(() => {
    const steps = 28; let i = 0;
    const t = setInterval(() => { i++; setDisplayed(Math.round((value / steps) * i)); if (i >= steps) clearInterval(t); }, 22);
    return () => clearInterval(t);
  }, [value]);

  return (
    <div style={{
      background: "#fff", border: "1px solid #f1f5f9", borderRadius: 14,
      padding: "18px 22px", animation: `fadeUp 0.5s ease ${delay}ms both`,
      position: "relative", overflow: "hidden",
      boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
    }}>
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: color, borderRadius: "14px 14px 0 0", opacity: 0.6 }} />
      <p style={{ margin: 0, fontSize: 10, color: "#94a3b8", letterSpacing: "0.09em", textTransform: "uppercase", fontWeight: 600 }}>{label}</p>
      <p style={{ margin: "6px 0 0", fontSize: 30, fontWeight: 700, color: "#0f172a", fontFamily: "'Playfair Display', serif", lineHeight: 1 }}>{displayed}</p>
    </div>
  );
}


function SkeletonRow() {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr 1fr 80px", padding: "16px 24px", borderBottom: "1px solid #f1f5f9", alignItems: "center" }}>
      {[180, 90, 70, 70, 80, 50].map((w, i) => (
        <div key={i} style={{ height: 13, width: w, borderRadius: 6, background: "linear-gradient(90deg,#f1f5f9 25%,#e2e8f0 50%,#f1f5f9 75%)", backgroundSize: "200% 100%", animation: "shimmer 1.4s infinite" }} />
      ))}
    </div>
  );
}


function EditModal({ record, onClose, onSave,classRecord }: {
  record: StudentProgression;
  onClose: () => void;
  onSave: (id: any, payload: { status: ProgressionStatus; to_class?: string; remarks?: string }) => Promise<void>;
  classRecord:ClassData[]
}) {
  const [status, setStatus] = useState<ProgressionStatus>(record.status);
  const [toClass, setToClass] = useState(record.to_class ?? "");
  const [remarks, setRemarks] = useState(record.remarks ?? "");
  const [saving, setSaving] = useState(false);
  const [classes, setClasses] = useState<ClassData[]>([]);
  const [error, setError] = useState("");
  const [className, setClassName] = useState("")
  const needsClass = status === "promoted" || status === "demoted";
  
  useEffect(() => {
  const loadClasses = async () => {
    const results = await fetchClasses();
    if (results) setClasses(results);
  };
  const GetClassname = ()=>{
    classRecord.forEach((element)=>{
        if(record.from_class === element.class_name || String(record.from_class) === String(element.id)){
            setClassName(element.class_name)
        }
    })
  }
  GetClassname();
  loadClasses();
}, []);

  const handleSave = async () => {
    if (needsClass && !toClass) { setError("Please select the destination class."); return; }
    setSaving(true); setError("");
    try {
      await onSave(record, { status, to_class: toClass || undefined, remarks: remarks || undefined });
      onClose();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
    } finally { setSaving(false); }
  };

  const inputStyle = { width: "100%", padding: "11px 14px", borderRadius: 10, background: "#f8fafc", border: "1px solid #e2e8f0", color: "#0f172a", fontSize: 13, fontFamily: "'DM Sans', sans-serif", outline: "none" } as const;

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 1000, background: "rgba(15,23,42,0.45)", backdropFilter: "blur(8px)", display: "flex", alignItems: "center", justifyContent: "center", animation: "fadeIn 0.2s ease" }} onClick={onClose}>
      <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 20, padding: 36, width: "100%", maxWidth: 480, animation: "slideUp 0.3s cubic-bezier(.16,1,.3,1)", boxShadow: "0 20px 60px rgba(0,0,0,0.12)" }} onClick={e => e.stopPropagation()}>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 }}>
          <div>
            <p style={{ margin: 0, fontSize: 10, color: "#94a3b8", letterSpacing: "0.1em", textTransform: "uppercase", fontWeight: 600 }}>Update Progression</p>
            <h3 style={{ margin: "4px 0 0", fontSize: 22, fontWeight: 700, color: "#0f172a", fontFamily: "'Playfair Display', serif" }}>{record.student_name}</h3>
          </div>
          <button onClick={onClose} style={{ background: "#f8fafc", border: "1px solid #e2e8f0", color: "#94a3b8", borderRadius: 8, width: 32, height: 32, cursor: "pointer", fontSize: 15, display: "flex", alignItems: "center", justifyContent: "center" }}>✕</button>
        </div>

        <div style={{ display: "inline-flex", gap: 8, padding: "8px 14px", background: "#f8fafc", borderRadius: 10, border: "1px solid #e2e8f0", marginBottom: 20 }}>
          <span style={{ fontSize: 12, color: "#94a3b8" }}>From</span>
          <span style={{ fontSize: 12, color: "#334155", fontWeight: 600 }}>{className || record.from_class}</span>
          <span style={{ fontSize: 12, color: "#cbd5e1" }}>·</span>
          <span style={{ fontSize: 12, color: "#94a3b8" }}>{record.academic_year}</span>
        </div>

     
        <p style={{ margin: "0 0 10px", fontSize: 10, color: "#94a3b8", letterSpacing: "0.09em", textTransform: "uppercase", fontWeight: 600 }}>New Status</p>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
          {(Object.keys(STATUS_META) as ProgressionStatus[]).filter(s => s !== "pending").map(s => {
            const m = STATUS_META[s]; const active = status === s;
            return (
              <button key={s} onClick={() => setStatus(s)} style={{
                padding: "11px 14px", borderRadius: 10, cursor: "pointer",
                background: active ? m.bg : "#f8fafc", border: `1px solid ${active ? m.border : "#e2e8f0"}`,
                color: active ? m.color : "#64748b", fontFamily: "'DM Sans', sans-serif",
                fontSize: 13, fontWeight: active ? 600 : 400, textAlign: "left",
                transition: "all 0.15s", display: "flex", alignItems: "center", gap: 8,
              }}>
                <span>{m.icon}</span>{m.label}
              </button>
            );
          })}
        </div>

        {needsClass && (
          <div style={{ animation: "fadeUp 0.2s ease" }}>
            <p style={{ margin: "18px 0 8px", fontSize: 10, color: "#94a3b8", letterSpacing: "0.09em", textTransform: "uppercase", fontWeight: 600 }}>{status === "promoted" ? "Promote To" : "Demote To"}</p>
            <select value={toClass} onChange={e => setToClass(e.target.value)} style={inputStyle}>
              <option value="">Select class…</option>
               {classes.map((t) => (
                    <option key={t.id} value={t.class_name}>
                    {t.class_name}
                    {t.teacher_name ? ` — ${t.teacher_name}` : " (No Teacher)"}
                    </option>
                ))}
            </select>
          </div>
        )}

        <p style={{ margin: "18px 0 8px", fontSize: 10, color: "#94a3b8", letterSpacing: "0.09em", textTransform: "uppercase", fontWeight: 600 }}>Remarks (optional)</p>
        <textarea value={remarks} onChange={e => setRemarks(e.target.value)} rows={3} placeholder="Add a note…" style={{ ...inputStyle, resize: "none", boxSizing: "border-box" }} />

        {error && <p style={{ color: "#dc2626", fontSize: 12, margin: "10px 0 0" }}>⚠ {error}</p>}

        <div style={{ display: "flex", gap: 10, marginTop: 22 }}>
          <button onClick={onClose} style={{ flex: 1, padding: "12px", borderRadius: 10, cursor: "pointer", background: "#f8fafc", border: "1px solid #e2e8f0", color: "#64748b", fontFamily: "'DM Sans', sans-serif", fontSize: 13 }}>Cancel</button>
          <button onClick={handleSave} disabled={saving} style={{ flex: 2, padding: "12px", borderRadius: 10, cursor: saving ? "not-allowed" : "pointer", background: saving ? "#fde68a" : "linear-gradient(135deg,#f59e0b,#d97706)", border: "none", color: "#fff", fontFamily: "'DM Sans', sans-serif", fontSize: 13, fontWeight: 700, transition: "opacity 0.2s" }}>
            {saving ? "Saving…" : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}


function BulkModal({ records, onClose, onConfirm,year }: {
  records: StudentProgression[];
  onClose: () => void;
  onConfirm: (payload: BulkPromotePayload) => Promise<void>;
  year:string;
}) {
  const pendingRecords = records.filter(r => r.status === "pending");
  const uniqueClasses = [...new Set(pendingRecords.map(r => r.from_class))];
  const [fromClass, setFromClass] = useState(uniqueClasses[0] ?? "");
  const [toClass, setToClass] = useState("");
  const [excluded, setExcluded] = useState<number[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [Classes, setClasses] = useState<ClassData[]>([]);
    useEffect(() => {
    const loadClasses = async () => {
        const results = await fetchClasses();
        if (results) setClasses(results);
    };

    loadClasses();
    }, []);

  const eligible = pendingRecords.filter(r => r.from_class === fromClass);
  const toggle = (id: number) => setExcluded(p => p.includes(id) ? p.filter(x => x !== id) : [...p, id]);

  const handleConfirm = async () => {
    if (!toClass) { setError("Please select destination class."); return; }
    setSaving(true); setError("");
    try { await onConfirm({ academic_year: year, from_class: fromClass, to_class: toClass, exclude_ids: excluded }); onClose(); }
    catch (e: unknown) { setError(e instanceof Error ? e.message : "Error occurred."); }
    finally { setSaving(false); }
  };

  const selectStyle = { width: "100%", padding: "11px 14px", borderRadius: 10, background: "#f8fafc", border: "1px solid #e2e8f0", color: "#0f172a", fontSize: 13, fontFamily: "'DM Sans', sans-serif", outline: "none" } as const;

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 1000, background: "rgba(15,23,42,0.45)", backdropFilter: "blur(10px)", display: "flex", alignItems: "center", justifyContent: "center", animation: "fadeIn 0.2s ease" }} onClick={onClose}>
      <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 20, padding: 36, width: "100%", maxWidth: 560, animation: "slideUp 0.3s cubic-bezier(.16,1,.3,1)", boxShadow: "0 20px 60px rgba(0,0,0,0.12)", maxHeight: "85vh", overflowY: "auto" }} onClick={e => e.stopPropagation()}>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 26 }}>
          <div>
            <p style={{ margin: 0, fontSize: 10, color: "#94a3b8", letterSpacing: "0.1em", textTransform: "uppercase", fontWeight: 600 }}>Bulk Action</p>
            <h3 style={{ margin: "4px 0 0", fontSize: 22, fontWeight: 700, color: "#0f172a", fontFamily: "'Playfair Display', serif" }}>Promote Entire Class</h3>
          </div>
          <button onClick={onClose} style={{ background: "#f8fafc", border: "1px solid #e2e8f0", color: "#94a3b8", borderRadius: 8, width: 32, height: 32, cursor: "pointer", fontSize: 15 }}>✕</button>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 22 }}>
          <div>
            <p style={{ margin: "0 0 8px", fontSize: 10, color: "#94a3b8", letterSpacing: "0.09em", textTransform: "uppercase", fontWeight: 600 }}>From Class</p>
            <select value={fromClass} onChange={e => { setFromClass(e.target.value); setExcluded([]); }} style={selectStyle}>
              {Classes.length === 0 && (
                    <option disabled>No classes available</option>
                )}
                {Classes.map((t) => (
                    <option key={t.id} value={t.class_name}>
                    {t.class_name}
                    {t.teacher_name ? ` — ${t.teacher_name}` : " (No Teacher)"}
                    </option>
                ))}
            </select>
          </div>
          <div>
            <p style={{ margin: "0 0 8px", fontSize: 10, color: "#94a3b8", letterSpacing: "0.09em", textTransform: "uppercase", fontWeight: 600 }}>To Class</p>
            <select value={toClass} onChange={e => setToClass(e.target.value)} style={{ ...selectStyle, color: toClass ? "#0f172a" : "#94a3b8" }}>
              <option value="">Select…</option>
             {Classes.length === 0 && (
                    <option disabled>No classes available</option>
                )}
                {Classes.map((t) => (
                    <option key={t.id} value={t.class_name}>
                    {t.class_name}
                    {t.teacher_name ? ` — ${t.teacher_name}` : " (No Teacher)"}
                    </option>
                ))}
            </select>
          </div>
        </div>

        {eligible.length > 0 ? (
          <>
            <p style={{ margin: "0 0 10px", fontSize: 10, color: "#94a3b8", letterSpacing: "0.09em", textTransform: "uppercase", fontWeight: 600 }}>Eligible Students — Click to Exclude</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 6, maxHeight: 220, overflowY: "auto" }}>
              {eligible.map((r,i) => {
                const isExcluded = excluded.includes(r.student);
                return (
                  <div key={i} onClick={() => toggle(r.student)} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 14px", borderRadius: 10, cursor: "pointer", background: isExcluded ? "#fff5f5" : "#fffbeb", border: `1px solid ${isExcluded ? "#fecaca" : "#fde68a"}`, transition: "all 0.15s" }}>
                    <span style={{ fontSize: 13, color: isExcluded ? "#94a3b8" : "#1e293b", fontFamily: "'DM Sans', sans-serif", textDecoration: isExcluded ? "line-through" : "none" }}>{r.student_name}</span>
                    <span style={{ fontSize: 11, color: isExcluded ? "#ef4444" : "#d97706", fontWeight: 600 }}>{isExcluded ? "Excluded" : "Include"}</span>
                  </div>
                );
              })}
            </div>
            <p style={{ margin: "10px 0 0", fontSize: 12, color: "#64748b" }}>{eligible.length - excluded.length} of {eligible.length} students will be promoted</p>
          </>
        ) : (
          <div style={{ padding: 20, textAlign: "center", background: "#f8fafc", borderRadius: 12, border: "1px solid #e2e8f0" }}>
            <p style={{ color: "#94a3b8", fontSize: 13 }}>No pending students in this class.</p>
          </div>
        )}

        {error && <p style={{ color: "#dc2626", fontSize: 12, margin: "10px 0 0" }}>⚠ {error}</p>}

        <div style={{ display: "flex", gap: 10, marginTop: 22 }}>
          <button onClick={onClose} style={{ flex: 1, padding: "12px", borderRadius: 10, cursor: "pointer", background: "#f8fafc", border: "1px solid #e2e8f0", color: "#64748b", fontFamily: "'DM Sans', sans-serif", fontSize: 13 }}>Cancel</button>
          <button onClick={handleConfirm} disabled={saving || eligible.length === 0} style={{ flex: 2, padding: "12px", borderRadius: 10, cursor: (saving || eligible.length === 0) ? "not-allowed" : "pointer", background: "linear-gradient(135deg,#f59e0b,#d97706)", border: "none", color: "#fff", fontFamily: "'DM Sans', sans-serif", fontSize: 13, fontWeight: 700, opacity: (saving || eligible.length === 0) ? 0.5 : 1, transition: "opacity 0.2s" }}>
            {saving ? "Promoting…" : `Promote ${eligible.length - excluded.length} Students`}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ProgressionPage() {
  const [records, setRecords]         = useState<StudentProgression[]>([]);
  const [totalResults, setTotalResults] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading]     = useState(true);
  const [editingRecord, setEditingRecord] = useState<StudentProgression | null>(null);
  const [showBulk, setShowBulk]       = useState(false);
  const [toast, setToast]             = useState<{ msg: string; type: "success" | "error" } | null>(null);
  const [filterClass,  setFilterClass]  = useState("");
  const [filterStatus, setFilterStatus] = useState<ProgressionStatus | "">("");
  const [filterYear,setFilterYear]   = useState("");
  const [filterYearList,setFilterYearList]   = useState<YearsModel[]>([]);
  const [searchQuery,  setSearchQuery]  = useState("");

  const debounceRef  = useRef<ReturnType<typeof setTimeout> | null>(null);
  const toastRef     = useRef<ReturnType<typeof setTimeout> | null>(null);
  const totalPages   = Math.ceil(totalResults / PAGE_SIZE);
  const [Classes, setClasses] = useState<ClassData[]>([]);

    useEffect(() => {
        const loadClasses = async () => {
            const results = await fetchClasses();
            if (results) setClasses(results);
        };
        setFilterYearList(handleYearSync());

    loadClasses();
    }, []);

    const handleYearSync = (): YearsModel[] => {
        const currentYear = new Date().getFullYear();
        return Array.from({ length: currentYear - 2000 + 1 }, (_, i) => {
        const year = currentYear - i;
        return {
            end_date: `${year}-${year + 1}`,
            start_date: `${year}`,
            id: i,
            is_current: year === currentYear,
            year_name: `${year}-${year + 1}`,
        };
        });
    };
    const load = async (page: number, search = searchQuery) => {
            console.log(searchQuery,filterClass,filterYear);
        if (!filterYear || !filterClass) {
            setRecords([]);
            setTotalResults(0);
            return; 
        }


    setIsLoading(true);
    try {
        const params: Record<string, string> = { 
        page: String(page),
        academic_year: filterYear,
        from_class: filterClass
        };
        
        if (filterStatus) params.status = filterStatus;
        if (search) params.search = search;

        const data = await fetchProgressions(params);
        setRecords(data.results);
        setTotalResults(data.count);
    } catch (err) {
        console.error(err);
        { showToast(`${(err as any)?.raw.detail || String(err)}`, "error"); }

    } finally {
        setIsLoading(false);
    }
    };

  useEffect(() => { load(currentPage); }, [currentPage, filterClass, filterStatus,filterYear]);


  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => { setCurrentPage(1); load(1, searchQuery); }, 350);
  }, [searchQuery]);


  const showToast = (msg: string, type: "success" | "error" = "success") => {
    setToast({ msg, type });
    if (toastRef.current) clearTimeout(toastRef.current);
    toastRef.current = setTimeout(() => setToast(null), 3500);
  };
    const handleFilterChange = (field: "class" | "status" | "academic_year", value: string) => {
    const setters = {
        class: setFilterClass,
        academic_year: setFilterYear,
        status: (val: string) => setFilterStatus(val as ProgressionStatus | ""),
    };

    setters[field](value);
    setCurrentPage(1); 
    };
  const handleClearFilters = () => { setFilterClass(""); setFilterStatus(""); setSearchQuery(""); setCurrentPage(1); };

  const hasActiveFilters = filterClass !== "" || filterStatus !== "" || searchQuery !== "";

  const handleUpdate = async (id: number, payload: { status: ProgressionStatus; to_class?: string; remarks?: string }) => {
    setRecords(prev => prev.map(r => r.id === id ? { ...r, ...payload, to_class: payload.to_class ?? r.to_class } : r));
    try {
      await patchProgression(id, payload);
      showToast(`Updated to ${STATUS_META[payload.status].label}`);
      load(currentPage);
    } catch(err) { showToast(`${err}`, "error"); load(currentPage); }
  };

  const handleBulkPromote = async (payload: BulkPromotePayload) => {
    try {
      await postBulkPromote(payload);
      showToast(`${payload.from_class} → ${payload.to_class} bulk promotion applied`);
      load(currentPage);
    } catch (err) { showToast(`${err}`, "error"); load(currentPage); }
  };

  const handlePageChange = (p: number) => { if (p >= 1 && p <= totalPages) setCurrentPage(p); };

  const pageStats = {
    total:     totalResults,
    pending:   records.filter(r => r.status === "pending").length,
    promoted:  records.filter(r => r.status === "promoted").length,
    demoted:   records.filter(r => r.status === "demoted").length,
    graduated: records.filter(r => r.status === "graduated").length,
    withheld:  records.filter(r => r.status === "withheld").length,
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;1,9..40,400&display=swap');

        @keyframes fadeIn  { from{opacity:0} to{opacity:1} }
        @keyframes fadeUp  { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:translateY(0)} }
        @keyframes slideUp { from{opacity:0;transform:translateY(20px) scale(0.98)} to{opacity:1;transform:translateY(0) scale(1)} }
        @keyframes toastIn { from{opacity:0;transform:translateX(16px)} to{opacity:1;transform:translateX(0)} }
        @keyframes shimmer { 0%{background-position:-200% 0} 100%{background-position:200% 0} }

        .prog-row:hover          { background:#f8fafc !important; }
        .prog-action:hover       { background:#fffbeb !important; border-color:#fde68a !important; color:#b45309 !important; }
        .prog-filter:focus       { outline:none; border-color:#f59e0b !important; box-shadow:0 0 0 3px rgba(245,158,11,0.1) !important; }
        .prog-bulk:hover         { transform:translateY(-1px); box-shadow:0 6px 20px rgba(245,158,11,0.35) !important; }

        ::-webkit-scrollbar       { width:6px; height:4px; }
        ::-webkit-scrollbar-track { background:#f8fafc; }
        ::-webkit-scrollbar-thumb { background:#cbd5e1; border-radius:16px; }
        ::-webkit-scrollbar-thumb:hover { background:#94a3b8; }
      `}</style>

      <div style={{ minHeight: "100vh", background: "#f8fafc", fontFamily: "'DM Sans', sans-serif" }}>

        <div style={{ position: "fixed", top: 0, left: 0, right: 0, height: 260, pointerEvents: "none", zIndex: 0, background: "radial-gradient(ellipse 65% 40% at 65% 0%,rgba(245,158,11,0.07),transparent)" }} />

        <div style={{ position: "relative", zIndex: 1, maxWidth: 1200, margin: "0 auto", padding: "36px 24px" }}>

          <div style={{ marginBottom: 32, animation: "fadeUp 0.45s ease" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
              <div style={{ width: 3, height: 22, background: "linear-gradient(180deg,#f59e0b,#d97706)", borderRadius: 3 }} />
              <p style={{ color: "#94a3b8", fontSize: 11, letterSpacing: "0.12em", textTransform: "uppercase", fontWeight: 500 }}>Academic Management</p>
            </div>
            <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
              <div>
                <h1 style={{ fontSize: 34, fontWeight: 700, color: "#0f172a", fontFamily: "'Playfair Display', serif", lineHeight: 1.1 }}>Student Progression</h1>
                <p style={{ color: "#64748b", marginTop: 6, fontSize: 14 }}>Promotions, demotions, graduations & class transitions · {filterYear}</p>
              </div>
              <button className="prog-bulk" onClick={() => setShowBulk(true)} style={{ padding: "12px 22px", borderRadius: 12, background: "linear-gradient(135deg,#f59e0b,#d97706)", border: "none", color: "#fff", fontFamily: "'DM Sans', sans-serif", fontSize: 13, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: 8, boxShadow: "0 2px 12px rgba(245,158,11,0.25)", transition: "transform 0.15s,box-shadow 0.15s" }}>
                <span>↑↑</span> Bulk Promote
              </button>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(140px,1fr))", gap: 12, marginBottom: 26 }}>
            <StatCard label="Total"     value={pageStats.total}     color="#f59e0b" delay={0}   />
            <StatCard label="Pending"   value={pageStats.pending}   color="#94a3b8" delay={50}  />
            <StatCard label="Promoted"  value={pageStats.promoted}  color="#f59e0b" delay={100} />
            <StatCard label="Demoted"   value={pageStats.demoted}   color="#ef4444" delay={150} />
            <StatCard label="Graduated" value={pageStats.graduated} color="#10b981" delay={200} />
            <StatCard label="Withheld"  value={pageStats.withheld}  color="#8b5cf6" delay={250} />
          </div>

          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 14, padding: "14px 18px", background: "#fff", border: "1px solid #e2e8f0", borderRadius: 14, boxShadow: "0 1px 4px rgba(0,0,0,0.04)", animation: "fadeUp 0.45s ease 0.1s both" }}>
       
            <div style={{ position: "relative", flex: "1 1 200px" }}>
              <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#94a3b8", fontSize: 13 }}>🔍</span>
              <input className="prog-filter" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Search student…" style={{ width: "100%", padding: "10px 12px 10px 32px", borderRadius: 9, background: "#f8fafc", border: "1px solid #e2e8f0", color: "#0f172a", fontSize: 13, transition: "border-color 0.15s,box-shadow 0.15s", outline: "none" }} />
            </div>

            <select className="prog-filter" value={filterClass} onChange={e => handleFilterChange("class", e.target.value)} style={{ padding: "10px 12px", borderRadius: 9, background: "#f8fafc", border: "1px solid #e2e8f0", color: filterClass ? "#0f172a" : "#94a3b8", fontSize: 13, cursor: "pointer", outline: "none", transition: "border-color 0.15s" }}>
              <option value="">All Classes</option>
              {Classes.length === 0 && (
                    <option disabled>No classes available</option>
                )}
                {Classes.map((t) => (
                    <option key={t.id} value={t.class_name}>
                    {t.class_name}
                    {t.teacher_name ? ` — ${t.teacher_name}` : " (No Teacher)"}
                    </option>
                ))}
            </select>
            <select className="prog-filter" value={filterYear} onChange={e => handleFilterChange("academic_year", e.target.value)} style={{ padding: "10px 12px", borderRadius: 9, background: "#f8fafc", border: "1px solid #e2e8f0", color: filterClass ? "#0f172a" : "#94a3b8", fontSize: 13, cursor: "pointer", outline: "none", transition: "border-color 0.15s" }}>
              <option value="">All Academic Year</option>
              {Classes.length === 0 && (
                    <option disabled>No academic year available</option>
                )}
                {filterYearList.map((year) => (
                    <option key={year.id} value={year.year_name}>
                    {year.year_name}
                    </option>
                ))}
            </select>

            <select className="prog-filter" value={filterStatus} onChange={e => handleFilterChange("status", e.target.value)} style={{ padding: "10px 12px", borderRadius: 9, background: "#f8fafc", border: "1px solid #e2e8f0", color: filterStatus ? "#0f172a" : "#94a3b8", fontSize: 13, cursor: "pointer", outline: "none", transition: "border-color 0.15s" }}>
              <option value="">All Statuses</option>
              {(Object.keys(STATUS_META) as ProgressionStatus[]).map(s => <option key={s} value={s}>{STATUS_META[s].label}</option>)}
            </select>

                

            {hasActiveFilters && (
              <button onClick={handleClearFilters} style={{ padding: "10px 14px", borderRadius: 9, background: "#fff5f5", border: "1px solid #fecaca", color: "#ef4444", fontSize: 12, cursor: "pointer", fontWeight: 500, whiteSpace: "nowrap" }}>✕ Clear</button>
            )}
          </div>

          <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 16, overflow: "hidden", boxShadow: "0 1px 8px rgba(0,0,0,0.05)", animation: "fadeUp 0.45s ease 0.2s both" }}>


            {!filterYear || !filterClass ? (
                <div className="p-10 text-center bg-gray-50 border-2 border-dashed rounded-lg">
                    <h3 className="text-lg font-semibold text-gray-600">Promotion Manager</h3>
                    <p className="text-gray-500">Please select an Academic Year and Class to begin.</p>
                </div>
                ) : (
            <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr 1fr 80px", padding: "12px 24px", background: "#f8fafc", borderBottom: "1px solid #e2e8f0" }}>
              {["Student", "Year", "From", "To", "Status", ""].map((h, i) => (
                <span key={i} style={{ fontSize: 10, color: "#94a3b8", letterSpacing: "0.1em", textTransform: "uppercase", fontWeight: 600 }}>{h}</span>
              ))}
            </div>
                            )}
                

            {filterYear && filterClass && isLoading && Array.from({ length: PAGE_SIZE }).map((_, i) => <SkeletonRow key={i} />)}

            {!isLoading && records.length === 0 && (
              <div style={{ padding: "56px 24px", textAlign: "center" }}>
                <p style={{ fontSize: 26, marginBottom: 8 }}>⊘</p>
                <p style={{ fontSize: 14, color: "#94a3b8" }}>No records match your filters</p>
                {hasActiveFilters && <button onClick={handleClearFilters} style={{ marginTop: 12, padding: "8px 16px", borderRadius: 8, background: "#f8fafc", border: "1px solid #e2e8f0", color: "#64748b", fontSize: 12, cursor: "pointer" }}>Clear filters</button>}
              </div>
            )}

            {!isLoading && records.map((r, i) => (
              <div key={i} className="prog-row" style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr 1fr 80px", padding: "15px 24px", borderBottom: "1px solid #f1f5f9", alignItems: "center", transition: "background 0.12s", animation: `fadeUp 0.35s ease ${i * 28}ms both` }}>
                <div>
                  <p style={{ fontSize: 14, color: "#1e293b", fontWeight: 500, margin: 0 }}>{r.student_name}</p>
                  {r.remarks && <p style={{ fontSize: 11, color: "#94a3b8", marginTop: 2, maxWidth: 220, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.remarks}</p>}
                </div>
                <span style={{ fontSize: 13, color: "#64748b" }}>{r.academic_year}</span>
                <span style={{ fontSize: 13, color: "#64748b" }}>{r.from_class}</span>
                <span style={{ fontSize: 13, color: r.to_class ? "#1e293b" : "#cbd5e1" }}>
                  {r.to_class ?? (r.status === "graduated" ? "—" : r.status === "withheld" ? r.from_class : "—")}
                </span>
                <StatusBadge status={r.status} />
                <button className="prog-action" onClick={() => setEditingRecord(r)} style={{ padding: "7px 14px", borderRadius: 8, cursor: "pointer", background: "#f8fafc", border: "1px solid #e2e8f0", color: "#64748b", fontSize: 12, fontFamily: "'DM Sans', sans-serif", transition: "all 0.15s" }}>Edit</button>
              </div>
            ))}

     
            <div style={{ padding: "11px 24px", borderTop: "1px solid #f1f5f9", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
              <span style={{ fontSize: 12, color: "#94a3b8" }}>
                Page {currentPage} of {totalPages || 1} · {totalResults} total records
              </span>
              <div style={{ display: "flex", gap: 12 }}>
                {(Object.keys(STATUS_META) as ProgressionStatus[]).map(s => {
                  const count = records.filter(r => r.status === s).length;
                  return count ? <span key={s} style={{ fontSize: 11, color: STATUS_META[s].color, fontWeight: 500 }}>{STATUS_META[s].icon} {count}</span> : null;
                })}
              </div>
            </div>
          </div>

          {totalPages > 1 && (
            <div style={{ marginTop: 14 }}>
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
                totalResults={totalResults}
                resultsPerPage={PAGE_SIZE}
              />
            </div>
          )}

        </div>
      </div>

      {editingRecord && <EditModal record={editingRecord} onClose={() => setEditingRecord(null)} onSave={handleUpdate}classRecord={Classes} />}
      {showBulk && <BulkModal records={records} onClose={() => setShowBulk(false)} onConfirm={handleBulkPromote} year={filterYear} />}

      {toast && (
        <div style={{ position: "fixed", bottom: 26, right: 26, zIndex: 2000, display: "flex", alignItems: "center", gap: 10, padding: "13px 18px", borderRadius: 12, background: "#fff", border: `1px solid ${toast.type === "success" ? "#bbf7d0" : "#fecaca"}`, color: toast.type === "success" ? "#059669" : "#dc2626", fontSize: 13, fontFamily: "'DM Sans', sans-serif", fontWeight: 500, animation: "toastIn 0.3s cubic-bezier(.16,1,.3,1)", boxShadow: "0 8px 24px rgba(0,0,0,0.1)" }}>
          <span style={{ fontSize: 15 }}>{toast.type === "success" ? "✓" : "✕"}</span>
          {toast.msg}
        </div>
      )}
    </>
  );
}
