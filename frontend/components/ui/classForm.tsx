"use client";

import { useState, useEffect, ChangeEvent, FormEvent } from "react";
import "@/styles/formStyles.css";
import { apiRequest } from '@/src/lib/apiClient';
/* ===== Types ===== */

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
};


export default function classForm({
  formData,
  setFormData,
}: ClassFormProps) {
  const [weekdays, setWeekdays] = useState<OptionBase[]>([]);
  const [teachers, setTeachers] = useState<TeacherBase[]>([]);
  const [subjects, setSubjects] = useState<OptionBase[]>([]);

  const [responseMsg, setResponseMsg] = useState<boolean>(false);
  const [messageMsg, setMessageMsg] = useState<string>("");
  const [error, setError] = useState<boolean>(false);
  const [AcademicYearList, setAcademicYearList] = useState<any>(null);

  useEffect(() => {
    fetchTeachers();
    handleYearSync();
  }, []);

  /* ===== Fetch helpers ===== */

  const fetchTeachers = async () => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/teachers`,
        {
          headers: {
            Authorization: `Bearer ${process.env.NEXT_PUBLIC_TOKEN_VAL}`,
            "Content-Type": "application/json",
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
  const handleYearSync = async () => {
    try {
      const res = await fetch('/api/academic_years');
      const result = await res.json();
      
      if (result.responseCode !== 0) throw new Error(result.responseMessage);
      
      const data = result.data;
        if (data && typeof data == 'object') {
        setAcademicYearList(data.year_list); 
        }
      

      const now = new Date();
      const startYear = now.getMonth() >= 7 ? now.getFullYear() : now.getFullYear() - 1;
      const currentKey = `${startYear}-${startYear + 1}`;

      if (data.year_list[currentKey] !== "true") {
        const updatedList = { ...data.year_list };
        Object.keys(updatedList).forEach(yr => updatedList[yr] = "false");
        updatedList[currentKey] = "true";

        await fetch('/api/academic_years', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ year_list: updatedList })
        });
        
        setAcademicYearList(updatedList);
      } else {
        setAcademicYearList(data.year_list);
      }
    } catch (error) {
      console.error("Internal Sync Error:", error);
    }
  };


  /* ===== Handlers ===== */

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setResponseMsg(true);
    setError(false);
    setMessageMsg("Class Data Found");

    var FormObject = new FormData();
    Object.entries(formData).forEach(([key, value]) =>
      FormObject.append(key, String(value))
    );

    const fetchRequest = await fetch(
      // 1. Added trailing slash to prevent 301 Redirect
      `${process.env.NEXT_PUBLIC_API_URL}/api/v1/classes/`, 
      {
        method: "POST", // 2. Changed to POST
        headers: {
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_TOKEN_VAL}`,
          "Content-Type": "application/json",
        },
        // 3. Added the data body
        body: JSON.stringify(formData),
      }
    );
    console.log(formData);
if (fetchRequest.status === 400) {
  const errorDetails = await fetchRequest.json();
  console.log("The server says:", errorDetails); // This will tell you exactly what is missing
}
    if (!fetchRequest.ok) {
      const errorData = await fetchRequest.json();
      console.error("API Error Details:", errorData);
      return;
    }

    const data_request = await fetchRequest.json();
    console.log("Success:", data_request);
    console.log(data_request);
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
        <h2>Class creation Form</h2>

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
                class name:
                <input
                  type="text"
                  name="class_name"
                  onChange={handleChange}
                  placeholder="Enter the name of the class eg class 1, JHS 2,extra, shs 3 etc"
                  required
                />
              </label>
            </div>

            <div className="feild">
              <label>
                Teacher:
                <select name="teachers" onChange={handleChange} required>
                  <option value="">Select teacher</option>
                  {teachers?.length === 0 && (
                    <option>No list available</option>
                  )}
                  {teachers?.map((t) => (
                      <option key={t.id} value={t.id}>
                          {`${t.first_name} ${t.last_name}`}
                      </option>
                  ))}
                </select>
              </label>
            </div>
          </div>

            <div className="feild">
              <label>
                Academic year:
                <select name="academic_year" onChange={handleChange} required>
                  <option value="">Select academic year</option>
                  
                  {AcademicYearList && AcademicYearList.length === 0 && (
                    <option>No list available</option>
                  )}
                  {AcademicYearList && Object.entries(AcademicYearList).map(([year, isActive]) => (
                    <option key={year} value={year}>
                        {year} {isActive === "true" ? " (Current)" : ""}
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
