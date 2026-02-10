"use client";

import { useState, useEffect } from "react";
import { UserPlus, Search, SlidersHorizontal, Download, Loader2 } from "lucide-react";
import { apiRequest } from "@/src/lib/apiClient";
import { StaffTable, StaffMember } from "@/src/assets/components/management/StaffTable";
import { AddStaffModal } from "@/src/assets/components/management/AddStaff";
import { Pagination } from "@/src/assets/components/management/Pagination";
import '@/styles/teacher_page.css';
interface PaginatedResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: any[];
}

export default function StaffDirectoryPage() {
  // State Management
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalResults, setTotalResults] = useState(0);
  const [loading, setLoading] = useState(false);

  const resultsPerPage = 10;

  // Fetch Logic
  const fetchStaff = async (page: number, search: string) => {
    setLoading(true);
    try {
      const query = new URLSearchParams({
        page: page.toString(),
        search: search,
      });
      const res = await apiRequest<any>(`/staff/?${query}`, {
        method: "GET",
      });


      const data: PaginatedResponse = {
        count: res.count ?? 0,
        next: res.next ?? null,
        previous: res.previous ?? null,
        results: res.results ?? [],
      };

      const formattedStaff = data.results.map((s: any) => ({
        id: s.user_id || s.id,
        fullName: `${s.first_name} ${s.last_name}`,
        role: s.role || "Staff",
        department: s.department || "General",
        email: s.email,
        phone: s.phone || "N/A",
        status: s.status || "Active",
        profileImage: s.profile_image || `https://ui-avatars.com/api/?name=${s.first_name}+${s.last_name}&background=0D9488&color=fff`,
      }));

      setStaff(formattedStaff);
      setTotalResults(data.count);
    } catch (err) {
      console.error("Error fetching staff:", err);
    } finally {
      setLoading(false);
    }
  };

  // Trigger fetch on page or search change
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchStaff(currentPage, searchTerm);
    }, 300); // Debounce search to prevent too many API calls

    return () => clearTimeout(delayDebounceFn);
  }, [currentPage, searchTerm]);

  const totalPages = Math.ceil(totalResults / resultsPerPage);

  return (
    <div className="staff-page">

      {/* Header */}
      <div className="page-header">
        <div className="page-title-group">
          <h1 className="page-title">Teachers Directory</h1>
          <p className="page-subtitle">
            Manage faculty records and system access
          </p>
        </div>

        <div className="page-actions">
          <button className="secondary-button">
            Export
          </button>

          <button
            className="primary-dark-button"
            onClick={() => setIsModalOpen(true)}
          >
            Add Staff
          </button>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="control-bar">

        <div className="search-wrapper">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            placeholder="Search by name, ID, or department..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="search-input"
          />
        </div>

        <div className="control-actions">
          {loading && <span className="loading-spinner" />}
          <button className="ghost-button">Filters</button>
        </div>

      </div>

      {/* Table & Pagination */}
      <div
        className={`table-section ${
          loading ? "is-loading" : ""
        }`}
      >
        <div className="table-container">
          <StaffTable staff={staff} />
        </div>

        {staff.length > 0 && !loading && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            totalResults={totalResults}
            resultsPerPage={resultsPerPage}
          />
        )}

        {!loading && staff.length === 0 && (
          <div className="empty-state">
            <p>No staff members found matching your search.</p>
          </div>
        )}
      </div>

      {/* Modal */}
      <AddStaffModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          fetchStaff(currentPage, searchTerm);
        }}
      />

    </div>
  );
}