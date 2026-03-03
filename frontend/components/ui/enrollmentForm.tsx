"use client";

import { useState, useEffect, ChangeEvent, FormEvent } from "react";
import { fetchWithAuth } from "@/src/lib/apiClient";
import { ErrorMessage, extractErrorDetail } from "@/components/ui/ErrorExtract";

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
interface YearsModel {
  end_date: string;
  id: number;
  is_current: boolean;
  start_date: string;
  year_name: string;
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
  teacher_name: string;
  teacher: Teacher | null;
}

export interface ClassesBase {
  count: number;
  next: string | null;
  previous: string | null;
  results: ClassData[];
}

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

type EnrollFormProps = {
  formData: Record<string, any>;
  selectedIM: number | null;
  setFormData: (field: string, value: any) => void;
  onSuccess?: () => void;
};

export default function EnrollForm({
  formData,
  setFormData,
  selectedIM,
  onSuccess,
}: EnrollFormProps) {
  const [Classes, setClasses] = useState<ClassData[]>([]);
  const [Students, setStudents] = useState<StudentData[]>([]);
  const [messageMsg, setMessageMsg] = useState<string>("");
  const [errorDetail, setErrorDetail] = useState<any>(null);
  const [AcademicYearList, setAcademicYearList] = useState<YearsModel[]>([]);
  useEffect(() => {
    fetchClasses();
    fetchStudents();
     setAcademicYearList(handleYearSync());
  }, []);

  const fetchClasses = async () => {
    try {
      const res = await fetchWithAuth(`${process.env.NEXT_PUBLIC_API_URL}/classes/`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });

      if (res.status === 401) return console.error("Access denied");

      const data: ClassesBase = await res.json();
      setClasses(data.results || []);
    } catch (err) {
      console.error(err);
      setErrorDetail("Failed to load classes");
    }
  };

  const fetchStudents = async () => {
    try {
      const res = await fetchWithAuth(`${process.env.NEXT_PUBLIC_API_URL}/students/`, {
        headers: { "Content-Type": "application/json" },
      });
      if (!res.ok) throw new Error(`Server error: ${res.status}`);

      const data: StudentApiResponse = await res.json();
      setStudents(data.results || []);
    } catch (err) {
      console.error(err);
      setErrorDetail("Failed to load students");
    }
  };

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
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const isEditing = selectedIM !== null;
    const url = isEditing
      ? `${process.env.NEXT_PUBLIC_API_URL}/enrollments/${selectedIM}/`
      : `${process.env.NEXT_PUBLIC_API_URL}/enrollments/`;
    const method = isEditing ? "PATCH" : "POST";
    const payload = {
      student: Number(formData.student?.id),
      class_obj: Number(formData.class_obj?.id),
      student_id: Number(formData.student?.id),
      class_id: Number(formData.class_obj?.id),
      academic_year: formData.academic_year?.trim() || undefined,
    };

    try {
      setErrorDetail(null);
      const response = await fetchWithAuth(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorDetail = await response.json();
        setErrorDetail(extractErrorDetail(errorDetail));
        return;
      }

      setErrorDetail(null);
      setMessageMsg(`${isEditing ? "Updated" : "Enrolled"} successfully.`);
      onSuccess?.();
    } catch (err: any) {
      setErrorDetail(extractErrorDetail(err?.response?.data || err?.message || err));
    }
  };

  const handleChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;

    if (name === "student") {
      const selectedStudent = Students.find((s) => s.id === Number(value));
      setFormData(name, selectedStudent || null);
    } else if (name === "class_obj") {
      const selectedClass = Classes.find((c) => c.id === Number(value));
      setFormData(name, selectedClass || null);
      if (!formData.academic_year && selectedClass?.academic_year) {
        setFormData("academic_year", selectedClass.academic_year);
      }
    } else {
      setFormData(name, value);
    }
  };

  return (
    <div className="min-h-[400px] w-full flex items-center justify-center p-6">
      <div className="w-full max-w-xl bg-white shadow-xl rounded-2xl border border-gray-100 p-8 space-y-6">

        <div>
          <h2 className="text-2xl font-bold text-gray-800">Enrollment Form</h2>
          <p className="text-sm text-gray-500 mt-1">Assign a student to a class</p>
        </div>

        {errorDetail && <ErrorMessage errorDetail={errorDetail} />}
        {messageMsg && !errorDetail && (
          <div className="bg-green-50 border border-green-200 text-green-700 p-3 rounded-md text-sm">
            {messageMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Select Student</label>
            <select
              name="student"
              onChange={handleChange}
              required
              value={formData.student?.id || ""}
              className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm 
                         focus:outline-none focus:ring-2 focus:ring-blue-500 
                         focus:border-blue-500 transition-all"
            >
              <option value="">-- Select a Student --</option>
              {Students.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.first_name} {s.last_name} (ID: {s.id})
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Select Class</label>
            <select
              name="class_obj"
              onChange={handleChange}
              required
              value={formData.class_obj?.id || ""}
              className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm 
                         focus:outline-none focus:ring-2 focus:ring-indigo-500 
                         focus:border-indigo-500 transition-all"
            >
              <option value="">-- Select Class --</option>
              {Classes.length === 0 && <option disabled>No classes available</option>}
              {Classes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.class_name}
                  {c.teacher_name ? ` — ${c.teacher_name}` : " (No Teacher)"}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Academic Year
            </label>
            <select
              name="academic_year"
              onChange={handleChange}
              value={formData.academic_year || ""}
              required
              className="w-full px-4 py-2.5 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all font-medium"
            >
              <option value="">Select year</option>
              {AcademicYearList.map((year) => (
                <option key={year.id} value={year.year_name}>
                  {year.year_name}
                </option>
              ))}
            </select>
            <p className="text-xs text-gray-500">
              Leave empty to use the selected class academic year.
            </p>
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold
                       hover:bg-blue-700 active:scale-[0.98] transition-all duration-200 shadow-sm"
          >
            {selectedIM ? "Update Enrollment" : "Enroll Student"}
          </button>
        </form>
      </div>
    </div>
  );
}
