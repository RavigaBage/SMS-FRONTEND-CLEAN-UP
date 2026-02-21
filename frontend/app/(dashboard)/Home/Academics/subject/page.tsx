"use client";

import React, { useState, useRef, useEffect } from 'react';
import '@/styles/subject-redesign.css';
import EnrollPopup from "@/components/ui/subjectPopup";
import { fetchWithAuth } from "@/src/lib/apiClient";
import SkeletonTable from '@/components/ui/SkeletonLoader';
import { Pagination } from '@/src/assets/components/management/Pagination';
import { ErrorState } from '@/src/assets/components/dashboard/ErrorState';

export interface Subject {
  id: number;
  subject_name: string;
  subject_code: string;
}

export interface SubjectApiResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Subject[];
}

const PAGE_SIZE = 10;

export default function SubjectsManagement() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [formData, setFormData] = useState({ subject_name: "", subject_code: "" });
  const [active, setActive] = useState(false);
  const [clickVelvet, setClickVelvet] = useState<number | null>(null);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const checkVelvetClick = useRef<HTMLTableRowElement>(null);

  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  const fetchSubjects = async (pageNumber: number) => {
    setIsLoading(true);
    try {
      const res = await fetchWithAuth(
        `${process.env.NEXT_PUBLIC_API_URL}/subjects/?page=${pageNumber}`,
        { headers: { "Content-Type": "application/json" } }
      );
      const data: SubjectApiResponse = await res.json();
      setTotalCount(data.count);
      setSubjects(data.results || []);
    } catch (err) {
      console.error("Failed to load subjects", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchSubjects(page); }, [page]);

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this subject?")) return;
    await fetchWithAuth(`${process.env.NEXT_PUBLIC_API_URL}/subjects/${id}/`, { method: "DELETE" });
    const newCount = totalCount - 1;
    const newTotalPages = Math.ceil(newCount / PAGE_SIZE);
    if (page > newTotalPages && newTotalPages > 0) setPage(newTotalPages);
    else fetchSubjects(page);
    setTotalCount(newCount);
  };

  const updateFormField = (field: string, value: any) =>
    setFormData((prev) => ({ ...prev, [field]: value }));

  const handlePopup = () => {
    if (active) setSelectedId(null);
    setActive(!active);
  };

  const handleStartEdit = (item: Subject) => {
    setSelectedId(item.id);
    setFormData({ subject_name: item.subject_name, subject_code: item.subject_code });
    setActive(true);
  };

  const handleVelvetToggle = (index: number) =>
    setClickVelvet(prev => (prev === index ? null : index));

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > totalPages) return;
    setPage(newPage);
    setClickVelvet(null);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (checkVelvetClick.current && !checkVelvetClick.current.contains(event.target as Node))
        setClickVelvet(null);
    };
    if (clickVelvet !== null) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [clickVelvet]);

  const filtered = subjects.filter(s =>
    s.subject_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.subject_code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="sm-wrapper">
      <EnrollPopup
        active={active}
        togglePopup={handlePopup}
        formData={formData}
        fieldNames={["student", "class_obj"]}
        setFormData={updateFormField}
        selectedIM={selectedId}
        onSuccess={() => {          // 👈 add this
          fetchSubjects(page);
          handlePopup();
        }}
      />

      {/* Header */}
      <div className="sm-header">
        <div className="sm-header-left">
          <div className="sm-eyebrow">Academic</div>
          <h1 className="sm-title">Subjects</h1>
          <p className="sm-subtitle">Manage academic subjects and teacher assignments</p>
        </div>
        <button
          className="sm-add-btn"
          onClick={() => {
            setFormData({ subject_name: "", subject_code: "" });
            setSelectedId(null);
            handlePopup();
          }}
        >
          <span className="sm-add-btn-icon">+</span>
          New Subject
        </button>
      </div>

      {/* Stats Bar */}
      <div className="sm-stats-bar">
        <div className="sm-stat">
          <span className="sm-stat-value">{totalCount}</span>
          <span className="sm-stat-label">Total Subjects</span>
        </div>
        <div className="sm-stat-divider" />
        <div className="sm-stat">
          <span className="sm-stat-value">{totalPages}</span>
          <span className="sm-stat-label">Pages</span>
        </div>
        <div className="sm-stat-divider" />
        <div className="sm-stat">
          <span className="sm-stat-value">Page {page}</span>
          <span className="sm-stat-label">Current</span>
        </div>

        <div className="sm-search">
          <svg className="sm-search-icon" viewBox="0 0 20 20" fill="none">
            <circle cx="8.5" cy="8.5" r="5.5" stroke="currentColor" strokeWidth="1.5"/>
            <path d="M13.5 13.5L17 17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
          <input
            className="sm-search-input"
            placeholder="Search subjects..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Table Card */}
      <div className="sm-card">
        {isLoading ? (
          <SkeletonTable rows={5} columns={3} />
        ) : (
          <table className="sm-table">
            <thead>
              <tr>
                <th className="sm-th">#</th>
                <th className="sm-th">Subject Name</th>
                <th className="sm-th">Code</th>
                <th className="sm-th sm-th-actions">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length > 0 ? (
                filtered.map((item, index) => (
                  <tr
                    key={item.id}
                    className="sm-row"
                    ref={clickVelvet === index ? checkVelvetClick : null}
                  >
                    <td className="sm-td sm-td-index">
                      {(page - 1) * PAGE_SIZE + index + 1}
                    </td>
                    <td className="sm-td sm-td-name">{item.subject_name}</td>
                    <td className="sm-td">
                      <span className="sm-code-badge">{item.subject_code}</span>
                    </td>
                    <td className="sm-td sm-td-actions">
                      <div className="sm-action-wrap">
                        <button
                          className="sm-dots-btn"
                          onClick={() => handleVelvetToggle(index)}
                          aria-label="Actions"
                        >
                          <span /><span /><span />
                        </button>
                        <div className={`sm-dropdown ${clickVelvet === index ? "sm-dropdown--open" : ""}`}>
                          <button
                            className="sm-dropdown-item sm-dropdown-item--edit"
                            onClick={() => handleStartEdit(item)}
                          >
                            <svg viewBox="0 0 16 16" fill="none" width="14" height="14">
                              <path d="M11.5 2.5L13.5 4.5L5 13H3V11L11.5 2.5Z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round"/>
                            </svg>
                            Edit
                          </button>
                          <button
                            className="sm-dropdown-item sm-dropdown-item--delete"
                            onClick={() => handleDelete(item.id)}
                          >
                            <svg viewBox="0 0 16 16" fill="none" width="14" height="14">
                              <path d="M3 4h10M6 4V3h4v1M6 7v5M10 7v5M4 4l1 9h6l1-9" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                            Delete
                          </button>
                        </div>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="sm-empty">
                    <ErrorState code={6} message="No Subjects Found" />
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}

        <div className="sm-footer">
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            totalResults={totalCount}
            resultsPerPage={PAGE_SIZE}
            onPageChange={handlePageChange}
          />
        </div>
      </div>
    </div>
  );
}