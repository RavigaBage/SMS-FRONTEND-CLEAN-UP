"use client";

import { useRef, useState } from "react";
import { ImportModal, ImportModalConfig } from "@/src/assets/components/management/ImportModal";
import { downloadStaffTemplate } from "@/src/lib/excelTemplate";
import "./style.css";

const STAFF_IMPORT_CONFIG: ImportModalConfig = {
  title: "Import Staff",
  endpoint: "/staff/",
  requiredHeaders: [
    "first_name", "last_name", "email", "staff_type", "gender",
    "phone_number", "address", "specialization", "date_of_birth",
    "employment_date", "national_id", "health_info", "photo_url",
  ],
  rowLabel: (row) => `${row.first_name ?? ""} ${row.last_name ?? ""}`.trim(),
  transformPayload: (row) => {
    const payload: Record<string, any> = {
      first_name: row.first_name ?? "",
      last_name: row.last_name ?? "",
      email: row.email ?? "",
      staff_type: row.staff_type ?? "admin_staff",
      gender: row.gender ?? "male",
      phone_number: row.phone_number ?? "",
      address: row.address ?? "",
      specialization: row.specialization ?? "",
      date_of_birth: row.date_of_birth
        ? new Date(row.date_of_birth).toISOString().split("T")[0]
        : "",
      employment_date: row.employment_date
        ? new Date(row.employment_date).toISOString().split("T")[0]
        : "",
      national_id: row.national_id ?? "",
      health_info: row.health_info ?? "",
      photo_url: row.photo_url ?? "",
    };
    return Object.fromEntries(Object.entries(payload).filter(([_, v]) => v !== ""));
  },
};


