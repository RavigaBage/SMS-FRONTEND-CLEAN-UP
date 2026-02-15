"use client";

import { useState, useEffect } from "react";
import { X, Loader2, BookOpen, Check } from "lucide-react";
import { apiRequest } from "@/src/lib/apiClient";
import { toast } from "react-hot-toast";
import { Teacher } from "./TeacherTable";

interface AssignSubjectsModalProps {
  isOpen: boolean;
  teacher: Teacher;
  onClose: () => void;
}

interface Subject {
  id: number;
  subject_name: string;
  subject_code: string;
  grade_level: string;
}

export function AssignSubjectsModal({ isOpen, teacher, onClose }: AssignSubjectsModalProps) {
  const [loading, setLoading] = useState(false);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [selectedSubjects, setSelectedSubjects] = useState<number[]>([]);
  const [errors, setErrors] = useState<any>({});

  useEffect(() => {
    if (isOpen) {
      fetchSubjects();
      // Set initially selected subjects
      setSelectedSubjects(teacher.subjects.map((s: any) => s.id));
    }
  }, [isOpen, teacher]);

  const fetchSubjects = async () => {
    try {
      const res = await apiRequest<any>("/subjects/", {
        method: "GET",
      });
      setSubjects(res.results as any || res);
    } catch (err: any) {
      console.error("Error fetching subjects:", err);
      toast.error("Failed to load subjects");
    }
  };

  const handleToggleSubject = (subjectId: number) => {
    setSelectedSubjects(prev =>
      prev.includes(subjectId)
        ? prev.filter(id => id !== subjectId)
        : [...prev, subjectId]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    try {
      await apiRequest(`/teachers/${teacher.id}/assign_subjects/`, {
        method: "POST",
        body: JSON.stringify({ subject_ids: selectedSubjects }),
      });

      toast.success("Subjects assigned successfully!");
      onClose();
    } catch (err: any) {
      console.error("Error assigning subjects:", err);
      
      if (err.response?.data) {
        const errorData = err.response.data;
        
        if (errorData.error && errorData.detail) {
          toast.error(errorData.detail);
          setErrors({ general: errorData.detail });
        } else {
          toast.error("Failed to assign subjects");
        }
      } else {
        toast.error(err.detail || "Failed to assign subjects");
      }
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container modal-md" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <h2 className="modal-title">
              <BookOpen className="modal-icon" />
              Assign Subjects
            </h2>
            <p className="modal-subtitle">
              Assign subjects to {teacher.fullName}
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
            <div className="subjects-selection">
              {subjects.length === 0 ? (
                <p className="text-secondary">No subjects available</p>
              ) : (
                subjects.map((subject) => (
                  <div
                    key={subject.id}
                    className={`subject-card ${selectedSubjects.includes(subject.id) ? 'selected' : ''}`}
                    onClick={() => handleToggleSubject(subject.id)}
                  >
                    <div className="subject-info">
                      <h4 className="subject-name">{subject.subject_name}</h4>
                      <p className="subject-code">{subject.subject_code}</p>
                      {subject.grade_level && (
                        <span className="badge badge-sm">{subject.grade_level}</span>
                      )}
                    </div>
                    {selectedSubjects.includes(subject.id) && (
                      <div className="subject-check">
                        <Check size={20} />
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>

            <div className="selected-count">
              <p>
                <strong>{selectedSubjects.length}</strong> subject{selectedSubjects.length !== 1 ? 's' : ''} selected
              </p>
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
                  Assigning...
                </>
              ) : (
                <>
                  <BookOpen size={18} />
                  Assign Subjects
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}