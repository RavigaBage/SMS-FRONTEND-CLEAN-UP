"use client";

import { useState, useEffect,useRef } from "react";
import { UserPlus, Search, Download } from "lucide-react";
import { apiRequest, ApiResponse } from "@/src/lib/apiClient";
import {
  StaffTable,
  StaffMember,
} from "@/src/assets/components/management/StaffTable";
import { AddStaffModal } from "@/src/assets/components/management/AddStaff";
import { Pagination } from "@/src/assets/components/management/Pagination";
import { StaffFilters } from "@/src/assets/components/management/StaffFilters";
import "@/styles/staff-dr.css";
import { ImportModal, ImportModalConfig } from "@/src/assets/components/management/ImportModal";
import { downloadStaffTemplate } from "@/src/lib/excelTemplate";
 
const STAFF_IMPORT_CONFIG: ImportModalConfig = {
  title: "Import Staff",
  endpoint: "/staff/",
  requiredHeaders: [
    "first_name", "last_name", "email", "staff_type", "gender",
    "phone_number", "address", "specialization", "date_of_birth",
    "employment_date", "national_id", "health_info", "photo_url",
  ],
  rowLabel: (row) => `${row.first_name ?? ""} ${row.last_name ?? ""}`.trim(),
  transformPayload: (row) => {
    const payload: Record<string, any> = {
      first_name: row.first_name ?? "",
      last_name: row.last_name ?? "",
      email: row.email ?? "",
      staff_type: row.staff_type ?? "admin_staff",
      gender: row.gender ?? "male",
      phone_number: row.phone_number ?? "",
      address: row.address ?? "",
      specialization: row.specialization ?? "",
      date_of_birth: row.date_of_birth
        ? new Date(row.date_of_birth).toISOString().split("T")[0]
        : "",
      employment_date: row.employment_date
        ? new Date(row.employment_date).toISOString().split("T")[0]
        : "",
      national_id: row.national_id ?? "",
      health_info: row.health_info ?? "",
      photo_url: row.photo_url ?? "",
    };
    return Object.fromEntries(Object.entries(payload).filter(([_, v]) => v !== ""));
  },
};
 

interface StaffApiData {
  user_id?: number;
  id: number;
  first_name: string;
  last_name: string;
  staff_type_display?: String;
  role?: string;
  department?: string;
  specialization?: String;
  email: string;
  phone?: string;
  status?: string;
  profile_image?: string;
  managed_classes: [];
  assigned_subjects: [];
  created_at: String;
}

export default function StaffDirectoryPage() {
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
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importFile, setImportFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
 
  const handleFileSelected = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.name.match(/\.(xlsx|xls)$/i)) {
      alert("Please upload a valid Excel file (.xlsx or .xls).");
      return;
    }
    setImportFile(file);
    setIsImportModalOpen(true);
    event.target.value = "";
  };
  const OnSuccess  = ()=>{
    fetchStaff(currentPage, searchTerm);
  }

  const resultsPerPage = 20;

  const handleFilterChange = (newFilters: Partial<typeof filters>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
    setCurrentPage(1);
  };

  const handleClearAll = () => {
    setSearchTerm("");
    setFilters({
      role: "",
      dept: "",
      status: "",
    });
    setCurrentPage(1);
  };

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

      const response: ApiResponse<StaffApiData | StaffApiData[]> =
        await apiRequest<StaffApiData>(`/staff/?${queryParams}`, {
          method: "GET",
        });
      const results = (response.results || []) as StaffApiData[];

      const formattedStaff: StaffMember[] = results.map((s) => ({
        id: String(s.user_id || s.id),
        fullName: `${s.first_name} ${s.last_name}`,
        role: String(s.staff_type_display || "Staff"),
        department: String(s.specialization || "General"),
        email: String(s.email),
        phone: String(s.phone || "N/A"),
        status: (s.status || "Active") as "Active" | "On Leave" | "Inactive",
        profileImage:
          s.profile_image ||
          `https://ui-avatars.com/api/?name=${s.first_name}+${s.last_name}`,
        specialization: s.specialization ? String(s.specialization) : undefined,
        managed_classes: s.managed_classes || [],
        assigned_subjects: s.assigned_subjects || [],
        created_at: s.created_at || "",
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

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchStaff(currentPage, searchTerm);
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [currentPage, searchTerm, filters]);

  const totalPages = Math.ceil(totalResults / resultsPerPage);

  return (
    <div className="staff-page">
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

              <input
                type="file"
                ref={fileInputRef}
                accept=".xlsx,.xls,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                onChange={handleFileSelected}
                style={{ display: "none" }}
              />
              <div className="staff-actions">
                <button
                  className="btn-primary text-purple-600 text-sm hover:underline"
                  onClick={downloadStaffTemplate}
                >
                  Download Template (.xlsx)
                </button>
              </div>
               <div className="staff-actions">
                <button
                  className="btn-primary secondary-button"
                  onClick={() => fileInputRef.current?.click()}
                >
                  📥 Import Excel
                </button>
              </div>
      </div>

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
      
        <ImportModal
          isOpen={isImportModalOpen}
          file={importFile}
          config={STAFF_IMPORT_CONFIG}
          onClose={() => { setIsImportModalOpen(false); setImportFile(null); }}
          onSuccess={OnSuccess}
        />
      
    </div>
  );
}
