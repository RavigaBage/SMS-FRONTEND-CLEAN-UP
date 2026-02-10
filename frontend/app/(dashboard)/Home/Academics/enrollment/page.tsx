"use client";

import React, { useState, useRef, useEffect } from 'react';
import '@/styles/enrollment.css';
import '@/styles/classM.css';
import '@/styles/global.css';
import EnrollPopup from "@/components/ui/enrollmentPopup";
import SkeletonTable from '@/components/ui/SkeletonLoader';
import { fetchWithAuth } from "@/src/lib/apiClient";
import Pagination from '@/src/assets/components/dashboard/Pagnation';
import {ErrorState} from '@/src/assets/components/dashboard/ErrorState';

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

export interface Parent {
  id: number;
  user: UserInfo;
  phone_number?: string | null;
  address?: string | null;
}

export interface Student {
  id: number;
  user: UserInfo;
  parent: Parent | null;
  first_name: string;
  last_name: string;
  date_of_birth: string;
  status: string;
}

export interface Teacher {
  id: number;
  user: UserInfo;
  first_name: string;
  last_name: string;
  specialization: string;
}

export interface ClassData {
  id: number;
  class_name: string;
  teachers: Teacher[];
}

export interface EnrollmentData {
  id: number;
  student: Student;
  class_obj: ClassData;
  enrollment_date: string;
  status_display: string;
}

export interface EnrollmentApiResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: EnrollmentData[];
}

