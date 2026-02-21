"use client";

import { useState, useEffect } from "react";
import { apiRequest, fetchWithAuth } from "@/src/lib/apiClient";
import { StudentTable } from "@/src/assets/components/management/StudentTable";
import { AddStudentModal } from "@/src/assets/components/management/AddStudentModal";
import { Student } from "@/src/assets/types/api";
import { Pagination } from "@/src/assets/components/management/Pagination";

import '@/styles/student_page.css';

interface PaginatedResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: any[];
  detail?: string;
}
export interface ClassData {
  id: number;
  class_name: string;
  academic_year: string;
  teacher_name:String;
  teacher: Teacher | null; 
}
export interface Teacher {
  id: number;
  first_name: string;
  last_name: string;
  specialization: number;
}

export interface ClassesBase {
  count: number;
  next: string | null;
  previous: string | null;
  results: ClassData[];
}
interface Filters {
  grade: string;
  gender: string;
  status: string;
}

const PAGE_SIZE = 10;

export default function StudentsManagementPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [students, setStudents] = useState<Student[]>([]);
  const [Classes, setClasses] = useState<ClassData[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalResults, setTotalResults] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState<Filters>({
    grade: "",
    gender: "",
    status: "",
  });

  const totalPages = Math.ceil(totalResults / PAGE_SIZE);

  // Build query string from active filters + page + search
  const buildQuery = (page: number, currentFilters: Filters, search: string) => {
    const params = new URLSearchParams();
    params.set("page", String(page));
    if (search)                params.set("search", search);
    if (currentFilters.grade)  params.set("grade", currentFilters.grade);
    if (currentFilters.gender) params.set("gender", currentFilters.gender);
    if (currentFilters.status) params.set("status", currentFilters.status);
    return params.toString();
  };

  const fetchStudents = async (page: number, currentFilters: Filters, search: string) => {
    setIsLoading(true);
    try {
      const query = buildQuery(page, currentFilters, search);
      const res = await apiRequest<PaginatedResponse>(`/students/?${query}`);

      if (!res || res.detail === "Invalid page.") {
        setCurrentPage(1);
        return;
      }

      const result: PaginatedResponse = {
        count: res.count ?? 0,
        next: res.next ?? null,
        previous: res.previous ?? null,
        results: res.results ?? [],
      };

      setTotalResults(result.count);

      const formattedData = result.results.map((s: any) => ({
        id: s.user_id || s.id,
        fullName: `${s.first_name} ${s.last_name}`,
        email: s.email || "N/A",
        grade: s.grade || "Unassigned",
        gender: s.gender || "uncaptured",
        enrollmentDate: s.created_at ? new Date(s.created_at).toLocaleDateString() : "N/A",
        status: s.status.charAt(0).toUpperCase() + s.status.slice(1),
        profileImage:
          s.profile_image ||
          `https://ui-avatars.com/api/?name=${s.first_name}+${s.last_name}&background=random`,
      }));

      setStudents(formattedData as any);
    } catch (err) {
      console.error("Failed to load students:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Re-fetch when page, filters, or search changes
  useEffect(() => {
    fetchStudents(currentPage, filters, searchTerm);
    fetchClasses();
  }, [currentPage, filters, searchTerm]);

  // When a filter changes, reset to page 1
  const handleFilterChange = (field: keyof Filters, value: string) => {
    setFilters(prev => ({ ...prev, [field]: value }));
    setCurrentPage(1);
  };
  const fetchClasses = async () => {
    try {
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
         return;
      }
  
      const data: ClassesBase = await res.json();
      if (data && data.results) {
        setClasses(data.results);
      }
    } catch (err) {
      console.error("Network or Auth error:", err);
    }
  };
  const handleClearFilters = () => {
    setFilters({ grade: "", gender: "", status: "" });
    setSearchTerm("");
    setCurrentPage(1);
  };

  const hasActiveFilters = Object.values(filters).some(v => v !== "") || searchTerm !== "";

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > totalPages) return;
    setCurrentPage(newPage);
  };

  const handleDelete = async (studentId: number) => {
    if (!confirm("Are you sure you want to delete this student?")) return;
    try {
      await fetchWithAuth(`${process.env.NEXT_PUBLIC_API_URL}/students/${studentId}/`, {
        method: "DELETE",
      });
      const newTotal = totalResults - 1;
      const newTotalPages = Math.ceil(newTotal / PAGE_SIZE);
      if (currentPage > newTotalPages && newTotalPages > 0) {
        setCurrentPage(newTotalPages);
      } else {
        fetchStudents(currentPage, filters, searchTerm);
      }
      setTotalResults(newTotal);
    } catch (error) {
      console.error("Failed to delete student:", error);
    }
  };

  return (
    <div className="students-page">

      {/* Page Header */}
      <div className="page-header">
        <div className="page-title-group">
          <h1 className="page-title">Students</h1>
          <p className="page-subtitle">Manage and track student records</p>
        </div>
        <div className="page-actions">
          <button className="primary-button" onClick={() => setIsModalOpen(true)}>
            + Add Student
          </button>
        </div>
      </div>

      {/* Control Bar */}
      <div className="control-bar">
        <div className="search-wrapper">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            placeholder="Search by name or ID..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="search-input"
          />
        </div>
        <div className="control-actions">
          <button className="ghost-button">Export</button>
        </div>
      </div>

      {/* Inline Filter Bar */}
      <div className="flex flex-wrap items-center gap-3 p-4 bg-white border border-gray-100 rounded-xl shadow-sm">

  <select
    value={filters.grade}
    onChange={(e) => handleFilterChange("grade", e.target.value)}
    className="flex-1 min-w-[180px] px-3 py-2 text-sm text-gray-700 bg-gray-50 border border-gray-200 rounded-lg outline-none cursor-pointer hover:border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-50 transition-all"
  >
    <option value="">Select Class</option>
    {Classes.length === 0 && (
      <option disabled>No classes available</option>
    )}
    {Classes.map((t) => (
      <option key={t.id} value={t.id}>
        {t.class_name}{t.teacher_name ? ` — ${t.teacher_name}` : " (No Teacher)"}
      </option>
    ))}
  </select>

  <select
    value={filters.gender}
    onChange={(e) => handleFilterChange("gender", e.target.value)}
    className="flex-1 min-w-[140px] px-3 py-2 text-sm text-gray-700 bg-gray-50 border border-gray-200 rounded-lg outline-none cursor-pointer hover:border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-50 transition-all"
  >
    <option value="">All Genders</option>
    <option value="male">Male</option>
    <option value="female">Female</option>
    <option value="other">Other</option>
  </select>

  <select
    value={filters.status}
    onChange={(e) => handleFilterChange("status", e.target.value)}
    className="flex-1 min-w-[140px] px-3 py-2 text-sm text-gray-700 bg-gray-50 border border-gray-200 rounded-lg outline-none cursor-pointer hover:border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-50 transition-all"
  >
    <option value="">All Statuses</option>
    <option value="active">Active</option>
    <option value="inactive">Inactive</option>
  </select>

  {hasActiveFilters && (
    <button
      onClick={handleClearFilters}
      className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-red-500 bg-red-50 border border-red-100 rounded-lg hover:bg-red-100 hover:border-red-200 transition-all whitespace-nowrap"
    >
      <span className="text-xs">✕</span>
      Clear filters
    </button>
  )}

</div>

      <div className="table-card">
        <StudentTable
          students={students}
          onDelete={handleDelete}
        />
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
          totalResults={totalResults}
          resultsPerPage={PAGE_SIZE}
        />
      </div>

      {/* Modal */}
      <AddStudentModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          fetchStudents(currentPage, filters, searchTerm);
        }}
        onSuccess={() => {
          setIsModalOpen(false);
          fetchStudents(currentPage, filters, searchTerm);
        }}
      />

    </div>
  );
}