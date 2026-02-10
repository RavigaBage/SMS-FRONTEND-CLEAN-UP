"use client";

import React, { useEffect, useMemo, useState, useCallback, useRef } from "react";
import {
  Search,
  Download,
  Loader2,
  Filter,
  Calendar,
  Users,
  Clock,
  TrendingUp,
  Edit,
  Plus,
} from "lucide-react";
import '@/styles/staffAttendance.css'
import { apiRequest } from "@/src/lib/apiClient";
import {StaffMember } from "@/src/assets/components/management/StaffTable";

/* ---------------- TYPES ---------------- */

export interface ApiResponse<T> {
  count?: number;
  next?: string | null;
  previous?: string | null;
  results?: T[];
}

export interface StaffAttendanceRaw {
  id: number;
  staff: number;
  staff_name: string;
  staff_initials: string;
  staff_type: string;
  staff_type_display: string;
  department: string;
  attendance_date: string;
  check_in: string | null;
  check_out: string | null;
  status: string;
  status_display: string;
  is_late: boolean;
  punctuality_score: number | null;
  remarks: string;
  created_at: string;
  updated_at: string;
}

export interface StaffAttendance {
  id: number;
  staffId: number;
  staffName: string;
  staffInitials: string;
  staffType: string;
  staffTypeDisplay: string;
  department: string;
  attendanceDate: string;
  checkIn: string | null;
  checkOut: string | null;
  status: string;
  statusDisplay: string;
  isLate: boolean;
  punctualityScore: number | null;
  remarks: string;
  createdAt: string;
  updatedAt: string;
}

export interface AttendanceSummary {
  total_staff?: number;
  present_today?: number;
  late_arrivals?: number;
  on_leave?: number;
  absent?: number;
  attendance_rate?: number;
}

interface FetchOptions {
  search?: string;
  date?: string;
  role?:String;
  department?: string;
  status?: string;
  page?: number;
}

interface ApiError {
  message: string;
  status?: number;
  details?: unknown;
}
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

}


/* ---------------- HELPERS ---------------- */

const normalizeAttendance = (raw: StaffAttendanceRaw): StaffAttendance => ({
  id: raw.id,
  staffId: raw.staff,
  staffName: raw.staff_name,
  staffInitials: raw.staff_initials,
  staffType: raw.staff_type,
  staffTypeDisplay: raw.staff_type_display,
  department: raw.department || "N/A",
  attendanceDate: raw.attendance_date,
  checkIn: raw.check_in,
  checkOut: raw.check_out,
  status: raw.status,
  statusDisplay: raw.status_display,
  isLate: raw.is_late,
  punctualityScore: raw.punctuality_score,
  remarks: raw.remarks || "",
  createdAt: raw.created_at,
  updatedAt: raw.updated_at,
});

function unwrapArray<T>(payload: ApiResponse<T> | T[] | null | undefined): T[] {
  if (!payload) return [];
  if (Array.isArray(payload)) return payload;
  if ((payload as ApiResponse<T>).results) return (payload as ApiResponse<T>).results as T[];
  return [];
}

const buildQuery = (opts?: FetchOptions) => {
  const params = new URLSearchParams();
  if (opts?.search) params.append("search", opts.search);
  if (opts?.date) params.append("date", opts.date);
  if (opts?.department && opts.department !== "All Departments") {
    params.append("department", opts.department);
    params.append("role", opts.department);
  }
  if (opts?.status && opts.status !== "All Statuses") {
    params.append("status", opts.status);
  }
  if (opts?.page && opts.page > 1) params.append("page", String(opts.page));
  return params.toString();
};

const createApiError = (err: unknown, defaultMessage = "An error occurred"): ApiError => {
  if (err instanceof Error) {
    return {
      message: err.message || defaultMessage,
      status: (err as any).status,
      details: err,
    };
  }

  if (typeof err === "object" && err !== null) {
    return {
      message: (err as any).message || defaultMessage,
      status: (err as any).status,
      details: err,
    };
  }

  return {
    message: defaultMessage,
    details: err,
  };
};

