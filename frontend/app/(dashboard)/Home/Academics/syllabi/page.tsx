"use client";

import React, { useState, useEffect } from "react";
import { X, BookOpen, ChevronDown, AlertCircle, CheckCircle, Search } from "lucide-react";
import "@/styles/syllabi.css";
import { fetchWithAuth } from "@/src/lib/apiClient";

interface Subject {
  id: number;
  subject_name: string;
  subject_code?: string;
}

interface Teacher {
  id: number;
  first_name: string;
  last_name: string;
  full_name: string;
}

interface ClassObj {
  id: number;
  class_name: string;
}

interface Syllabus {
  id: number;
  subject: Subject;
  teacher: Teacher;
  class_obj: ClassObj | null;
  week_number: number;
  topic_title: string;
  content_summary: string;
  learning_objectives: string;
}

interface Toast {
  id: string;
  type: "success" | "error" | "info";
  message: string;
}

function Toast({ toast, onClose }: { toast: Toast; onClose: () => void }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 5000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const colors = {
    success: { bg: "#ecfdf5", border: "#d1fae5", text: "#065f46", icon: "#10b981" },
    error: { bg: "#fef2f2", border: "#fee2e2", text: "#7f1d1d", icon: "#ef4444" },
    info: { bg: "#eff6ff", border: "#dbeafe", text: "#1e3a8a", icon: "#3b82f6" },
  }[toast.type];

  return (
    <div
      className="fixed bottom-4 right-4 max-w-md animate-in fade-in slide-in-from-bottom-4 duration-300"
      style={{
        backgroundColor: colors.bg,
        borderLeft: `4px solid ${colors.icon}`,
        borderRadius: "8px",
        padding: "16px",
        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.08)",
      }}
    >
      <div className="flex items-start gap-3">
        <div style={{ color: colors.icon, marginTop: "2px" }}>
          {toast.type === "success" && <CheckCircle size={18} />}
          {toast.type === "error" && <AlertCircle size={18} />}
          {toast.type === "info" && <AlertCircle size={18} />}
        </div>
        <div className="flex-1">
          <p style={{ color: colors.text, fontSize: "13px", fontWeight: 500, lineHeight: 1.5 }}>
            {toast.message}
          </p>
        </div>
        <button
          onClick={onClose}
          style={{ color: colors.text, opacity: 0.6 }}
          className="hover:opacity-100 transition-opacity"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
}

