"use client";

import React, { useState, useRef, useEffect } from 'react';
import '@/styles/subjects.css'
import '@/styles/classM.css';
import '@/styles/global.css';
import EnrollPopup from "@/components/ui/subjectPopup"
import { fetchWithAuth } from "@/src/lib/apiClient";
import SkeletonTable from '@/components/ui/SkeletonLoader';
import Pagination from '@/src/assets/components/dashboard/Pagnation';
export interface Subject {
  id: number;
  subject_name: string;
  subject_code: string;
}

export interface SubjectApiResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Subject[];
}
interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}
export default function SubjectsManagement() {
const [subjects, setSubjects] = useState<Subject[]>([]);
const [formData, setFormData] = useState({
  subject_name: "",
  subject_code: "",
});
  const [ClassFilter, setClassFilter] = useState("");
  const [active, setActive] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [clickVelvet, setClickVelvet] = useState<number | null>(null);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState(" ");
  const [searchQuery, setSearchQuery] = useState("");
  const checkVelvetClick = useRef<HTMLTableRowElement>(null);
  const [selectedClassId, setSelectedClassId] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [pagination, setPagination] = useState<PaginatedResponse<Subject> | null>(null);
  const [page, setPage] = useState(1);

const fetchSubjects = async () => {
  setIsLoading(true);
  try {
    const res = await fetchWithAuth(
      `${process.env.NEXT_PUBLIC_API_URL}/subjects/`,
      { headers: { "Content-Type": "application/json" } }
    );

    const data: SubjectApiResponse = await res.json();
    setPagination(data)
    setSubjects(data.results || []);
    setIsLoading(false);
  } catch (err) {
    console.error("Failed to load subjects", err);
  }
};


const handleDelete = async (id: number) => {
  if (!confirm("Delete this subject?")) return;

  await fetchWithAuth(
    `${process.env.NEXT_PUBLIC_API_URL}/subjects/${id}/`,
    { method: "DELETE" }
  );

  setSubjects(prev => prev.filter(s => s.id !== id));
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

const handleStartEdit = (item: Subject) => {
  setSelectedId(item.id);
  setFormData({
    subject_name: item.subject_name,
    subject_code: item.subject_code,
  });
  setActive(true);
};


  const handleVelvetToggle = (index: number) => {
    setClickVelvet(prev => (prev === index ? null : index));
    console.log('click herer');
  };

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
  fetchSubjects();
}, []);

  return (
    <div className="dashboardWrapper">
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
            <h1>Subjects Management</h1>
            <p>Manage academic subjects and teacher assignments</p>
          </div>
          <button
            className="primaryBtn"
            onClick={() => {
              setFormData({
                subject_name: "",
                subject_code: "",
              });
              setSelectedId(null);
              handlePopup();
            }}
          >
            Add Subject
          </button>

        </header>

        <main className="tableCard">
          {isLoading ? (
            <SkeletonTable rows={5} columns={3} />
          ) : (
          <table className="subjectTable">
            <thead>
              <tr>
                <th>Subject Name</th>
                <th>Subject Code</th>
                <th>Actions</th>
              </tr>

            </thead>
            <tbody>
              {subjects.length > 0 ? (
                subjects.map((item, index) => (
                  <tr key={item.id} ref={clickVelvet === index ? checkVelvetClick : null}>
                    <td>{item.subject_name}</td>
                    <td>{item.subject_code}</td>
                    <td className="action_tr">
                        <button className="menu-trigger">
                          <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" onClick={() => handleVelvetToggle(index)}>
                            <path d="M480-160q-33 0-56.5-23.5T400-240q0-33 23.5-56.5T480-320q33 0 56.5 23.5T560-240q0 33-23.5 56.5T480-160Zm0-240q-33 0-56.5-23.5T400-480q0-33 23.5-56.5T480-560q33 0 56.5 23.5T560-480q0 33-23.5 56.5T480-400Zm0-240q-33 0-56.5-23.5T400-720q0-33 23.5-56.5T480-800q33 0 56.5 23.5T560-720q0 33-23.5 56.5T480-640Z"/>
                          </svg>
                        </button>

                      <div className={`actionContainer ${clickVelvet === index ? "active" : ""}`}>
                        <button className="actionBtn btnEdit" onClick={() => handleStartEdit(item)}>
                          Edit
                        </button>
                        <button className="actionBtn btnDelete" onClick={() => handleDelete(item.id)}>
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={3} style={{ textAlign: "center", padding: "2rem" }}>
                    No subjects found.
                  </td>
                </tr>
              )}
            </tbody>

          </table>)}
        </main>
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
  );
}