const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
};

const formatTime = (timeString: string | null): string => {
  if (!timeString) return "-- : --";
  const [hours, minutes] = timeString.split(":");
  const hour = parseInt(hours);
  const ampm = hour >= 12 ? "PM" : "AM";
  const displayHour = hour % 12 || 12;
  return `${displayHour}:${minutes} ${ampm}`;
};

const getTodayDate = (): string => {
  const today = new Date();
  return today.toISOString().split("T")[0];
};

/* ---------------- COMPONENT ---------------- */

export default function StaffAttendancePage() {
  const [attendanceRecords, setAttendanceRecords] = useState<StaffAttendance[]>([]);
  const [summary, setSummary] = useState<AttendanceSummary>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [debouncedSearch, setDebouncedSearch] = useState<string>("");
  const [selectedDate, setSelectedDate] = useState<string>(getTodayDate());
  const [departmentFilter, setDepartmentFilter] = useState<string>("All Departments");
  const [statusFilter, setStatusFilter] = useState<string>("All Statuses");
  const [page, setPage] = useState<number>(1);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);
  

  const abortControllerRef = useRef<AbortController | null>(null);

  
  const [isModalOpen, setIsModalOpen] = useState(false);
const [isSubmitting, setIsSubmitting] = useState(false);
const [editingRecord, setEditingRecord] = useState<StaffAttendance | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalResults, setTotalResults] = useState(0);

 const [staff, setStaff] = useState<StaffMember[]>([]);
  const [filters, setFilters] = useState({
    role: "",
    dept: "",
    status: "",
  });

  const fetchStaff = async (page: number, search: string) => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams({
        page: page.toString(),
        search: search,
        ...(filters.role && { role: filters.dept}),
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

const openAddModal = () => {
  setEditingRecord(null);
  setFormData({
    staffId: "",
    status: "present",
    attendanceDate: getTodayDate(),
    checkIn: "08:00",
    checkOut: "16:00",
    remarks: ""
  });
  setIsModalOpen(true);
};

const OpenEditModal = (record: StaffAttendance) => {
  setEditingRecord(record);
  setFormData({
    staffId: record.staffId.toString(),
    status: record.status,
    attendanceDate: record.attendanceDate,
    checkIn: toTimeInput(record.checkIn),
  checkOut: toTimeInput(record.checkOut),
    remarks: record.remarks
  });
  setIsModalOpen(true);
};

const handleDelete = async (id: number) => {
  if (!confirm("Are you sure you want to delete this attendance record?")) return;
  
  try {
    await apiRequest(`/staff-attendance/${id}/`, { method: "DELETE" });
    setAttendanceRecords(prev => prev.filter(r => r.id !== id));
    // Refresh summary
    fetchAttendanceData({ date: selectedDate });
  } catch (err) {
    setError("Failed to delete record");
  }
};
// Form State
const [formData, setFormData] = useState({
  staffId: "",
  status: "present",
  attendanceDate: getTodayDate(),
  checkIn: "08:00",
  checkOut: "16:00",
  remarks: ""
});

  /* ---------------- EFFECTS ---------------- */

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(searchTerm.trim()), 400);
    return () => clearTimeout(t);
  }, [searchTerm]);

  // Reset page when filters change
  useEffect(() => setPage(1), [debouncedSearch, selectedDate, departmentFilter, statusFilter]);

  // Fetch data when filters or page changes
  useEffect(() => {
    fetchAttendanceData({
      search: debouncedSearch,
      date: selectedDate,
      department: departmentFilter,
      role:departmentFilter,
      status: statusFilter,
      page,
    });

   
  }, [debouncedSearch, selectedDate, departmentFilter, statusFilter, page]);

  /* ---------------- API ---------------- */

  const fetchAttendanceData = useCallback(async (opts?: FetchOptions) => {


    abortControllerRef.current = new AbortController();
    const signal = abortControllerRef.current.signal;

    setLoading(true);
    setError(null);

    try {
      const query = buildQuery(opts ?? {});

      const [listResult, summaryResult] = await Promise.allSettled([
        apiRequest<ApiResponse<StaffAttendanceRaw>>(`/staff-attendance/?${query}`, {
          method: "GET",
          signal,
        }),
        apiRequest<AttendanceSummary>(`/staff-attendance/summary/?date=${opts?.date || getTodayDate()}`, {
          method: "GET",
          signal,
        }),
      ]);

      // Handle attendance list
      if (listResult.status === "fulfilled") {
        const rawList = unwrapArray(listResult.value as any);
        const normalized = rawList.map(normalizeAttendance as any);
        setAttendanceRecords(normalized as any);
        setSummary(calculateSummary(normalized as any));
        setTotalCount(listResult.value?.count ?? rawList.length);
      } else {
        if (listResult.reason?.name !== "AbortError") {
          console.error("Failed to fetch attendance:", listResult.reason);
          setAttendanceRecords([]);
          setTotalCount(0);
          throw createApiError(listResult.reason, "Failed to fetch attendance records");
        }
      }

    } catch (err) {
      if ((err as Error)?.name === "AbortError") {
        return;
      }

      const apiError = createApiError(err);
      console.error("Attendance fetch error:", apiError);

      setError(apiError.message);
      setAttendanceRecords([]);
      setSummary({});
      setTotalCount(0);
    } finally {
      setLoading(false);
      abortControllerRef.current = null;
    }
  }, []);

  const calculateSummary = (records: StaffAttendance[]): AttendanceSummary => {
  const total_staff = records.length;
  let present_today = 0;
  let late_arrivals = 0;
  let on_leave = 0;
  let absent = 0;

  records.forEach(record => {
    switch (record.status) {
      case "present":
        present_today++;
        break;
      case "late":
        present_today++;
        late_arrivals++;
        break;
      case "on_leave":
        on_leave++;
        break;
      case "absent":
        absent++;
        break;
      case "half_day":
        present_today++;
        break;
    }
  });

  const attendance_rate = total_staff ? (present_today / total_staff) * 100 : 0;

  return {
    total_staff,
    present_today,
    late_arrivals,
    on_leave,
    absent,
    attendance_rate,
  };
};


  /* ---------------- HANDLERS ---------------- */

  const handleExport = async () => {
    try {
      const qs = buildQuery({ search: debouncedSearch, date: selectedDate,role: departmentFilter, department: departmentFilter, status: statusFilter });
      window.open(`${process.env.NEXT_PUBLIC_API_URL || ""}/staff/?${qs}`, "_blank");
    } catch (err) {
      console.error("Export failed:", err);
      alert("Failed to export data. Please try again.");
    }
  };

  const totalPages = useMemo(() => Math.ceil((totalCount || 0) / 20), [totalCount]);

  // Inside StaffAttendancePage component


