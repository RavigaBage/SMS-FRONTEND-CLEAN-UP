"use client";

import { useState, useEffect, ChangeEvent, FormEvent } from "react";
import "@/styles/formStyles.css";

/* ===== Types ===== */

type OptionBase = {
  id: number | string;
  name?: string;
  label?: string;
};

type TeachingFormProps = {
  formData: Record<string, any>;
  fieldName: string | string[];
  setFormData:  (field: string, value: any) => void;
};

export default function TeachingForm({
  formData,
  setFormData,
}: TeachingFormProps) {
  const [weekdays, setWeekdays] = useState<OptionBase[]>([]);
  const [timeSlots, setTimeSlots] = useState<OptionBase[]>([]);
  const [teachers, setTeachers] = useState<OptionBase[]>([]);
  const [subjects, setSubjects] = useState<OptionBase[]>([]);

  const [responseMsg, setResponseMsg] = useState<boolean>(false);
  const [messageMsg, setMessageMsg] = useState<string>("");
  const [error, setError] = useState<boolean>(false);

  useEffect(() => {
    fetchWeekdays();
    fetchTimeSlots();
    fetchTeachers();
    fetchSubjects();
  }, []);

  /* ===== Fetch helpers ===== */

  const fetchWeekdays = async () => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/timetable/weekdays_list/`,
        {
          headers: {
            Authorization: `Bearer ${process.env.NEXT_PUBLIC_TOKEN_VAL}`,
            "Content-Type": "application/json",
          },
        }
      );
      setWeekdays(await res.json());
    } catch (err) {
      console.error("Failed to load weekdays", err);
    }
  };

  const fetchTimeSlots = async () => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/timetable/time_slot_list/`,
        {
          headers: {
            Authorization: `Bearer ${process.env.NEXT_PUBLIC_TOKEN_VAL}`,
            "Content-Type": "application/json",
          },
        }
      );
      setTimeSlots(await res.json());
    } catch (err) {
      console.error("Failed to load time slots", err);
    }
  };

  const fetchTeachers = async () => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/timetable/teachers_list/`,
        {
          headers: {
            Authorization: `Bearer ${process.env.NEXT_PUBLIC_TOKEN_VAL}`,
            "Content-Type": "application/json",
          },
        }
      );
      setTeachers(await res.json());
    } catch (err) {
      console.error("Failed to load teachers", err);
    }
  };

  const fetchSubjects = async () => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/timetable/subjects_list/`,
        {
          headers: {
            Authorization: `Bearer ${process.env.NEXT_PUBLIC_TOKEN_VAL}`,
            "Content-Type": "application/json",
          },
        }
      );
      setSubjects(await res.json());
    } catch (err) {
      console.error("Failed to load subjects", err);
    }
  };

  /* ===== Handlers ===== */

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setResponseMsg(true);
    setError(false);
    setMessageMsg("Class Data Found");

    const data = new FormData();
    Object.entries(formData).forEach(([key, value]) =>
      data.append(key, String(value))
    );

    console.log("FormData:", Object.fromEntries(data.entries()));
  };

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData(name, value);
  };

  return (
    <div className="form-page">
      <div className="form-wrapper">
        <h2>Teaching Assignment Form</h2>

        <form onSubmit={handleSubmit} className="teaching-form">
          <div className={`loader_wrapper ${responseMsg ? "play" : ""}`}>
            <div className="load-3">
              <div className="line"></div>
              <div className="line"></div>
              <div className="line"></div>
            </div>
            {messageMsg && (
              <p className={error ? "red" : "green"}>{messageMsg}</p>
            )}
          </div>

          <div className="feild_x">
            <div className="feild">
              <label>
                Subject:
                <select name="subjects" onChange={handleChange} required>
                  <option value="">Select subject</option>
                  {subjects.length === 0 && (
                    <option>No list available</option>
                  )}
                  {subjects.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <div className="feild">
              <label>
                Teacher:
                <select name="teachers" onChange={handleChange} required>
                  <option value="">Select teacher</option>
                  {teachers.length === 0 && (
                    <option>No list available</option>
                  )}
                  {teachers.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          </div>

          <div className="feild_x_x">
            <div className="feild">
              <label>
                Weekday:
                <select name="weekdays" onChange={handleChange} required>
                  <option value="">Select weekday</option>
                  {weekdays.length === 0 && (
                    <option>No list available</option>
                  )}
                  {weekdays.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <div className="feild">
              <label>
                Time Slot:
                <select name="timeSlots" onChange={handleChange} required>
                  <option value="">Select time slot</option>
                  {timeSlots.length === 0 && (
                    <option>No list available</option>
                  )}
                  {timeSlots.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.label}
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
                  name="roomNumber"
                  onChange={handleChange}
                  placeholder="Enter room number"
                  required
                />
              </label>
            </div>
          </div>

          <label>
            Status:
            <select name="status" onChange={handleChange} required>
              <option value="">Select status</option>
              <option>Pending</option>
              <option>Ongoing</option>
              <option>Completed</option>
            </select>
          </label>

          <button type="submit">Submit</button>
        </form>
      </div>
    </div>
  );
}
