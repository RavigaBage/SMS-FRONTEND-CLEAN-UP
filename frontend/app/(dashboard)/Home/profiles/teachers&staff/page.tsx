"use client";

import { useState, useEffect } from "react";
import { UserPlus, Search, Download } from "lucide-react";
import { apiRequest, ApiResponse } from "@/src/lib/apiClient";
import { StaffTable, StaffMember } from "@/src/assets/components/management/StaffTable";
import { AddStaffModal } from "@/src/assets/components/management/AddStaff";
import { Pagination } from "@/src/assets/components/management/Pagination";
import { StaffFilters } from "@/src/assets/components/management/StaffFilters";
import '@/styles/staff-dr.css';

interface StaffApiData {
  user_id?: number;
  id: number;
  first_name: string;
  last_name: string;
  staff_type_display?:String;
  role?: string;
  department?: string;
  specialization?:String;
  email: string;
  phone?: string;
  status?: string;
  profile_image?: string;
  managed_classes:[];
  assigned_subjects:[];
  created_at:String;

}


export default function StaffDirectoryPage() {
  // State Management
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalResults, setTotalResults] = useState(0);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    role: "",
    dept: "",
    status: "",
  });

  const resultsPerPage = 5;

  const handleFilterChange = (newFilters: Partial<typeof filters>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
    setCurrentPage(1);
  };

  const handleClearAll = () => {
    setSearchTerm("");
    setFilters({
      role: "",
      dept: "",
      status: ""
    });
    setCurrentPage(1);
  };

  // Fetch Logic
  const fetchStaff = async (page: number, search: string) => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams({
        page: page.toString(),
        search: search,
        ...(filters.role && { role: filters.role }),
        ...(filters.dept && { department: filters.dept }),
        ...(filters.status && { status: filters.status }),
      });

      const response: ApiResponse<StaffApiData | StaffApiData[]> = await apiRequest<StaffApiData>(
        `/staff/?${queryParams}`,
        { method: "GET" }
      );

      // Extract the results array from the normalized response
      const results = (response.results || []) as StaffApiData[];

      // Map backend data to our StaffMember interface
   const formattedStaff: StaffMember[] = results.map((s) => ({
      id: String(s.user_id || s.id), 
      fullName: `${s.first_name} ${s.last_name}`,
      // Force lowercase 'string' using String() constructor or type assertion
      role: String(s.staff_type_display || "Staff"), 
      department: String(s.specialization || "General"),
      email: String(s.email),
      phone: String(s.phone || "N/A"),
      status: (s.status || "Active") as "Active" | "On Leave" | "Inactive",
      profileImage: s.profile_image || `https://ui-avatars.com/api/?name=${s.first_name}+${s.last_name}`,
      // Add these to match the new interface
      specialization: s.specialization ? String(s.specialization) : undefined,
      managed_classes: s.managed_classes || [],
      assigned_subjects: s.assigned_subjects || [],
      created_at:s.created_at || ""
    }));

      setStaff(formattedStaff);
      setTotalResults(response.count || 0);
    } catch (err) {
      console.error("Error fetching staff:", err);
      setStaff([]);
      setTotalResults(0);
    } finally {
      setLoading(false);
    }
  };

  // Trigger fetch on page or search change
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchStaff(currentPage, searchTerm);
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [currentPage, searchTerm, filters]);

  const totalPages = Math.ceil(totalResults / resultsPerPage);

  return (
    
    <div className="staff-page">
      {/* Header */}
      <div className="staff-header">
        <div>
          <h1>Staff Directory</h1>
          <p>Manage faculty records and system access</p>
        </div>

        <div className="staff-actions">
          <button className="btn-primary" onClick={() => setIsModalOpen(true)}>
            <UserPlus size={18} /> Add Staff
          </button>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="staff-toolbar">
        <div className="search-box">
          <Search size={18} />
          <input
            type="text"
            placeholder="Search by name, ID, or department..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
          />
        </div>
        <StaffFilters
          filters={filters}
          onFilterChange={handleFilterChange}
          onClear={handleClearAll}
        />
      </div>

      <div className={`table-wrapper ${loading ? "loading" : ""}`}>
        <StaffTable staff={staff} />

        {staff.length > 0 ? (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            totalResults={totalResults}
            resultsPerPage={resultsPerPage}
          />
        ) : (
          !loading && <div className="empty-state">No staff members found.</div>
        )}
      </div>

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