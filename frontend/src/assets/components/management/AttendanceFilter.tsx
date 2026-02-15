"use client";

import { useState, useEffect } from "react";
import { X, Filter, RotateCcw } from "lucide-react";
import { apiRequest } from "@/src/lib/apiClient";

interface FilterState {
  date?: string;
  start_date?: string;
  end_date?: string;
  status?: string;
  class_id?: string;
}

interface AttendanceFilterModalProps {
  isOpen: boolean;
  filters: FilterState;
  onClose: () => void;
  onApply: (filters: FilterState) => void;
}

export function AttendanceFilterModal({
  isOpen,
  filters,
  onClose,
  onApply,
}: AttendanceFilterModalProps) {
  const [localFilters, setLocalFilters] = useState<FilterState>(filters);
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
    // Remove empty filters
    const cleanedFilters = Object.entries(localFilters).reduce((acc, [key, value]) => {
      if (value !== "" && value !== undefined) {
        acc[key as keyof FilterState] = value;
      }
      return acc;
    }, {} as FilterState);

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
            <p className="modal-subtitle">Filter attendance records by criteria</p>
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
                onChange={(e) =>
                  setLocalFilters({ ...localFilters, status: e.target.value })
                }
              >
                <option value="">All Statuses</option>
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
                onChange={(e) =>
                  setLocalFilters({ ...localFilters, class_id: e.target.value })
                }
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
                <div className="form-group-inline">
                  <label className="form-label-sm">Start Date</label>
                  <input
                    type="date"
                    className="form-input"
                    value={localFilters.start_date || ""}
                    onChange={(e) =>
                      setLocalFilters({ ...localFilters, start_date: e.target.value })
                    }
                  />
                </div>
                <div className="form-group-inline">
                  <label className="form-label-sm">End Date</label>
                  <input
                    type="date"
                    className="form-input"
                    value={localFilters.end_date || ""}
                    onChange={(e) =>
                      setLocalFilters({ ...localFilters, end_date: e.target.value })
                    }
                  />
                </div>
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
            <Filter size={18} />
            Apply Filters
          </button>
        </div>
      </div>
    </div>
  );
}