export default function Syllabi() {
  const [syllabi, setSyllabi] = useState<Syllabus[]>([]);
  const [selectedSyllabus, setSelectedSyllabus] = useState<Syllabus | null>(null);
  const [loading, setLoading] = useState(true);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingSyllabus, setEditingSyllabus] = useState<Syllabus | null>(null);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [selectSubject, setSelectSubject] = useState("");
  const [classes, setClasses] = useState<ClassObj[]>([]);
  const [selectedClass, setSelectedClass] = useState("");
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = (type: "success" | "error" | "info", message: string) => {
    const id = Date.now().toString();
    setToasts((prev) => [...prev, { id, type, message }]);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const classResponse = await fetchWithAuth(
        `${process.env.NEXT_PUBLIC_API_URL}/classes/`
      );
      const classData = await classResponse.json();
      setClasses(classData.results || classData);

      const subjectResponse = await fetchWithAuth(
        `${process.env.NEXT_PUBLIC_API_URL}/subjects/`
      );
      const subjectData = await subjectResponse.json();
      setSubjects(subjectData.results || subjectData);
    } catch (error) {
      console.error("Failed to fetch data:", error);
      addToast("error", "Failed to load subjects and classes");
    } finally {
      setLoading(false);
    }
  };

  const handleSyllabiClick = async () => {
    if (!selectSubject && !selectedClass) {
      addToast("info", "Please select at least a subject or class");
      return;
    }

    try {
      setLoading(true);
      let url = `${process.env.NEXT_PUBLIC_API_URL}/syllabi/?`;

      if (selectedClass) {
        url += `class_obj=${selectedClass}&`;
      }
      if (selectSubject) {
        url += `subject=${selectSubject}&`;
      }

      const syllResponse = await fetchWithAuth(url);
      const syllData = await syllResponse.json();

      const syllabusArray = syllData.results || syllData;
      setSyllabi(syllabusArray);

      if (syllabusArray.length > 0) {
        setSelectedSyllabus(syllabusArray[0]);
        addToast("success", `Loaded ${syllabusArray.length} syllabus(es)`);
      } else {
        setSelectedSyllabus(null);
        addToast("info", "No syllabi found for the selected filters");
      }
    } catch (error) {
      console.error("Failed to fetch syllabi:", error);
      addToast("error", "Failed to fetch syllabi");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSyllabus = async (syllabusId: number) => {
    if (
      !confirm(
        "Are you sure you want to delete this syllabus? This action cannot be undone."
      )
    ) {
      return;
    }

    try {
      const response = await fetchWithAuth(
        `${process.env.NEXT_PUBLIC_API_URL}/syllabi/${syllabusId}/`,
        {
          method: "DELETE",
        }
      );

      if (response.ok) {
        setSyllabi((prev) => prev.filter((s) => s.id !== syllabusId));
        if (selectedSyllabus?.id === syllabusId) {
          const remaining = syllabi.filter((s) => s.id !== syllabusId);
          setSelectedSyllabus(remaining.length > 0 ? remaining[0] : null);
        }
        addToast("success", "Syllabus deleted successfully");
      } else {
        throw new Error("Failed to delete syllabus");
      }
    } catch (error) {
      console.error("Failed to delete syllabus:", error);
      addToast("error", "Failed to delete syllabus");
    }
  };

  const handleEditClick = (syllabus: Syllabus) => {
    setEditingSyllabus(syllabus);
    setShowEditModal(true);
  };

  const groupedSyllabi = syllabi.reduce(
    (acc, syllabus) => {
      const weekKey = `Week ${syllabus.week_number}`;
      if (!acc[weekKey]) {
        acc[weekKey] = [];
      }
      acc[weekKey].push(syllabus);
      return acc;
    },
    {} as Record<string, Syllabus[]>
  );

  if (loading && syllabi.length === 0) {
    return (
      <div style={{ background: "linear-gradient(135deg, #ffffff 0%, #f8fafb 100%)", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ marginBottom: "16px", display: "flex", justifyContent: "center", gap: "8px" }}>
            <div style={{ width: "8px", height: "8px", background: "#9ca3af", borderRadius: "50%", animation: "pulse 2s infinite" }}></div>
          </div>
          <p style={{ color: "#6b7280", fontSize: "14px", fontWeight: 500 }}>Loading syllabi...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ background: "linear-gradient(135deg, #ffffff 0%, #f8fafb 100%)", minHeight: "100vh" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Crimson+Text:wght@400;600&family=Inter:wght@400;500;600;700&display=swap');
        
        * {
          font-family: 'Inter', sans-serif;
        }
        
        h1, h2, h3 {
          font-family: 'Crimson Text', serif;
        }

        .syllabus-container {
          display: grid;
          grid-template-columns: 320px 1fr;
          height: 100vh;
          gap: 0;
        }

        .sidebar {
          background: white;
          border-right: 1px solid #e5e7eb;
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }

        .sidebar-header {
          padding: 24px;
          border-bottom: 1px solid #f3f4f6;
        }

        .sidebar-header h2 {
          font-size: 24px;
          font-weight: 600;
          color: #1f2937;
          margin: 0 0 8px 0;
          letter-spacing: -0.5px;
        }

        .sidebar-header p {
          font-size: 12px;
          color: #9ca3af;
          margin: 0;
        }

        .filter-panel {
          padding: 20px 24px;
          border-bottom: 1px solid #f3f4f6;
        }

        .filter-label {
          font-size: 11px;
          font-weight: 700;
          color: #6b7280;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin-bottom: 12px;
          display: block;
        }

        .select-wrapper {
          position: relative;
          margin-bottom: 12px;
        }

        .select-wrapper select {
          width: 100%;
          padding: 10px 12px;
          font-size: 13px;
          border: 1px solid #e5e7eb;
          border-radius: 6px;
          background: white;
          color: #374151;
          appearance: none;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .select-wrapper select:hover {
          border-color: #d1d5db;
        }

        .select-wrapper select:focus {
          outline: none;
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }

        .select-wrapper::after {
          content: '';
          position: absolute;
          right: 10px;
          top: 50%;
          transform: translateY(-50%);
          pointer-events: none;
          width: 5px;
          height: 5px;
          border-right: 2px solid #9ca3af;
          border-bottom: 2px solid #9ca3af;
          transform: translateY(-65%) rotate(45deg);
        }

        .load-btn {
          width: 100%;
          padding: 10px 12px;
          background: #1f2937;
          color: white;
          border: none;
          border-radius: 6px;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
          margin-top: 8px;
        }

        .load-btn:hover {
          background: #111827;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }

        .syllabi-list {
          flex: 1;
          overflow-y: auto;
          padding: 12px 0;
        }

        .syllabi-list::-webkit-scrollbar {
          width: 6px;
        }

        .syllabi-list::-webkit-scrollbar-track {
          background: transparent;
        }

        .syllabi-list::-webkit-scrollbar-thumb {
          background: #e5e7eb;
          border-radius: 3px;
        }

        .week-section {
          margin-bottom: 16px;
        }

        .week-label {
          padding: 8px 24px;
          font-size: 11px;
          font-weight: 700;
          color: #9ca3af;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          background: #f9fafb;
        }

        .syllabus-item {
          padding: 12px 16px;
          margin: 0 12px;
          border-left: 3px solid transparent;
          cursor: pointer;
          transition: all 0.2s ease;
          border-radius: 4px;
          margin-bottom: 6px;
        }

        .syllabus-item:hover {
          background: #f9fafb;
          border-left-color: #d1d5db;
        }

        .syllabus-item.active {
          background: #f0f9ff;
          border-left-color: #3b82f6;
        }

        .syllabus-item-title {
          font-size: 13px;
          font-weight: 600;
          color: #1f2937;
          margin: 0;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .syllabus-item-subject {
          font-size: 12px;
          color: #9ca3af;
          margin-top: 4px;
          display: block;
        }

        .item-actions {
          display: flex;
          gap: 6px;
          margin-top: 8px;
        }

        .action-btn {
          flex: 1;
          padding: 6px 8px;
          font-size: 11px;
          font-weight: 600;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          transition: all 0.2s ease;
          text-transform: uppercase;
          letter-spacing: 0.3px;
        }

        .action-btn-edit {
          background: #eff6ff;
          color: #3b82f6;
        }

        .action-btn-edit:hover {
          background: #dbeafe;
        }

        .action-btn-delete {
          background: #fef2f2;
          color: #ef4444;
        }

        .action-btn-delete:hover {
          background: #fee2e2;
        }

        .main-content {
          display: flex;
          flex-direction: column;
          padding: 40px 48px;
          overflow-y: auto;
        }

        .header-section {
          margin-bottom: 40px;
          padding-bottom: 32px;
          border-bottom: 1px solid #e5e7eb;
        }

        .main-title {
          font-size: 48px;
          font-weight: 600;
          color: #1f2937;
          margin: 0 0 24px 0;
          letter-spacing: -1px;
          line-height: 1.1;
        }

        .badges-group {
          display: flex;
          flex-wrap: wrap;
          gap: 12px;
        }

        .badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 8px 12px;
          font-size: 12px;
          font-weight: 500;
          border-radius: 4px;
          border: 1px solid;
        }

        .badge-subject {
          background: #f0f9ff;
          border-color: #bfdbfe;
          color: #0369a1;
        }

        .badge-class {
          background: #f0fdf4;
          border-color: #bbf7d0;
          color: #15803d;
        }

        .badge-week {
          background: #fffbeb;
          border-color: #fde68a;
          color: #92400e;
        }

        .content-section {
          margin-bottom: 32px;
        }

        .section-title {
          font-size: 18px;
          font-weight: 600;
          color: #1f2937;
          margin: 0 0 16px 0;
          letter-spacing: -0.3px;
        }

        .content-text {
          font-size: 14px;
          line-height: 1.8;
          color: #4b5563;
          white-space: pre-line;
          margin: 0;
        }

        .objectives-list {
          list-style: none;
          padding: 0;
          margin: 0;
        }

        .objectives-list li {
          font-size: 14px;
          line-height: 1.8;
          color: #4b5563;
          padding: 8px 0;
          padding-left: 20px;
          position: relative;
        }

        .objectives-list li::before {
          content: '→';
          position: absolute;
          left: 0;
          color: #d1d5db;
          font-weight: 600;
        }

        .metadata-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 24px;
          background: #f9fafb;
          padding: 20px 24px;
          border-radius: 6px;
        }

        .metadata-item {
          display: flex;
          flex-direction: column;
        }

        .metadata-label {
          font-size: 11px;
          font-weight: 700;
          color: #9ca3af;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin-bottom: 6px;
        }

        .metadata-value {
          font-size: 14px;
          font-weight: 500;
          color: #1f2937;
        }

        .empty-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 100%;
          text-align: center;
        }

        .empty-icon {
          width: 64px;
          height: 64px;
          background: #f3f4f6;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 20px;
          color: #d1d5db;
        }

        .empty-title {
          font-size: 20px;
          font-weight: 600;
          color: #1f2937;
          margin: 0 0 8px 0;
        }

        .empty-text {
          font-size: 14px;
          color: #9ca3af;
          margin: 0;
        }

        .header-bar {
          background: white;
          border-bottom: 1px solid #e5e7eb;
          padding: 24px 48px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .header-bar-title {
          font-size: 32px;
          font-weight: 600;
          color: #1f2937;
          margin: 0;
          letter-spacing: -0.5px;
        }

        .header-bar-subtitle {
          font-size: 13px;
          color: #9ca3af;
          margin: 4px 0 0 0;
        }

        .create-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 20px;
          background: #3b82f6;
          color: white;
          border: none;
          border-radius: 6px;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .create-btn:hover {
          background: #2563eb;
          box-shadow: 0 4px 12px rgba(37, 99, 235, 0.2);
        }
      `}</style>

      <div className="syllabus-container">
        <div className="sidebar">
          <div className="sidebar-header">
            <h2>Syllabi</h2>
            <p>{syllabi.length} syllabi loaded</p>
          </div>

          <div className="filter-panel">
            <label className="filter-label">Subject</label>
            <div className="select-wrapper">
              <select value={selectSubject} onChange={(e) => setSelectSubject(e.target.value)}>
                <option value="">All Subjects</option>
                {subjects.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.subject_name} - {item.subject_code}
                  </option>
                ))}
              </select>
            </div>

            <label className="filter-label">Class</label>
            <div className="select-wrapper">
              <select value={selectedClass} onChange={(e) => setSelectedClass(e.target.value)}>
                <option value="">All Classes</option>
                {classes.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.class_name}
                  </option>
                ))}
              </select>
            </div>

            <button className="load-btn" onClick={handleSyllabiClick}>
              Load Syllabi
            </button>
          </div>

          <div className="syllabi-list">
            {Object.entries(groupedSyllabi).map(([weekLabel, weekSyllabi]) => (
              <div className="week-section" key={weekLabel}>
                <div className="week-label">{weekLabel}</div>
                {weekSyllabi.map((syllabus) => (
                  <div
                    key={syllabus.id}
                    className={`syllabus-item ${selectedSyllabus?.id === syllabus.id ? "active" : ""}`}
                  >
                    <div onClick={() => setSelectedSyllabus(syllabus)}>
                      <p className="syllabus-item-title">{syllabus.topic_title}</p>
                      <span className="syllabus-item-subject">{syllabus.subject?.subject_name} - {syllabus.subject?.subject_code}</span>
                    </div>
                    <div className="item-actions">
                      <button
                        className="action-btn action-btn-edit"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditClick(syllabus);
                        }}
                      >
                        Edit
                      </button>
                      <button
                        className="action-btn action-btn-delete"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteSyllabus(syllabus.id);
                        }}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ))}

            {Object.keys(groupedSyllabi).length === 0 && (
              <div style={{ padding: "32px 20px", textAlign: "center", color: "#9ca3af" }}>
                <p style={{ fontSize: "13px", margin: 0 }}>No syllabi found</p>
              </div>
            )}
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div className="header-bar">
            <div>
              <h1 className="header-bar-title">Syllabi Management</h1>
              <p className="header-bar-subtitle">Create, edit, and manage course syllabi</p>
            </div>
            <button className="create-btn" onClick={() => setShowUploadModal(true)}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 5v14M5 12h14" />
              </svg>
              Create Syllabus
            </button>
          </div>

          <div className="main-content">
            {selectedSyllabus ? (
              <>
                <div className="header-section">
                  <h1 className="main-title">{selectedSyllabus.topic_title}</h1>
                  <div className="badges-group">
                    <div className="badge badge-subject">
                      <BookOpen size={12} />
                      {selectedSyllabus.subject?.subject_name}
                    </div>
                    {selectedSyllabus.class_obj && (
                      <div className="badge badge-class">{selectedSyllabus.class_obj.class_name}</div>
                    )}
                    <div className="badge badge-week">Week {selectedSyllabus.week_number}</div>
                  </div>
                </div>

                <div className="content-section">
                  <h2 className="section-title">Content Summary</h2>
                  <p className="content-text">
                    {selectedSyllabus.content_summary || "No content summary provided"}
                  </p>
                </div>

                <div className="content-section">
                  <h2 className="section-title">Learning Objectives</h2>
                  <ul className="objectives-list">
                    {selectedSyllabus.learning_objectives ? (
                      selectedSyllabus.learning_objectives
                        .split("\n")
                        .filter((obj) => obj.trim())
                        .map((objective, index) => <li key={index}>{objective.trim()}</li>)
                    ) : (
                      <li>No learning objectives specified</li>
                    )}
                  </ul>
                </div>

                <div className="metadata-grid">
                  <div className="metadata-item">
                    <span className="metadata-label">Subject Code</span>
                    <span className="metadata-value">{selectedSyllabus.subject?.subject_code || "N/A"}</span>
                  </div>
                  <div className="metadata-item">
                    <span className="metadata-label">Teacher</span>
                    <span className="metadata-value">{selectedSyllabus.teacher?.full_name || "Not assigned"}</span>
                  </div>
                </div>
              </>
            ) : (
              <div className="empty-state">
                <div className="empty-icon">
                  <BookOpen size={32} />
                </div>
                <h3 className="empty-title">No Syllabus Selected</h3>
                <p className="empty-text">Select a syllabus from the list to view details</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {showUploadModal && (
        <UploadModal
          onClose={() => setShowUploadModal(false)}
          onSuccess={() => {
            fetchData();
            handleSyllabiClick();
          }}
          subjects={subjects}
          classes={classes}
          addToast={addToast}
        />
      )}

      {showEditModal && editingSyllabus && (
        <EditModal
          onClose={() => {
            setShowEditModal(false);
            setEditingSyllabus(null);
          }}
          onSuccess={() => {
            handleSyllabiClick();
            setShowEditModal(false);
            setEditingSyllabus(null);
          }}
          subjects={subjects}
          classes={classes}
          syllabus={editingSyllabus}
          addToast={addToast}
        />
      )}

      <div>
        {toasts.map((toast) => (
          <Toast
            key={toast.id}
            toast={toast}
            onClose={() => removeToast(toast.id)}
          />
        ))}
      </div>
    </div>
  );
}

function UploadModal({
  onClose,
  onSuccess,
  subjects,
  classes,
  addToast,
}: {
  onClose: () => void;
  onSuccess: () => void;
  subjects: Subject[];
  classes: ClassObj[];
  addToast: (type: "success" | "error" | "info", message: string) => void;
}) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    subject_id: "",
    class_id: "",
    week_number: "1",
    topic_title: "",
    content_summary: "",
    learning_objectives: "",
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setUploading(true);

    try {
      const submitData = {
        subject_id: parseInt(formData.subject_id),
        class_id: formData.class_id ? parseInt(formData.class_id) : null,
        week_number: parseInt(formData.week_number),
        topic_title: formData.topic_title,
        content_summary: formData.content_summary,
        learning_objectives: formData.learning_objectives,
      };

      const response = await fetchWithAuth(
        `${process.env.NEXT_PUBLIC_API_URL}/syllabi/`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(submitData),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        let errorMessage = "Failed to create syllabus";

        if (typeof errorData === "object") {
          if (errorData.subject_id && Array.isArray(errorData.subject_id)) {
            errorMessage = errorData.subject_id[0];
          } else if (errorData.error) {
            errorMessage = errorData.error;
          }
        }

        setError(errorMessage);
        return;
      }

      addToast("success", "Syllabus created successfully");
      onSuccess();
      onClose();
    } catch (error) {
      console.error("Failed to create syllabus:", error);
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0, 0, 0, 0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50, padding: "16px" }}>
      <div style={{ background: "white", width: "100%", maxWidth: "600px", borderRadius: "8px", boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)" }}>
        <div style={{ padding: "32px", borderBottom: "1px solid #e5e7eb" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div>
              <h2 style={{ fontSize: "24px", fontWeight: 600, color: "#1f2937", margin: "0 0 4px 0" }}>Create New Syllabus</h2>
              <p style={{ fontSize: "13px", color: "#9ca3af", margin: 0 }}>Fill in the details to add a new syllabus</p>
            </div>
            <button
              onClick={onClose}
              style={{ background: "none", border: "none", fontSize: "24px", cursor: "pointer", color: "#9ca3af", padding: 0 }}
            >
              ×
            </button>
          </div>
        </div>

        {error && (
          <div style={{ margin: "20px 32px 0", padding: "12px 16px", background: "#fef2f2", border: "1px solid #fee2e2", borderRadius: "6px", display: "flex", gap: "12px" }}>
            <AlertCircle size={18} style={{ color: "#ef4444", flexShrink: 0, marginTop: "2px" }} />
            <div>
              <p style={{ margin: 0, fontSize: "13px", fontWeight: 500, color: "#7f1d1d" }}>{error}</p>
              <p style={{ margin: "4px 0 0 0", fontSize: "12px", color: "#dc2626" }}>Check your subject assignment and try again</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ padding: "32px", maxHeight: "calc(100vh - 200px)", overflowY: "auto" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px", marginBottom: "24px" }}>
            <div>
              <label style={{ fontSize: "13px", fontWeight: 600, color: "#1f2937", display: "block", marginBottom: "8px" }}>
                Subject <span style={{ color: "#ef4444" }}>*</span>
              </label>
              <div className="select-wrapper">
                <select name="subject_id" value={formData.subject_id} onChange={handleInputChange} required style={{ width: "100%", padding: "10px 12px", fontSize: "13px", border: "1px solid #e5e7eb", borderRadius: "6px", background: "white" }}>
                  <option value="">Select a subject</option>
                  {subjects.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.subject_name} - {item.subject_code}
                    </option>
                  ))}
                </select>
              </div>
              <p style={{ fontSize: "12px", color: "#9ca3af", margin: "6px 0 0 0" }}>Select only subjects you teach</p>
            </div>

            <div>
              <label style={{ fontSize: "13px", fontWeight: 600, color: "#1f2937", display: "block", marginBottom: "8px" }}>Class (Optional)</label>
              <div className="select-wrapper">
                <select name="class_id" value={formData.class_id} onChange={handleInputChange} style={{ width: "100%", padding: "10px 12px", fontSize: "13px", border: "1px solid #e5e7eb", borderRadius: "6px", background: "white" }}>
                  <option value="">Select a class</option>
                  {classes.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.class_name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px", marginBottom: "24px" }}>
            <div>
              <label style={{ fontSize: "13px", fontWeight: 600, color: "#1f2937", display: "block", marginBottom: "8px" }}>Week Number *</label>
              <input type="number" name="week_number" min="1" value={formData.week_number} onChange={handleInputChange} required style={{ width: "100%", padding: "10px 12px", fontSize: "13px", border: "1px solid #e5e7eb", borderRadius: "6px" }} />
            </div>

            <div>
              <label style={{ fontSize: "13px", fontWeight: 600, color: "#1f2937", display: "block", marginBottom: "8px" }}>Topic Title *</label>
              <input type="text" name="topic_title" placeholder="e.g., Algebra Fundamentals" value={formData.topic_title} onChange={handleInputChange} required style={{ width: "100%", padding: "10px 12px", fontSize: "13px", border: "1px solid #e5e7eb", borderRadius: "6px" }} />
            </div>
          </div>

          <div style={{ marginBottom: "24px" }}>
            <label style={{ fontSize: "13px", fontWeight: 600, color: "#1f2937", display: "block", marginBottom: "8px" }}>Content Summary *</label>
            <textarea name="content_summary" value={formData.content_summary} onChange={handleInputChange} placeholder="Describe what will be covered..." required rows={3} style={{ width: "100%", padding: "10px 12px", fontSize: "13px", border: "1px solid #e5e7eb", borderRadius: "6px", resize: "none", fontFamily: "inherit" }} />
          </div>

          <div style={{ marginBottom: "24px" }}>
            <label style={{ fontSize: "13px", fontWeight: 600, color: "#1f2937", display: "block", marginBottom: "8px" }}>Learning Objectives *</label>
            <textarea name="learning_objectives" value={formData.learning_objectives} onChange={handleInputChange} placeholder="• Enter each objective on a new line" required rows={3} style={{ width: "100%", padding: "10px 12px", fontSize: "13px", border: "1px solid #e5e7eb", borderRadius: "6px", resize: "none", fontFamily: "inherit" }} />
          </div>

          <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end", paddingTop: "20px", borderTop: "1px solid #e5e7eb" }}>
            <button type="button" onClick={onClose} style={{ padding: "10px 20px", background: "#f3f4f6", border: "none", borderRadius: "6px", fontSize: "13px", fontWeight: 600, color: "#374151", cursor: "pointer" }}>
              Cancel
            </button>
            <button type="submit" disabled={uploading} style={{ padding: "10px 20px", background: "#3b82f6", color: "white", border: "none", borderRadius: "6px", fontSize: "13px", fontWeight: 600, cursor: uploading ? "not-allowed" : "pointer", opacity: uploading ? 0.6 : 1 }}>
              {uploading ? "Creating..." : "Create Syllabus"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function EditModal({
  onClose,
  onSuccess,
  subjects,
  classes,
  syllabus,
  addToast,
}: {
  onClose: () => void;
  onSuccess: () => void;
  subjects: Subject[];
  classes: ClassObj[];
  syllabus: Syllabus;
  addToast: (type: "success" | "error" | "info", message: string) => void;
}) {
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    subject_id: syllabus.subject?.id?.toString() || "",
    class_id: syllabus.class_obj?.id?.toString() || "",
    week_number: syllabus.week_number?.toString() || "1",
    topic_title: syllabus.topic_title || "",
    content_summary: syllabus.content_summary || "",
    learning_objectives: syllabus.learning_objectives || "",
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setUpdating(true);

    try {
      const submitData = {
        subject_id: parseInt(formData.subject_id),
        class_id: formData.class_id ? parseInt(formData.class_id) : null,
        week_number: parseInt(formData.week_number),
        topic_title: formData.topic_title,
        content_summary: formData.content_summary,
        learning_objectives: formData.learning_objectives,
      };

      const response = await fetchWithAuth(
        `${process.env.NEXT_PUBLIC_API_URL}/syllabi/${syllabus.id}/`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(submitData),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        let errorMessage = "Failed to update syllabus";

        if (typeof errorData === "object") {
          if (errorData.subject_id && Array.isArray(errorData.subject_id)) {
            errorMessage = errorData.subject_id[0];
          } else if (errorData.error) {
            errorMessage = errorData.error;
          }
        }

        setError(errorMessage);
        return;
      }

      addToast("success", "Syllabus updated successfully");
      onSuccess();
    } catch (error) {
      console.error("Failed to update syllabus:", error);
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0, 0, 0, 0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50, padding: "16px" }}>
      <div style={{ background: "white", width: "100%", maxWidth: "600px", borderRadius: "8px", boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)" }}>
        <div style={{ padding: "32px", borderBottom: "1px solid #e5e7eb" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div>
              <h2 style={{ fontSize: "24px", fontWeight: 600, color: "#1f2937", margin: "0 0 4px 0" }}>Edit Syllabus</h2>
              <p style={{ fontSize: "13px", color: "#9ca3af", margin: 0 }}>Update the syllabus details</p>
            </div>
            <button
              onClick={onClose}
              style={{ background: "none", border: "none", fontSize: "24px", cursor: "pointer", color: "#9ca3af", padding: 0 }}
            >
              ×
            </button>
          </div>
        </div>

        {error && (
          <div style={{ margin: "20px 32px 0", padding: "12px 16px", background: "#fef2f2", border: "1px solid #fee2e2", borderRadius: "6px", display: "flex", gap: "12px" }}>
            <AlertCircle size={18} style={{ color: "#ef4444", flexShrink: 0 }} />
            <p style={{ margin: 0, fontSize: "13px", fontWeight: 500, color: "#7f1d1d" }}>{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ padding: "32px", maxHeight: "calc(100vh - 200px)", overflowY: "auto" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px", marginBottom: "24px" }}>
            <div>
              <label style={{ fontSize: "13px", fontWeight: 600, color: "#1f2937", display: "block", marginBottom: "8px" }}>Subject *</label>
              <div className="select-wrapper">
                <select name="subject_id" value={formData.subject_id} onChange={handleInputChange} required style={{ width: "100%", padding: "10px 12px", fontSize: "13px", border: "1px solid #e5e7eb", borderRadius: "6px", background: "white" }}>
                  <option value="">Select a Subject</option>
                  {subjects.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.subject_name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label style={{ fontSize: "13px", fontWeight: 600, color: "#1f2937", display: "block", marginBottom: "8px" }}>Class (Optional)</label>
              <div className="select-wrapper">
                <select name="class_id" value={formData.class_id} onChange={handleInputChange} style={{ width: "100%", padding: "10px 12px", fontSize: "13px", border: "1px solid #e5e7eb", borderRadius: "6px", background: "white" }}>
                  <option value="">Select a Class</option>
                  {classes.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.class_name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px", marginBottom: "24px" }}>
            <div>
              <label style={{ fontSize: "13px", fontWeight: 600, color: "#1f2937", display: "block", marginBottom: "8px" }}>Week Number *</label>
              <input type="number" name="week_number" min="1" value={formData.week_number} onChange={handleInputChange} required style={{ width: "100%", padding: "10px 12px", fontSize: "13px", border: "1px solid #e5e7eb", borderRadius: "6px" }} />
            </div>

            <div>
              <label style={{ fontSize: "13px", fontWeight: 600, color: "#1f2937", display: "block", marginBottom: "8px" }}>Topic Title *</label>
              <input type="text" name="topic_title" value={formData.topic_title} onChange={handleInputChange} required style={{ width: "100%", padding: "10px 12px", fontSize: "13px", border: "1px solid #e5e7eb", borderRadius: "6px" }} />
            </div>
          </div>

          <div style={{ marginBottom: "24px" }}>
            <label style={{ fontSize: "13px", fontWeight: 600, color: "#1f2937", display: "block", marginBottom: "8px" }}>Content Summary *</label>
            <textarea name="content_summary" value={formData.content_summary} onChange={handleInputChange} required rows={3} style={{ width: "100%", padding: "10px 12px", fontSize: "13px", border: "1px solid #e5e7eb", borderRadius: "6px", resize: "none", fontFamily: "inherit" }} />
          </div>

          <div style={{ marginBottom: "24px" }}>
            <label style={{ fontSize: "13px", fontWeight: 600, color: "#1f2937", display: "block", marginBottom: "8px" }}>Learning Objectives *</label>
            <textarea name="learning_objectives" value={formData.learning_objectives} onChange={handleInputChange} required rows={3} style={{ width: "100%", padding: "10px 12px", fontSize: "13px", border: "1px solid #e5e7eb", borderRadius: "6px", resize: "none", fontFamily: "inherit" }} />
          </div>

          <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end", paddingTop: "20px", borderTop: "1px solid #e5e7eb" }}>
            <button type="button" onClick={onClose} style={{ padding: "10px 20px", background: "#f3f4f6", border: "none", borderRadius: "6px", fontSize: "13px", fontWeight: 600, color: "#374151", cursor: "pointer" }}>
              Cancel
            </button>
            <button type="submit" disabled={updating} style={{ padding: "10px 20px", background: "#3b82f6", color: "white", border: "none", borderRadius: "6px", fontSize: "13px", fontWeight: 600, cursor: updating ? "not-allowed" : "pointer", opacity: updating ? 0.6 : 1 }}>
              {updating ? "Updating..." : "Update Syllabus"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}