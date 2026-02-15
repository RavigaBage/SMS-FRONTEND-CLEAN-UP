"use client";

import { useState, useEffect } from "react";
import { X, Loader2, Save, UserCheck } from "lucide-react";
import { apiRequest } from "@/src/lib/apiClient";
import { toast } from "react-hot-toast";

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
      toast.error("Failed to load classes");
    }
  };

  const fetchStudents = async (classId: string) => {
    try {
      const res = await apiRequest<any>(`/classes/${classId}/students/`, { method: "GET" });
      setStudents(res as any);
    } catch (err) {
      console.error("Error fetching students:", err);
      toast.error("Failed to load students");
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
      console.error("Error marking attendance:", err);
      
      if (err.response?.data) {
        const errorData = err.response.data;
        
        if (errorData.error && errorData.detail) {
          toast.error(errorData.detail);
          setErrors({ general: errorData.detail });
        } else if (typeof errorData === 'object') {
          setErrors(errorData);
          const firstError = Object.values(errorData)[0];
          toast.error(Array.isArray(firstError) ? firstError[0] : String(firstError));
        } else {
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
          {errors.general && (
            <div className="error-alert">
              {errors.general}
            </div>
          )}

          <div className="form-section">
            <div className="form-group">
              <label className="form-label">
                Class <span className="required">*</span>
              </label>
              <select
                className={`form-select ${errors.class_id ? 'error' : ''}`}
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
              {errors.class_id && <span className="error-text">{errors.class_id}</span>}
            </div>

            <div className="form-group">
              <label className="form-label">
                Student <span className="required">*</span>
              </label>
              <select
                className={`form-select ${errors.student_id ? 'error' : ''}`}
                value={formData.student_id}
                onChange={(e) => setFormData({ ...formData, student_id: e.target.value })}
                required
                disabled={!selectedClass}
              >
                <option value="">-- Select Student --</option>
                {students.map((student) => (
                  <option key={student.id} value={student.id}>
                    {student.first_name} {student.last_name} - {student.admission_number || student.id}
                  </option>
                ))}
              </select>
              {errors.student_id && <span className="error-text">{errors.student_id}</span>}
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
              disabled={loading}
            >
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