/* ---------------- CRUD HANDLERS ---------------- */

const toTimeInput = (isoString: string | null): string => {
  if (!isoString) return "";
  const date = new Date(isoString);
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${hours}:${minutes}`;
};

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setIsSubmitting(true);
  
  const payload = {
    staff: parseInt(formData.staffId),
    status: formData.status,
    attendance_date: formData.attendanceDate,
    check_in: formData.checkIn
    ? `${formData.attendanceDate}T${formData.checkIn}:00Z`
    : null,
  check_out: formData.checkOut
    ? `${formData.attendanceDate}T${formData.checkOut}:00Z`
    : null,
    remarks: formData.remarks
  };

  try {
    if (editingRecord) {
      await apiRequest(`/staff-attendance/${editingRecord.id}/`, {
        method: "PUT",
        body: JSON.stringify(payload)
      });
    } else {
      await apiRequest(`/staff-attendance/`, {
        method: "POST",
        body: JSON.stringify(payload)
      });
    }
    setIsModalOpen(false);
    fetchAttendanceData({ date: selectedDate }); 

    const updatedRecords = editingRecord
  ? attendanceRecords.map(r => (r.id === editingRecord.id ? { ...r, ...payload } : r))
  : [...attendanceRecords, payload];

setAttendanceRecords(updatedRecords as any);
setSummary(calculateSummary(updatedRecords as any));

console.log(summary);

  } catch (err) {
    setError("Failed to save attendance record.");
  } finally {
    setIsSubmitting(false);
  }
};

  return (
    <div className="container staffAttendance">
      {/* Error Banner */}
      {error && (
        <div style={{
          background: "#fee",
          border: "1px solid #fcc",
          color: "#c33",
          padding: "1rem 1.5rem",
          borderRadius: "12px",
          marginBottom: "1.5rem",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}>
          <span style={{ fontWeight: 600 }}>{error}</span>
          <button
            onClick={() => setError(null)}
            style={{
              background: "none",
              border: "none",
              color: "#c33 !important",
              fontSize: "1.5rem",
              cursor: "pointer",
            }}
          >
            ×
          </button>
        </div>
      )}

      {/* Header */}
      <header className="page-header">
        <div className="header-left">
          <h1>Staff Attendance</h1>
          <p>Monitoring daily presence and punctuality for Academic Year 2025-26</p>
        </div>
        <div className="controls-row">
          <div className="date-picker">
            <Calendar size={18} />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              style={{
                border: "none",
                background: "transparent",
                outline: "none",
                cursor: "pointer",
              }}
            />
          </div>
          <button className="btn btn-primary"  disabled={loading} onClick={handleExport}> 
            <Download size={18} />
            Export
          </button>
          
          <button className="btn btn-primary"  disabled={loading} onClick={openAddModal}> 
            <Plus size={18} />
            Bulk Mark Attendance
          </button>
        </div>
      </header>


      <section className="summary-grid">
        <SummaryCard
          label="Total Staff"
          value={summary.total_staff || 0}
          percentage={100}
          color="var(--primary-blue)"
          loading={loading}
        />
        <SummaryCard
          label="Present Today"
          value={summary.present_today || 0}
          percentage={(summary.present_today || 0) / (summary.total_staff || 1) * 100}
          color="var(--primary-teal)"
          loading={loading}
        />
        
        <SummaryCard
          label="On Leave"
          value={summary.on_leave || 0}
          percentage={(summary.on_leave || 0) / (summary.total_staff || 1) * 100}
          color="var(--primary-blue)"
          loading={loading}
        />
      </section>

      <main className="content-card">
        <div className="filter-bar">
          <div style={{ position: "relative", flex: 1, maxWidth: "400px" }}>
            <Search
              size={18}
              style={{
                position: "absolute",
                left: "12px",
                top: "50%",
                transform: "translateY(-50%)",
                color: "#94a3b8",
              }}
            />
            <input
              type="text"
              className="search-input"
              placeholder="Search staff by name or ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              disabled={loading}
              style={{ paddingLeft: "40px" }}
            />
          </div>
          <div style={{ display: "flex", gap: "10px" }}>
            <select
              className="date-picker"
              style={{ fontSize: "0.85rem" }}
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
              disabled={loading}
            >
              <option value="teacher">Teacher</option>
                  <option value="headmaster">Headmaster</option>
                  <option value="bursar">Bursar</option>
                  <option value="admin_staff">Admin Staff</option>
                  <option value="support_staff">Support Staff</option>
            </select>
            
            <select
              className="date-picker"
              style={{ fontSize: "0.85rem" }}
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              disabled={loading}
            >
              <option>All Statuses</option>
              <option value="present">Present</option>
              <option value="late">Late</option>
              <option value="absent">Absent</option>
              <option value="on_leave">On Leave</option>
            </select>
          </div>
        </div>

        <div style={{ overflowX: "auto" }}>
          <table className="attendance-table">
            <thead>
              <tr>
                <th>Staff Member</th>
                <th>Check-In</th>
                <th>Check-Out</th>
                <th>Status</th>
                <th>Punctuality</th>
                <th>Remarks</th>
                <th style={{ textAlign: "right" }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: "center", padding: "3rem" }}>
                    <Loader2 className="animate-spin" size={32} style={{ margin: "0 auto 1rem", color: "var(--primary-teal)" }} />
                    <div style={{ fontSize: "0.75rem", fontWeight: 700, color: "#94a3b8", textTransform: "uppercase" }}>
                      Loading Attendance...
                    </div>
                  </td>
                </tr>
              ) : attendanceRecords.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: "center", padding: "3rem" }}>
                    <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>📋</div>
                    <p style={{ color: "#94a3b8" }}>
                      {debouncedSearch || departmentFilter !== "All Departments" || statusFilter !== "All Statuses"
                        ? "No attendance records match your filters"
                        : "No attendance records for this date"}
                    </p>
                    {(debouncedSearch || departmentFilter !== "All Departments" || statusFilter !== "All Statuses") && (
                      <button
                        onClick={() => {
                          setSearchTerm("");
                          setDepartmentFilter("All Departments");
                          setStatusFilter("All Statuses");
                        }}
                        style={{
                          marginTop: "1rem",
                          color: "var(--primary-teal)",
                          background: "none",
                          border: "none",
                          cursor: "pointer",
                          fontWeight: 600,
                          textDecoration: "underline",
                        }}
                      >
                        Clear filters
                      </button>
                    )}
                  </td>
                </tr>
              ) : (
                attendanceRecords.map((record) => (
                  <AttendanceRow
                    key={record.id}
                    record={record}
                    onEdit={OpenEditModal}
                    onDelete={handleDelete}
                  />
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {!loading && attendanceRecords.length > 0 && totalPages > 1 && (
          <div style={{
            padding: "1rem",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            background: "#f8fafc",
            borderTop: "1px solid #e2e8f0",
          }}>
            <div style={{ fontSize: "0.875rem", color: "#64748b" }}>
              Showing {attendanceRecords.length} of {totalCount}
            </div>
            <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="btn btn-outline"
                style={{ padding: "0.5rem 1rem", fontSize: "0.875rem" }}
              >
                Prev
              </button>
              <span style={{ fontSize: "0.875rem", fontWeight: 600 }}>
                {page} / {totalPages}
              </span>
              <button
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="btn btn-outline"
                style={{ padding: "0.5rem 1rem", fontSize: "0.875rem" }}
              >
                Next
              </button>
            </div>
          </div>
        )}
      </main>
      {isModalOpen && (
  <div className="modal-overlay">
    <div className="modal-content animate-in">
      <div className="modal-header">
        <h2 className="text-lg font-black uppercase italic">
          {editingRecord ? "Edit Attendance" : "Take Attendance"}
        </h2>
        <button onClick={() => setIsModalOpen(false)} className="close-btn">×</button>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-4 pt-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="input-group">
            <label>Staff ID / Name</label>
                
  <select
    required
    value={formData.staffId}
    onChange={e => setFormData({...formData, staffId: e.target.value})}
    disabled={!!editingRecord}
  >
    <option value="">Select Staff</option>
    {staff.map(staff => (
      <option key={staff.id} value={staff.id}>{staff.fullName}</option>
    ))}
  </select>
          </div>
          <div className="input-group">
            <label>Status</label>
            <select 
              value={formData.status} 
              onChange={e => setFormData({...formData, status: e.target.value})}
            >
              <option value="present">Present</option>
              <option value="absent">Absent</option>
              <option value="on_leave">On Leave</option>
              <option value="half_day">Half Day</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="input-group">
            <label>Check In</label>
            <input 
              type="time" 
              value={formData.checkIn}
              onChange={e => setFormData({...formData, checkIn: e.target.value})}
            />
          </div>
          <div className="input-group">
            <label>Check Out</label>
            <input 
              type="time" 
              value={formData.checkOut}
              onChange={e => setFormData({...formData, checkOut: e.target.value})}
            />
          </div>
        </div>

        <div className="input-group">
          <label>Remarks</label>
          <textarea 
            rows={3}
            value={formData.remarks}
            onChange={e => setFormData({...formData, remarks: e.target.value})}
            placeholder="Add any additional notes..."
          />
        </div>

        <div className="modal-footer pt-4">
          <button 
            type="button" 
            onClick={() => setIsModalOpen(false)} 
            className="btn btn-outline"
          >
            Cancel
          </button>
          <button 
            type="submit" 
            className="btn btn-primary" 
            disabled={isSubmitting}
          >
            {isSubmitting ? <Loader2 className="animate-spin" /> : "Save Attendance"}
          </button>
        </div>
      </form>
    </div>
  </div>
)}
    </div>
  );
}

/* ---------------- SUBCOMPONENTS ---------------- */

function SummaryCard({ label, value, percentage, color, loading }: {
  label: string;
  value: number;
  percentage: number;
  color: string;
  loading: boolean;
}) {
  return (
    <div className="summary-card">
      <span className="label">{label}</span>
      {loading ? (
        <div style={{ height: "2rem", background: "#e2e8f0", borderRadius: "4px", marginBottom: "0.5rem" }} />
      ) : (
        <div className="value" style={{ color }}>{value.toString().padStart(2, "0")}</div>
      )}
      <div className="mini-chart">
        <div className="chart-fill" style={{ width: `${Math.min(percentage, 100)}%`, background: color }}></div>
      </div>
    </div>
  );
}

function AttendanceRow({ record, onEdit,
  onDelete }: { record: StaffAttendance ,onEdit: (r: StaffAttendance) => void;
  onDelete: (id: number) => void;}) {

  
  const getStatusClass = (status: string): string => {
    const statusMap: Record<string, string> = {
      present: "status-present",
      late: "status-late",
      absent: "status-absent",
      on_leave: "status-leave",
      half_day: "status-half-day",
    };
    return statusMap[status] || "status";
  };

  const getAvatarColor = (status: string): Record<string, string> => {
    if (status === "late") {
      return { background: "#fff3e0", color: "#ff9800" };
    }
    if (status === "on_leave") {
      return { background: "#e3f2fd", color: "#2196f3" };
    }
    return {};
  };

  return (
    <tr>
      <td>
        <div className="staff-cell">
          <div className="avatar" style={getAvatarColor(record.status)}>
            <img src={`https://ui-avatars.com/api/?name=${record.staffName}&background=random`}   style={{ borderRadius: "50%" }} />
          </div>
          <div>
            <span style={{ fontWeight: 600 }}>{record.staffName}</span>
            <span className="role-tag">{record.staffTypeDisplay}</span>
          </div>
        </div>
      </td>
      <td>
        <span className="time-text">{formatTime(record.checkIn)}</span>
      </td>
      <td>
        <span className="time-text">{formatTime(record.checkOut)}</span>
      </td>
      <td>
        <span className={`status ${getStatusClass(record.status)}`}>
          {record.statusDisplay}
        </span>
      </td>
      <td>
        {record.punctualityScore !== null ? (
          <div className="mini-chart" style={{ width: "80px", height: "6px" }}>
            <div
              className="chart-fill"
              style={{
                width: `${record.punctualityScore}%`,
                background: record.punctualityScore >= 80 ? "var(--primary-teal)" : "#ff9800",
              }}
            ></div>
          </div>
        ) : (
          <div className="mini-chart" style={{ width: "80px", height: "6px", background: "#eee" }}></div>
        )}
      </td>
      <td className="remarks">{record.remarks || "—"}</td>
<td style={{ textAlign: "right" }}>
  <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end" }}>
    <button
      className="btn btn-outline"
      style={{ padding: "0.4rem 0.8rem", fontSize: "0.75rem", color: "var(--primary-blue) !important" }}
      onClick={() => onEdit(record)}
    >
      <Edit size={14} style={{ marginRight: "4px" }} />
      Edit
    </button>
    <button
      className="btn btn-outline"
      style={{ padding: "0.4rem 0.8rem", fontSize: "0.75rem", color: "#ef4444 !important" }}
      onClick={() => onDelete(record.id)}
    >
      Delete
    </button>
  </div>
</td>
    </tr>
  );
}
