"use client";

import { useState, useEffect, ChangeEvent, FormEvent } from "react";
import "@/styles/formStyles.css";
import { fetchWithAuth } from "@/src/lib/apiClient";

/* ===== Types ===== */

type OptionBase = {
  id: number | string;
  name?: string;
  label?: string;
};

type SubjectBase = {
  id: number;
  subject_name: string;
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
  Update:any;
  fieldName: string | string[];
  setFormData:  (field: string, value: any) => void;
};

export default function TeachingForm({
  formData,
  Update,
  setFormData,
}: TeachingFormProps) {
  console.log(Update);
  const [timeSlots, setTimeSlots] = useState<TimePoint[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [subjects, setSubjects] = useState<SubjectBase[]>([]);

  const [responseMsg, setResponseMsg] = useState<boolean>(false);
  const [messageMsg, setMessageMsg] = useState<string>("");
  const [error, setError] = useState<boolean>(false);

  useEffect(() => {
    fetchTeachers();
    fetchSubjects();
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

      const hour12 = h % 12 || 12;
      const period = h < 12 ? "AM" : "PM";

      const label = `${hour12}:${m.toString().padStart(2, "0")}:00 ${period}`;
      const value = `${h.toString().padStart(2, "0")}:${m
        .toString()
        .padStart(2, "0")}:00`;

      points.push({
        id: String(id++),
        value, 
      });
    }

    return points;
  }



  const fetchTeachers = async () => {
    try {
      const res = await fetchWithAuth(
        `${process.env.NEXT_PUBLIC_API_URL}/teachers/`,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      const teacher_data = await res.json();
      setTeachers(teacher_data.results);
    } catch (err) {
      console.error("Failed to load teachers", err);
    }
  };

  const fetchSubjects = async () => {
    try {
      const res = await fetchWithAuth(
        `${process.env.NEXT_PUBLIC_API_URL}/subjects/`,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      const subject_result = await res.json();
      setSubjects(subject_result.results);
    } catch (err) {
      console.error("Failed to load subjects", err);
    }
  };

useEffect(() => {
  setTimeSlots(generateTimePoints(7, 18, 30));
}, []);

const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {

  e.preventDefault();

  setResponseMsg(true);
  setError(false);

  const { start_time, end_time } = formData;

  if (!start_time || !end_time) {
    setError(true);
    setMessageMsg("Please select both start and end times.");
    return;
  }

  const [startHour, startMin] = start_time.split(":").map(Number);
  const [endHour, endMin] = end_time.split(":").map(Number);

  const startTotalMins = startHour * 60 + startMin;
  const endTotalMins = endHour * 60 + endMin;

  if (startTotalMins >= endTotalMins) {
    setError(true);
    setMessageMsg("Start time must be earlier than end time.");
    return;
  }

  setMessageMsg("Submitting class data...");

  try {
    const Url = typeof Update == 'number' ?  `${process.env.NEXT_PUBLIC_API_URL}/timetables/${Update}/`
    : `${process.env.NEXT_PUBLIC_API_URL}/timetables/`;

    const method_config = typeof Update == 'number' ? "PUT":"POST";
     
    const response = await fetchWithAuth(Url, {
      method: method_config,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Error:", errorData);
      setError(true);
      setMessageMsg("Failed to submit class data. Check the console for details.");
      return;
    }

    const responseData = await response.json();
    setMessageMsg("Class data submitted successfully!");
  } catch (err) {
    console.error("Network error:", err);
    setError(true);
    setMessageMsg("Network error. Please try again.");
  } finally {
    setTimeout(() => {
      setResponseMsg(false);
      setMessageMsg("");
    }, 3000);
  }
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
                <select name="subject" onChange={handleChange} value={formData.subject || ""} required>
                  <option value="">Select subject</option>
                  {subjects.length === 0 && (
                    <option>No list available</option>
                  )}
                  {subjects.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.subject_name}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <div className="feild">
              <label>
                Teacher:
                <select name="teacher" onChange={handleChange} value={formData.teacher || ""} required>
                  <option value="">Select teacher</option>
                  {teachers.length === 0 && (
                    <option>No list available</option>
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

          <div className="feild_x_x">
            <div className="feild">
              <label>
                Time Slot:
               <select name="start_time" onChange={handleChange} value={formData.start_time || ""} required>
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
                Time Slot:
               <select name="end_time" onChange={handleChange} value={formData.end_time || ""} required>
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

            <div className="feild">
              <label>
                Weekday:
                <select name="day_of_week" onChange={handleChange} value={formData.day_of_week || ""} required>
                  <option value="">Select Weekday</option>
                  {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"].map((day) => (
                    <option key={day} value={day}>
                      {day}
                    </option>
                  ))}
                </select>
              </label>
            </div>

          <button type="submit">Submit</button>
        </form>
      </div>
    </div>
  );
}
