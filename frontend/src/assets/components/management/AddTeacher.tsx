"use client";

import { useState, useEffect } from "react";
import { X, Loader2, Save, User, BookOpen } from "lucide-react";
import { apiRequest } from "@/src/lib/apiClient";
import { toast } from "react-hot-toast";

interface AddTeacherModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Subject {
  id: number;
  subject_name: string;
  subject_code: string;
}

interface TeacherUser {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
}

export function AddTeacherModal({ isOpen, onClose }: AddTeacherModalProps) {
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState<TeacherUser[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [errors, setErrors] = useState<any>({});

  const [formData, setFormData] = useState({
    user_id: "",
    first_name: "",
    last_name: "",
    specialization: "",
    subject_ids: [] as number[],
    qualifications: "",
    years_of_experience: 0,
    phone_number: "",
    emergency_contact: "",
  });

  // Fetch users with teacher role
  useEffect(() => {
    if (isOpen) {
      fetchTeacherUsers();
      fetchSubjects();
    }
  }, [isOpen]);

  const fetchTeacherUsers = async () => {
    try {
      const res = await apiRequest<any>("/users/?role=teacher&is_active=true", {
        method: "GET",
      });
      
      // Filter out users who already have teacher profiles
      const availableUsers = res.results || [];
      setUsers(availableUsers);
    } catch (err: any) {
      console.error("Error fetching users:", err);
      toast.error("Failed to load teacher users");
    }
  };

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

  const handleUserChange = (userId: string) => {
    const selectedUser = users.find(u => u.id.toString() === userId);
    if (selectedUser) {
      setFormData({
        ...formData,
        user_id: userId,
        first_name: selectedUser.first_name || "",
        last_name: selectedUser.last_name || "",
      });
    } else {
      setFormData({ ...formData, user_id: userId });
    }
  };

  const handleSubjectToggle = (subjectId: number) => {
    setFormData(prev => ({
      ...prev,
      subject_ids: prev.subject_ids.includes(subjectId)
        ? prev.subject_ids.filter(id => id !== subjectId)
        : [...prev.subject_ids, subjectId]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    try {
      await apiRequest("/teachers/", {
        method: "POST",
        body: JSON.stringify(formData),
      });

      toast.success("Teacher profile created successfully!");
      onClose();
      resetForm();
    } catch (err: any) {
      console.error("Error creating teacher:", err);
      
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
          toast.error("Failed to create teacher profile");
        }
      } else {
        toast.error(err.detail || "Failed to create teacher profile");
      }
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      user_id: "",
      first_name: "",
      last_name: "",
      specialization: "",
      subject_ids: [],
      qualifications: "",
      years_of_experience: 0,
      phone_number: "",
      emergency_contact: "",
    });
    setErrors({});
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <h2 className="modal-title">
              <User className="modal-icon" />
              Add Teacher Profile
            </h2>
            <p className="modal-subtitle">Create a teacher profile for an existing user</p>
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
            <h3 className="section-title">User Account</h3>
            
            <div className="form-group">
              <label className="form-label">
                Select User <span className="required">*</span>
              </label>
              <select
                className={`form-select ${errors.user_id ? 'error' : ''}`}
                value={formData.user_id}
                onChange={(e) => handleUserChange(e.target.value)}
                required
              >
                <option value="">-- Select a teacher user --</option>
                {users.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.username} ({user.email})
                  </option>
                ))}
              </select>
              {errors.user_id && <span className="error-text">{errors.user_id}</span>}
            </div>
          </div>

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
              <label className="form-label">
                <BookOpen size={16} />
                Subjects
              </label>
              <div className="checkbox-grid">
                {subjects.map((subject) => (
                  <label key={subject.id} className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={formData.subject_ids.includes(subject.id)}
                      onChange={() => handleSubjectToggle(subject.id)}
                    />
                    <span>{subject.subject_name} ({subject.subject_code})</span>
                  </label>
                ))}
              </div>
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
                  Creating...
                </>
              ) : (
                <>
                  <Save size={18} />
                  Create Teacher
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}