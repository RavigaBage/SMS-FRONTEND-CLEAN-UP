"use client";

import { useState, useEffect } from "react";
import { Plus, Search, RotateCcw, UserX } from "lucide-react";
import { apiRequest, StudentRaw } from "@/src/lib/apiClient";
import { StudentTable } from "@/src/assets/components/management/StudentTable";
import { AddStudentModal } from "@/src/assets/components/management/AddStudentModal";
import { Student } from "@/src/assets/types/api";
import { FilterBar } from "@/src/assets/components/management/FilterBar";
import { Pagination } from "@/src/assets/components/management/Pagination";
import { ErrorMessage, extractErrorDetail } from "@/components/ui/ErrorExtract";

export default function StudentsManagementPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [students, setStudents] = useState<Student[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState<{ classId?: string; status?: string }>(
    {},
  );
  const [isLoading, setIsLoading] = useState(true);
  const [pageError, setPageError] = useState<any>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalResults, setTotalResults] = useState(0);

  const PAGE_SIZE = 20;

  const handleReset = () => {
    setSearchTerm("");
    setFilters({});
    setCurrentPage(1);
  };
  const handleDeleteStudent = async (id: number) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this student? All enrollment records will be removed.",
    );

    if (!confirmed) return;

    try {
      setPageError(null);

      await apiRequest(`/students/${id}/`, {
        method: "DELETE",
      });
      setStudents((prev) => prev.filter((student) => student.id !== id));


      fetchStudents();
    } catch (err: any) {
      console.error("Delete failed:", err);
      setPageError(extractErrorDetail(err) || "Failed to delete student.");
    }
  };

  const fetchStudents = async (page = 1, search = "") => {
    setIsLoading(true);
    try {
      const query = new URLSearchParams();
      query.append("page", String(page));
      query.append("page_size", String(PAGE_SIZE));
      if (filters.classId) query.append("class_id", filters.classId);
      if (filters.status) query.append("status", filters.status);
      if (search.trim()) query.append("search", search.trim());

      const res = await apiRequest<any>(`/students/?${query.toString()}`);

      const hasServerPagination = Array.isArray(res.results);
      let rawList = hasServerPagination
        ? (res.results || [])
        : Array.isArray(res.data)
          ? res.data
          : [];

      if (!hasServerPagination && search.trim()) {
        const s = search.toLowerCase();
        rawList = rawList.filter((item: any) => {
          const fullName = String(item.full_name || "").toLowerCase();
          const admissionNo = String(item.admission_number || "").toLowerCase();
          return fullName.includes(s) || admissionNo.includes(s);
        });
      }

      const effectiveTotal = hasServerPagination
        ? (res.count ?? rawList.length)
        : rawList.length;

      if (!hasServerPagination) {
        const start = (page - 1) * PAGE_SIZE;
        rawList = rawList.slice(start, start + PAGE_SIZE);
      }

      const formattedData: Student[] = rawList.map((s: any) => ({
        id: s.id,
        user: s.id,
        first_name: s.first_name,
        last_name: s.last_name,
        fullName: s.full_name,
        gender: s.gender,
        date_of_birth: s.date_of_birth,
        profileImage:
          s.photo_url ||
          `https://ui-avatars.com/api/?name=${s.first_name}+${s.last_name}&background=random`,
        email: s.email || "",
        grade: s.current_class?.name || "Unassigned",
        gender_display: s.gender,
        classInfo: s.current_class ? s.current_class.name : "Unassigned",
        enrollmentDate: s.admission_date,
        status: s.status as "active" | "graduated" | "inactive",
        parent: undefined,
      }));

      setStudents(formattedData);
      setTotalResults(effectiveTotal);
    } catch (err: any) {
      console.error("Failed to load students:", err.message || err);
      setStudents([]);
      setTotalResults(0);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents(currentPage, searchTerm);
  }, [filters, currentPage, searchTerm]);

  const totalPages = Math.max(1, Math.ceil(totalResults / PAGE_SIZE));

  return (
    <div className="p-8 bg-slate-50 min-h-screen">
      {pageError && <ErrorMessage errorDetail={pageError} className="mb-4" />}
      <FilterBar onFilterChange={(newFilters) => setFilters(newFilters)} />

      <div className="bg-white border-x border-t rounded-t-2xl p-4 flex flex-col md:flex-row gap-4 items-center justify-between mt-4">
        <div className="relative w-full md:w-96">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            size={18}
          />
          <input
            type="text"
            placeholder="Search by name or ID..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-cyan-100 transition-all text-sm"
          />
        </div>

        <div className="flex items-center gap-3">
          {(filters.classId || filters.status || searchTerm) && (
            <button
              onClick={handleReset}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-cyan-600 hover:bg-cyan-50 rounded-lg transition-colors"
            >
              <RotateCcw size={16} /> Reset
            </button>
          )}
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-cyan-600 text-white text-sm font-bold rounded-lg hover:bg-cyan-700 transition-all"
          >
            <Plus size={18} /> Add Student
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="bg-white border-x border-b rounded-b-2xl p-20 flex flex-col items-center justify-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-cyan-600"></div>
          <p className="mt-4 text-slate-500 text-sm">Fetching students...</p>
        </div>
      ) : students.length > 0 ? (
        <>
          <StudentTable students={students} onDelete={handleDeleteStudent} />
          <div className="bg-white border-x border-b rounded-b-2xl">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={(p) => {
                if (p < 1 || p > totalPages) return;
                setCurrentPage(p);
              }}
              totalResults={totalResults}
              resultsPerPage={PAGE_SIZE}
            />
          </div>
        </>
      ) : (
        <div className="bg-white border-x border-b rounded-b-2xl p-20 flex flex-col items-center justify-center text-center">
          <div className="bg-slate-100 p-4 rounded-full mb-4">
            <UserX size={48} className="text-slate-400" />
          </div>
          <h3 className="text-lg font-bold text-slate-700">
            No students found
          </h3>
          <p className="text-slate-500 max-w-xs mb-6 text-sm">
            We couldn't find any students matching your current search or filter
            criteria.
          </p>
          <button
            onClick={handleReset}
            className="px-6 py-2 bg-cyan-600 text-white rounded-lg font-bold hover:bg-cyan-700 transition-all shadow-lg shadow-cyan-100 text-sm"
          >
            Clear all filters
          </button>
        </div>
      )}

      <AddStudentModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => {
          fetchStudents();
        }}
      />
    </div>
  );
}
