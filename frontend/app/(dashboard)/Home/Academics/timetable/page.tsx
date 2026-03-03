"use client";

import { useState, useRef, useEffect, useCallback, memo } from "react";
import Dropdown from "@/components/ui/dropdown";
import DropdownYear from "@/components/ui/dropdown_yr";
import Popup from "@/components/ui/Popup";
import DeletePopup from "@/components/ui/deletepopup";
import "@/styles/timetable.css";
import { fetchWithAuth } from "@/src/lib/apiClient";
import { ErrorMessage, extractErrorDetail } from "@/components/ui/ErrorExtract";
import { Pencil, Trash2 } from "lucide-react";

type TermOption = { class_id: number; class_name: string; id: number };
type Teacher    = { id: number; first_name: string; last_name: string };
type Subject    = { id: number; subject_name: string; subject_code: string };
type Class      = { id: number; class_name: string };
type TimetableEntry = {
  id: number;
  class_obj?:    Class   | null;
  subject?:      Subject | null;
  teacher?:      Teacher | null;
  day_of_week?:  string  | null;
  start_time?:   string  | null;
  end_time?:     string  | null;
  room_number?:  string  | null;
};
type Option = { class_id: number; class_name: string; id: number };

const extraCss = `
@keyframes tt-spin     { to { transform: rotate(360deg); } }
@keyframes tt-fade-in  { from { opacity:0; } to { opacity:1; } }
@keyframes tt-slide-up { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:translateY(0); } }

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

const ROWS: {
  type: "time" | "break";
  hour?: string;
  label?: string;
  breakText?: string;
}[] = [
  { type: "time",  hour: "07", label: "07:00" },
  { type: "time",  hour: "08", label: "08:00" },
  { type: "time",  hour: "09", label: "09:00" },
  { type: "break", breakText: "☕  RECESS BREAK" },
  { type: "time",  hour: "10", label: "10:00" },
  { type: "time",  hour: "11", label: "11:00" },
  { type: "time",  hour: "12", label: "12:00" },
  { type: "time",  hour: "13", label: "13:00" },
  { type: "break", breakText: "🍽  LUNCH BREAK" },
  { type: "time",  hour: "14", label: "14:00" },
  { type: "time",  hour: "15", label: "15:00" },
  { type: "time",  hour: "16", label: "16:00" },
  { type: "time",  hour: "17", label: "17:00" },
];

const WEEKDAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"] as const;

const TERM_LIST: TermOption[] = [
  { id: 1, class_id: 1, class_name: "First Term"  },
  { id: 2, class_id: 2, class_name: "Second Term" },
  { id: 3, class_id: 3, class_name: "Third Term"  },
];

const INITIAL_FORM = {
  schoolClass: "", term: "", weekdays: "", timeSlots: "",
  roomNumber: "", teachingAssignment: "", status: "", teachers: "",
  day_of_week: "", subjects: "", year: "", academic_year: "", class_id: "",
};

function getSlotsForDay(
  data: TimetableEntry[],
  day: string,
  hour: string,
): { entry: TimetableEntry; isContinuation: boolean }[] {
  if (!Array.isArray(data)) return [];
  const slotH = parseInt(hour, 10);

  return data
    .filter((e) => e?.day_of_week === day && e?.start_time)
    .flatMap((e) => {
      const [startH, startM] = e.start_time!.split(":").map(Number);
      let endH = startH + 1, endM = startM;
      if (e.end_time) [endH, endM] = e.end_time.split(":").map(Number);

      const startDec = startH + startM / 60;
      const endDec   = endH   + endM   / 60;

      if (startDec < slotH + 1 && endDec > slotH) {
        return [{ entry: e, isContinuation: startH !== slotH }];
      }
      return [];
    });
}

type TimetableCellProps = {
  matches:    { entry: TimetableEntry; isContinuation: boolean }[];
  colorIndex: number;
  onAdd:      () => void;
  onEdit:     (entry: TimetableEntry) => void;
  onDelete:   (id: number) => void;
};

const TimetableCell = memo(function TimetableCell({
  matches,
  colorIndex,
  onAdd,
  onEdit,
  onDelete,
}: TimetableCellProps) {
  const first = matches[0];

  if (!first) {
    return (
      <div className="grid_feild">
        <div className="card empty" onClick={onAdd}>
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <circle cx="9" cy="9" r="8" stroke="currentColor" strokeWidth="1.4" strokeDasharray="3 2" />
            <path d="M9 5.5v7M5.5 9h7" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
          </svg>
        </div>
      </div>
    );
  }

  const { entry, isContinuation } = first;

  return (
    <div className="grid_feild">
      <div
        className={`card${isContinuation ? " is-continuation" : ""}`}
        data-color={colorIndex}
      >
        {isContinuation ? (
          <div className="tt-cont-label">
            <svg width="10" height="12" viewBox="0 0 10 12" fill="none">
              <path
                d="M5 1v10M2 8l3 3 3-3"
                stroke="currentColor" strokeWidth="1.5"
                strokeLinecap="round" strokeLinejoin="round"
              />
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
              <div className="item_" title="Delete" onClick={() => entry.id && onDelete(entry.id)}>
                <Trash2 size={14} />
              </div>
              <div className="item_" title="Edit" onClick={() => entry.id && onEdit(entry)}>
                <Pencil size={14} />
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
});

export default function Timetable() {
  const [classList,    setClassList]    = useState<Option[]>([]);
  const [active,       setActive]       = useState(false);
  const [showDelete,   setShowDelete]   = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState<number | null>(null);
  const [Updating,     setUpdate]       = useState<any>(false);
  const [timetableData, setTimetableData] = useState<TimetableEntry[]>([]);
  const [loading,      setLoading]      = useState(false);
  const [pageError,    setPageError]    = useState<any>(null);
  const [formData,     setFormData]     = useState<Record<string, any>>(INITIAL_FORM);
  const boxRef = useRef<HTMLDivElement | null>(null);

  const updateFormField = useCallback((field: string, value: any) => {
    const fieldMap: Record<string, string> = {
      year:        "academic_year",
      schoolClass: "class_id",
    };
    const mappedField    = fieldMap[field] ?? field;
    const resolvedValue  =
      typeof value === "object" && value !== null && "id" in value
        ? (value as { id: number | string }).id
        : (value ?? "");

    setFormData((prev) => ({
      ...prev,
      [mappedField]: resolvedValue,
      ...(mappedField === "subject" ? { subject_id: resolvedValue } : {}),
      ...(mappedField === "teacher" ? { teacher_id: resolvedValue } : {}),
    }));
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const res  = await fetchWithAuth(`${process.env.NEXT_PUBLIC_API_URL}/classes/`, {
          method: "GET", headers: { "Content-Type": "application/json" },
        });
        const data = await res.json();
        if (res.ok) {
          const list = data.results || data;
          if (Array.isArray(list)) setClassList(list);
        }
      } catch (err) {
        console.error("Error fetching classes:", err);
      }
    })();
  }, []);

  const handleDelete = useCallback(async (id: number) => {
    try {
      setPageError(null);
      const res = await fetchWithAuth(
        `${process.env.NEXT_PUBLIC_API_URL}/timetable/${id}/`,
        { method: "DELETE", headers: { "Content-Type": "application/json" } },
      );
      if (res.ok) {
        setTimetableData((prev) => prev.filter((i) => i.id !== id));
        setShowDelete(false);
        setPendingDeleteId(null);
      } else {
        const data = await res.json();
        setPageError(extractErrorDetail(data) || "Failed to delete timetable entry.");
      }
    } catch (err) {
      setPageError(extractErrorDetail(err) || "Error deleting the entry.");
    }
  }, []);

  const openDeleteMiddleware = useCallback((id: number) => {
    setPendingDeleteId(id);
    setShowDelete(true);
  }, []);

  const closePopup = useCallback(() => {
    setActive(false);
    setUpdate(false);
  }, []);

  const openCreatePopup = useCallback((dayOfWeek: string) => {
    setFormData((prev) => {
      if (!prev.class_id || !prev.term || !prev.academic_year) {
        setPageError("Please select class, term, and year before adding a new timetable entry.");
        return prev;
      }
      return {
        ...INITIAL_FORM,
        class_id:      prev.class_id,
        term:          prev.term,
        academic_year: prev.academic_year,
        day_of_week:   dayOfWeek,
      };
    });
    setUpdate(false);
    setActive(true);
  }, []);

  const openEditPopup = useCallback((entry: TimetableEntry) => {
    setUpdate(entry.id);
    setFormData((prev) => ({
      ...INITIAL_FORM,
      class_id:      entry.class_obj?.id          ?? prev.class_id      ?? "",
      term:          (entry as any)?.term          ?? prev.term          ?? "",
      academic_year: (entry as any)?.academic_year ?? prev.academic_year ?? "",
      day_of_week:   entry.day_of_week  ?? "",
      start_time:    entry.start_time   ?? "",
      end_time:      entry.end_time     ?? "",
      room_number:   entry.room_number  ?? "",
      subject:       entry.subject?.id  ?? "",
      subject_id:    entry.subject?.id  ?? "",
      teacher:       entry.teacher?.id  ?? "",
      teacher_id:    entry.teacher?.id  ?? "",
    }));
    setActive(true);
  }, []);

  const fetchTimetable = useCallback(async () => {
    setLoading(true);
    setPageError(null);
    try {
      const params = new URLSearchParams();
      if (formData.class_id)      params.append("class_id",      String(formData.class_id));
      if (formData.term)          params.append("term",           String(formData.term));
      if (formData.academic_year) params.append("academic_year",  String(formData.academic_year));

      const url = `${process.env.NEXT_PUBLIC_API_URL}/timetable/${params.toString() ? `?${params}` : ""}`;
      const response = await fetchWithAuth(url);

      if (!response.ok) {
        const errData = await response.json().catch(() => null);
        setPageError(extractErrorDetail(errData) || "Failed to fetch timetable.");
        return;
      }

      const data     = await response.json();
      const safeData = Array.isArray(data?.results)
        ? data.results
        : Array.isArray(data) ? data : [];
      setTimetableData(safeData);
    } catch (err) {
      setPageError(extractErrorDetail(err) || "Error fetching timetable.");
      setTimetableData([]);
    } finally {
      setLoading(false);
    }
  }, [formData.class_id, formData.term, formData.academic_year]);

  return (
    <div className="app timetableApp">
      <style>{extraCss}</style>
      {pageError && <ErrorMessage errorDetail={pageError} className="m-4" />}

      <main className="main">
        <header className="header">
          <div>
            <h1>Timetable Management</h1>
            <p>Class Schedule · Grade 10A · Term 1, 2024</p>
          </div>
          <div className="actions">
            <button
              className="btn primary"
              onClick={!loading ? fetchTimetable : undefined}
              disabled={loading}
              style={{
                opacity: loading ? 0.6 : 1,
                cursor:  loading ? "not-allowed" : "pointer",
                display: "flex", alignItems: "center", gap: 7,
              }}
            >
              {loading && (
                <svg
                  width="13" height="13" viewBox="0 0 13 13" fill="none"
                  style={{ animation: "tt-spin .7s linear infinite", flexShrink: 0 }}
                >
                  <circle cx="6.5" cy="6.5" r="5.5" stroke="currentColor" strokeWidth="1.8" strokeDasharray="20 14" />
                </svg>
              )}
              {loading ? "Loading…" : "Load table"}
            </button>
          </div>
        </header>

        <section className="filters">
          <Dropdown
            options={classList}
            placeholder="Select class"
            fieldName="schoolClass"
            setFormData={updateFormField}
          />
          <Dropdown
            options={TERM_LIST}
            placeholder="Select term"
            fieldName="term"
            setFormData={updateFormField}
          />
          <DropdownYear
            placeholder="Select year"
            fieldName="year"
            setFormData={updateFormField}
          />
        </section>

        <div className="content">
          <section className="timetable">
            <div className="grid-header">
              <span></span>
              {WEEKDAYS.map((d) => <span key={d}>{d}</span>)}
            </div>

            <div className="grid" ref={boxRef} style={{ position: "relative" }}>
              {loading && (
                <div className="tt-loader-overlay">
                  <div className="tt-loader-ring" />
                  <div className="tt-loader-label">Loading timetable…</div>
                  <div className="tt-loader-sub">Fetching schedule data</div>
                </div>
              )}

              
              <Popup
                active={active}
                togglePopup={closePopup}
                setUpdating={Updating}
                formData={formData}
                fieldNames={["weekdays", "timeSlots", "teachers", "subjects"]}
                setFormData={updateFormField}
                onSuccess={() => { setActive(false); fetchTimetable(); }}
              />
              <DeletePopup
                isOpen={showDelete}
                onClose={() => { setShowDelete(false); setPendingDeleteId(null); }}
                onConfirm={() => { if (pendingDeleteId !== null) handleDelete(pendingDeleteId); }}
              />

              {ROWS.map((row, ri) => {
                if (row.type === "break") {
                  return <div key={`break-${ri}`} className="break">{row.breakText}</div>;
                }
                return (
                  <div key={row.hour} style={{ display: "contents" }}>
                    <div className="time">{row.label}</div>
                    {WEEKDAYS.map((day, index) => {
                      const colorIndex = (index * 7) % 10;
                      const matches    = getSlotsForDay(timetableData, day, row.hour!);
                      return (
                        <div key={`${row.hour}-${day}`}>
                          <TimetableCell
                            matches={matches}
                            colorIndex={colorIndex}
                            onAdd={() => openCreatePopup(day)}
                            onEdit={openEditPopup}
                            onDelete={openDeleteMiddleware}
                          />
                        </div>
                      );
                    })}
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