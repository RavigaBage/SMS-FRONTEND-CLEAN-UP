"use client";

import { useState, useEffect } from "react";
import { X, Loader2, Save, Users } from "lucide-react";
import { apiRequest } from "@/src/lib/apiClient";
import { toast } from "react-hot-toast";
import { ErrorMessage, extractErrorDetail } from "@/components/ui/ErrorExtract";

interface BulkAttendanceModalProps {
  isOpen: boolean;
  selectedDate: string;
  onClose: () => void;
}

export function BulkAttendanceModal({
  isOpen,
  selectedDate,
  onClose,
}: BulkAttendanceModalProps) {
  const [loading, setLoading] = useState(false);
  const [students, setStudents] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [selectedClass, setSelectedClass] = useState("");
  const [defaultStatus, setDefaultStatus] = useState("present");
  const [attendanceData, setAttendanceData] = useState<any[]>([]);
  const [errorDetail, setErrorDetail] = useState<any>(null);

  useEffect(() => {
    if (isOpen) {
      fetchClasses();
      setSelectedClass("");
      setStudents([]);
      setAttendanceData([]);
      setErrorDetail(null);
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
      setClasses((res.results as any) || res);
    } catch (err) {
      setErrorDetail(extractErrorDetail(err) || "Failed to load classes");
    }
  };

  const fetchStudents = async (classId: string) => {
    try {
      const res = await apiRequest<any>(`/classes/${classId}/students/`, {
        method: "GET",
      });
      const students = (res.results || res.data || []) as any[];

      setStudents(students);
      setAttendanceData(
        students.map((s: any) => ({
          student_id: s.id,
          status: defaultStatus,
          remarks: "",
        })),
      );
    } catch (err) {
      setErrorDetail(extractErrorDetail(err) || "Failed to load students");
    }
  };

  const updateStudentStatus = (studentId: number, status: string) => {
    setAttendanceData((prev) =>
      prev.map((item) =>
        item.student_id === studentId ? { ...item, status } : item,
      ),
    );
  };

  const updateStudentRemarks = (studentId: number, remarks: string) => {
    setAttendanceData((prev) =>
      prev.map((item) =>
        item.student_id === studentId ? { ...item, remarks } : item,
      ),
    );
  };

  const handleDefaultStatusChange = (status: string) => {
    setDefaultStatus(status);
    setAttendanceData((prev) => prev.map((item) => ({ ...item, status })));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorDetail(null);

    try {
      const res = await apiRequest("/attendance/bulk_mark/", {
        method: "POST",
        body: JSON.stringify({
          class_id: parseInt(selectedClass),
          attendance_date: selectedDate,
          attendance_records: attendanceData.map((item) => ({
            student_id: item.student_id,
            status: item.status,
            remarks: item.remarks || "",
          })),
        }),
      });

      if (res.error) {
        toast.error(res.error);
        return;
      }

      const summary = (res.data as any)?.summary;
      toast.success(
        summary
          ? `Created: ${summary.created}, Updated: ${summary.updated}, Failed: ${summary.failed}`
          : `Attendance marked for ${attendanceData.length} students!`,
      );
      onClose();
      resetForm();
    } catch (err: any) {
      setErrorDetail(
        extractErrorDetail(err) || "Failed to mark bulk attendance. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setSelectedClass("");
    setStudents([]);
    setAttendanceData([]);
    setDefaultStatus("present");
    setErrorDetail(null);
  };

  if (!isOpen) return null;

  return (
    <div className="attendance-modal modal-overlay" onClick={onClose}>
      <div
        className="modal-container modal-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <div>
            <h2 className="modal-title">
              <Users className="modal-icon" />
              Bulk Mark Attendance
            </h2>
            <p className="modal-subtitle">
              Mark attendance for entire class on{" "}
              {new Date(selectedDate).toLocaleDateString()}
            </p>
          </div>
          <button className="modal-close" onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          {errorDetail && (
            <ErrorMessage errorDetail={errorDetail} className="mb-3" />
          )}
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
                  onChange={(e) => handleDefaultStatusChange(e.target.value)}
                >
                  <option value="present">All Present</option>
                  <option value="absent">All Absent</option>
                  <option value="late">All Late</option>
                  <option value="excused">All Excused</option>
                </select>
              </div>
            </div>

            {students.length > 0 && (
              <div className="bulk-attendance-list">
                <div className="bulk-attendance-header">
                  <span className="student-col-header">Student Name</span>
                  <span className="status-col-header">Status</span>
                </div>
                {students.map((student, index) => {
                  const attendance = attendanceData.find(
                    (a) => a.student_id === student.id,
                  );
                  return (
                    <div key={student.id} className="bulk-attendance-item">
                      <div className="student-info">
                        <span className="student-number">{index + 1}.</span>
                        <img
                          src={
                            student.photo_url ||
                            `https://ui-avatars.com/api/?name=${student.first_name}+${student.last_name}&background=0D9488&color=fff`
                          }
                          alt={`${student.first_name} ${student.last_name}`}
                          className="student-avatar-sm"
                        />
                        <div className="student-details">
                          <span className="student-name">
                            {student.first_name} {student.last_name}
                          </span>
                          <span className="student-id">
                            {student.admission_number || `ID: ${student.id}`}
                          </span>
                        </div>
                      </div>
                      <select
                        className="status-select-sm"
                        value={attendance?.status || defaultStatus}
                        onChange={(e) =>
                          updateStudentStatus(student.id, e.target.value)
                        }
                      >
                        <option value="present">Present</option>
                        <option value="absent">Absent</option>
                        <option value="late">Late</option>
                        <option value="excused">Excused</option>
                      </select>
                    </div>
                  );
                })}
              </div>
            )}

            {selectedClass && students.length === 0 && (
              <div className="empty-state-small">
                <p>No students found in this class</p>
              </div>
            )}
          </div>

          <div className="modal-footer">
            <button
              type="button"
              className="secondary-button"
              onClick={onClose}
              disabled={loading}
            >
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
