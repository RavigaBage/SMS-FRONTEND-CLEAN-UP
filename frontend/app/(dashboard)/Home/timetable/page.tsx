"use client";

import { useState, useRef, useEffect } from "react";
import Dropdown from "@/components/ui/dropdown";
import DropdownYear from "@/components/ui/dropdown_yr";
import Popup from "@/components/ui/Popup";
import DeletePopup from "@/components/ui/deletepopup";
import "@/styles/timetable.css";
import { fetchWithAuth } from "@/src/lib/apiClient";
import { Pencil, Trash2 } from "lucide-react";

type TermOption     = { class_id: number; class_name: string; id: number; };
type Teacher        = { id: number; first_name: string; last_name: string; };
type Subject        = { id: number; subject_name: string; subject_code: string; };
type Class          = { id: number; class_name: string; };
type TimetableEntry = {
  id: number; class_obj?: Class | null; subject?: Subject | null;
  teacher?: Teacher | null; day_of_week?: string | null;
  start_time?: string | null; end_time?: string | null; room_number?: string | null;
};
type Option = { class_id: number; class_name: string; id: number; };

/* ── Extra CSS (loader + continuation cards) ────────────────────────────── */
const extraCss = `
@keyframes tt-spin     { to { transform: rotate(360deg); } }
@keyframes tt-fade-in  { from { opacity:0; } to { opacity:1; } }
@keyframes tt-slide-up { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:translateY(0); } }

/* LOADER OVERLAY */
.tt-loader-overlay {
  position: absolute; inset: 0; z-index: 20;
  background: rgba(248,250,252,.85);
  backdrop-filter: blur(4px);
  display: flex; flex-direction: column;
  align-items: center; justify-content: center; gap: 12px;
  animation: tt-fade-in .2s ease;
  pointer-events: all;
}
.tt-loader-ring {
  width: 46px; height: 46px;
  border: 3.5px solid #e2e8f0;
  border-top-color: #6366f1;
  border-radius: 50%;
  animation: tt-spin .7s linear infinite;
}
.tt-loader-label {
  font-size: 14px; font-weight: 700; color: #4f46e5;
  animation: tt-slide-up .25s ease;
}
.tt-loader-sub {
  font-size: 11px; color: #94a3b8; margin-top: -8px;
  animation: tt-slide-up .3s ease;
}

/* CONTINUATION card (entry spills into next hour row) */
.card.is-continuation {
  opacity: .5;
  pointer-events: none;
  border-style: dashed !important;
}
.card.is-continuation .slot_options { display: none !important; }
.tt-cont-label {
  display: flex; align-items: center; justify-content: center;
  gap: 5px; height: 100%; font-size: 11px; font-weight: 600;
  opacity: .8; font-style: italic;
}
`;

/* ── Row definitions: hour string or break marker ─────────────────────── */
const ROWS: { type: "time" | "break"; hour?: string; label?: string; breakText?: string }[] = [
  { type: "time",  hour: "07", label: "07:00" },
  { type: "time",  hour: "08", label: "08:00" },
  { type: "time",  hour: "09", label: "09:00" },
  { type: "break", breakText: "☕  RECESS BREAK" },
  { type: "time",  hour: "10", label: "10:00" },
  { type: "time",  hour: "11", label: "11:00" },
  { type: "time",  hour: "12", label: "12:00" },
  { type: "time",  hour: "13", label: "13:00" },
  { type: "break", breakText: "🍽  LUNCH BREAK"  },
  { type: "time",  hour: "14", label: "14:00" },
  { type: "time",  hour: "15", label: "15:00" },
  { type: "time",  hour: "16", label: "16:00" },
  { type: "time",  hour: "17", label: "17:00" },
];

