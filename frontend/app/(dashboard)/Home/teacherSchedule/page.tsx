"use client";

import { useEffect, useState, useCallback } from "react";
import { apiRequest } from "@/src/lib/apiClient";

interface TimetableEntry {
  id: number;
  day_of_week: string;
  start_time: string;
  end_time: string;
  room_number: string;
  term: string;
  academic_year: string;
  subject: { id: number; name: string; code?: string };
  class_obj: { id: number; class_name: string };
  teacher: { id: number; first_name: string; last_name: string } | null;
}


const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

const SUBJECT_COLORS = [
  { bg: "#fef3c7", border: "#f59e0b", text: "#92400e", dot: "#f59e0b" },
  { bg: "#dbeafe", border: "#3b82f6", text: "#1e40af", dot: "#3b82f6" },
  { bg: "#dcfce7", border: "#22c55e", text: "#166534", dot: "#22c55e" },
  { bg: "#fce7f3", border: "#ec4899", text: "#9d174d", dot: "#ec4899" },
  { bg: "#ede9fe", border: "#8b5cf6", text: "#5b21b6", dot: "#8b5cf6" },
  { bg: "#ffedd5", border: "#f97316", text: "#9a3412", dot: "#f97316" },
  { bg: "#cffafe", border: "#06b6d4", text: "#164e63", dot: "#06b6d4" },
  { bg: "#f0fdf4", border: "#10b981", text: "#064e3b", dot: "#10b981" },
];

const subjectColor = (subjectId: number) =>
  SUBJECT_COLORS[subjectId % SUBJECT_COLORS.length];

const fmtTime = (t: string) => {
  const [h, m] = t.split(":").map(Number);
  const ampm = h >= 12 ? "PM" : "AM";
  const hour = h % 12 || 12;
  return `${hour}:${String(m).padStart(2, "0")} ${ampm}`;
};

const fmtDuration = (start: string, end: string) => {
  const [sh, sm] = start.split(":").map(Number);
  const [eh, em] = end.split(":").map(Number);
  const mins = eh * 60 + em - (sh * 60 + sm);
  return mins >= 60
    ? `${Math.floor(mins / 60)}h${mins % 60 ? ` ${mins % 60}m` : ""}`
    : `${mins}m`;
};

const isNowInSlot = (day: string, start: string, end: string) => {
  const now = new Date();
  const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  if (days[now.getDay()] !== day) return false;
  const [sh, sm] = start.split(":").map(Number);
  const [eh, em] = end.split(":").map(Number);
  const nowMins = now.getHours() * 60 + now.getMinutes();
  return nowMins >= sh * 60 + sm && nowMins < eh * 60 + em;
};


function SessionCard({ entry, index }: { entry: TimetableEntry; index: number }) {
  const color = subjectColor(entry.subject.id);
  const isLive = isNowInSlot(entry.day_of_week, entry.start_time, entry.end_time);

  return (
    <div
      style={{
        background: color.bg,
        border: `1.5px solid ${color.border}`,
        borderRadius: 12,
        padding: "12px 14px",
        marginBottom: 8,
        position: "relative",
        animation: `cardIn 0.4s ease ${index * 60}ms both`,
        transition: "transform 0.15s, box-shadow 0.15s",
        cursor: "default",
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)";
        (e.currentTarget as HTMLElement).style.boxShadow = `0 6px 20px ${color.border}33`;
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
        (e.currentTarget as HTMLElement).style.boxShadow = "none";
      }}
    >
      {isLive && (
        <div style={{
          position: "absolute", top: 10, right: 10,
          display: "flex", alignItems: "center", gap: 4,
          background: "#dcfce7", border: "1px solid #86efac",
          borderRadius: 20, padding: "2px 8px",
        }}>
          <div style={{
            width: 6, height: 6, borderRadius: "50%", background: "#22c55e",
            animation: "pulse 1.5s infinite",
          }} />
          <span style={{ fontSize: 9, fontWeight: 700, color: "#166534", textTransform: "uppercase", letterSpacing: "0.06em" }}>Live</span>
        </div>
      )}
      <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 6 }}>
        <div style={{ width: 8, height: 8, borderRadius: "50%", background: color.dot, flexShrink: 0 }} />
        <span style={{ fontSize: 13, fontWeight: 700, color: color.text, lineHeight: 1.2 }}>
          {entry.subject.name}
        </span>
        {entry.subject.code && (
          <span style={{ fontSize: 10, color: color.text, opacity: 0.6, fontWeight: 500 }}>
            {entry.subject.code}
          </span>
        )}
      </div>

      <div style={{ fontSize: 12, color: color.text, opacity: 0.8, marginBottom: 8, fontWeight: 500 }}>
        {entry.class_obj.class_name}
      </div>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
          <span style={{ fontSize: 11, color: color.text, fontWeight: 600, opacity: 0.9 }}>
            {fmtTime(entry.start_time)} – {fmtTime(entry.end_time)}
          </span>
        </div>
        <span style={{
          fontSize: 10, fontWeight: 700, color: color.text,
          background: `${color.border}22`, padding: "2px 7px", borderRadius: 20,
        }}>
          {fmtDuration(entry.start_time, entry.end_time)}
        </span>
      </div>

      {entry.room_number && (
        <div style={{ marginTop: 6, fontSize: 10, color: color.text, opacity: 0.65, fontWeight: 500 }}>
          📍 {entry.room_number}
        </div>
      )}
    </div>
  );
}

