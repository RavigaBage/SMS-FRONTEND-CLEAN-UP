"use client";

import { useState, useEffect } from "react";
import { X, Loader2, Save, Edit } from "lucide-react";
import { apiRequest } from "@/src/lib/apiClient";
import { toast } from "react-hot-toast";
import { Teacher } from "./TeacherTable";

interface EditTeacherModalProps {
  isOpen: boolean;
  teacher: Teacher;
  onClose: () => void;
}

export function EditTeacherModal({ isOpen, teacher, onClose }: EditTeacherModalProps) {
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<any>({});

  const [formData, setFormData] = useState({
    first_name: teacher.firstName,
    last_name: teacher.lastName,
    specialization: teacher.specialization,
    qualifications: teacher.qualifications,
    years_of_experience: teacher.yearsOfExperience,
    phone_number: teacher.phoneNumber,
    emergency_contact: teacher.emergencyContact,
    is_active: teacher.isActive,
  });

  useEffect(() => {
    if (isOpen) {
      setFormData({
        first_name: teacher.firstName,
        last_name: teacher.lastName,
        specialization: teacher.specialization,
        qualifications: teacher.qualifications,
        years_of_experience: teacher.yearsOfExperience,
        phone_number: teacher.phoneNumber,
        emergency_contact: teacher.emergencyContact,
        is_active: teacher.isActive,
      });
      setErrors({});
    }
  }, [isOpen, teacher]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    try {
      await apiRequest(`/teachers/${teacher.id}/`, {
        method: "PATCH",
        body: JSON.stringify(formData),
      });

      toast.success("Teacher updated successfully!");
      onClose();
    } catch (err: any) {
      console.error("Error updating teacher:", err);
      
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
          toast.error("Failed to update teacher");
        }
      } else {
        toast.error(err.detail || "Failed to update teacher");
      }
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <h2 className="modal-title">
              <Edit className="modal-icon" />
              Edit Teacher
            </h2>
            <p className="modal-subtitle">Update teacher information</p>
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
            <h3 className="section-title">Personal Information</h3>
            
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">
                  First Name <span className="required">*</span>
                </label>
                <input
                  type="text"
                  className={`form-input ${errors.first_name ? 'error' : ''}`}
                  value={formData.first_name}
                  onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                  required
                />
                {errors.first_name && <span className="error-text">{errors.first_name}</span>}
              </div>

              <div className="form-group">
                <label className="form-label">
                  Last Name <span className="required">*</span>
                </label>
                <input
                  type="text"
                  className={`form-input ${errors.last_name ? 'error' : ''}`}
                  value={formData.last_name}
                  onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                  required
                />
                {errors.last_name && <span className="error-text">{errors.last_name}</span>}
              </div>
            </div>
          </div>

          <div className="form-section">
            <h3 className="section-title">Teaching Information</h3>
            
            <div className="form-group">
              <label className="form-label">Specialization</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g., Mathematics, Science, English"
                value={formData.specialization}
                onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Qualifications</label>
              <textarea
                className="form-textarea"
                placeholder="e.g., B.Ed Mathematics, M.Sc Applied Mathematics"
                value={formData.qualifications}
                onChange={(e) => setFormData({ ...formData, qualifications: e.target.value })}
                rows={3}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Years of Experience</label>
              <input
                type="number"
                className="form-input"
                min="0"
                value={formData.years_of_experience}
                onChange={(e) => setFormData({ ...formData, years_of_experience: parseInt(e.target.value) || 0 })}
              />
            </div>
          </div>

          <div className="form-section">
            <h3 className="section-title">Contact Information</h3>
            
            <div className="form-group">
              <label className="form-label">Phone Number</label>
              <input
                type="tel"
                className="form-input"
                placeholder="+233 XX XXX XXXX"
                value={formData.phone_number}
                onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Emergency Contact</label>
              <input
                type="tel"
                className="form-input"
                placeholder="+233 XX XXX XXXX"
                value={formData.emergency_contact}
                onChange={(e) => setFormData({ ...formData, emergency_contact: e.target.value })}
              />
            </div>
          </div>

          <div className="form-section">
            <h3 className="section-title">Status</h3>
            
            <div className="form-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                />
                <span>Active Teacher</span>
              </label>
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
                  Updating...
                </>
              ) : (
                <>
                  <Save size={18} />
                  Update Teacher
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}