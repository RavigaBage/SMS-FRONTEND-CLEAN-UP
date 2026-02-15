"use client";

import { useState, useEffect } from "react";
import { UserPlus, Search, SlidersHorizontal, Download, Loader2, BookOpen } from "lucide-react";
import { apiRequest } from "@/src/lib/apiClient";
import { TeacherTable, Teacher } from "@/src/assets/components/management/TeacherTable";
import { AddTeacherModal } from "@/src/assets/components/management/AddTeacher";
import { EditTeacherModal } from "@/src/assets/components/management/EditTeacher";
import { AssignSubjectsModal } from "@/src/assets/components/management/AssignSubject";
import { TeacherDetailsModal } from "@/src/assets/components/management/TeacherDetails";
import { Pagination } from "@/src/assets/components/management/Pagination";
import { FilterModal } from "@/src/assets/components/management/FilterModel";
import { toast } from "react-hot-toast";
import '@/styles/Teachers.css';

interface PaginatedResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: any[];
}

interface FilterState {
  is_active?: string;
  specialization?: string;
  subject_id?: string;
}

export default function TeachersDirectoryPage() {
  // State Management
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalResults, setTotalResults] = useState(0);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState<FilterState>({});

  const resultsPerPage = 10;

  // Fetch Teachers
  const fetchTeachers = async (page: number, search: string, filterParams: FilterState = {}) => {
    setLoading(true);
    try {
      const query = new URLSearchParams({
        page: page.toString(),
        ...(search && { search }),
        ...filterParams,
      });

      const res = await apiRequest<PaginatedResponse>(`/teachers/?${query}`, {
        method: "GET",
      });

      const data: PaginatedResponse = {
        count: res.count ?? 0,
        next: res.next ?? null,
        previous: res.previous ?? null,
        results: res.results ?? [],
      };

      const formattedTeachers = data.results.map((t: any) => ({
        id: t.id,
        userId: t.user?.id,
        fullName: t.full_name || `${t.first_name} ${t.last_name}`,
        firstName: t.first_name,
        lastName: t.last_name,
        username: t.user?.username || "N/A",
        email: t.user?.email || "N/A",
        specialization: t.specialization || "General",
        subjects: t.subjects || [],
        subjectList: t.subject_list || "None",
        qualifications: t.qualifications || "N/A",
        yearsOfExperience: t.years_of_experience || 0,
        phoneNumber: t.phone_number || "N/A",
        emergencyContact: t.emergency_contact || "N/A",
        isActive: t.is_active,
        dateJoined: t.date_joined,
        assignedBy: t.assigned_by_username || "System",
        profileImage: `https://ui-avatars.com/api/?name=${t.first_name}+${t.last_name}&background=0D9488&color=fff`,
      }));

      setTeachers(formattedTeachers);
      setTotalResults(data.count);
    } catch (err: any) {
      console.error("Error fetching teachers:", err);
      toast.error(err?.detail || "Failed to fetch teachers");
    } finally {
      setLoading(false);
    }
  };

  // Delete Teacher
  const handleDelete = async (teacherId: number) => {
    if (!confirm("Are you sure you want to delete this teacher? This action cannot be undone.")) {
      return;
    }

    try {
      await apiRequest(`/teachers/${teacherId}/`, {
        method: "DELETE",
      });

      toast.success("Teacher deleted successfully");
      fetchTeachers(currentPage, searchTerm, filters);
    } catch (err: any) {
      console.error("Error deleting teacher:", err);
      toast.error(err?.detail || "Failed to delete teacher");
    }
  };

  // Deactivate Teacher
  const handleDeactivate = async (teacherId: number) => {
    try {
      await apiRequest(`/teachers/${teacherId}/deactivate/`, {
        method: "POST",
      });

      toast.success("Teacher deactivated successfully");
      fetchTeachers(currentPage, searchTerm, filters);
    } catch (err: any) {
      console.error("Error deactivating teacher:", err);
      toast.error(err?.detail || "Failed to deactivate teacher");
    }
  };

  // View Details
  const handleViewDetails = (teacher: Teacher) => {
    setSelectedTeacher(teacher);
    setIsDetailsModalOpen(true);
  };

  // Edit Teacher
  const handleEdit = (teacher: Teacher) => {
    setSelectedTeacher(teacher);
    setIsEditModalOpen(true);
  };

  // Assign Subjects
  const handleAssignSubjects = (teacher: Teacher) => {
    setSelectedTeacher(teacher);
    setIsAssignModalOpen(true);
  };

  // Export to CSV
  const handleExport = async () => {
    try {
      toast.loading("Preparing export...");
      const query = new URLSearchParams({
        ...(searchTerm && { search: searchTerm }),
        ...filters,
      });

      const res = await apiRequest<PaginatedResponse>(`/teachers/?${query}&page_size=1000`, {
        method: "GET",
      });

      // Convert to CSV
      const headers = ["ID", "Full Name", "Username", "Email", "Specialization", "Subjects", "Qualifications", "Experience", "Phone", "Status"];
      const csvData = res?.results?.map((t: any) => [
        t.id,
        t.full_name,
        t.user?.username,
        t.user?.email,
        t.specialization,
        t.subject_list,
        t.qualifications,
        t.years_of_experience,
        t.phone_number,
        t.is_active ? "Active" : "Inactive"
      ]);

      const csv = [headers.join(","), 
          ...(csvData ?? []).map((row: any[]) => row.map((cell: any) => `"${cell}"`).join(","))
        
      ].join("\n");

      // Download
      const blob = new Blob([csv], { type: "text/csv" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `teachers_export_${new Date().toISOString().split("T")[0]}.csv`;
      a.click();

      toast.dismiss();
      toast.success("Teachers exported successfully");
    } catch (err: any) {
      toast.dismiss();
      console.error("Error exporting teachers:", err);
      toast.error("Failed to export teachers");
    }
  };

  // Apply Filters
  const handleApplyFilters = (newFilters: FilterState) => {
    setFilters(newFilters);
    setCurrentPage(1);
    setIsFilterModalOpen(false);
  };

  // Trigger fetch on page, search, or filter change
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchTeachers(currentPage, searchTerm, filters);
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [currentPage, searchTerm, filters]);

  const totalPages = Math.ceil(totalResults / resultsPerPage);

  return (
    <div className="staff-page">
      {/* Header */}
      <div className="page-header">
        <div className="page-title-group">
          <h1 className="page-title">
            <BookOpen className="page-icon" />
            Teachers Directory
          </h1>
          <p className="page-subtitle">
            Manage teacher profiles, specializations, and subject assignments
          </p>
        </div>

        <div className="page-actions">
          <button className="secondary-button" onClick={handleExport}>
            <Download size={18} />
            Export
          </button>

          <button
            className="primary-dark-button"
            onClick={() => setIsAddModalOpen(true)}
          >
            <UserPlus size={18} />
            Add Teacher
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-content">
            <p className="stat-label">Total Teachers</p>
            <p className="stat-value">{totalResults}</p>
          </div>
          <div className="stat-icon stat-icon-blue">
            <UserPlus size={24} />
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-content">
            <p className="stat-label">Active Teachers</p>
            <p className="stat-value">
              {teachers.filter(t => t.isActive).length}
            </p>
          </div>
          <div className="stat-icon stat-icon-green">
            <BookOpen size={24} />
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-content">
            <p className="stat-label">Avg. Experience</p>
            <p className="stat-value">
              {teachers.length > 0
                ? Math.round(
                    teachers.reduce((sum, t) => sum + t.yearsOfExperience, 0) /
                      teachers.length
                  )
                : 0}{" "}
              yrs
            </p>
          </div>
          <div className="stat-icon stat-icon-purple">
            <SlidersHorizontal size={24} />
          </div>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="control-bar">
        <div className="search-wrapper">
          <Search className="search-icon" size={20} />
          <input
            type="text"
            placeholder="Search by name, username, specialization..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="search-input"
          />
        </div>

        <div className="control-actions">
          {loading && (
            <span className="loading-spinner">
              <Loader2 className="animate-spin" size={20} />
            </span>
          )}
          <button
            className="ghost-button"
            onClick={() => setIsFilterModalOpen(true)}
          >
            <SlidersHorizontal size={18} />
            Filters
            {Object.keys(filters).length > 0 && (
              <span className="filter-badge">{Object.keys(filters).length}</span>
            )}
          </button>
        </div>
      </div>

      {/* Table & Pagination */}
      <div className={`table-section ${loading ? "is-loading" : ""}`}>
        <div className="table-container">
          <TeacherTable
            teachers={teachers}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onDeactivate={handleDeactivate}
            onViewDetails={handleViewDetails}
            onAssignSubjects={handleAssignSubjects}
          />
        </div>

        {teachers.length > 0 && !loading && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            totalResults={totalResults}
            resultsPerPage={resultsPerPage}
          />
        )}

        {!loading && teachers.length === 0 && (
          <div className="empty-state">
            <BookOpen size={48} className="empty-icon" />
            <p className="empty-title">No teachers found</p>
            <p className="empty-description">
              {searchTerm || Object.keys(filters).length > 0
                ? "No teachers match your search or filters."
                : "Get started by adding your first teacher."}
            </p>
            {!searchTerm && Object.keys(filters).length === 0 && (
              <button
                className="primary-dark-button"
                onClick={() => setIsAddModalOpen(true)}
              >
                <UserPlus size={18} />
                Add First Teacher
              </button>
            )}
          </div>
        )}
      </div>

      {/* Modals */}
      <AddTeacherModal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          fetchTeachers(currentPage, searchTerm, filters);
        }}
      />

      {selectedTeacher && (
        <>
          <EditTeacherModal
            isOpen={isEditModalOpen}
            teacher={selectedTeacher}
            onClose={() => {
              setIsEditModalOpen(false);
              setSelectedTeacher(null);
              fetchTeachers(currentPage, searchTerm, filters);
            }}
          />

          <AssignSubjectsModal
            isOpen={isAssignModalOpen}
            teacher={selectedTeacher}
            onClose={() => {
              setIsAssignModalOpen(false);
              setSelectedTeacher(null);
              fetchTeachers(currentPage, searchTerm, filters);
            }}
          />

          <TeacherDetailsModal
            isOpen={isDetailsModalOpen}
            teacher={selectedTeacher}
            onClose={() => {
              setIsDetailsModalOpen(false);
              setSelectedTeacher(null);
            }}
          />
        </>
      )}

      <FilterModal
        isOpen={isFilterModalOpen}
        filters={filters}
        onClose={() => setIsFilterModalOpen(false)}
        onApply={handleApplyFilters}
      />
    </div>
  );
}