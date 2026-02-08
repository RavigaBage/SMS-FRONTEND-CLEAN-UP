"use client";

import { useState, useEffect, ChangeEvent, FormEvent } from "react";
import "@/styles/formStyles.css";
import { fetchWithAuth } from '@/src/lib/apiClient';

export interface UserInfo {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
  is_active: boolean;
  is_staff: boolean;
  created_at: string;
}

export interface Teacher {
  id: number;
  user: UserInfo;
  first_name: string;
  last_name: string;
  specialization: number;
}

export interface ClassData {
  id: number;
  class_name: string;
  academic_year: string;
  teacher: Teacher | null; 
}

export interface ClassesBase {
  count: number;
  next: string | null;
  previous: string | null;
  results: ClassData[];
}

type enrollFormProps = {
  formData: Record<string, any>;
  fieldName: string | string[];
  selectedIM:number | number[] | null;
  setFormData:  (field: string, value: any) => void;
};

export interface UserDetails {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
  is_active: boolean;
  is_staff: boolean;
  created_at: string;
}

export interface Parent {
  id: number;
  user: UserDetails;
  phone_number: string;
  address: string;
}

export interface StudentData {
  id: number;
  user: UserDetails;
  parent: Parent;
  first_name: string;
  last_name: string;
  date_of_birth: string;
  status: string;
}

export interface StudentApiResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: StudentData[];
}
export default function EnrollForm({
  formData,
  setFormData,
  selectedIM
}: enrollFormProps) {
  const [Classes, setClasses] = useState<ClassData[]>([]);
  const [Students, setStudents] = useState<StudentData[]>([]);
  const [responseMsg, setResponseMsg] = useState<boolean>(false);
  const [messageMsg, setMessageMsg] = useState<string>("");
  const [error, setError] = useState<boolean>(false);
  useEffect(() => {
    fetchClasses();
    fetchStudents();
  }, []);


const fetchClasses = async () => {
  try {
    // REMOVE: let accessToken = localStorage.getItem("accessToken");
    const res = await fetchWithAuth(
      `${process.env.NEXT_PUBLIC_API_URL}/classes/`, 
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (res.status === 401) {
       console.error("Access denied. Redirecting to login...");
       // window.location.href = "/login"; 
       return;
    }

    const data: ClassesBase = await res.json();
    if (data && data.results) {
      setClasses(data.results);
    }
  } catch (err) {
    console.error("Network or Auth error:", err);
    setError(true);
  }
};
const fetchStudents = async () => {
  try {
    const res = await fetchWithAuth(
      `${process.env.NEXT_PUBLIC_API_URL}/students/`, // 1. Lowercase + trailing slash
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (!res.ok) {
        throw new Error(`Server error: ${res.status}`);
    }

    const data: StudentApiResponse = await res.json();

    if (data && data.results) {
      setStudents(data.results);
    } else {
      console.warn("API returned success but results array is missing:", data);
    }
    
  } catch (err) {
    console.error("Failed to load Classes:", err);
    setError(true);
    setMessageMsg("Failed to load class list.");
  }
};





const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
  e.preventDefault();
      const isEditing = selectedIM !== null;
  try {
  const url = isEditing 
    ? `${process.env.NEXT_PUBLIC_API_URL}/enrollments/${selectedIM}/`
    : `${process.env.NEXT_PUBLIC_API_URL}/enrollments/`;
const method = isEditing ? "PATCH" : "POST";
const payload = {
  student: Number(formData.student?.id),
  class_obj: Number(formData.class_obj?.id),
  student_id: Number(formData.student?.id),
  class_id: Number(formData.class_obj?.id),
  
};
    const response = await fetchWithAuth(`${url}`, {
      method: method,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorDetail = await response.json();
      setResponseMsg(errorDetail)
    }

    setError(false);
    setMessageMsg(`Operation was a success, item has been ${isEditing?'updated':"created"}.`);
  } catch (err) {
    setError(true);
    setMessageMsg(`Failed to ${isEditing?'update':"create"} list.`);
  }
};

const handleChange = (e: ChangeEvent<HTMLSelectElement>) => {
  const { name, value } = e.target;

  if (name === "student") {
    const selectedStudent = Students.find(s => s.id === Number(value));
    setFormData(name, selectedStudent || null);
  } else if (name === "class_obj") {
    const selectedClass = Classes.find(c => c.id === Number(value));
    setFormData(name, selectedClass || null);
  } else {
    setFormData(name, value);
  }
};



  return (
    <div className="form-page">
      <div className="form-wrapper">
        <h2>Enrollment Form</h2>

        <form onSubmit={handleSubmit} className="teaching-form">
          <div className={`loader_wrapper ${responseMsg ? "play" : ""}`}>
            <div className="load-3">
              <div className="line"></div>
              <div className="line"></div>
              <div className="line"></div>
            </div>
            {messageMsg && (
              <p className={error ? "statusError" : "statusSuccess"}>{messageMsg}</p>
            )}
          </div>

          <div className="feild_x">
            <div className="feild">
            <label>
                Select Student:
                <select name="student" onChange={handleChange} required value={formData.student?.id || ""}>
                <option value="">-- Select a Student --</option>
                {Students.map((s) => (
                    <option key={s.id} value={s.id}>
                    {s.first_name} {s.last_name} (ID: {s.id})
                    </option>
                ))}
                </select>
            </label>
            </div>

            <div className="feild">
              <label>
                Class:
                <select name="class_obj" onChange={handleChange} required value={formData.class_obj?.id || ""}>
                <option value="">Select Class</option>
                
                {/* Check array length directly */}
                {Classes.length === 0 && (
                    <option disabled>No classes available</option>
                )}

                {Classes.map((t) => (
                    <option key={t.id} value={t.id}>
                    {t.class_name} 
                    {t.teacher ? ` — ${t.teacher.first_name} ${t.teacher.last_name}` : " (No Teacher)"}
                    </option>
                ))}
                </select>
              </label>
            </div>
          </div>
          
          <button type="submit">Submit</button>
        </form>
      </div>
    </div>
  );
}
