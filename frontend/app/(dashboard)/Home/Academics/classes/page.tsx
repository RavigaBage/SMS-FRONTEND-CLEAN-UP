"use client";

import React, { useState, useRef, useEffect } from 'react';
import ClassPopup from "@/components/ui/classPopup";
import { fetchWithAuth } from '@/src/lib/apiClient';
import SkeletonTable from '@/components/ui/SkeletonLoader';
import Pagination from '@/src/assets/components/dashboard/Pagnation';
import {ErrorState} from '@/src/assets/components/dashboard/ErrorState';
import '@/styles/classM.css'
import '@/styles/global.css'
import Loading from '@/src/assets/components/dashboard/loader';

export interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
  is_active: boolean;
  is_staff: boolean;
  created_at: string;
}
export interface YearsModel {
  end_date: string
  id: number
  is_current: boolean
  start_date: string
  year_name: string
}

export interface Teacher {
  id: number;
  first_name: string;
  last_name: string;
  full_name:string;
  email: string;
}

export interface Classroom {
  id: number;
  class_name: string;
  academic_year: string;
  academic_year_name: string;
  room_number?: string;
  class_teacher: Teacher;
  teacher_name?: string;
  subjects: any[];
  capacity: number;
  current_enrollment: number;
  students_on_leave: number;
  grade_level?: string;
  section?: string;
}

interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

type ClassBase = PaginatedResponse<Classroom>;


export async function fetchStudentsByClass(
  className: string,
  academicYear: string
) {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL;

  const url =
    `${baseUrl}/enrollments/` +
    `?class=${encodeURIComponent(className)}` +
    `&academic_year=${encodeURIComponent(academicYear)}`;

  const response = await fetchWithAuth(url);

  if (!response.ok) {
    throw new Error("Failed to fetch students");
  }

  return response.json();
}

