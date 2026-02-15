"use client";

import { useState, useEffect } from "react";
import { X, SlidersHorizontal, RotateCcw } from "lucide-react";
import { apiRequest } from "@/src/lib/apiClient";

interface FilterModalProps {
  isOpen: boolean;
  filters: any;
  onClose: () => void;
  onApply: (filters: any) => void;
}

interface Subject {
  id: number;
  subject_name: string;
  subject_code: string;
}

export function FilterModal({ isOpen, filters, onClose, onApply }: FilterModalProps) {
  const [localFilters, setLocalFilters] = useState(filters);
  const [subjects, setSubjects] = useState<Subject[]>([]);

  useEffect(() => {
    if (isOpen) {
      setLocalFilters(filters);
      fetchSubjects();
    }
  }, [isOpen, filters]);

  const fetchSubjects = async () => {
    try {
      const res = await apiRequest<any>("/subjects/", {
        method: "GET",
      });
      setSubjects(res.results as any || res);
    } catch (err) {
      console.error("Error fetching subjects:", err);
    }
  };

  const handleApply = () => {
    // Remove empty filters
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
              <SlidersHorizontal className="modal-icon" />
              Filters
            </h2>
            <p className="modal-subtitle">Filter teachers by criteria</p>
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
                value={localFilters.is_active || ""}
                onChange={(e) =>
                  setLocalFilters({ ...localFilters, is_active: e.target.value })
                }
              >
                <option value="">All</option>
                <option value="true">Active</option>
                <option value="false">Inactive</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Specialization</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g., Mathematics"
                value={localFilters.specialization || ""}
                onChange={(e) =>
                  setLocalFilters({ ...localFilters, specialization: e.target.value })
                }
              />
            </div>

            <div className="form-group">
              <label className="form-label">Subject</label>
              <select
                className="form-select"
                value={localFilters.subject_id || ""}
                onChange={(e) =>
                  setLocalFilters({ ...localFilters, subject_id: e.target.value })
                }
              >
                <option value="">All Subjects</option>
                {subjects.map((subject) => (
                  <option key={subject.id} value={subject.id}>
                    {subject.subject_name} ({subject.subject_code})
                  </option>
                ))}
              </select>
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