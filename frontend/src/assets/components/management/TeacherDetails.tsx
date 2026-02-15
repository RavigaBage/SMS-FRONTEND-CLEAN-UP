"use client";

import { X, Mail, Phone, BookOpen, Award, Calendar, User, AlertCircle } from "lucide-react";
import { Teacher } from "./TeacherTable";

interface TeacherDetailsModalProps {
  isOpen: boolean;
  teacher: Teacher;
  onClose: () => void;
}

export function TeacherDetailsModal({ isOpen, teacher, onClose }: TeacherDetailsModalProps) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container modal-lg" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <h2 className="modal-title">
              <User className="modal-icon" />
              Teacher Details
            </h2>
            <p className="modal-subtitle">Complete teacher profile information</p>
          </div>
          <button className="modal-close" onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        <div className="modal-content">
          {/* Teacher Header */}
          <div className="teacher-detail-header">
            <img
              src={teacher.profileImage}
              alt={teacher.fullName}
              className="teacher-detail-avatar"
            />
            <div className="teacher-detail-info">
              <h3 className="teacher-detail-name">{teacher.fullName}</h3>
              <p className="teacher-detail-specialization">{teacher.specialization}</p>
              <div className="teacher-detail-badges">
                {teacher.isActive ? (
                  <span className="status-badge status-active">Active</span>
                ) : (
                  <span className="status-badge status-inactive">Inactive</span>
                )}
                <span className="badge badge-blue">
                  {teacher.yearsOfExperience} years experience
                </span>
              </div>
            </div>
          </div>

          {/* Details Grid */}
          <div className="details-grid">
            {/* Account Information */}
            <div className="detail-section">
              <h4 className="detail-section-title">Account Information</h4>
              <div className="detail-items">
                <div className="detail-item">
                  <span className="detail-label">
                    <User size={16} />
                    Username
                  </span>
                  <span className="detail-value">{teacher.username}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">
                    <Mail size={16} />
                    Email
                  </span>
                  <span className="detail-value">{teacher.email}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">
                    <Calendar size={16} />
                    Date Joined
                  </span>
                  <span className="detail-value">
                    {new Date(teacher.dateJoined).toLocaleDateString()}
                  </span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">
                    <User size={16} />
                    Assigned By
                  </span>
                  <span className="detail-value">{teacher.assignedBy}</span>
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div className="detail-section">
              <h4 className="detail-section-title">Contact Information</h4>
              <div className="detail-items">
                <div className="detail-item">
                  <span className="detail-label">
                    <Phone size={16} />
                    Phone Number
                  </span>
                  <span className="detail-value">{teacher.phoneNumber}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">
                    <AlertCircle size={16} />
                    Emergency Contact
                  </span>
                  <span className="detail-value">{teacher.emergencyContact}</span>
                </div>
              </div>
            </div>

            {/* Teaching Information */}
            <div className="detail-section detail-section-full">
              <h4 className="detail-section-title">Teaching Information</h4>
              <div className="detail-items">
                <div className="detail-item">
                  <span className="detail-label">
                    <BookOpen size={16} />
                    Specialization
                  </span>
                  <span className="detail-value">{teacher.specialization}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">
                    <Award size={16} />
                    Qualifications
                  </span>
                  <span className="detail-value">{teacher.qualifications}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">
                    <Calendar size={16} />
                    Years of Experience
                  </span>
                  <span className="detail-value">
                    {teacher.yearsOfExperience} year{teacher.yearsOfExperience !== 1 ? 's' : ''}
                  </span>
                </div>
              </div>
            </div>

            {/* Assigned Subjects */}
            <div className="detail-section detail-section-full">
              <h4 className="detail-section-title">
                <BookOpen size={16} />
                Assigned Subjects ({teacher.subjects.length})
              </h4>
              {teacher.subjects.length > 0 ? (
                <div className="subjects-grid">
                  {teacher.subjects.map((subject: any) => (
                    <div key={subject.id} className="subject-badge-detail">
                      <span className="subject-badge-name">{subject.subject_name}</span>
                      <span className="subject-badge-code">{subject.subject_code}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-secondary">No subjects assigned yet</p>
              )}
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button className="secondary-button" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}