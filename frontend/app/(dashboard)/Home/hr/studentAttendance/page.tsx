"use client";

import { useState, useEffect } from "react";
import { Calendar, Search, Download, UserCheck, Users, Clock, Filter } from "lucide-react";
import { apiRequest } from "@/src/lib/apiClient";
import { AttendanceTable, AttendanceRecord } from "@/src/assets/components/management/AttendanceTable";
import { MarkAttendanceModal } from "@/src/assets/components/management/MarkAttendance";
import { BulkAttendanceModal } from "@/src/assets/components/management/BulkAttendance";
import { AttendanceStatsCards } from "@/src/assets/components/management/Attendancestat";
import { AttendanceFilterModal } from "@/src/assets/components/management/AttendanceFilter";
import { Pagination } from "@/src/assets/components/management/Pagination";
import { toast } from "react-hot-toast";
import '@/styles/attpage.css';

interface PaginatedResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: any[];
}

interface FilterState {
  date?: string;
  start_date?: string;
  end_date?: string;
  status?: string;
  class_id?: string;
}

export default function StudentAttendancePage() {
  // State Management
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [isMarkModalOpen, setIsMarkModalOpen] = useState(false);
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<AttendanceRecord | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalResults, setTotalResults] = useState(0);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState<FilterState>({});
  const [stats, setStats] = useState({
    total: 0,
    present: 0,
    absent: 0,
    late: 0,
    excused: 0,
  });

  const resultsPerPage = 20;

  // Fetch Attendance
  const fetchAttendance = async (
    page: number,
    search: string,
    date: string,
    filterParams: FilterState = {}
  ) => {
    setLoading(true);
    try {
      const query = new URLSearchParams({
        page: page.toString(),
        ...(search && { search }),
        ...(date && { date }),
        ...filterParams,
      });

      const res = await apiRequest<PaginatedResponse>(`/student-attendance/?${query}`, {
        method: "GET",
      });

      const data: PaginatedResponse = {
        count: res.count ?? 0,
        next: res.next ?? null,
        previous: res.previous ?? null,
        results: res.results ?? [],
      };

      const formattedAttendance = data.results.map((a: any) => ({
        id: a.id,
        studentId: a.student?.id,
        studentName: `${a.student?.first_name} ${a.student?.last_name}`,
        studentImage: a.student?.photo_url || `https://ui-avatars.com/api/?name=${a.student?.first_name}+${a.student?.last_name}&background=0D9488&color=fff`,
        className: a.class_name || a.student?.class_name || "N/A",
        attendanceDate: a.attendance_date,
        status: a.status,
        checkInTime: a.check_in_time,
        checkOutTime: a.check_out_time,
        remarks: a.remarks || "",
        markedBy: a.marked_by_username || "System",
      }));

      setAttendance(formattedAttendance);
      setTotalResults(data.count);

      // Calculate stats
      calculateStats(formattedAttendance);
    } catch (err: any) {
      console.error("Error fetching attendance:", err);
      toast.error(err?.detail || "Failed to fetch attendance records");
    } finally {
      setLoading(false);
    }
  };

  // Calculate Stats
  const calculateStats = (records: AttendanceRecord[]) => {
    const total = records.length;
    const present = records.filter(r => r.status === 'present').length;
    const absent = records.filter(r => r.status === 'absent').length;
    const late = records.filter(r => r.status === 'late').length;
    const excused = records.filter(r => r.status === 'excused').length;

    setStats({ total, present, absent, late, excused });
  };

  // Update Attendance
  const handleUpdateAttendance = async (id: number, status: string, remarks?: string) => {
    try {
      await apiRequest(`/student-attendance/${id}/`, {
        method: "PATCH",
        body: JSON.stringify({ status, remarks }),
      });

      toast.success("Attendance updated successfully");
      fetchAttendance(currentPage, searchTerm, selectedDate, filters);
    } catch (err: any) {
      console.error("Error updating attendance:", err);
      toast.error(err?.detail || "Failed to update attendance");
    }
  };

  // Delete Attendance
  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this attendance record?")) {
      return;
    }

    try {
      await apiRequest(`/student-attendance/${id}/`, {
        method: "DELETE",
      });

      toast.success("Attendance record deleted");
      fetchAttendance(currentPage, searchTerm, selectedDate, filters);
    } catch (err: any) {
      console.error("Error deleting attendance:", err);
      toast.error(err?.detail || "Failed to delete attendance record");
    }
  };

  // Export to CSV
  const handleExport = async () => {
    try {
      toast.loading("Preparing export...");
      const query = new URLSearchParams({
        ...(searchTerm && { search: searchTerm }),
        ...(selectedDate && { date: selectedDate }),
        ...filters,
      });

      const res = await apiRequest<PaginatedResponse>(
        `/student-attendance/?${query}&page_size=1000`,
        { method: "GET" }
      );

      const headers = ["Date", "Student Name", "Class", "Status", "Check In", "Check Out", "Remarks", "Marked By"];
      const csvData = res?.results?.map((a: any) => [
        a.attendance_date,
        `${a.student?.first_name} ${a.student?.last_name}`,
        a.class_name || "N/A",
        a.status,
        a.check_in_time || "N/A",
        a.check_out_time || "N/A",
        a.remarks || "",
        a.marked_by_username || "System"
      ]);
        const csv = [headers.join(","), 
          ...(csvData ?? []).map((row: any[]) => row.map((cell: any) => `"${cell}"`).join(","))
        
      ].join("\n");

      const blob = new Blob([csv], { type: "text/csv" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `attendance_${selectedDate}.csv`;
      a.click();

      toast.dismiss();
      toast.success("Attendance exported successfully");
    } catch (err: any) {
      toast.dismiss();
      console.error("Error exporting attendance:", err);
      toast.error("Failed to export attendance");
    }
  };

  // Apply Filters
  const handleApplyFilters = (newFilters: FilterState) => {
    setFilters(newFilters);
    setCurrentPage(1);
    setIsFilterModalOpen(false);
  };

  // Trigger fetch on changes
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchAttendance(currentPage, searchTerm, selectedDate, filters);
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [currentPage, searchTerm, selectedDate, filters]);

  const totalPages = Math.ceil(totalResults / resultsPerPage);
  const attendanceRate = stats.total > 0 ? ((stats.present / stats.total) * 100).toFixed(1) : 0;

  return (
    <div className="attendance-page">
      {/* Header */}
      <div className="page-header">
        <div className="page-title-group">
          <h1 className="page-title">
            <UserCheck className="page-icon" />
            Student Attendance
          </h1>
          <p className="page-subtitle">
            Mark and manage daily student attendance
          </p>
        </div>

        <div className="page-actions">
          <button className="secondary-button" onClick={handleExport}>
            <Download size={18} />
            Export
          </button>

          <button
            className="primary-button"
            onClick={() => setIsBulkModalOpen(true)}
          >
            <Users size={18} />
            Bulk Mark
          </button>

          <button
            className="primary-dark-button"
            onClick={() => setIsMarkModalOpen(true)}
          >
            <UserCheck size={18} />
            Mark Attendance
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <AttendanceStatsCards stats={stats} attendanceRate={Number(attendanceRate)} />

      {/* Date & Controls */}
      <div className="attendance-controls">
        <div className="date-selector">
          <Calendar size={20} />
          <input
            type="date"
            className="date-input"
            value={selectedDate}
            onChange={(e) => {
              setSelectedDate(e.target.value);
              setCurrentPage(1);
            }}
          />
        </div>

        <div className="search-wrapper">
          <Search className="search-icon" size={20} />
          <input
            type="text"
            placeholder="Search by student name..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="search-input"
          />
        </div>

        <button
          className="ghost-button"
          onClick={() => setIsFilterModalOpen(true)}
        >
          <Filter size={18} />
          Filters
          {Object.keys(filters).length > 0 && (
            <span className="filter-badge">{Object.keys(filters).length}</span>
          )}
        </button>
      </div>

      {/* Table & Pagination */}
      <div className={`table-section ${loading ? "is-loading" : ""}`}>
        <div className="table-container">
          <AttendanceTable
            records={attendance}
            onUpdate={handleUpdateAttendance}
            onDelete={handleDelete}
          />
        </div>

        {attendance.length > 0 && !loading && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            totalResults={totalResults}
            resultsPerPage={resultsPerPage}
          />
        )}

        {!loading && attendance.length === 0 && (
          <div className="empty-state">
            <Clock size={48} className="empty-icon" />
            <p className="empty-title">No attendance records found</p>
            <p className="empty-description">
              {searchTerm || Object.keys(filters).length > 0
                ? "No attendance records match your search or filters."
                : `No attendance records for ${new Date(selectedDate).toLocaleDateString()}`}
            </p>
            <button
              className="primary-dark-button"
              onClick={() => setIsMarkModalOpen(true)}
            >
              <UserCheck size={18} />
              Mark Attendance
            </button>
          </div>
        )}
      </div>

      {/* Modals */}
      <MarkAttendanceModal
        isOpen={isMarkModalOpen}
        selectedDate={selectedDate}
        onClose={() => {
          setIsMarkModalOpen(false);
          fetchAttendance(currentPage, searchTerm, selectedDate, filters);
        }}
      />

      <BulkAttendanceModal
        isOpen={isBulkModalOpen}
        selectedDate={selectedDate}
        onClose={() => {
          setIsBulkModalOpen(false);
          fetchAttendance(currentPage, searchTerm, selectedDate, filters);
        }}
      />

      <AttendanceFilterModal
        isOpen={isFilterModalOpen}
        filters={filters}
        onClose={() => setIsFilterModalOpen(false)}
        onApply={handleApplyFilters}
      />
    </div>
  );
}