export default function ClassesManagement() {
  const [clickvelvet, setClickvelvet] = useState<number | null>(null);
  const checkvelvetClick = useRef<HTMLTableRowElement>(null);
  const [classData, setClassData] = useState<Classroom[]>([]);
  const [Subject, setSubjects] = useState<Classroom[]>([]);
  const [AcademicYears, setAcademicYears] = useState<YearsModel[]>([]);
  const [active, setActive] = useState(false);
  const [isUpdating, setUpdating] = useState(false);
  const [isDeleting, setDeleting] = useState(false);
  const [isLoading, setLoading] = useState(false);
  const [formData, setFormData] = useState<Record<string, any>>({
    schoolClass: "",
    term: "",
    weekdays: "",
    timeSlots: "",
    roomNumber: "",
    teachingAssignment: "",
    status: "",
    teacher: "",
    subject: "",
    teacher_id: "",
    subject_id: "",
    year: "",
  });

  const EmptyForm: Classroom = {
    id: 0,
    class_name: "",
    academic_year: "",
    academic_year_name: "",
    room_number: "",
    class_teacher: {} as Teacher,
    subjects: [],
    capacity: 0,
    current_enrollment: 0,
    students_on_leave: 0
  }
  
  const [selectedClass, setSelectedClass] = useState<Classroom | null>(null);
  const [selectedYear, setSelectedYear] = useState('2025-2026');
  const [pagination, setPagination] = useState<PaginatedResponse<Classroom> | null>(null);
  const [page, setPage] = useState(1);



  
  const handleEditClick = (item: Classroom) => {
    setSelectedClass(item);
    
    setFormData({
        id: item.id,
        class_name: item.class_name,
        academic_year: item.academic_year,
        academic_year_name: item.academic_year_name,
        room_number: item.room_number,
        class_teacher: item.class_teacher,
        teacher_name: item.teacher_name,
        subjects: item.subjects,
        capacity: item.capacity,
        current_enrollment: item.current_enrollment,
        grade_level: item.grade_level,
        section: item.section
    });
    
    setActive(true); 
    setClickvelvet(null); 
    setUpdating(true);
    
  };
  useEffect(() => {
    loadData();
    setLoading(false)
  }, [selectedClass, selectedYear]);

    const loadData = async () => {
        setLoading(true);
        if (!selectedClass) return;
        try {
            const data = await fetchStudentsByClass(selectedClass.class_name, selectedYear);
        } catch (err) {
            console.error("Error loading students:", err);
        }
    };
  const handleDelete = async (item: Classroom) => {
    const confirmDelete = window.confirm(
      `Are you sure you want to delete the class "${item.class_name}"? This action cannot be undone.`
    );

    if (!confirmDelete) {
      return;
    }

    setDeleting(true);

    try {
      const fetchRequest = await fetchWithAuth(
        `${process.env.NEXT_PUBLIC_API_URL}/classes/${item.id}/`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json"
          }
        }
      );

      if (!fetchRequest.ok) {
        const errorData = await fetchRequest.json();
        console.error("Delete Error:", errorData);
        alert("Failed to delete class. Please try again.");
        setDeleting(false);
        return;
      }

      await fetcClassData();
      setClickvelvet(null);

    } catch (err) {
      console.error("Delete request failed:", err);
      alert("Network error. Please try again.");
    } finally {
      setDeleting(false);
    }
  };

  const updateFormField = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };
  const handlePopup = () => {
    setActive((prev) => {
      const isClosing = prev === true;
      
      if (isClosing) {
        setUpdating(false);
        setFormData({
          schoolClass: "",
          term: "",
          weekdays: "",
          timeSlots: "",
          roomNumber: "",
          teachingAssignment: "",
          status: "",
          teacher: "",
          subject: "",
          teacher_id: "",
          subject_id: "",
          year: "",
        });
      }
      
      return !prev;
    });
  };

  const handleVelvetToggle = (index: number) => {
    setClickvelvet(prevIndex => (prevIndex === index ? null : index));
  };

 
  useEffect(() => {
    fetcClassData();
    generateAcademicYears();
    const handleClickOutside = (event: MouseEvent) => {
      if (checkvelvetClick.current && !checkvelvetClick.current.contains(event.target as Node)) {
        setClickvelvet(null);
      }
    };

    if (clickvelvet !== null) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [clickvelvet]);

  const fetcClassData = async () => {
    try {
      const res = await fetchWithAuth(
        `${process.env.NEXT_PUBLIC_API_URL}/classes`,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      const data: PaginatedResponse<Classroom> = await res.json();
      if (data) {
        setPagination(data);         
        setClassData(data.results); 
        setPage(1); 
        const result_set = data.results;
        setClassData(result_set);
      }
    } catch (err) {
      console.error("Failed to load classes", err);
    }
  }

  const handleUpdate = () => {
    setDeleting(!isUpdating);
  }


  const generateAcademicYears =async ()=> {
      try {
        const res = await fetchWithAuth(
          `${process.env.NEXT_PUBLIC_API_URL}/academic-years`,
          {
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
        const data = await res.json();
        if (data) {
          const result_set = data.results;
          setAcademicYears(result_set);
        }
      } catch (err) {
        console.error("Failed to load academic-years", err);
      }
  };
  return (

    <div className="dashboardWrapper CLASSDATA">
      <ClassPopup
        active={active}
        togglePopup={handlePopup}
        formData={formData}
        fieldNames={["weekdays", "timeSlots", "teachers", "subjects"]}
        setFormData={updateFormField}
        isDeleting={isDeleting}
        isUpdating={isUpdating}
      />
      {isLoading ? (
                  <SkeletonTable rows={5} columns={3} />
                ) : (
      <div className="dashboard">
        {/* Header */}
        <header className="header">
          <div>
            <h1>Classes Management</h1>
            <p>Manage academic classes, teachers, and students</p>
          </div>
        </header>

        {/* Filters */}
        <section className="filters">
           <select
                className="nav-select short"
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
            >
              <option>Select academic year</option>
                {AcademicYears.map((year) => (
                <option key={year.id} value={year.id}>
                    {year.year_name}
                </option>
                ))}
            </select>

          <select aria-label="Filter by Class Level">
            <option>Class Level</option>
            <option>Primary</option>
            <option>Junior High</option>
            <option>Senior High</option>
          </select>
          
          <div className="filter" onClick={handlePopup}>
            <div className="filter_list">
              <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#ffffff">
                <path d="M400-240v-80h160v80H400ZM240-440v-80h480v80H240ZM120-640v-80h720v80H120Z"/>
              </svg>
            </div>
            <p>Filter</p>
          </div>

          <div className="add_subject" onClick={() => {
            setUpdating(false);
            setTimeout(() => {
                handleEditClick(EmptyForm);
            }, 100);
          }}>
            <div className="filter_list">
              <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#fff">
                <path d="M680-40v-120H560v-80h120v-120h80v120h120v80H760v120h-80ZM200-200v-560 560Zm0 80q-33 0-56.5-23.5T120-200v-560q0-33 23.5-56.5T200-840h560q33 0 56.5 23.5T840-760v353q-18-11-38-18t-42-11v-324H200v560h280q0 21 3 41t10 39H200Zm120-160q17 0 28.5-11.5T360-320q0-17-11.5-28.5T320-360q-17 0-28.5 11.5T280-320q0 17 11.5 28.5T320-280Zm0-160q17 0 28.5-11.5T360-480q0-17-11.5-28.5T320-520q-17 0-28.5 11.5T280-480q0 17 11.5 28.5T320-440Zm0-160q17 0 28.5-11.5T360-640q0-17-11.5-28.5T320-680q-17 0-28.5 11.5T280-640q0 17 11.5 28.5T320-600Zm120 160h240v-80H440v80Zm0-160h240v-80H440v80Zm0 320h54q8-23 20-43t28-37H440v80Z"/>
              </svg>
            </div>
            <p>Add Class</p>
          </div>
        </section>

        {/* Table Card */}
        <main className="tableCard">
          <table className="classTable">
            <thead>
              <tr>
                <th>Class Name</th>
                <th>Academic Year</th>
                <th>Assigned Teacher</th>
                <th>Room Number</th>
                <th>Students</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {classData.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: "center", padding: "2rem" }}>
                    <div>
                      <ErrorState code={6} message="No Subject Found"/>
                    </div>
                  </td>
                </tr>
              ) : (
                classData.map((item, index) => (
                  <tr 
                    key={item.id} 
                    ref={clickvelvet === index ? checkvelvetClick : null}
                  >
                    <td style={{ fontWeight: 600 }}>{item.class_name}</td>
                    
                    <td>{item.academic_year_name}</td>
                    
                    <td>{item.teacher_name || "Unassigned"}</td>

                    <td>{item.room_number}</td>

                    <td>
                      {item.capacity > 0 
                        ? `${item.current_enrollment} / ${item.capacity}` 
                        : '0'}
                    </td>
                    

                    <td className="action_tr">
                      <div className="action_btn">
                        <button 
                          onClick={(e) => {
                            e.stopPropagation(); 
                            handleVelvetToggle(index);
                          }}
                          style={{ background: 'none', border: 'none', cursor: 'pointer' }}
                          aria-label="Actions menu"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#000000">
                            <path d="M480-160q-33 0-56.5-23.5T400-240q0-33 23.5-56.5T480-320q33 0 56.5 23.5T560-240q0 33-23.5 56.5T480-160Zm0-240q-33 0-56.5-23.5T400-480q0-33 23.5-56.5T480-560q33 0 56.5 23.5T560-480q0 33-23.5 56.5T480-400Zm0-240q-33 0-56.5-23.5T400-720q0-33 23.5-56.5T480-800q33 0 56.5 23.5T560-720q0 33-23.5 56.5T480-640Z"/>
                          </svg>
                        </button>
                      </div>

                      <div className={`actionContainer ${clickvelvet === index ? 'active' : ""}`}>
                        <button 
                          className="actionBtn btnEdit" 
                          onClick={() => handleEditClick(item)}
                        >
                          Edit
                        </button>
                        <button className="actionBtn btnAssign">
                          Assign Teacher
                        </button>
                        <button 
                          className="actionBtn btnManage" 
                          onClick={() => handleDelete(item)}
                          disabled={isDeleting}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
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
      </div>)}
    </div>
  );
}