function EmptyDay() {
  return (
    <div style={{
      border: "1.5px dashed #e2e8f0", borderRadius: 12,
      padding: "20px 14px", textAlign: "center",
    }}>
      <div style={{ fontSize: 18, marginBottom: 4, opacity: 0.3 }}>—</div>
      <span style={{ fontSize: 11, color: "#cbd5e1", fontWeight: 500 }}>No classes</span>
    </div>
  );
}

export default function TeacherSchedulePage() {
  const [entries, setEntries] = useState<TimetableEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterTerm, setFilterTerm] = useState("");
  const [filterYear, setFilterYear] = useState("");
  const [viewMode, setViewMode] = useState<"week" | "list">("week");

  const terms = [...new Set(entries.map((e) => e.term).filter(Boolean))];
  const years = [...new Set(entries.map((e) => e.academic_year).filter(Boolean))];

  const fetchSchedule = useCallback(async () => {
    const teacherId = localStorage.getItem("teacherId");
    if (!teacherId) {
      setError("Teacher profile not found. Please log in again.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({ teacher_id: teacherId });
      if (filterTerm) params.append("term", filterTerm);
      if (filterYear) params.append("academic_year", filterYear);

      const res = await apiRequest<any>(
        `/timetable/teacher_schedule/?${params.toString()}`,
      );

      const data: TimetableEntry[] = Array.isArray(res)
        ? res
        : Array.isArray(res?.data)
          ? res.data
          : Array.isArray(res?.results)
            ? res.results
            : [];

      setEntries(data);
    } catch (err: any) {
      setError(err?.detail || err?.message || "Failed to load schedule.");
    } finally {
      setLoading(false);
    }
  }, [filterTerm, filterYear]);

  useEffect(() => {
    fetchSchedule();
  }, [fetchSchedule]);

  const byDay = DAYS.reduce<Record<string, TimetableEntry[]>>((acc, day) => {
    acc[day] = entries
      .filter((e) => e.day_of_week === day)
      .sort((a, b) => a.start_time.localeCompare(b.start_time));
    return acc;
  }, {});

  const todayName = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"][
    new Date().getDay()
  ];

  const totalPeriods = entries.length;
  const totalMins = entries.reduce((sum, e) => {
    const [sh, sm] = e.start_time.split(":").map(Number);
    const [eh, em] = e.end_time.split(":").map(Number);
    return sum + (eh * 60 + em - (sh * 60 + sm));
  }, 0);
  const uniqueSubjects = new Set(entries.map((e) => e.subject.id)).size;
  const uniqueClasses = new Set(entries.map((e) => e.class_obj.id)).size;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap');

        @keyframes cardIn {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; } to { opacity: 1; }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; } 50% { opacity: 0.4; }
        }
        @keyframes shimmer {
          0%   { background-position: -400px 0; }
          100% { background-position: 400px 0; }
        }

        .sched-day-col:hover .sched-day-header { background: #f1f5f9; }
        .filter-select:focus { outline: none; border-color: #6366f1 !important; box-shadow: 0 0 0 3px rgba(99,102,241,0.1) !important; }
        .view-btn:hover { background: #f1f5f9 !important; }
        .view-btn.active { background: #0f172a !important; color: white !important; }

        ::-webkit-scrollbar { width: 5px; }
        ::-webkit-scrollbar-track { background: #f8fafc; }
        ::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
      `}</style>

      <div style={{
        minHeight: "100vh",
        background: "#f8fafc",
        fontFamily: "'Sora', sans-serif",
        padding: "32px 24px",
      }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>

          <div style={{ marginBottom: 28, animation: "fadeIn 0.4s ease" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
              <div style={{ width: 3, height: 18, background: "#6366f1", borderRadius: 2 }} />
              <span style={{ fontSize: 10, color: "#94a3b8", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.12em" }}>
                My Teaching Schedule
              </span>
            </div>
            <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
              <div>
                <h1 style={{ fontSize: 30, fontWeight: 800, color: "#0f172a", margin: 0, letterSpacing: "-0.02em" }}>
                  Weekly Timetable
                </h1>
                <p style={{ fontSize: 13, color: "#64748b", margin: "4px 0 0", fontWeight: 400 }}>
                  {new Date().toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
                </p>
              </div>

              <div style={{ display: "flex", background: "white", border: "1.5px solid #e2e8f0", borderRadius: 10, padding: 3, gap: 2 }}>
                {(["week", "list"] as const).map((mode) => (
                  <button key={mode} className={`view-btn ${viewMode === mode ? "active" : ""}`}
                    onClick={() => setViewMode(mode)}
                    style={{
                      padding: "7px 16px", borderRadius: 8, border: "none", cursor: "pointer",
                      fontSize: 12, fontWeight: 600, fontFamily: "'Sora', sans-serif",
                      background: viewMode === mode ? "#0f172a" : "transparent",
                      color: viewMode === mode ? "white" : "#64748b",
                      transition: "all 0.15s", textTransform: "capitalize",
                    }}>
                    {mode === "week" ? "⊞ Week" : "☰ List"}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {!loading && (
            <div style={{
              display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))",
              gap: 12, marginBottom: 24, animation: "fadeIn 0.4s ease 0.1s both",
            }}>
              {[
                { label: "Total Periods", value: totalPeriods, icon: "📚" },
                { label: "Teaching Hours", value: `${Math.floor(totalMins / 60)}h ${totalMins % 60}m`, icon: "⏱" },
                { label: "Subjects", value: uniqueSubjects, icon: "📖" },
                { label: "Classes", value: uniqueClasses, icon: "🏫" },
              ].map(({ label, value, icon }) => (
                <div key={label} style={{
                  background: "white", border: "1.5px solid #e2e8f0", borderRadius: 12,
                  padding: "14px 16px",
                }}>
                  <div style={{ fontSize: 18, marginBottom: 6 }}>{icon}</div>
                  <div style={{ fontSize: 20, fontWeight: 800, color: "#0f172a", lineHeight: 1 }}>{value}</div>
                  <div style={{ fontSize: 10, color: "#94a3b8", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", marginTop: 4 }}>{label}</div>
                </div>
              ))}
            </div>
          )}

          <div style={{
            display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 20,
            padding: "12px 16px", background: "white", border: "1.5px solid #e2e8f0", borderRadius: 12,
          }}>
            <select className="filter-select" value={filterTerm} onChange={(e) => setFilterTerm(e.target.value)}
              style={{ padding: "8px 12px", borderRadius: 8, border: "1.5px solid #e2e8f0", fontSize: 12, fontFamily: "'Sora', sans-serif", color: filterTerm ? "#0f172a" : "#94a3b8", background: "#f8fafc", cursor: "pointer", transition: "border-color 0.15s" }}>
              <option value="">All Terms</option>
              {terms.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>

            <select className="filter-select" value={filterYear} onChange={(e) => setFilterYear(e.target.value)}
              style={{ padding: "8px 12px", borderRadius: 8, border: "1.5px solid #e2e8f0", fontSize: 12, fontFamily: "'Sora', sans-serif", color: filterYear ? "#0f172a" : "#94a3b8", background: "#f8fafc", cursor: "pointer", transition: "border-color 0.15s" }}>
              <option value="">All Years</option>
              {years.map((y) => <option key={y} value={y}>{y}</option>)}
            </select>

            {(filterTerm || filterYear) && (
              <button onClick={() => { setFilterTerm(""); setFilterYear(""); }}
                style={{ padding: "8px 12px", borderRadius: 8, background: "#fff5f5", border: "1px solid #fecaca", color: "#ef4444", fontSize: 11, fontWeight: 600, cursor: "pointer", fontFamily: "'Sora', sans-serif" }}>
                ✕ Clear
              </button>
            )}

            <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 6 }}>
              <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#22c55e", animation: "pulse 2s infinite" }} />
              <span style={{ fontSize: 11, color: "#64748b", fontWeight: 500 }}>
                {todayName} is today
              </span>
            </div>
          </div>

          {error && (
            <div style={{ background: "#fff5f5", border: "1.5px solid #fecaca", borderRadius: 12, padding: "14px 18px", marginBottom: 20, color: "#dc2626", fontSize: 13, fontWeight: 500 }}>
              ⚠ {error}
            </div>
          )}

          {loading && (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 12 }}>
              {DAYS.map((day) => (
                <div key={day} style={{ background: "white", border: "1.5px solid #e2e8f0", borderRadius: 14, overflow: "hidden" }}>
                  <div style={{ height: 40, background: "#f8fafc", borderBottom: "1px solid #e2e8f0" }} />
                  {[1, 2].map((i) => (
                    <div key={i} style={{ margin: 10, height: 80, borderRadius: 10, background: "linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%)", backgroundSize: "400px 100%", animation: "shimmer 1.4s infinite" }} />
                  ))}
                </div>
              ))}
            </div>
          )}

          {!loading && !error && viewMode === "week" && (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 12, animation: "fadeIn 0.4s ease" }}>
              {DAYS.map((day) => {
                const daySessions = byDay[day] ?? [];
                const isToday = day === todayName;
                return (
                  <div key={day} className="sched-day-col" style={{
                    background: "white",
                    border: isToday ? "2px solid #6366f1" : "1.5px solid #e2e8f0",
                    borderRadius: 14,
                    overflow: "hidden",
                    boxShadow: isToday ? "0 4px 20px rgba(99,102,241,0.12)" : "none",
                  }}>
                    <div className="sched-day-header" style={{
                      padding: "12px 14px",
                      borderBottom: "1px solid #f1f5f9",
                      background: isToday ? "rgba(99,102,241,0.06)" : "#fafafa",
                      transition: "background 0.15s",
                    }}>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                        <span style={{ fontSize: 12, fontWeight: 700, color: isToday ? "#6366f1" : "#475569", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                          {day.slice(0, 3)}
                        </span>
                        {isToday && (
                          <span style={{ fontSize: 9, fontWeight: 700, color: "#6366f1", background: "rgba(99,102,241,0.1)", padding: "2px 6px", borderRadius: 20, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                            Today
                          </span>
                        )}
                        {daySessions.length > 0 && !isToday && (
                          <span style={{ fontSize: 10, color: "#94a3b8", fontWeight: 600, fontFamily: "'JetBrains Mono', monospace" }}>
                            {daySessions.length}
                          </span>
                        )}
                      </div>
                    </div>

                    <div style={{ padding: "10px 10px 6px" }}>
                      {daySessions.length === 0 ? (
                        <EmptyDay />
                      ) : (
                        daySessions.map((entry, i) => (
                          <SessionCard key={entry.id} entry={entry} index={i} />
                        ))
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
          {!loading && !error && viewMode === "list" && (
            <div style={{ background: "white", border: "1.5px solid #e2e8f0", borderRadius: 14, overflow: "hidden", animation: "fadeIn 0.4s ease" }}>

              <div style={{ display: "grid", gridTemplateColumns: "100px 1fr 1fr 120px 80px", padding: "10px 20px", background: "#f8fafc", borderBottom: "1.5px solid #e2e8f0" }}>
                {["Day", "Subject", "Class", "Time", "Room"].map((h) => (
                  <span key={h} style={{ fontSize: 10, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.09em" }}>{h}</span>
                ))}
              </div>

              {entries.length === 0 ? (
                <div style={{ padding: "48px 20px", textAlign: "center" }}>
                  <div style={{ fontSize: 32, marginBottom: 8 }}>📅</div>
                  <p style={{ color: "#94a3b8", fontSize: 13 }}>No schedule entries found.</p>
                </div>
              ) : (
                DAYS.flatMap((day) =>
                  (byDay[day] ?? []).map((entry, i) => {
                    const color = subjectColor(entry.subject.id);
                    const isToday = day === todayName;
                    const isLive = isNowInSlot(day, entry.start_time, entry.end_time);
                    return (
                      <div key={entry.id} style={{
                        display: "grid", gridTemplateColumns: "100px 1fr 1fr 120px 80px",
                        padding: "14px 20px", borderBottom: "1px solid #f1f5f9",
                        background: isLive ? "rgba(99,102,241,0.03)" : "white",
                        animation: `cardIn 0.35s ease ${i * 40}ms both`,
                        transition: "background 0.1s",
                      }}
                        onMouseEnter={(e) => { if (!isLive) (e.currentTarget as HTMLElement).style.background = "#f8fafc"; }}
                        onMouseLeave={(e) => { if (!isLive) (e.currentTarget as HTMLElement).style.background = "white"; }}
                      >
                        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                          <span style={{ fontSize: 12, fontWeight: isToday ? 700 : 500, color: isToday ? "#6366f1" : "#64748b" }}>
                            {day.slice(0, 3)}
                          </span>
                          {isToday && <div style={{ width: 5, height: 5, borderRadius: "50%", background: "#6366f1" }} />}
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <div style={{ width: 7, height: 7, borderRadius: "50%", background: color.dot, flexShrink: 0 }} />
                          <div>
                            <div style={{ fontSize: 13, fontWeight: 600, color: "#0f172a" }}>{entry.subject.name}</div>
                            {entry.subject.code && <div style={{ fontSize: 10, color: "#94a3b8" }}>{entry.subject.code}</div>}
                          </div>
                          {isLive && (
                            <span style={{ fontSize: 9, fontWeight: 700, color: "#166534", background: "#dcfce7", border: "1px solid #86efac", padding: "2px 6px", borderRadius: 20, textTransform: "uppercase" }}>Live</span>
                          )}
                        </div>
                        <span style={{ fontSize: 13, color: "#475569", alignSelf: "center" }}>{entry.class_obj.class_name}</span>
                        <div style={{ alignSelf: "center" }}>
                          <div style={{ fontSize: 12, fontWeight: 600, color: "#0f172a", fontFamily: "'JetBrains Mono', monospace" }}>
                            {fmtTime(entry.start_time)}
                          </div>
                          <div style={{ fontSize: 11, color: "#94a3b8", fontFamily: "'JetBrains Mono', monospace" }}>
                            {fmtTime(entry.end_time)}
                          </div>
                        </div>
                        <span style={{ fontSize: 12, color: "#64748b", alignSelf: "center" }}>
                          {entry.room_number || "—"}
                        </span>
                      </div>
                    );
                  })
                )
              )}
            </div>
          )}

          {!loading && !error && entries.length === 0 && (
            <div style={{ textAlign: "center", padding: "60px 20px", background: "white", border: "1.5px solid #e2e8f0", borderRadius: 14, marginTop: 8 }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>🗓</div>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: "#0f172a", margin: "0 0 6px" }}>No schedule found</h3>
              <p style={{ fontSize: 13, color: "#94a3b8" }}>
                {filterTerm || filterYear ? "Try clearing the filters." : "No timetable entries have been assigned to you yet."}
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}