"use client";

import { useState, useRef, useEffect } from "react";
import Dropdown from "@/components/ui/dropdown";
import DropdownYear from "@/components/ui/dropdown_yr";
import Popup from "@/components/ui/Popup";
import DeletePopup from "@/components/ui/deletepopup";
import "@/styles/timetable.css";
import { fetchWithAuth } from "@/src/lib/apiClient";
import { Pencil, Trash2 } from "lucide-react";

type TermOption = {
  class_id: number;
  class_name: string;
  id: number;
};

type Teacher = {
  id: number;
  first_name: string;
  last_name: string;
};

type Subject = {
  id: number;
  subject_name: string;
  subject_code: string;
};

type Class = {
  id: number;
  class_name: string;
};

type TimetableEntry = {
  id: number;
  class_obj?: Class | null;
  subject?: Subject | null;
  teacher?: Teacher | null;
  day_of_week?: string | null;
  start_time?: string | null;
  end_time?: string | null;
  room_number?: string | null;
};
type Option = {
  class_id: number;
  class_name: string;
  id: number;
};

export default function Home() {
  const [classList, setClassList] = useState<Option[]>([]);
  const [TermList, setTermList] = useState<TermOption[]>([]);
  const [active, setActive] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState<number | null>(null); // ✅ fix #3
  const [Updating, setUpdate] = useState<any>(false);
  const [timetableData, setTimetableData] = useState<TimetableEntry[]>([]);
  const boxRef = useRef<HTMLDivElement | null>(null);

  const InitialData = {
    schoolClass: "",
    term: "",
    weekdays: "",
    timeSlots: "",
    roomNumber: "",
    teachingAssignment: "",
    status: "",
    teachers: "",
    day_of_week: "",
    subjects: "",
    year: "",
    academic_year: "",
    class_id: "",
  };

  const [formData, setFormData] = useState<Record<string, any>>(InitialData);

  const updateFormField = (field: string, value: any) => {
    const fieldMap: Record<string, string> = {
      year: "academic_year",
      schoolClass: "class_id"
    };

    const mappedField = fieldMap[field] ?? field;
    const resolvedValue =
      typeof value === "object" && value !== null && "id" in value
        ? (value as { id: number | string }).id
        : value ?? "";

    setFormData((prev) => ({
      ...prev,
      [mappedField]: resolvedValue,
      ...(mappedField === "subject" ? { subject_id: resolvedValue } : {}),
      ...(mappedField === "teacher" ? { teacher_id: resolvedValue } : {}),
    }));
  };
  useEffect(() => {
    const handleOnPageLoad = async () => {
      try {
        const classRes = await fetchWithAuth(
          `${process.env.NEXT_PUBLIC_API_URL}/classes/`,
          { method: "GET", headers: { "Content-Type": "application/json" } }
        );
        const classData = await classRes.json();
        if (classRes.ok) {
          const list = classData.results || classData;
          if (Array.isArray(list)) setClassList(list);
        }

        setTermList([
          { id: 1, class_id: 1, class_name: "First Term" },
          { id: 2, class_id: 2, class_name: "Second Term" },
          { id: 3, class_id: 3, class_name: "Third Term" },
        ]);
      } catch (err) {
        console.error("Error fetching data:", err);
      }
    };

    handleOnPageLoad();
  }, []);

  // ✅ Fix #3 — delete only fires after user confirms in DeletePopup
  const handleDelete = async (id: number) => {
    try {
      const res = await fetchWithAuth(
        `${process.env.NEXT_PUBLIC_API_URL}/timetable/${id}/`,
        { method: "DELETE", headers: { "Content-Type": "application/json" } }
      );
      if (res.ok) {
        setTimetableData((prev) => prev.filter((item) => item.id !== id));
        setShowDelete(false);
        setPendingDeleteId(null);
      } else {
        const data = await res.json();
        alert(`Failed to delete: ${data.detail || "Unknown error"}`);
      }
    } catch (err) {
      console.error("Delete failed", err);
      alert("Error deleting the entry.");
    }
  };

  const MiddlewareDel = (id: number) => {
    setPendingDeleteId(id);   
    setShowDelete(true);
  };

  const closePopup = () => {
    setActive(false);
    setUpdate(false);
  };

  const openCreatePopup = (dayOfWeek: string) => {
    if (!formData.class_id || !formData.term || !formData.academic_year) {
      alert("Please select class, term, and year before adding a new timetable entry.");
      return;
    }

    setUpdate(false); // force POST
    setFormData((prev) => ({
      ...InitialData,
      class_id: prev.class_id,
      term: prev.term,
      academic_year: prev.academic_year,
      day_of_week: dayOfWeek,
    }));
    setActive(true);
  };

  const openEditPopup = (entry: TimetableEntry) => {
    setUpdate(entry.id);
    setFormData((prev) => ({
      ...InitialData,
      class_id: entry.class_obj?.id ?? prev.class_id ?? "",
      term: (entry as any)?.term ?? prev.term ?? "",
      academic_year: (entry as any)?.academic_year ?? prev.academic_year ?? "",
      day_of_week: entry.day_of_week ?? "",
      start_time: entry.start_time ?? "",
      end_time: entry.end_time ?? "",
      room_number: entry.room_number ?? "",
      subject: entry.subject?.id ?? "",
      subject_id: entry.subject?.id ?? "",
      teacher: entry.teacher?.id ?? "",
      teacher_id: entry.teacher?.id ?? "",
    }));
    setActive(true);
  };
const fetchTimetable = async () => {
  try {
    const params = new URLSearchParams();

    if (formData.class_id)
      params.append("class_id", String(formData.class_id));

    if (formData.term)
      params.append("term", String(formData.term));

    if (formData.academic_year)
      params.append("academic_year", String(formData.academic_year));

    const url = `${process.env.NEXT_PUBLIC_API_URL}/timetable/${
      params.toString() ? `?${params.toString()}` : ""
    }`;

    const response = await fetchWithAuth(url);
    if (!response.ok) {
      console.error("Failed to fetch timetable");
      return;
    }

    const data = await response.json();
    const safeData = Array.isArray(data?.results)
      ? data.results
      : Array.isArray(data)
      ? data
      : [];

    setTimetableData(safeData);
  } catch (err) {
    console.error("Error fetching timetable:", err);
    setTimetableData([]);
  }
};
  const weekdays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

function getSlotsForDay(
  data: TimetableEntry[],
  day: string,
  time?: string
): TimetableEntry[] {
  if (!Array.isArray(data)) return [];

  let filtered = data.filter(
    (entry) => entry?.day_of_week === day
  );

  if (time) {
    const targetHour = Number(time);

    filtered = filtered.filter((entry) => {
      if (!entry?.start_time) return false;

      const hour = Number(entry.start_time.split(":")[0]);
      return hour === targetHour;
    });
  }

  return filtered;
}

function TimetableDiv(match: TimetableEntry[], index = 0) {
  const colorIndex = (index * 7) % 10;
  const entry = match?.[0];

  if (!entry) {
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
          +
        </div>
      </div>
    );
  }

  return (
    <div className="grid_feild">
      <div className="card" data-color={colorIndex}>
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

        <div className="slot_location">
          {entry.room_number ?? "No Room"}
        </div>

        <div className="slot_options">
          <div
            className="item_"
            title="Delete"
            onClick={() => entry.id && MiddlewareDel(entry.id)}
          >
            <Trash2 size={14} />
          </div>

          <div
            className="item_"
            title="Select / Edit"
            onClick={() => entry.id && openEditPopup(entry)}
          >
            <Pencil size={14} />
          </div>
        </div>
      </div>
    </div>
  );
}
const timeSlots = ["08", "09", "10", "11"];
  return (
    <div className="app timetableApp">
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
          <Dropdown
            options={classList}
            placeholder="Select class"
            fieldName="schoolClass"
            setFormData={updateFormField}
          />
          <Dropdown
            options={TermList}
            placeholder="Select term"
            fieldName="term"
            setFormData={updateFormField}
          />
          <DropdownYear
            placeholder="Select year"
            fieldName="year"
            setFormData={updateFormField}
          />
          <div className="chips">
            <span className="chip active" onClick={fetchTimetable}>
              Load table
            </span>
          </div>
        </section>

        <div className="content">
          <section className="timetable">
            <div className="grid-header">
              <span></span>
              <span>Monday</span>
              <span>Tuesday</span>
              <span>Wednesday</span>
              <span>Thursday</span>
              <span>Friday</span>
            </div>

            <div className="grid" ref={boxRef}>
              <Popup
                active={active}
                togglePopup={closePopup}
                setUpdating={Updating}
                formData={formData}
                fieldNames={["weekdays", "timeSlots", "teachers", "subjects"]}
                setFormData={updateFormField}
                onSuccess={() => {
                  setActive(false);
                  fetchTimetable();
                }}
              />

              {/* ✅ Fix #3 — delete only fires when user confirms */}
              <DeletePopup
                isOpen={showDelete}
                onClose={() => { setShowDelete(false); setPendingDeleteId(null); }}
                onConfirm={() => {
                  if (pendingDeleteId !== null) handleDelete(pendingDeleteId);
                }}
              />
              
              
              <div className="time">07:00</div>
              {weekdays.map((day, index) => (
                <div key={index}>{TimetableDiv(getSlotsForDay(timetableData, day, "07"), index)}</div>
              ))}
              <div className="time">08:00</div>
              {weekdays.map((day, index) => (
                <div key={index}>{TimetableDiv(getSlotsForDay(timetableData, day, "08"), index)}</div>
              ))}

              <div className="time">09:00</div>
              {weekdays.map((day, index) => (
                <div key={index}>{TimetableDiv(getSlotsForDay(timetableData, day, "09"), index)}</div>
              ))}

              <div className="break">RECESS BREAK</div>

              <div className="time">10:30</div>
              {weekdays.map((day, index) => (
                <div key={index}>{TimetableDiv(getSlotsForDay(timetableData, day, "10"), index)}</div>
              ))}

              <div className="time">11:30</div>
              {weekdays.map((day, index) => (
                <div key={day}>{TimetableDiv(getSlotsForDay(timetableData, day, "11"), index)}</div>
              ))}
            </div>
            <div className="time">12:30</div>
              {weekdays.map((day, index) => (
                <div key={day}>{TimetableDiv(getSlotsForDay(timetableData, day, "12"), index)}</div>
              ))}
          </section>
        </div>
      </main>
    </div>
  );
}

