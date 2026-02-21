"use client";

import { useState, useEffect, ChangeEvent, FormEvent } from "react";
import "@/styles/formStyles.css";
import "@/styles/loader.css";
import { fetchWithAuth } from "@/src/lib/apiClient";

type SubjectBase = {
  id: number;
  subject_name: string;
  subject_code:string;
};

type User = {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  is_active: boolean;
  is_staff: boolean;
  created_at: string;
};

type Teacher = {
  id: number;
  user: User;
  first_name: string;
  last_name: string;
  specialization: string;
};

type TimePoint = {
  id: string;
  value: string;
};

type TeachingFormProps = {
  formData: Record<string, any>;
  Update: any;
  fieldName: string | string[];
  setFormData: (field: string, value: any) => void;
  onSuccess?: () => void;
};

// ✅ Fields whose values must be sent as integers not strings
const INT_FIELDS = ["subject", "subject_id", "teacher", "teacher_id", "class_obj", "class_id"];

export default function TeachingForm({
  formData,
  Update,
  setFormData,
  onSuccess,
}: TeachingFormProps) {
  const [timeSlots, setTimeSlots]           = useState<TimePoint[]>([]);
  const [teachers, setTeachers]             = useState<Teacher[]>([]);
  const [subjects, setSubjects]             = useState<SubjectBase[]>([]);
  const [responseMsg, setResponseMsg]       = useState<boolean>(false);
  const [messageMsg, setMessageMsg]         = useState<string>("");
  const [error, setError]                   = useState<boolean>(false);
  const [loadingTeachers, setLoadingTeachers] = useState(true);
  const [loadingSubjects, setLoadingSubjects] = useState(true);
  const [submitting, setSubmitting]         = useState(false);

  useEffect(() => {
    fetchTeachers();
    fetchSubjects();
    setTimeSlots(generateTimePoints(7, 18, 30));
    setMessageMsg("");
  }, []);

  function generateTimePoints(
    startHour = 7,
    endHour = 18,
    intervalMinutes = 30
  ): TimePoint[] {
    const points: TimePoint[] = [];
    let id = 1;
    const start = startHour * 60;
    const end = endHour * 60;

    for (let mins = start; mins <= end; mins += intervalMinutes) {
      const h = Math.floor(mins / 60);
      const m = mins % 60;
      const value = `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:00`;
      points.push({ id: String(id++), value });
    }
    return points;
  }

  const fetchTeachers = async () => {
    setLoadingTeachers(true);
    try {
      const res = await fetchWithAuth(
        `${process.env.NEXT_PUBLIC_API_URL}/teachers/`,
        { headers: { "Content-Type": "application/json" } }
      );
      const data = await res.json();
      setTeachers(data.results || []);
    } catch (err) {
      console.error("Failed to load teachers", err);
    } finally {
      setLoadingTeachers(false);
    }
  };

  const fetchSubjects = async () => {
    setLoadingSubjects(true);
    try {
      const res = await fetchWithAuth(
        `${process.env.NEXT_PUBLIC_API_URL}/subjects/`,
        { headers: { "Content-Type": "application/json" } }
      );
      const data = await res.json();
      setSubjects(data.results || []);
    } catch (err) {
      console.error("Failed to load subjects", err);
    } finally {
      setLoadingSubjects(false);
    }
  };

  // ✅ Fix #1 & #2 — parse integer fields so select values match and IDs are numbers
  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    const parsed = INT_FIELDS.includes(name) ? Number(value) : value;
    setFormData(name, parsed);
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);
    setResponseMsg(true);
    setError(false);

    const { start_time, end_time } = formData;

    if (!start_time || !end_time) {
      setError(true);
      setMessageMsg("Please select both start and end times.");
      setSubmitting(false);
      return;
    }

    const [startHour, startMin] = start_time.split(":").map(Number);
    const [endHour, endMin]     = end_time.split(":").map(Number);
    const startTotal = startHour * 60 + startMin;
    const endTotal   = endHour   * 60 + endMin;

    if (startTotal >= endTotal) {
      setError(true);
      setMessageMsg("Start time must be earlier than end time.");
      setSubmitting(false);
      return;
    }

    try {
      const isUpdate = typeof Update === "number";
      const url = isUpdate
        ? `${process.env.NEXT_PUBLIC_API_URL}/timetable/${Update}/`
        : `${process.env.NEXT_PUBLIC_API_URL}/timetable/`;
      const method = isUpdate ? "PUT" : "POST";

      const response = await fetchWithAuth(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          subject_id: formData.subject_id ?? formData.subject,
          teacher_id: formData.teacher_id ?? formData.teacher,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        const error_process = String(errorData).replace(/[{}']/g, "");


        setError(true);
        setMessageMsg(`Failed to submit. Check console for details.${error_process}`);
        return;
      }

      setError(false);
      setMessageMsg(isUpdate ? "Assignment updated successfully!" : "Assignment created successfully!");
      // onSuccess?.();
    } catch (err) {
      console.error("Network error:", err);
      setError(true);
      setMessageMsg("Network error. Please try again.");
    } finally {
      setSubmitting(false);
     
    }
  };

  return (
    <div className="form-page">
      <div className="form-wrapper">
        <div className="form-header">
          <div className="form-header-icon">📚</div>
          {submitting && <div className="top-loader"></div>}
          <div>
            <h2 className="form-title">
              {typeof Update === "number"
                ? "Update Teaching Assignment"
                : "Create Teaching Assignment"}
            </h2>
            <p className="form-subtitle">
              Assign subjects, teachers, rooms and schedule time slots.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="teaching-form">
          <div className={`loader_wrapper ${submitting ? "play" : "active"}`}>
            <div className="load-3">
              <div className="line"></div>
              <div className="line"></div>
              <div className="line"></div>
            </div>
            {messageMsg && (
              <p className={`status_message ${error ? "red" : "green"}`}>{messageMsg}</p>
            )}
          </div>

          {/* Subject + Teacher */}
          <div className="feild_x">
            <div className="feild">
              <label>
                Subject:
                {/* ✅ Fix #2 — value cast to Number so it matches option value={s.id} */}
                <select
                  name="subject"
                  onChange={handleChange}
                  value={Number(formData.subject) || ""}
                  required
                  disabled={loadingSubjects}
                >
                  <option value="">
                    {loadingSubjects ? "Loading subjects..." : "Select subject"}
                  </option>
                  {subjects.length === 0 && !loadingSubjects && (
                    <option disabled>No subjects available</option>
                  )}
                  {subjects.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.subject_name} - {s.subject_code}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <div className="feild">
              <label>
                Teacher:
                {/* ✅ Fix #2 — value cast to Number so it matches option value={t.id} */}
                <select
                  name="teacher"
                  onChange={handleChange}
                  value={Number(formData.teacher) || ""}
                  required
                  disabled={loadingTeachers}
                >
                  <option value="">
                    {loadingTeachers ? "Loading teachers..." : "Select teacher"}
                  </option>
                  {teachers.length === 0 && !loadingTeachers && (
                    <option disabled>No teachers available</option>
                  )}
                  {teachers.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.last_name} - {t.first_name}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          </div>

          {/* Time slots + Room */}
          <div className="feild_x_x">
            <div className="feild">
              <label>
                Start Time:
                <select
                  name="start_time"
                  onChange={handleChange}
                  value={formData.start_time || ""}
                  required
                >
                  <option value="">Select Start Time</option>
                  {timeSlots.map((t) => (
                    <option key={t.id} value={t.value}>
                      {t.value}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <div className="feild">
              <label>
                End Time:
                <select
                  name="end_time"
                  onChange={handleChange}
                  value={formData.end_time || ""}
                  required
                >
                  <option value="">Select End Time</option>
                  {timeSlots.map((t) => (
                    <option key={t.id} value={t.value}>
                      {t.value}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <div className="feild">
              <label>
                Room Number:
                <input
                  type="text"
                  name="room_number"
                  onChange={handleChange}
                  value={formData.room_number || ""}
                  placeholder="Enter room number"
                  required
                />
              </label>
            </div>
          </div>

          {/* Weekday */}
          <div className="feild">
            <label>
              Weekday:
              <select
                name="day_of_week"
                onChange={handleChange}
                value={formData.day_of_week || ""}
                required
              >
                <option value="">Select Weekday</option>
                {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"].map(
                  (day) => (
                    <option key={day} value={day}>
                      {day}
                    </option>
                  )
                )}
              </select>
            </label>
          </div>

          <button className="submit_btn" type="submit" disabled={submitting}>
            {submitting ? (
              <span className="submit_btn_content">
                <span className="submit_spinner" aria-hidden="true"></span>
                <span>{typeof Update === "number" ? "Updating..." : "Saving..."}</span>
              </span>
            ) : (
              <span className="submit_btn_content">
                {typeof Update === "number" ? "Update Timetable" : "Create Timetable"}
              </span>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
