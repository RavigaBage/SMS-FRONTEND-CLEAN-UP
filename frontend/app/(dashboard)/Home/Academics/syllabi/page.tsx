"use client";

import React, { useState, useEffect } from "react";
import "@/styles/syllabi.css";
import { fetchWithAuth } from "@/src/lib/apiClient";

// Types based on your backend serializer
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

export default function Syllabi() {
  const [syllabi, setSyllabi] = useState<Syllabus[]>([]);
  const [selectedSyllabus, setSelectedSyllabus] = useState<Syllabus | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingSyllabus, setEditingSyllabus] = useState<Syllabus | null>(null);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [selectSubject, setSelectSubject] = useState("");
  const [classes, setClasses] = useState<ClassObj[]>([]);
  const [selectedClass, setSelectedClass] = useState("");
  
  // Fetch initial data on mount
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch classes
      const classResponse = await fetchWithAuth(
        `${process.env.NEXT_PUBLIC_API_URL}/classes/`
      );
      const classData = await classResponse.json();
      setClasses(classData.results || classData);

      // Fetch subjects
      const subjectResponse = await fetchWithAuth(
        `${process.env.NEXT_PUBLIC_API_URL}/subjects/`
      );
      const subjectData = await subjectResponse.json();
      setSubjects(subjectData.results || subjectData);

    } catch (error) {
      console.error("Failed to fetch data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSyllabiClick = async () => {
    if (!selectSubject && !selectedClass) {
      alert("Please select at least a subject or class");
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
      
      // Set first syllabus as selected if available
      if (syllabusArray.length > 0) {
        setSelectedSyllabus(syllabusArray[0]);
      } else {
        setSelectedSyllabus(null);
        alert("No syllabi found for the selected filters");
      }
    } catch (error) {
      console.error("Failed to fetch syllabi:", error);
      alert("Failed to fetch syllabi. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSyllabus = async (syllabusId: number) => {
    if (!confirm("Are you sure you want to delete this syllabus? This action cannot be undone.")) {
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
        alert("Syllabus deleted successfully!");
        // Remove from list
        setSyllabi(prev => prev.filter(s => s.id !== syllabusId));
        // Clear selection if deleted syllabus was selected
        if (selectedSyllabus?.id === syllabusId) {
          setSelectedSyllabus(syllabi.length > 1 ? syllabi[0] : null);
        }
      } else {
        throw new Error("Failed to delete syllabus");
      }
    } catch (error) {
      console.error("Failed to delete syllabus:", error);
      alert("Failed to delete syllabus. Please try again.");
    }
  };

  const handleEditClick = (syllabus: Syllabus) => {
    setEditingSyllabus(syllabus);
    setShowEditModal(true);
  };

  // Group syllabi by week number
  const groupedSyllabi = syllabi.reduce((acc, syllabus) => {
    const weekKey = `Week ${syllabus.week_number}`;
    if (!acc[weekKey]) {
      acc[weekKey] = [];
    }
    acc[weekKey].push(syllabus);
    return acc;
  }, {} as Record<string, Syllabus[]>);

  // Filter syllabi based on search
  const filteredSyllabi = syllabi.filter(
    (s) =>
      s.subject?.subject_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.topic_title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.content_summary?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleBulkDownload = async () => {
    alert("Bulk download feature coming soon!");
  };
  
  if (loading && syllabi.length === 0) {
    return (
      <div className="container SYLLABIDATA">
        <div style={{ padding: "40px", textAlign: "center" }}>
          <p>Loading syllabi...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container SYLLABIDATA">
      <header className="header">
        <div>
          <h1>Syllabi Management</h1>
          <p>
            Academic Year 2025-2026 • {syllabi.length} Syllabi Found
          </p>
        </div>
        <div className="header-div">
          <button className="btn btn-outline" onClick={handleBulkDownload}>
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" />
            </svg>
            Bulk Download
          </button>
          <button
            className="btn btn-primary"
            onClick={() => setShowUploadModal(true)}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M12 5v14M5 12h14" />
            </svg>
            Create New Syllabus
          </button>
        </div>
      </header>

      <main className="syllabus-grid">
        <aside className="list-panel">
          <div className="panel-header">
            <h3>Filter Syllabi</h3>
            <select 
              className="search-box" 
              value={selectSubject}
              onChange={(e) => setSelectSubject(e.target.value)}
            >
              <option value="">All Subjects</option>
              {subjects.map(item => (
                <option key={item.id} value={item.id}>
                  {item.subject_name}
                </option>
              ))}
            </select>
            <select 
              className="search-box" 
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
            >
              <option value="">All Classes</option>
              {classes.map(item => (
                <option key={item.id} value={item.id}>
                  {item.class_name}
                </option>
              ))}
            </select>
            <button 
              className="btn btn-primary" 
              onClick={handleSyllabiClick}
              style={{ width: '100%', marginTop: '8px' }}
            >
              Load Syllabi
            </button>
          </div>
          
          <div className="scroll-area">
            {Object.entries(groupedSyllabi).map(([weekLabel, weekSyllabi]) => (
              <div className="class-group" key={weekLabel}>
                <div className="class-label">{weekLabel}</div>
                {weekSyllabi.map((syllabus) => (
                  <div
                    key={syllabus.id}
                    className={`syllabus-item ${
                      selectedSyllabus?.id === syllabus.id ? "active" : ""
                    }`}
                  >
                    <div 
                      className="item-info"
                      onClick={() => setSelectedSyllabus(syllabus)}
                      style={{ cursor: "pointer", flex: 1 }}
                    >
                      <h4>{syllabus.topic_title}</h4>
                      <span>{syllabus.subject?.subject_name}</span>
                    </div>
                    <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                      <button
                        className="icon-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditClick(syllabus);
                        }}
                        title="Edit syllabus"
                      >
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                        </svg>
                      </button>
                      <button
                        className="icon-btn icon-btn-danger"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteSyllabus(syllabus.id);
                        }}
                        title="Delete syllabus"
                      >
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <polyline points="3 6 5 6 21 6" />
                          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ))}

            {Object.keys(groupedSyllabi).length === 0 && (
              <div style={{ padding: "20px", textAlign: "center", color: "#64748b" }}>
                <p>No syllabi found. Select filters and click "Load Syllabi"</p>
              </div>
            )}
          </div>
        </aside>

        <section className="detail-panel">
          {selectedSyllabus ? (
            <>
              <div className="detail-hero">
                <div className="detail-hero-flex">
                  <div>
                    <h2 className="detail-hero-flex-h2">
                      {selectedSyllabus.topic_title}
                    </h2>
                    <div className="meta-badges">
                      <span className="badge badge-blue">
                        <svg
                          width="14"
                          height="14"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.5"
                        >
                          <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
                        </svg>
                        {selectedSyllabus.subject?.subject_name}
                      </span>
                      {selectedSyllabus.class_obj && (
                        <span className="badge badge-teal">
                          <svg
                            width="14"
                            height="14"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2.5"
                          >
                            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                            <polyline points="9 22 9 12 15 12 15 22" />
                          </svg>
                          {selectedSyllabus.class_obj.class_name}
                        </span>
                      )}
                      <span className="badge badge-green">
                        <svg
                          width="14"
                          height="14"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.5"
                        >
                          <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                          <line x1="16" y1="2" x2="16" y2="6"/>
                          <line x1="8" y1="2" x2="8" y2="6"/>
                          <line x1="3" y1="10" x2="21" y2="10"/>
                        </svg>
                        Week {selectedSyllabus.week_number}
                      </span>
                    </div>
                  </div>
                  <div style={{ fontSize: '14px', color: '#64748b' }}>
                    Teacher: {selectedSyllabus.teacher?.full_name || 'Not assigned'}
                  </div>
                </div>
              </div>

              <div className="content-body">
                <div className="main-content">
                  <h3 className="section-title">Content Summary</h3>
                  <p className="course-description">
                    {selectedSyllabus.content_summary || "No content summary provided"}
                  </p>

                  <h3 className="section-title">Learning Objectives</h3>
                  <ul className="objectives-list">
                    {selectedSyllabus.learning_objectives ? (
                      selectedSyllabus.learning_objectives
                        .split('\n')
                        .filter(obj => obj.trim())
                        .map((objective, index) => (
                          <li key={index}>{objective.trim()}</li>
                        ))
                    ) : (
                      <li>No learning objectives specified</li>
                    )}
                  </ul>
                </div>

                <aside className="detail-sidebar">
                  <div className="metadata-section">
                    <h4 className="section-title">Details</h4>
                    <div className="metadata-item">
                      <span className="metadata-label">Subject Code:</span>
                      <span className="metadata-value">
                        {selectedSyllabus.subject?.subject_code || "N/A"}
                      </span>
                    </div>
                    <div className="metadata-item">
                      <span className="metadata-label">Week Number:</span>
                      <span className="metadata-value">
                        {selectedSyllabus.week_number}
                      </span>
                    </div>
                    <div className="metadata-item">
                      <span className="metadata-label">Teacher:</span>
                      <span className="metadata-value">
                        {selectedSyllabus.teacher?.full_name || "Not assigned"}
                      </span>
                    </div>
                  </div>
                </aside>
              </div>
            </>
          ) : (
            <div className="empty-state">
              <svg
                width="64"
                height="64"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
              >
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="16" y1="13" x2="8" y2="13" />
                <line x1="16" y1="17" x2="8" y2="17" />
                <polyline points="10 9 9 9 8 9" />
              </svg>
              <h3>No Syllabus Selected</h3>
              <p>Select a syllabus from the list to view its details</p>
            </div>
          )}
        </section>
      </main>

      {showUploadModal && (
        <UploadModal 
          onClose={() => setShowUploadModal(false)} 
          onSuccess={() => {
            fetchData();
            handleSyllabiClick();
          }}
          subjects={subjects}
          classes={classes}
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
        />
      )}
    </div>
  );
}

// Upload Modal Component
function UploadModal({
  onClose,
  onSuccess,
  subjects,
  classes,
}: {
  onClose: () => void;
  onSuccess: () => void;
  subjects: Subject[];
  classes: ClassObj[];
}) {
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    subject_id: "",
    teacher_id: "1", // You should get this from auth context
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
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploading(true);

    try {
      const submitData = {
        subject_id: parseInt(formData.subject_id),
        teacher_id: parseInt(formData.teacher_id),
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
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(submitData)
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(JSON.stringify(errorData) || "Failed to create syllabus");
      }

      alert("Syllabus created successfully!");
      onSuccess();
      onClose();
    } catch (error) {
      console.error("Failed to create syllabus:", error);
      alert(error instanceof Error ? error.message : "Failed to create syllabus. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Create New Syllabus</h2>
          <button className="modal-close" onClick={onClose}>
            ✕
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="grid-2x">
            <div className="form-group">
              <label>Subject *</label>
              <select 
                name="subject_id"
                className="search-box" 
                value={formData.subject_id}
                onChange={handleInputChange}
                required
              >
                <option value="">Select a Subject</option>
                {subjects.map(item => (
                  <option key={item.id} value={item.id}>
                    {item.subject_name}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Class (Optional)</label>
              <select 
                name="class_id"
                className="search-box" 
                value={formData.class_id}
                onChange={handleInputChange}
              >
                <option value="">Select a Class</option>
                {classes.map(item => (
                  <option key={item.id} value={item.id}>
                    {item.class_name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid-2x">
            <div className="form-group">
              <label>Week Number *</label>
              <input 
                type="number"
                name="week_number"
                min="1"
                placeholder="Week number" 
                value={formData.week_number}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Topic Title *</label>
              <input 
                type="text"
                name="topic_title"
                placeholder="Topic title" 
                value={formData.topic_title}
                onChange={handleInputChange}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label>Content Summary *</label>
            <textarea
              name="content_summary"
              value={formData.content_summary}
              onChange={handleInputChange}
              placeholder="Describe what will be covered in this topic"
              required
              rows={4}
            />
          </div>

          <div className="form-group">
            <label>Learning Objectives *</label>
            <textarea
              name="learning_objectives"
              value={formData.learning_objectives}
              onChange={handleInputChange}
              placeholder="Enter each objective on a new line"
              required
              rows={4}
            />
          </div>

          <div className="modal-actions">
            <button type="button" className="btn btn-outline" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={uploading}>
              {uploading ? "Creating..." : "Create Syllabus"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Edit Modal Component
function EditModal({
  onClose,
  onSuccess,
  subjects,
  classes,
  syllabus,
}: {
  onClose: () => void;
  onSuccess: () => void;
  subjects: Subject[];
  classes: ClassObj[];
  syllabus: Syllabus;
}) {
  const [updating, setUpdating] = useState(false);
  const [formData, setFormData] = useState({
    subject_id: syllabus.subject?.id?.toString() || "",
    teacher_id: syllabus.teacher?.id?.toString() || "1",
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
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdating(true);

    try {
      const submitData = {
        subject_id: parseInt(formData.subject_id),
        teacher_id: parseInt(formData.teacher_id),
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
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(submitData)
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(JSON.stringify(errorData) || "Failed to update syllabus");
      }

      alert("Syllabus updated successfully!");
      onSuccess();
    } catch (error) {
      console.error("Failed to update syllabus:", error);
      alert(error instanceof Error ? error.message : "Failed to update syllabus. Please try again.");
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Edit Syllabus</h2>
          <button className="modal-close" onClick={onClose}>
            ✕
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="grid-2x">
            <div className="form-group">
              <label>Subject *</label>
              <select 
                name="subject_id"
                className="search-box" 
                value={formData.subject_id}
                onChange={handleInputChange}
                required
              >
                <option value="">Select a Subject</option>
                {subjects.map(item => (
                  <option key={item.id} value={item.id}>
                    {item.subject_name}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Class (Optional)</label>
              <select 
                name="class_id"
                className="search-box" 
                value={formData.class_id}
                onChange={handleInputChange}
              >
                <option value="">Select a Class</option>
                {classes.map(item => (
                  <option key={item.id} value={item.id}>
                    {item.class_name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid-2x">
            <div className="form-group">
              <label>Week Number *</label>
              <input 
                type="number"
                name="week_number"
                min="1"
                placeholder="Week number" 
                value={formData.week_number}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Topic Title *</label>
              <input 
                type="text"
                name="topic_title"
                placeholder="Topic title" 
                value={formData.topic_title}
                onChange={handleInputChange}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label>Content Summary *</label>
            <textarea
              name="content_summary"
              value={formData.content_summary}
              onChange={handleInputChange}
              placeholder="Describe what will be covered in this topic"
              required
              rows={4}
            />
          </div>

          <div className="form-group">
            <label>Learning Objectives *</label>
            <textarea
              name="learning_objectives"
              value={formData.learning_objectives}
              onChange={handleInputChange}
              placeholder="Enter each objective on a new line"
              required
              rows={4}
            />
          </div>

          <div className="modal-actions">
            <button type="button" className="btn btn-outline" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={updating}>
              {updating ? "Updating..." : "Update Syllabus"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}