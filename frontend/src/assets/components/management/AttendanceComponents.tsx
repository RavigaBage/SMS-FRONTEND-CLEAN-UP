import { Users, UserCheck, UserX, Clock, AlertCircle,X, Loader2, Save} from "lucide-react";
import { useState, useEffect } from "react";
import { apiRequest } from "@/src/lib/apiClient";
import { toast } from "react-hot-toast";
interface StatsProps {
  stats: {
    total: number;
    present: number;
    absent: number;
    late: number;
    excused: number;
  };
  attendanceRate: number;
}

export function AttendanceStatsCards({ stats, attendanceRate }: StatsProps) {
  return (
    <div className="stats-grid">
      <div className="stat-card">
        <div className="stat-content">
          <p className="stat-label">Total Students</p>
          <p className="stat-value">{stats.total}</p>
        </div>
        <div className="stat-icon stat-icon-blue">
          <Users size={24} />
        </div>
      </div>

      <div className="stat-card">
        <div className="stat-content">
          <p className="stat-label">Present</p>
          <p className="stat-value stat-value-green">{stats.present}</p>
        </div>
        <div className="stat-icon stat-icon-green">
          <UserCheck size={24} />
        </div>
      </div>

      <div className="stat-card">
        <div className="stat-content">
          <p className="stat-label">Absent</p>
          <p className="stat-value stat-value-red">{stats.absent}</p>
        </div>
        <div className="stat-icon stat-icon-red">
          <UserX size={24} />
        </div>
      </div>

      <div className="stat-card">
        <div className="stat-content">
          <p className="stat-label">Late</p>
          <p className="stat-value stat-value-yellow">{stats.late}</p>
        </div>
        <div className="stat-icon stat-icon-yellow">
          <Clock size={24} />
        </div>
      </div>

      <div className="stat-card stat-card-highlight">
        <div className="stat-content">
          <p className="stat-label">Attendance Rate</p>
          <p className="stat-value">{attendanceRate}%</p>
        </div>
        <div className="attendance-progress">
          <div
            className="attendance-progress-bar"
            style={{ width: `${attendanceRate}%` }}
          />
        </div>
      </div>
    </div>
  );
}



interface MarkAttendanceModalProps {
  isOpen: boolean;
  selectedDate: string;
  onClose: () => void;
}

