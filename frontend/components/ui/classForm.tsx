
"use client";

import { useState, useEffect, ChangeEvent, FormEvent } from "react";
import "@/styles/formStyles.css";
import { fetchWithAuth } from '@/src/lib/apiClient';

type OptionBase = {
  id: number | string;
  name?: string;
  label?: string;
};
interface TeacherBase {
  id: number;
  first_name: string;
  last_name: string;
  specialization: number;
  user: {
    id: string;
    email: string;
    first_name: string;
    last_name: string;
    role: string;
    is_active: boolean;
  };
}

type ClassFormProps = {
  formData: Record<string, any>;
  fieldName: string | string[];
  setFormData:  (field: string, value: any) => void;
  isDeleting:Boolean
  isUpdating:Boolean
  onSuccess?: (payload?: any) => void;
};

export interface YearsModel {
  end_date: string
  id: number
  is_current: boolean
  start_date: string
  year_name: string
}
export default function classForm({
  formData,
  setFormData,
  isDeleting,
  isUpdating,
  onSuccess
}: ClassFormProps) {
  const [weekdays, setWeekdays] = useState<OptionBase[]>([]);
  const [teachers, setTeachers] = useState<TeacherBase[]>([]);
  const [subjects, setSubjects] = useState<OptionBase[]>([]);
  const [responseMsg, setResponseMsg] = useState<boolean>(false);
  const [messageMsg, setMessageMsg] = useState<string>("");
  const [error, setError] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [AcademicYearList, setAcademicYearList] = useState<YearsModel[]>([]);

  useEffect(() => {
    const syncTeacherData = async () => {
      if (!formData.teachers) {
        setSubjects([]); 
        return;
      }

      try {
        const res = await fetchWithAuth(
          `${process.env.NEXT_PUBLIC_API_URL}/teachers/${formData.teachers}/subjects/`
        );
        
        if (res.ok) {
          const fetchedSubjects = await res.json();
          
          setSubjects(fetchedSubjects); 

          const ids = fetchedSubjects.map((s: any) => s.id);
          
          setFormData("subject_id", ids); 
        }
      } catch (err) {
        console.error("Auto-fetch failed:", err);
      }
    };

    syncTeacherData();
    setFormData("class_teacher", parseInt(formData.class_teacher_id));
  }, [formData.teachers]);

  useEffect(() => {
    const date = new Date().getFullYear();
    fetchTeachers();
    setAcademicYearList(handleYearSync());
  }, []);


  const fetchTeachers = async () => {
    try {
      const res = await fetchWithAuth(
        `${process.env.NEXT_PUBLIC_API_URL}/teachers`,
        {
          headers: {
            "Content-Type": "application/json"
          },
        }
      );
      const data = await res.json();
      if(data){
        const result_set = data.results;
        setTeachers(result_set);
      }
      
    } catch (err) {
      console.error("Failed to load teachers", err);
    }
  };

    const handleYearSync = (): any => {
      const currentYear = new Date().getFullYear();
      const startYear   = 2000;

      return Array.from(
        { length: currentYear - startYear + 1 },
        (_, i) => {
          const year = currentYear - i;        
          return {
            end_date:   `${year}-${year + 1}`,
            start_date:  year,
            id:          i,
            is_current:  year === currentYear,
            year_name:  `${year}-${year + 1}`,
          };
        }
      );
    };


  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setResponseMsg(true);
    setError(false);
    setIsSubmitting(true);
    
    const url = isUpdating 
      ? `${process.env.NEXT_PUBLIC_API_URL}/classes/${formData.id}/`
      : `${process.env.NEXT_PUBLIC_API_URL}/classes/`;
    
    const method = isUpdating ? "PUT" : "POST";
    
    setMessageMsg(isUpdating ? "Updating Class..." : "Creating Class...");

    try {
      const fetchRequest = await fetchWithAuth(url, {
        method: method, 
        headers:{ 
          "Content-Type": "application/json"
        },
        body: JSON.stringify(formData),
      });

      if (fetchRequest.status === 400) {
        const errorDetails = await fetchRequest.json();
        const detail = errorDetails?.detail;
        if (detail) {
          const message =
            detail.non_field_errors?.[0] ||           
            Object.values(detail)  
              .flat()
              .find((msg) => typeof msg === "string") ||
            "Validation error. Please check your inputs.";

          setMessageMsg(message);
        } else {
          setMessageMsg("Validation error. Please check your inputs.");
        }
        setTimeout(() => {
          setResponseMsg(false);
          setMessageMsg("");
        }, 3000);
        return;
      }
      
      if (!fetchRequest.ok) {
        const errorData = await fetchRequest.json();
        console.error("API Error Details:", errorData);
        setError(true);
        setMessageMsg("An error occurred. Please try again.");
        setTimeout(() => {
          setResponseMsg(false);
          setMessageMsg("");
        }, 3000);
        return;
      }

      const data_request = await fetchRequest.json();
      console.log("Success:", data_request);
      
      setError(false);
      setMessageMsg(isUpdating ? "Class updated successfully!" : "Class created successfully!");
      onSuccess?.(data_request);
      
      if (isUpdating) {
        alert("Class updated successfully!");
      }
      
      setTimeout(() => {
        setResponseMsg(false);
        setMessageMsg("");
      }, 3000);

    } catch (err) {
      console.error("Request failed:", err);
      setError(true);
      setMessageMsg("Network error. Please try again.");
      setTimeout(() => {
        setResponseMsg(false);
        setMessageMsg("");
      }, 3000);
    } finally {
      setIsSubmitting(false);
    }
  };



  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    if(name === "class_teacher"){
      setFormData('teacher_id',Number(value));
    }

    if (name === "class_teacher" || name === "grade_level" || name === "capacity") {
      setFormData(name, value ? parseInt(value) : "");

    } 
    else {
      setFormData(name, value);
    }
  };

  return (
    <div className="form-page">
      <div className="form-wrapper">
        <h2>{formData.id ? "Edit Class" : "Class Creation Form"}</h2>

        <form onSubmit={handleSubmit} className="teaching-form">
          <div className={`form-status ${responseMsg ? "show" : ""} ${error ? "error" : "success"}`}>
            {isSubmitting && <span className="status-spinner" aria-hidden="true" />}
            {messageMsg && (
              <p className="status-message">{messageMsg}</p>
            )}
          </div>

          <div className="feild_x">
            <div className="feild">
              <label>
                class name:
                <input
                  type="text"
                  name="class_name"
                  value={formData.class_name || ""}
                  onChange={handleChange}
                  placeholder="Enter the name of the class eg class 1, JHS 2,extra, shs 3 etc"
                  required
                />
              </label>
            </div>

            <div className="feild">
              <label>
                Teacher:
                <select 
                  name="class_teacher" 
                  onChange={handleChange} 
                  value={formData.class_teacher || ""} 
                  required
                >
                  <option value="">Select teacher</option>
                  {teachers?.map((t) => (
                    <option key={t.id} value={t.id}>
                      {`${t.first_name} ${t.last_name}`}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          </div>
          <div className="feild_x_x">
            <div className="feild"> 
              <label>
                Grade level
                <input type="text" name="grade_level" value={formData.grade_level || ""} onChange={handleChange} placeholder="Enter the grade level eg Grade 1, Grade 2, Form 1, Form 2 etc" required />
              </label>
            </div>
            <div className="feild"> 
              <label>
                Section
                <input type="text" name="section" value={formData.section || ""} onChange={handleChange} placeholder="Enter the section of the class" required />
              </label>
            </div>
            <div className="feild"> 
              <label>
                capacity
                <input type="text" name="capacity" value={formData.capacity || ""} onChange={handleChange} placeholder="Enter the capacity of the class" required />
              </label>
            </div>
          </div>
          <div className="feild_x">
            <div className="feild">
              <label>
                Academic year:
                <select name="academic_year" onChange={handleChange} value={formData.academic_year || ""} required>
                  <option value="">Select academic year</option>
                  
                  {AcademicYearList && AcademicYearList.length === 0 && (
                    <option>No list available</option>
                  )}
                  {AcademicYearList.map((year) => (
                    <option key={year.id} value={year.year_name}>
                        {year.year_name}
                    </option>
                    ))}
                </select>
              </label>
            </div>

            <div className="feild">
              <label>
                Room number:
                <input type="text" name="room_number" value={formData.room_number || ""} onChange={handleChange} placeholder="Enter the room number" required />
              </label>
            </div>
          </div>

          <div className="button-group">
            <button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Please wait..." : formData.id ? "Update Class" : "Submit"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
