"use client";

import { useState, useEffect, ChangeEvent, FormEvent } from "react";
import { fetchWithAuth } from "@/src/lib/apiClient";
import { ErrorMessage, extractErrorDetail } from "@/components/ui/ErrorExtract";
import {
  BookOpen, User, Clock, Hash, Calendar,
  CheckCircle, AlertCircle, Loader2, ChevronDown
} from "lucide-react";

const FontLoader = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Lora:wght@500;600;700&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600&display=swap');

    .tf-wrap * { box-sizing: border-box; }
    .tf-wrap {
      font-family: 'DM Sans', sans-serif;
      background: #ffffff;
      border-radius: 20px;
      padding: 36px 40px;
      width: 100%;
      max-width: 680px;
    }

    .tf-header { display: flex; align-items: flex-start; gap: 16px; margin-bottom: 28px; padding-bottom: 24px; border-bottom: 1.5px solid #e2e8f0; }
    .tf-icon-wrap { width: 48px; height: 48px; background: #eff6ff; border-radius: 12px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
    .tf-title { font-family: 'Lora', serif; font-size: 20px; font-weight: 700; color: #1b2e4b; line-height: 1.2; margin: 0; }
    .tf-subtitle { font-size: 13px; color: #64748b; margin: 4px 0 0; }

    .tf-progress { height: 3px; background: #e2e8f0; border-radius: 99px; margin-top: 10px; overflow: hidden; }
    .tf-progress-fill { height: 100%; background: linear-gradient(90deg, #2563eb, #3b82f6); border-radius: 99px; animation: tf-pulse 1.5s ease-in-out infinite; }
    @keyframes tf-pulse { 0%,100% { opacity:1; } 50% { opacity:0.5; } }

    .tf-alert { display: flex; align-items: flex-start; gap: 10px; padding: 12px 14px; border-radius: 10px; font-size: 13.5px; margin-bottom: 20px; }
    .tf-alert.error   { background: #fef2f2; color: #dc2626; border: 1px solid #fecaca; }
    .tf-alert.success { background: #f0fdf4; color: #16a34a; border: 1px solid #bbf7d0; }
    .tf-alert svg { flex-shrink: 0; margin-top: 1px; }

    .tf-section { font-size: 10.5px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; color: #94a3b8; margin: 0 0 14px; display: flex; align-items: center; gap: 8px; }
    .tf-section::after { content:''; flex:1; height:1px; background:#f1f5f9; }

    .tf-grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 16px; }
    .tf-grid-3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 16px; margin-bottom: 16px; }
    .tf-full   { margin-bottom: 16px; }

    .tf-field { display: flex; flex-direction: column; gap: 6px; }
    .tf-label { font-size: 12.5px; font-weight: 600; color: #374151; display: flex; align-items: center; gap: 6px; }
    .tf-label svg { color: #94a3b8; }

    .tf-input, .tf-select {
      width: 100%; padding: 10px 13px; font-family: 'DM Sans', sans-serif;
      font-size: 13.5px; color: #1b2e4b; background: #ffffff;
      border: 1.5px solid #e2e8f0; border-radius: 10px; outline: none;
      transition: border-color 0.15s, box-shadow 0.15s, background 0.15s;
    }
    .tf-input::placeholder { color: #9ca3af; }
    .tf-input:focus, .tf-select:focus {
      border-color: #2563eb;
      box-shadow: 0 0 0 3px rgba(37,99,235,0.1);
      background: #fafcff;
    }
    .tf-input:hover:not(:focus), .tf-select:hover:not(:focus) { border-color: #cbd5e1; }

    .tf-sel-wrap { position: relative; }
    .tf-sel-wrap .tf-select { appearance: none; padding-right: 36px; cursor: pointer; }
    .tf-sel-wrap .tf-chevron { position: absolute; right: 11px; top: 50%; transform: translateY(-50%); pointer-events: none; color: #94a3b8; }
    .tf-select:disabled { background: #f8fafc; color: #94a3b8; cursor: not-allowed; border-color: #e2e8f0; }

    .tf-submit {
      width: 100%; padding: 13px; background: #1b2e4b; color: white;
      border: none; border-radius: 11px; font-family: 'DM Sans', sans-serif;
      font-size: 14px; font-weight: 600; cursor: pointer; margin-top: 8px;
      display: flex; align-items: center; justify-content: center; gap: 8px;
      transition: background 0.18s, box-shadow 0.18s, transform 0.1s;
      box-shadow: 0 2px 8px rgba(27,46,75,0.2);
    }
    .tf-submit:hover:not(:disabled) { background: #243b55; box-shadow: 0 4px 16px rgba(27,46,75,0.28); }
    .tf-submit:active:not(:disabled) { transform: scale(0.99); }
    .tf-submit:disabled { opacity: 0.6; cursor: not-allowed; }

    .tf-spin { animation: tf-spin 0.8s linear infinite; }
    @keyframes tf-spin { to { transform: rotate(360deg); } }

    @media (max-width: 600px) {
      .tf-wrap { padding: 24px 20px; }
      .tf-grid-2, .tf-grid-3 { grid-template-columns: 1fr; }
    }
  `}</style>
);

type SubjectBase = { id: number; subject_name: string; subject_code: string };
type User        = { id: string; email: string; first_name: string; last_name: string; is_active: boolean; is_staff: boolean; created_at: string };
type Teacher     = { id: number; user: User; first_name: string; last_name: string; specialization: string };
type TimePoint   = { id: string; value: string };
type TeachingFormProps = {
  formData: Record<string, any>;
  Update: any;
  fieldName: string | string[];
  setFormData: (field: string, value: any) => void;
  onSuccess?: () => void;
};

const INT_FIELDS = ["subject","subject_id","teacher","teacher_id","class_obj","class_id"];

const DAYS = ["Monday","Tuesday","Wednesday","Thursday","Friday"];

function generateTimePoints(startHour=7, endHour=18, intervalMinutes=30): TimePoint[] {
  const points: TimePoint[] = [];
  let id = 1;
  for (let mins = startHour*60; mins <= endHour*60; mins += intervalMinutes) {
    const h = Math.floor(mins/60), m = mins%60;
    const value = `${h.toString().padStart(2,"0")}:${m.toString().padStart(2,"0")}:00`;
    const label = new Date(`1970-01-01T${value}`).toLocaleTimeString("en-US",{ hour:"numeric", minute:"2-digit", hour12:true });
    points.push({ id: String(id++), value });
  }
  return points;
}

function SelectField({ label, icon: Icon, name, value, onChange, disabled, required, children }: any) {
  return (
    <div className="tf-field">
      <label className="tf-label"><Icon size={13}/>{label}</label>
      <div className="tf-sel-wrap">
        <select className="tf-select" name={name} value={value} onChange={onChange} disabled={disabled} required={required}>
          {children}
        </select>
        <ChevronDown size={14} className="tf-chevron"/>
      </div>
    </div>
  );
}

export default function TeachingForm({ formData, Update, setFormData, onSuccess }: TeachingFormProps) {
  const [timeSlots,       setTimeSlots]       = useState<TimePoint[]>([]);
  const [teachers,        setTeachers]        = useState<Teacher[]>([]);
  const [subjects,        setSubjects]        = useState<SubjectBase[]>([]);
  const [messageMsg,      setMessageMsg]      = useState("");
  const [errorDetail,     setErrorDetail]     = useState<any>(null);
  const [loadingTeachers, setLoadingTeachers] = useState(true);
  const [loadingSubjects, setLoadingSubjects] = useState(true);
  const [submitting,      setSubmitting]      = useState(false);

  useEffect(() => {
    fetchTeachers();
    fetchSubjects();
    setTimeSlots(generateTimePoints(7, 18, 30));
    setMessageMsg("");
  }, []);

  const fetchTeachers = async () => {
    setLoadingTeachers(true);
    try {
      const res  = await fetchWithAuth(`${process.env.NEXT_PUBLIC_API_URL}/teachers/`, { headers: { "Content-Type": "application/json" } });
      const data = await res.json();
      setTeachers(data.results || []);
    } catch { console.error("Failed to load teachers"); }
    finally { setLoadingTeachers(false); }
  };

  const fetchSubjects = async () => {
    setLoadingSubjects(true);
    try {
      const res  = await fetchWithAuth(`${process.env.NEXT_PUBLIC_API_URL}/subjects/`, { headers: { "Content-Type": "application/json" } });
      const data = await res.json();
      setSubjects(data.results || []);
    } catch { console.error("Failed to load subjects"); }
    finally { setLoadingSubjects(false); }
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(name, INT_FIELDS.includes(name) ? Number(value) : value);
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorDetail(null);

    const { start_time, end_time } = formData;
    if (!start_time || !end_time) { setErrorDetail("Please select both start and end times."); setSubmitting(false); return; }

    const [sh, sm] = start_time.split(":").map(Number);
    const [eh, em] = end_time.split(":").map(Number);
    if (sh*60+sm >= eh*60+em) { setErrorDetail("Start time must be earlier than end time."); setSubmitting(false); return; }

    try {
      const isUpdate = typeof Update === "number";
      const url    = isUpdate ? `${process.env.NEXT_PUBLIC_API_URL}/timetable/${Update}/` : `${process.env.NEXT_PUBLIC_API_URL}/timetable/`;
      const method = isUpdate ? "PUT" : "POST";

      const response = await fetchWithAuth(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, subject_id: formData.subject_id ?? formData.subject, teacher_id: formData.teacher_id ?? formData.teacher }),
      });

      if (!response.ok) { const err = await response.json(); setErrorDetail(extractErrorDetail(err)); return; }

      setErrorDetail(null);
      setMessageMsg(isUpdate ? "Assignment updated successfully!" : "Assignment created successfully!");
      onSuccess?.();
    } catch { setErrorDetail("Network error. Please try again."); }
    finally { setSubmitting(false); }
  };

  const isUpdate = typeof Update === "number";

  const fmtTime = (val: string) => {
    if (!val) return val;
    try { return new Date(`1970-01-01T${val}`).toLocaleTimeString("en-US",{ hour:"numeric", minute:"2-digit", hour12:true }); }
    catch { return val; }
  };

  return (
    <>
      <FontLoader/>
      <div className="tf-wrap">

        <div className="tf-header">
          <div className="tf-icon-wrap">
            <BookOpen size={22} color="#2563eb"/>
          </div>
          <div style={{ flex:1 }}>
            <h2 className="tf-title">{isUpdate ? "Update Teaching Assignment" : "New Teaching Assignment"}</h2>
            <p className="tf-subtitle">Assign subjects, teachers, rooms and schedule time slots</p>
            {submitting && <div className="tf-progress"><div className="tf-progress-fill" style={{ width:"100%" }}/></div>}
          </div>
        </div>

        {errorDetail && (
          <div className="tf-alert error">
            <AlertCircle size={15}/>
            <span>{typeof errorDetail === "string" ? errorDetail : JSON.stringify(errorDetail)}</span>
          </div>
        )}
        {messageMsg && !errorDetail && (
          <div className="tf-alert success">
            <CheckCircle size={15}/>
            <span>{messageMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>

          <p className="tf-section">Assignment Details</p>
          <div className="tf-grid-2">
            <SelectField label="Subject" icon={BookOpen} name="subject" value={Number(formData.subject)||""} onChange={handleChange} disabled={loadingSubjects} required>
              <option value="">{loadingSubjects ? "Loading subjects…" : "Select a subject"}</option>
              {subjects.length === 0 && !loadingSubjects && <option disabled>No subjects available</option>}
              {subjects.map(s => <option key={s.id} value={s.id}>{s.subject_name} — {s.subject_code}</option>)}
            </SelectField>

            <SelectField label="Teacher" icon={User} name="teacher" value={Number(formData.teacher)||""} onChange={handleChange} disabled={loadingTeachers} required>
              <option value="">{loadingTeachers ? "Loading teachers…" : "Select a teacher"}</option>
              {teachers.length === 0 && !loadingTeachers && <option disabled>No teachers available</option>}
              {teachers.map(t => <option key={t.id} value={t.id}>{t.last_name}, {t.first_name}</option>)}
            </SelectField>
          </div>

          <p className="tf-section">Schedule</p>
          <div className="tf-grid-3">
            <SelectField label="Start Time" icon={Clock} name="start_time" value={formData.start_time||""} onChange={handleChange} required>
              <option value="">Select start</option>
              {timeSlots.map(t => <option key={t.id} value={t.value}>{fmtTime(t.value)}</option>)}
            </SelectField>

            <SelectField label="End Time" icon={Clock} name="end_time" value={formData.end_time||""} onChange={handleChange} required>
              <option value="">Select end</option>
              {timeSlots.map(t => <option key={t.id} value={t.value}>{fmtTime(t.value)}</option>)}
            </SelectField>

            <SelectField label="Day" icon={Calendar} name="day_of_week" value={formData.day_of_week||""} onChange={handleChange} required>
              <option value="">Select day</option>
              {DAYS.map(d => <option key={d} value={d}>{d}</option>)}
            </SelectField>
          </div>

          <p className="tf-section">Location</p>
          <div className="tf-full">
            <div className="tf-field">
              <label className="tf-label"><Hash size={13}/>Room Number</label>
              <input
                className="tf-input"
                type="text"
                name="room_number"
                onChange={handleChange}
                value={formData.room_number || ""}
                placeholder="e.g. B-204, Lab 3, Hall A"
                required
              />
            </div>
          </div>

          <button type="submit" disabled={submitting} className="tf-submit">
            {submitting
              ? <><Loader2 size={15} className="tf-spin"/>{isUpdate ? "Updating…" : "Saving…"}</>
              : isUpdate ? "Update Assignment" : "Create Assignment"
            }
          </button>

        </form>
      </div>
    </>
  );
}