export function MarkAttendanceModal({ isOpen, selectedDate, onClose }: MarkAttendanceModalProps) {
  const [loading, setLoading] = useState(false);
  const [students, setStudents] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [selectedClass, setSelectedClass] = useState("");
  const [formData, setFormData] = useState({
    student_id: "",
    attendance_date: selectedDate,
    status: "present",
    check_in_time: "",
    remarks: "",
  });
  const [errors, setErrors] = useState<any>({});

  useEffect(() => {
    if (isOpen) {
      fetchClasses();
      setFormData(prev => ({ ...prev, attendance_date: selectedDate }));
    }
  }, [isOpen, selectedDate]);

  useEffect(() => {
    if (selectedClass) {
      fetchStudents(selectedClass);
    }
  }, [selectedClass]);

  const fetchClasses = async () => {
    try {
      const res = await apiRequest<any>("/classes/", { method: "GET" });
      setClasses(res.results as any || res);
    } catch (err) {
      console.error("Error fetching classes:", err);
    }
  };

  const fetchStudents = async (classId: string) => {
    try {
      const res = await apiRequest<any>(`/classes/${classId}/students/`, { method: "GET" });
      setStudents(res as any);
    } catch (err) {
      console.error("Error fetching students:", err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    try {
      await apiRequest("/attendance/students/", {
        method: "POST",
        body: JSON.stringify(formData),
      });

      toast.success("Attendance marked successfully!");
      onClose();
      resetForm();
    } catch (err: any) {
      if (err.response?.data) {
        const errorData = err.response.data;
        if (errorData.error && errorData.detail) {
          toast.error(errorData.detail);
          setErrors({ general: errorData.detail });
        } else {
          setErrors(errorData);
          toast.error("Failed to mark attendance");
        }
      } else {
        toast.error(err.detail || "Failed to mark attendance");
      }
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      student_id: "",
      attendance_date: selectedDate,
      status: "present",
      check_in_time: "",
      remarks: "",
    });
    setSelectedClass("");
    setErrors({});
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container modal-md" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <h2 className="modal-title">
              <UserCheck className="modal-icon" />
              Mark Attendance
            </h2>
            <p className="modal-subtitle">
              Record student attendance for {new Date(selectedDate).toLocaleDateString()}
            </p>
          </div>
          <button className="modal-close" onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          {errors.general && <div className="error-alert">{errors.general}</div>}

          <div className="form-section">
            <div className="form-group">
              <label className="form-label">
                Class <span className="required">*</span>
              </label>
              <select
                className="form-select"
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                required
              >
                <option value="">-- Select Class --</option>
                {classes.map((cls) => (
                  <option key={cls.id} value={cls.id}>
                    {cls.class_name}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">
                Student <span className="required">*</span>
              </label>
              <select
                className="form-select"
                value={formData.student_id}
                onChange={(e) => setFormData({ ...formData, student_id: e.target.value })}
                required
                disabled={!selectedClass}
              >
                <option value="">-- Select Student --</option>
                {students.map((student) => (
                  <option key={student.id} value={student.id}>
                    {student.first_name} {student.last_name} - {student.admission_number}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">
                  Status <span className="required">*</span>
                </label>
                <select
                  className="form-select"
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  required
                >
                  <option value="present">Present</option>
                  <option value="absent">Absent</option>
                  <option value="late">Late</option>
                  <option value="excused">Excused</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Check-in Time</label>
                <input
                  type="time"
                  className="form-input"
                  value={formData.check_in_time}
                  onChange={(e) => setFormData({ ...formData, check_in_time: e.target.value })}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Remarks</label>
              <textarea
                className="form-textarea"
                rows={3}
                placeholder="Additional notes..."
                value={formData.remarks}
                onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
              />
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="secondary-button" onClick={onClose} disabled={loading}>
              Cancel
            </button>
            <button type="submit" className="primary-button" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="animate-spin" size={18} />
                  Saving...
                </>
              ) : (
                <>
                  <Save size={18} />
                  Mark Attendance
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ============= BulkAttendance.tsx =============
export function BulkAttendanceModal({ isOpen, selectedDate, onClose }: MarkAttendanceModalProps) {
  const [loading, setLoading] = useState(false);
  const [students, setStudents] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [selectedClass, setSelectedClass] = useState("");
  const [defaultStatus, setDefaultStatus] = useState("present");
  const [attendanceData, setAttendanceData] = useState<any[]>([]);

  useEffect(() => {
    if (isOpen) {
      fetchClasses();
    }
  }, [isOpen]);

  useEffect(() => {
    if (selectedClass) {
      fetchStudents(selectedClass);
    }
  }, [selectedClass]);

  const fetchClasses = async () => {
    try {
      const res = await apiRequest<any>("/classes/", { method: "GET" });
      setClasses(res.results as any || res);
    } catch (err) {
      console.error("Error fetching classes:", err);
    }
  };

  const fetchStudents = async (classId: string) => {
    try {
      const res = await apiRequest<any>(`/classes/${classId}/students/`, { method: "GET" });
      setStudents(res.results as any || res );
      setAttendanceData(
        res.map((s: any) => ({
          student_id: s.id,
          status: defaultStatus,
          remarks: "",
        }))
      );
    } catch (err) {
      console.error("Error fetching students:", err);
    }
  };

  const updateStudentStatus = (studentId: number, status: string) => {
    setAttendanceData(prev =>
      prev.map(item =>
        item.student_id === studentId ? { ...item, status } : item
      )
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = attendanceData.map(item => ({
        ...item,
        attendance_date: selectedDate,
      }));

      await apiRequest("/attendance/students/bulk/", {
        method: "POST",
        body: JSON.stringify({ attendance_records: payload }),
      });

      toast.success(`Attendance marked for ${payload.length} students!`);
      onClose();
    } catch (err: any) {
      toast.error(err?.detail || "Failed to mark bulk attendance");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container modal-lg" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <h2 className="modal-title">
              <Users className="modal-icon" />
              Bulk Mark Attendance
            </h2>
            <p className="modal-subtitle">
              Mark attendance for entire class on {new Date(selectedDate).toLocaleDateString()}
            </p>
          </div>
          <button className="modal-close" onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-section">
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">
                  Select Class <span className="required">*</span>
                </label>
                <select
                  className="form-select"
                  value={selectedClass}
                  onChange={(e) => setSelectedClass(e.target.value)}
                  required
                >
                  <option value="">-- Select Class --</option>
                  {classes.map((cls) => (
                    <option key={cls.id} value={cls.id}>
                      {cls.class_name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Default Status</label>
                <select
                  className="form-select"
                  value={defaultStatus}
                  onChange={(e) => {
                    setDefaultStatus(e.target.value);
                    setAttendanceData(prev =>
                      prev.map(item => ({ ...item, status: e.target.value }))
                    );
                  }}
                >
                  <option value="present">All Present</option>
                  <option value="absent">All Absent</option>
                </select>
              </div>
            </div>

            {students.length > 0 && (
              <div className="bulk-attendance-list">
                {students.map((student, index) => (
                  <div key={student.id} className="bulk-attendance-item">
                    <div className="student-info">
                      <span className="student-number">{index + 1}.</span>
                      <span className="student-name">
                        {student.first_name} {student.last_name}
                      </span>
                    </div>
                    <select
                      className="status-select-sm"
                      value={attendanceData.find(a => a.student_id === student.id)?.status}
                      onChange={(e) => updateStudentStatus(student.id, e.target.value)}
                    >
                      <option value="present">Present</option>
                      <option value="absent">Absent</option>
                      <option value="late">Late</option>
                      <option value="excused">Excused</option>
                    </select>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="modal-footer">
            <button type="button" className="secondary-button" onClick={onClose} disabled={loading}>
              Cancel
            </button>
            <button
              type="submit"
              className="primary-button"
              disabled={loading || students.length === 0}
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" size={18} />
                  Marking...
                </>
              ) : (
                <>
                  <Save size={18} />
                  Mark All ({students.length})
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ============= AttendanceFilter.tsx =============
import { Filter, RotateCcw } from "lucide-react";

interface FilterModalProps {
  isOpen: boolean;
  filters: any;
  onClose: () => void;
  onApply: (filters: any) => void;
}

export function AttendanceFilterModal({ isOpen, filters, onClose, onApply }: FilterModalProps) {
  const [localFilters, setLocalFilters] = useState(filters);
  const [classes, setClasses] = useState<any[]>([]);

  useEffect(() => {
    if (isOpen) {
      setLocalFilters(filters);
      fetchClasses();
    }
  }, [isOpen, filters]);

  const fetchClasses = async () => {
    try {
      const res = await apiRequest<any>("/classes/", { method: "GET" });
      setClasses(res.results as any || res);
    } catch (err) {
      console.error("Error fetching classes:", err);
    }
  };

  const handleApply = () => {
    const cleanedFilters = Object.entries(localFilters).reduce((acc, [key, value]) => {
      if (value !== "" && value !== undefined) {
        acc[key] = value;
      }
      return acc;
    }, {} as any);

    onApply(cleanedFilters);
  };

  const handleReset = () => {
    setLocalFilters({});
    onApply({});
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container modal-sm" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <h2 className="modal-title">
              <Filter className="modal-icon" />
              Filter Attendance
            </h2>
          </div>
          <button className="modal-close" onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        <div className="modal-form">
          <div className="form-section">
            <div className="form-group">
              <label className="form-label">Status</label>
              <select
                className="form-select"
                value={localFilters.status || ""}
                onChange={(e) => setLocalFilters({ ...localFilters, status: e.target.value })}
              >
                <option value="">All</option>
                <option value="present">Present</option>
                <option value="absent">Absent</option>
                <option value="late">Late</option>
                <option value="excused">Excused</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Class</label>
              <select
                className="form-select"
                value={localFilters.class_id || ""}
                onChange={(e) => setLocalFilters({ ...localFilters, class_id: e.target.value })}
              >
                <option value="">All Classes</option>
                {classes.map((cls) => (
                  <option key={cls.id} value={cls.id}>
                    {cls.class_name}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Date Range</label>
              <div className="form-row">
                <input
                  type="date"
                  className="form-input"
                  placeholder="Start Date"
                  value={localFilters.start_date || ""}
                  onChange={(e) => setLocalFilters({ ...localFilters, start_date: e.target.value })}
                />
                <input
                  type="date"
                  className="form-input"
                  placeholder="End Date"
                  value={localFilters.end_date || ""}
                  onChange={(e) => setLocalFilters({ ...localFilters, end_date: e.target.value })}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button className="ghost-button" onClick={handleReset}>
            <RotateCcw size={18} />
            Reset
          </button>
          <button className="primary-button" onClick={handleApply}>
            Apply Filters
          </button>
        </div>
      </div>
    </div>
  );
}