export interface EnrollmentApiResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: EnrollmentData[];
}
export interface ClassesBase {
  count: number;
  next: string | null;
  previous: string | null;
  results: ClassData[];
}
interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export default function EnrollmentsManagement() {
  const [enrollmentData, setEnrollmentData] = useState<EnrollmentData[]>([]);
  const [formData, setFormData] = useState<Record<string, any>>({
    student: "",
    class_obj: "",
    stauts:"",
    roll_number:"",
  });
  const [Classes, setClasses] = useState<ClassData[]>([]);
  const [ClassFilter, setClassFilter] = useState("");
  const [active, setActive] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [clickVelvet, setClickVelvet] = useState<number | null>(null);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState(" ");
  const [searchQuery, setSearchQuery] = useState("");
  const checkVelvetClick = useRef<HTMLTableRowElement>(null);
  const [selectedClassId, setSelectedClassId] = useState("");
  const [isloading, setIsLoading] = useState(true);
  const [pagination, setPagination] = useState<PaginatedResponse<EnrollmentData> | null>(null);
  const [page, setPage] = useState(1);

  const fetchEnrollmentData = async (filterClassId?: string) => {
    setIsLoading(true);
    try {
      const baseUrl = `${process.env.NEXT_PUBLIC_API_URL}/enrollments/`;
      const params = new URLSearchParams();

      if (filterClassId && filterClassId !== "") params.append("class_id", filterClassId);

      if (searchQuery && searchQuery.trim() !== "") params.append("search", searchQuery.trim());

      const url = params.toString() ? `${baseUrl}?${params.toString()}` : baseUrl;

      const res = await fetchWithAuth(url, {
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data: EnrollmentApiResponse = await res.json();
      setEnrollmentData(data.results || []);
      setIsLoading(false);
      setPagination(data);     
      setPage(1);

    } catch (err) {
      console.error("Failed to load enrollment data", err);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Are you sure you want to remove this enrollment?")) return;

    try {
      const res = await fetchWithAuth(`${process.env.NEXT_PUBLIC_API_URL}/enrollments/${id}/`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (res.ok) {
        setEnrollmentData((prev) => prev.filter((item) => item.id !== id));
        setClickVelvet(null);
      }
    } catch (err) {
      console.error("Error deleting:", err);
    }
  };

  const updateFormField = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handlePopup = () => {
    if (active) setSelectedId(null);
    setActive(!active);
  };
  const handleClassFilter = (e: string)=>{
    setClassFilter(e)
    setSelectedClassId(e)
  }
  const handleSearch = (e?: React.FormEvent) => {
    e?.preventDefault();
    setSearchQuery(searchTerm.toLowerCase());
    setIsSearching(!!searchTerm);
  };
  const searchedData = (name:string,searchQuery:string)=>{
    const lowerName = name.toLowerCase();
    const lowerSearch = searchQuery.toLowerCase();
    const startIndex = lowerName.indexOf(lowerSearch);
    if (startIndex === -1) return name;
    return (
      <p style={{ fontSize: "18px" }}>
        {lowerName.substring(0, startIndex)}
        <mark className="highlight">{searchQuery}</mark>
        {lowerName.substring(startIndex + searchQuery.length)}
      </p>
    );
  };
  const handleStartEdit = (item: EnrollmentData) => {
    setSelectedId(item.id);
    updateFormField("student", item.student);
    updateFormField("class_obj", item.class_obj);
    setClickVelvet(null);
    setActive(true);
  };

  const handleVelvetToggle = (index: number) => {
    setClickVelvet(prev => (prev === index ? null : index));
  };

  const fetchClasses = async () => {
    try {
      const res = await fetchWithAuth(
        `${process.env.NEXT_PUBLIC_API_URL}/classes/`,
        {
          headers: {
            Authorization: `Bearer ${process.env.NEXT_PUBLIC_TOKEN_VAL}`,
            "Content-Type": "application/json",
          },
        }
      );
  
      if (!res.ok) {
          throw new Error(`Server error: ${res.status}`);
      }
  
      const data: ClassesBase = await res.json();
      
  
      if (data && data.results) {
        setClasses(data.results);
      } else {
        console.warn("API returned success but results array is missing:", data);
      }
      
    } catch (err) {
      console.error("Failed to load Classes:", err);
    }
  };
  useEffect(() => {
    fetchEnrollmentData();
    fetchClasses();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (checkVelvetClick.current && !checkVelvetClick.current.contains(event.target as Node)) {
        setClickVelvet(null);
      }
    };

    if (clickVelvet !== null) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [clickVelvet]);

useEffect(() => {
  fetchEnrollmentData(selectedClassId);
}, [selectedClassId, searchQuery]);
const displayData = enrollmentData;

  return (
    <div className="dashboardWrapper ENROLLDATA">
      <div className="dashboard">
        
        <EnrollPopup
          active={active}
          togglePopup={handlePopup}
          formData={formData}
          fieldNames={["student", "class_obj"]}
          setFormData={updateFormField}
          selectedIM={selectedId}
        />

        <header className="header">
          <div>
            <h1>Enrollments Management</h1>
            <p>Track and manage student enrollments across academic years</p>
          </div>
          <button className="primaryBtn" onClick={() => {
            setFormData({ student: "", class_obj: "" });
            handlePopup();
          }}>
            Enroll Student
          </button>
        </header>

        <section className="controls">
          <form onSubmit={handleSearch} className="searchBox">
            <input
              type="text"
              placeholder="Search student or class..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <button type="submit" className="search-button">
              <svg width="16" height="16" fill="#000" viewBox="0 0 16 16">
                <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0z"/>
              </svg>
            </button>
          </form>

        <div className="filters">
          <div className="filter-group">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon>
            </svg>
            
            <select 
              aria-label="Academic Year" 
              value={ClassFilter} 
              onChange={(e) => handleClassFilter(e.target.value)}
            >
                <option value="">Select Class</option>
                
                {Classes.length === 0 && (
                    <option disabled>No classes available</option>
                )}

                {Classes.map((t) => (
                    <option key={t.id} value={t.id}>
                    {t.class_name} 
                    </option>
                ))}
            </select>
            
            {(ClassFilter) && (
              <button className="clear-filters" onClick={() => { setClassFilter(""); }}>
                Reset
              </button>
            )}
          </div>
        </div>
        </section>

        <main className="tableCard">
           {isloading ? (<SkeletonTable rows={4} columns={5} />):(
          <table className="enrollmentTable">
            <thead>
              <tr>
                <th>Student Name</th>
                <th>Class</th>
                <th>Academic Year</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {isSearching && searchQuery && (
                <tr>
                  <td colSpan={5} className="full-width-cell">
                    <div className="search-results-info">
                      Showing results for: <strong>"{searchQuery}"</strong>
                      <button onClick={() => { setSearchTerm(""); setSearchQuery(""); setIsSearching(false); }}>Reset</button>
                    </div>
                  </td>
                </tr>
              )}

                {displayData.length > 0 ? (
                  displayData.map((item, index) => (
                    <tr key={item.id} ref={clickVelvet === index ? checkVelvetClick : null}>
                      <td>
                            {isSearching ? (
                              searchedData(`${item.student.first_name} ${item.student.last_name}`, searchQuery)
                            ) : (
                              `${item.student.first_name} ${item.student.last_name}`
                            )}
                      </td>
                      <td>{item.class_obj.class_name}</td>
                      <td>{item.enrollment_date}</td>
                      <td>
                        <div className={`status-badge status-${item.status_display.toLowerCase()}`}>
                          <div className="status-dot-container">
                            <span className={`dot dot-${item.status_display.toLowerCase()}`}></span>
                            <span className="status-text">{item.status_display}</span>
                          </div>
                        </div>
                      </td>
                      <td className="action_tr">
                        <button className="menu-trigger">
                          <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" onClick={() => handleVelvetToggle(index)}>
                            <path d="M480-160q-33 0-56.5-23.5T400-240q0-33 23.5-56.5T480-320q33 0 56.5 23.5T560-240q0 33-23.5 56.5T480-160Zm0-240q-33 0-56.5-23.5T400-480q0-33 23.5-56.5T480-560q33 0 56.5 23.5T560-480q0 33-23.5 56.5T480-400Zm0-240q-33 0-56.5-23.5T400-720q0-33 23.5-56.5T480-800q33 0 56.5 23.5T560-720q0 33-23.5 56.5T480-640Z"/>
                          </svg>
                        </button>

                        <div className={`actionContainer ${clickVelvet === index ? 'active' : ""}`}>
                          <button className="actionBtn btnEdit" onClick={() => handleStartEdit(item)}>Edit</button>
                          <button className="actionBtn btnDelete" onClick={() => handleDelete(item.id)}>Delete</button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} style={{ textAlign: "center", padding: "2rem" }}>
                      <div>
                        <ErrorState code={6} message="No Student Enrollment Found"/>
                      </div>
                    </td>
                  </tr>
                )}

            </tbody>
          </table>)}
        </main>
        <div className="footerSpace">
          <div className="footerSpace">
            {pagination && (
              <Pagination
                count={pagination.count}
                next={pagination.next}
                previous={pagination.previous}
                currentPage={page}
                onPageChange={(newPage) => setPage(newPage)}
              />
            )}
          </div>
        </div>

      </div>
    </div>
  );
}