export default function Home() {
  const [classList,        setClassList]        = useState<Option[]>([]);
  const [TermList,         setTermList]          = useState<TermOption[]>([]);
  const [active,           setActive]            = useState(false);
  const [showDelete,       setShowDelete]        = useState(false);
  const [pendingDeleteId,  setPendingDeleteId]   = useState<number | null>(null);
  const [Updating,         setUpdate]            = useState<any>(false);
  const [timetableData,    setTimetableData]     = useState<TimetableEntry[]>([]);
  const [loading,          setLoading]           = useState(false);  // ← loader state
  const boxRef = useRef<HTMLDivElement | null>(null);

  const InitialData = {
    schoolClass: "", term: "", weekdays: "", timeSlots: "", roomNumber: "",
    teachingAssignment: "", status: "", teachers: "", day_of_week: "",
    subjects: "", year: "", academic_year: "", class_id: "",
  };
  const [formData, setFormData] = useState<Record<string, any>>(InitialData);

  const updateFormField = (field: string, value: any) => {
    const fieldMap: Record<string, string> = { year: "academic_year", schoolClass: "class_id" };
    const mappedField   = fieldMap[field] ?? field;
    const resolvedValue = typeof value === "object" && value !== null && "id" in value
      ? (value as { id: number | string }).id : value ?? "";
    setFormData(prev => ({
      ...prev,
      [mappedField]: resolvedValue,
      ...(mappedField === "subject" ? { subject_id: resolvedValue } : {}),
      ...(mappedField === "teacher" ? { teacher_id: resolvedValue } : {}),
    }));
  };

  useEffect(() => {
    (async () => {
      try {
        const classRes  = await fetchWithAuth(`${process.env.NEXT_PUBLIC_API_URL}/classes/`, { method: "GET", headers: { "Content-Type": "application/json" } });
        const classData = await classRes.json();
        if (classRes.ok) {
          const list = classData.results || classData;
          if (Array.isArray(list)) setClassList(list);
        }
        setTermList([
          { id: 1, class_id: 1, class_name: "First Term"  },
          { id: 2, class_id: 2, class_name: "Second Term" },
          { id: 3, class_id: 3, class_name: "Third Term"  },
        ]);
      } catch (err) { console.error("Error fetching data:", err); }
    })();
  }, []);

  const handleDelete = async (id: number) => {
    try {
      const res = await fetchWithAuth(`${process.env.NEXT_PUBLIC_API_URL}/timetable/${id}/`, { method: "DELETE", headers: { "Content-Type": "application/json" } });
      if (res.ok) {
        setTimetableData(prev => prev.filter(i => i.id !== id));
        setShowDelete(false); setPendingDeleteId(null);
      } else {
        const data = await res.json();
        alert(`Failed to delete: ${data.detail || "Unknown error"}`);
      }
    } catch (err) { console.error("Delete failed", err); alert("Error deleting the entry."); }
  };

  const MiddlewareDel = (id: number) => { setPendingDeleteId(id); setShowDelete(true); };
  const closePopup    = () => { setActive(false); setUpdate(false); };

  const openCreatePopup = (dayOfWeek: string) => {
    if (!formData.class_id || !formData.term || !formData.academic_year) {
      alert("Please select class, term, and year before adding a new timetable entry.");
      return;
    }
    setUpdate(false);
    setFormData(prev => ({ ...InitialData, class_id: prev.class_id, term: prev.term, academic_year: prev.academic_year, day_of_week: dayOfWeek }));
    setActive(true);
  };

  const openEditPopup = (entry: TimetableEntry) => {
    setUpdate(entry.id);
    setFormData(prev => ({
      ...InitialData,
      class_id:      entry.class_obj?.id ?? prev.class_id ?? "",
      term:          (entry as any)?.term ?? prev.term ?? "",
      academic_year: (entry as any)?.academic_year ?? prev.academic_year ?? "",
      day_of_week:   entry.day_of_week ?? "",
      start_time:    entry.start_time  ?? "",
      end_time:      entry.end_time    ?? "",
      room_number:   entry.room_number ?? "",
      subject:       entry.subject?.id ?? "",
      subject_id:    entry.subject?.id ?? "",
      teacher:       entry.teacher?.id ?? "",
      teacher_id:    entry.teacher?.id ?? "",
    }));
    setActive(true);
  };

  const fetchTimetable = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (formData.class_id)     params.append("class_id",     String(formData.class_id));
      if (formData.term)          params.append("term",          String(formData.term));
      if (formData.academic_year) params.append("academic_year", String(formData.academic_year));
      const url      = `${process.env.NEXT_PUBLIC_API_URL}/timetable/${params.toString() ? `?${params}` : ""}`;
      const response = await fetchWithAuth(url);
      if (!response.ok) { console.error("Failed to fetch timetable"); return; }
      const data     = await response.json();
      const safeData = Array.isArray(data?.results) ? data.results : Array.isArray(data) ? data : [];
      setTimetableData(safeData);
    } catch (err) { console.error("Error fetching timetable:", err); setTimetableData([]); }
    finally { setLoading(false); }
  };

  const weekdays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

  /* ── Time-span aware slot lookup ────────────────────────────────────────
   *
   * An entry whose start_time="07:30" end_time="09:00" will appear in
   * both the "07" row (as the main card) and the "08" row (as a faded
   * continuation card), because it occupies that hour slot.
   *
   * Overlap rule: entry overlaps slot [H, H+1) when
   *   startDecimal < H+1  AND  endDecimal > H
   * ──────────────────────────────────────────────────────────────────────*/
  function getSlotsForDay(
    data: TimetableEntry[],
    day: string,
    hour: string,
  ): { entry: TimetableEntry; isContinuation: boolean }[] {
    if (!Array.isArray(data)) return [];

    const slotH = parseInt(hour, 10);

    return data
      .filter(e => e?.day_of_week === day && e?.start_time)
      .flatMap(e => {
        const [startH, startM] = e.start_time!.split(":").map(Number);

        // If no end_time, assume 1-hour duration
        let endH = startH + 1, endM = startM;
        if (e.end_time) [endH, endM] = e.end_time.split(":").map(Number);

        const startDec = startH + startM / 60;
        const endDec   = endH   + endM   / 60;

        // Does this entry touch the [slotH, slotH+1) window?
        if (startDec < slotH + 1 && endDec > slotH) {
          return [{ entry: e, isContinuation: startH !== slotH }];
        }
        return [];
      });
  }

  /* ── Card / empty cell renderer ─────────────────────────────────────── */
  function TimetableDiv(
    matches: { entry: TimetableEntry; isContinuation: boolean }[],
    index = 0,
  ) {
    const colorIndex = (index * 7) % 10;
    const first = matches[0];

    if (!first) {
      return (
        <div className="grid_feild">
          <div
            className="card empty"
            onClick={() => {
              if (!formData.class_id || !formData.term || !formData.academic_year) {
                alert("Please select class, term, and year first.");
                return;
              }
              openCreatePopup(weekdays[index]);
            }}
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <circle cx="9" cy="9" r="8" stroke="currentColor" strokeWidth="1.4" strokeDasharray="3 2"/>
              <path d="M9 5.5v7M5.5 9h7" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
            </svg>
          </div>
        </div>
      );
    }

    const { entry, isContinuation } = first;

    return (
      <div className="grid_feild">
        <div className={`card${isContinuation ? " is-continuation" : ""}`} data-color={colorIndex}>
          {isContinuation ? (
            /* Faded continuation row — subject name + arrow only */
            <div className="tt-cont-label">
              <svg width="10" height="12" viewBox="0 0 10 12" fill="none">
                <path d="M5 1v10M2 8l3 3 3-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              {entry.subject?.subject_name ?? "Continued"}
            </div>
          ) : (
            <>
              <div className="slot_title">
                <h1>{entry.subject?.subject_name ?? "No Subject"}</h1>
              </div>
              <div className="slot_assigned">
                <p>
                  {entry.teacher
                    ? `${entry.teacher.last_name ?? ""} ${entry.teacher.first_name ?? ""}`
                    : "No Teacher"}
                </p>
              </div>
              <div className="slot_location">{entry.room_number ?? "No Room"}</div>
              <div className="slot_options">
                <div className="item_" title="Delete" onClick={() => entry.id && MiddlewareDel(entry.id)}>
                  <Trash2 size={14} />
                </div>
                <div className="item_" title="Edit" onClick={() => entry.id && openEditPopup(entry)}>
                  <Pencil size={14} />
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="app timetableApp">
      <style>{extraCss}</style>

      <main className="main">
        <header className="header">
          <div>
            <h1>Timetable Management</h1>
            <p>Class Schedule · Grade 10A · Term 1, 2024</p>
          </div>
          <div className="actions">
            <button className="btn primary">Save Changes</button>
          </div>
        </header>

        <section className="filters">
          <Dropdown options={classList}  placeholder="Select class" fieldName="schoolClass" setFormData={updateFormField} />
          <Dropdown options={TermList}   placeholder="Select term"  fieldName="term"        setFormData={updateFormField} />
          <DropdownYear                  placeholder="Select year"  fieldName="year"        setFormData={updateFormField} />
          <div className="chips">
            <span
              className="chip active"
              onClick={!loading ? fetchTimetable : undefined}
              style={{ opacity: loading ? .6 : 1, cursor: loading ? "not-allowed" : "pointer", display: "flex", alignItems: "center", gap: 7 }}
            >
              {loading && (
                <svg width="13" height="13" viewBox="0 0 13 13" fill="none" style={{ animation: "tt-spin .7s linear infinite", flexShrink: 0 }}>
                  <circle cx="6.5" cy="6.5" r="5.5" stroke="currentColor" strokeWidth="1.8" strokeDasharray="20 14"/>
                </svg>
              )}
              {loading ? "Loading…" : "Load table"}
            </span>
          </div>
        </section>

        <div className="content">
          <section className="timetable">
            <div className="grid-header">
              <span></span>
              <span>Monday</span><span>Tuesday</span><span>Wednesday</span>
              <span>Thursday</span><span>Friday</span>
            </div>

            {/* position:relative so the loader overlay is scoped to the grid */}
            <div className="grid" ref={boxRef} style={{ position: "relative" }}>

              {/* ── LOADER OVERLAY ── */}
              {loading && (
                <div className="tt-loader-overlay">
                  <div className="tt-loader-ring" />
                  <div className="tt-loader-label">Loading timetable…</div>
                  <div className="tt-loader-sub">Fetching schedule data</div>
                </div>
              )}

              <Popup
                active={active} togglePopup={closePopup} setUpdating={Updating}
                formData={formData} fieldNames={["weekdays","timeSlots","teachers","subjects"]}
                setFormData={updateFormField}
                onSuccess={() => { setActive(false); fetchTimetable(); }}
              />
              <DeletePopup
                isOpen={showDelete}
                onClose={() => { setShowDelete(false); setPendingDeleteId(null); }}
                onConfirm={() => { if (pendingDeleteId !== null) handleDelete(pendingDeleteId); }}
              />

              {/* ── ROWS (07:00 – 17:00 with two break banners) ── */}
              {ROWS.map((row, ri) => {
                if (row.type === "break") {
                  return <div key={`break-${ri}`} className="break">{row.breakText}</div>;
                }
                return (
                  <div key={row.hour} style={{ display: "contents" }}>
                    <div className="time">{row.label}</div>
                    {weekdays.map((day, index) => (
                      <div key={`${row.hour}-${day}`}>
                        {TimetableDiv(getSlotsForDay(timetableData, day, row.hour!), index)}
                      </div>
                    ))}
                  </div>
                );
              })}

            </div>
          </section>
        </div>
      </main>
    </div>
  );
}