export default function StaffProfilePage() {
  return (
    <div className="container">
      <div className="main-content">
        <div className="header">
          <div className="breadcrumb">
            Staff Management / <strong>Staff Profile</strong>
          </div>
          <div className="header-actions">
            <input
              type="text"
              className="search-bar"
              placeholder="Search staff, departments.."
            />
            <div className="icon-btn">🔔</div>
            <div className="icon-btn">👤</div>
          </div>
        </div>

        <div className="profile-banner">
          <div className="profile-header">
            <div className="profile-info">
              <div className="profile-avatar">
                <img
                  src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Crect fill='%23667eea' width='120' height='120'/%3E%3Ctext x='50%25' y='50%25' font-size='48' fill='white' text-anchor='middle' dy='.3em'%3ESW%3C/text%3E%3C/svg%3E"
                  alt="Profile"
                />
                <div className="online-status"></div>
              </div>
              <div className="profile-text">
                <h1>Dr. Sarah Wilson</h1>
                <div className="profile-meta">
                  ID: EMP-2021-042 • Senior Faculty • Mathematics Dept
                </div>
              </div>
            </div>
            <div className="profile-actions">
              <button className="btn btn-secondary">✉ Send Email</button>
              <button className="btn btn-primary">✏ Edit Profile</button>
            </div>
          </div>
        </div>

        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-header">
              <div className="stat-title">Student Rating</div>
              <div className="stat-icon">⭐</div>
            </div>
            <div className="stat-value">
              4.8<span>/5</span>
            </div>
            <div className="stat-meta">
              <span className="stat-badge badge-green">+0.2</span>
              vs last term
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-header">
              <div className="stat-title">Staff Attendance</div>
              <div className="stat-icon att">📊</div>
            </div>
            <div className="stat-value">98%</div>
            <div className="stat-meta">
              <span className="stat-badge badge-blue">Excellent</span>0 sick
              leaves
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-header">
              <div className="stat-title">Classes Taught</div>
              <div className="stat-icon clt">📚</div>
            </div>
            <div className="stat-value">5</div>
            <div className="stat-extra">
              <div className="extra-item">
                <div className="extra-label">Standard Load</div>
                <div className="extra-value">18 hrs/week</div>
              </div>
            </div>
          </div>
        </div>

        <div className="content-grid">
          <div>
            <div className="card">
              <div className="card-header">
                <span>👤</span> Staff Details
              </div>

              <div className="detail-row">
                <div className="detail-icon">📅</div>
                <div className="detail-content">
                  <div className="detail-label">Date of Birth</div>
                  <div className="detail-value">12 August 1985</div>
                </div>
              </div>

              <div className="detail-row">
                <div className="detail-icon">📞</div>
                <div className="detail-content">
                  <div className="detail-label">Phone</div>
                  <div className="detail-value">+1 (555) 012-9988</div>
                </div>
              </div>

              <div className="detail-row">
                <div className="detail-icon">✉️</div>
                <div className="detail-content">
                  <div className="detail-label">Work Email</div>
                  <div className="detail-value">
                    sarah.wilson@edumanager.edu
                  </div>
                </div>
              </div>

              <div className="detail-row">
                <div className="detail-icon">🏠</div>
                <div className="detail-content">
                  <div className="detail-label">Address</div>
                  <div className="detail-value">
                    224 Maple Avenue,
                    <br />
                    Springfield, IL 62704
                  </div>
                </div>
              </div>

              <div className="detail-row">
                <div className="detail-icon">💼</div>
                <div className="detail-content">
                  <div className="detail-label">Employment Type</div>
                  <div className="detail-value">Full-Time (Tenured)</div>
                  <a href="#" className="link-text">
                    View Contract
                  </a>
                </div>
              </div>
            </div>

            <div className="card">
              <div className="card-header">
                <span>📝</span> Admin Notes
              </div>
              <div className="admin-notes">
                "Sarah has been instrumental in revising the Grade 10 calculus
                curriculum. Highly recommended for the upcoming Department Head
                vacancy."
              </div>
              <div className="add-note-btn">+ Add Note</div>
            </div>
          </div>

          <div>
            <div className="card">
              <div className="table-header">
                <div className="card-header">Assigned Classes</div>
                <a href="#" className="link-text">
                  View Timetable
                </a>
              </div>

              <table>
                <thead>
                  <tr>
                    <th>Class ID</th>
                    <th>Subject</th>
                    <th>Students</th>
                    <th>Schedule</th>
                    <th>Avg Grade</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>10-B</td>
                    <td>Adv. Mathematics</td>
                    <td>32</td>
                    <td>Mon, Wed, Fri</td>
                    <td>
                      <span className="grade a">A- (91%)</span>
                    </td>
                  </tr>
                  <tr>
                    <td>09-A</td>
                    <td>Intro to Physics</td>
                    <td>28</td>
                    <td>Tue, Thu</td>
                    <td>
                      <span className="grade b">B+ (87%)</span>
                    </td>
                  </tr>
                  <tr>
                    <td>12-Sci</td>
                    <td>Calculus II</td>
                    <td>24</td>
                    <td>Mon, Tue, Thu</td>
                    <td>
                      <span className="grade a">A (94%)</span>
                    </td>
                  </tr>
                  <tr>
                    <td>11-Gen</td>
                    <td>General Math</td>
                    <td>30</td>
                    <td>Wed, Fri</td>
                    <td>
                      <span className="grade c">C+ (78%)</span>
                    </td>
                  </tr>
                </tbody>
              </table>

              <button className="generate-report-btn">
                Generate Performance Report
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}









export function StaffImportSection({ onSuccess }: { onSuccess: () => void }) {
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importFile, setImportFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelected = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.name.match(/\.(xlsx|xls)$/i)) {
      alert("Please upload a valid Excel file (.xlsx or .xls).");
      return;
    }
    setImportFile(file);
    setIsImportModalOpen(true);
    event.target.value = "";
  };

  return (
    <>
      <input
        type="file"
        ref={fileInputRef}
        accept=".xlsx,.xls,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        onChange={handleFileSelected}
        style={{ display: "none" }}
      />
      <button
        className="text-purple-600 text-sm hover:underline"
        onClick={downloadStaffTemplate}
      >
        Download Template (.xlsx)
      </button>
      <button
        className="secondary-button"
        onClick={() => fileInputRef.current?.click()}
      >
        📥 Import Excel
      </button>

      <ImportModal
        isOpen={isImportModalOpen}
        file={importFile}
        config={STAFF_IMPORT_CONFIG}
        onClose={() => { setIsImportModalOpen(false); setImportFile(null); }}
        onSuccess={onSuccess}
      />
    </>
  );
}