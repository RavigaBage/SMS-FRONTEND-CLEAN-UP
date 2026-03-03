"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { BookOpen, Clock, Users, FileText, Settings, LogOut, ChevronRight, Home } from "lucide-react";
import { apiRequest } from "@/src/lib/apiClient";

interface TeacherData {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string;
  specialization: string;
  years_of_experience: number;
}

export default function TeachingLanding() {
  const [teacher, setTeacher] = useState<TeacherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [teacherId, setTeacherId] = useState<number | null>(null);

  const mapTeacher = (raw: any): TeacherData => ({
    id: raw?.id,
    first_name: raw?.first_name || raw?.user?.first_name || "Teacher",
    last_name: raw?.last_name || raw?.user?.last_name || "",
    email: raw?.user?.email || raw?.email || "N/A",
    phone_number: raw?.phone_number || "N/A",
    specialization: raw?.specialization || "General",
    years_of_experience: raw?.years_of_experience || 0,
  });

  useEffect(() => {
    const role = localStorage.getItem("userRole")?.toLowerCase();
    if (!role) {
      window.location.href = "/auth/login";
      return;
    }

    if (role === "admin" || role === "headmaster") {
      window.location.href = "/Home/";
      return;
    }

    const resolveTeacher = async () => {
      const userId = localStorage.getItem("userId");
      const username = localStorage.getItem("userName") || "";

      const pickTeacher = (items: any[]) => {
        if (!Array.isArray(items)) return null;

        const byUserId =
          userId &&
          items.find(
            (t) => String(t?.user?.id ?? t?.user_id ?? "") === String(userId),
          );

        if (byUserId) return byUserId;

        const byUsername = username
          ? items.find(
              (t) =>
                String(t?.user?.username ?? t?.username ?? "").toLowerCase() ===
                username.toLowerCase(),
            )
          : null;

        if (byUsername) return byUsername;

        return items.length === 1 ? items[0] : null;
      };

      try {
        setLoading(true);

        let matched: any = null;

        if (userId) {
          const byUserRes = await apiRequest<any>(
            `/teachers/?user_id=${encodeURIComponent(userId)}&page_size=10`,
            { method: "GET" },
          );
          matched = pickTeacher(byUserRes.results || []);
        }

        if (!matched && username) {
          const bySearchRes = await apiRequest<any>(
            `/teachers/?search=${encodeURIComponent(username)}&page_size=50`,
            { method: "GET" },
          );
          matched = pickTeacher(bySearchRes.results || []);
        }

        if (!matched) {
          const fallbackRes = await apiRequest<any>(`/teachers/?page_size=50`, {
            method: "GET",
          });
          matched = pickTeacher(fallbackRes.results || []);
        }

        if (!matched) {
          throw new Error("Teacher profile not found for the logged-in user.");
        }

        setTeacher(mapTeacher(matched));
        setTeacherId(matched.id ?? null);
        if (matched?.id) {
          localStorage.setItem("teacherId", String(matched.id));
        }
        if (!userId && (matched?.user?.id || matched?.user_id)) {
          localStorage.setItem(
            "userId",
            String(matched?.user?.id ?? matched?.user_id),
          );
        }
      } catch (error) {
        setTeacher(null);
      } finally {
        setLoading(false);
      }
    };

    resolveTeacher();
  }, []);

  const teacherProfileHref = teacherId
    ? `/Home/profiles/teachers&staff/profile/${teacherId}`
    : "/Home/profiles/teachers";

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "linear-gradient(135deg, #ffffff 0%, #f8fafb 100%)" }}>
        <p style={{ fontSize: "16px", color: "#6b7280" }}>Loading...</p>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg, #ffffff 0%, #f8fafb 100%)" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Crimson+Text:wght@400;600&family=Inter:wght@400;500;600;700&display=swap');
        
        * { font-family: 'Inter', sans-serif; }
        h1, h2, h3 { font-family: 'Crimson Text', serif; }

        .teaching-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 40px 20px;
        }

        .hero-section {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border-radius: 16px;
          padding: 48px;
          color: white;
          margin-bottom: 48px;
          position: relative;
          overflow: hidden;
        }

        .hero-section::before {
          content: '';
          position: absolute;
          top: -50%;
          right: -10%;
          width: 400px;
          height: 400px;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 50%;
        }

        .hero-content {
          position: relative;
          z-index: 1;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 40px;
          align-items: center;
        }

        @media (max-width: 768px) {
          .hero-content {
            grid-template-columns: 1fr;
          }
        }

        .hero-text h1 {
          font-size: 44px;
          font-weight: 600;
          margin: 0 0 16px 0;
          letter-spacing: -0.5px;
          line-height: 1.2;
        }

        .hero-text p {
          font-size: 16px;
          opacity: 0.95;
          margin: 0 0 8px 0;
          line-height: 1.6;
        }

        .hero-stats {
          display: flex;
          gap: 24px;
          margin-top: 24px;
        }

        .stat {
          display: flex;
          flex-direction: column;
        }

        .stat-label {
          font-size: 12px;
          opacity: 0.9;
          margin-bottom: 4px;
        }

        .stat-value {
          font-size: 24px;
          font-weight: 700;
        }

        .nav-breadcrumb {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 13px;
          color: rgba(255, 255, 255, 0.8);
          margin-bottom: 24px;
        }

        .nav-breadcrumb a {
          color: white;
          text-decoration: none;
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .quick-actions {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
          gap: 16px;
          margin-top: 32px;
        }

        .action-btn {
          background: rgba(255, 255, 255, 0.15);
          border: 1px solid rgba(255, 255, 255, 0.3);
          color: white;
          padding: 12px 20px;
          border-radius: 8px;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          text-decoration: none;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          transition: all 0.2s ease;
        }

        .action-btn:hover {
          background: rgba(255, 255, 255, 0.25);
          transform: translateY(-2px);
        }

        .main-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 24px;
          margin-bottom: 48px;
        }

        .card {
          background: white;
          border: 1px solid #e5e7eb;
          border-radius: 12px;
          padding: 32px;
          transition: all 0.2s ease;
        }

        .card:hover {
          border-color: #667eea;
          box-shadow: 0 4px 12px rgba(102, 126, 234, 0.1);
        }

        .card-icon {
          width: 48px;
          height: 48px;
          background: #f0f9ff;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #667eea;
          margin-bottom: 16px;
        }

        .card h3 {
          font-size: 18px;
          font-weight: 600;
          color: #1f2937;
          margin: 0 0 8px 0;
        }

        .card p {
          font-size: 13px;
          color: #6b7280;
          margin: 0 0 20px 0;
          line-height: 1.6;
        }

        .card-link {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          color: #667eea;
          text-decoration: none;
          font-size: 13px;
          font-weight: 600;
          transition: all 0.2s ease;
        }

        .card-link:hover {
          gap: 12px;
          color: #764ba2;
        }

        .logout-btn {
          background: #ef4444;
          color: white;
          border: none;
          padding: 10px 20px;
          border-radius: 6px;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 8px;
          text-decoration: none;
          transition: all 0.2s ease;
        }

        .logout-btn:hover {
          background: #dc2626;
        }
      `}</style>

      <div className="teaching-container">
        {/* Breadcrumb */}
        <div className="nav-breadcrumb">
          <a href="/Home/">
            <Home size={14} />
            Home
          </a>
          <ChevronRight size={14} />
          <span>Teacher Portal</span>
        </div>

        {/* Hero Section */}
        <div className="hero-section">
          <div className="hero-content">
            <div className="hero-text">
              <h1>Welcome back, {teacher?.first_name}! 👋</h1>
              <p>Your dedicated teaching portal for managing grades, syllabi, timetables, and student records.</p>
              
              <div className="hero-stats">
                <div className="stat">
                  <span className="stat-label">Specialization</span>
                  <span className="stat-value">{teacher?.specialization}</span>
                </div>
                <div className="stat">
                  <span className="stat-label">Experience</span>
                  <span className="stat-value">{teacher?.years_of_experience}y</span>
                </div>
              </div>
            </div>

            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: "12px", color: "rgba(255, 255, 255, 0.8)", marginBottom: "8px" }}>Contact</div>
              <div style={{ fontSize: "14px", fontWeight: 600, marginBottom: "12px" }}>{teacher?.email}</div>
              <div style={{ fontSize: "14px", fontWeight: 600 }}>{teacher?.phone_number}</div>
            </div>
          </div>

          <div className="quick-actions">
            <Link href={teacherProfileHref} className="action-btn">
              My Profile
            </Link>
            <Link href="/Home/Academics/grades/class" className="action-btn">
              Grades
            </Link>
            <Link href="/Home/Academics/syllabi/" className="action-btn">
              Syllabi
            </Link>
            <Link href="/Home/timetable/" className="action-btn">
              Timetable
            </Link>
          </div>
        </div>

        {/* Main Content Cards */}
        <div className="main-grid">
          {/* Grades Card */}
          <div className="card">
            <div className="card-icon">
              <FileText size={24} />
            </div>
            <h3>Grade Management</h3>
            <p>View and manage student grades across classes and subjects. Enter assessment, test, and exam scores.</p>
            <Link href="/Home/Academics/grades/class" className="card-link">
              Manage Grades <ChevronRight size={14} />
            </Link>
          </div>

          {/* Syllabi Card */}
          <div className="card">
            <div className="card-icon">
              <BookOpen size={24} />
            </div>
            <h3>Syllabi Management</h3>
            <p>Create and organize course syllabi with topics, objectives, and content summaries for your classes.</p>
            <Link href="/Home/Academics/syllabi/" className="card-link">
              View Syllabi <ChevronRight size={14} />
            </Link>
          </div>

          {/* Timetable Card */}
          <div className="card">
            <div className="card-icon">
              <Clock size={24} />
            </div>
            <h3>Timetable</h3>
            <p>View your complete weekly schedule including classes, rooms, and time slots for all subjects.</p>
            <Link href="/Home/timetable/" className="card-link">
              View Timetable <ChevronRight size={14} />
            </Link>
          </div>

          {/* Students Card */}
          <div className="card">
            <div className="card-icon">
              <Users size={24} />
            </div>
            <h3>Student Records</h3>
            <p>Access detailed student information, attendance records, and academic performance data.</p>
            <Link href="/Home/profiles/students" className="card-link">
              View Students <ChevronRight size={14} />
            </Link>
          </div>

          {/* Attendance Card */}
          <div className="card">
            <div className="card-icon">
              <Clock size={24} />
            </div>
            <h3>Student Attendance</h3>
            <p>Track and manage student attendance records across your classes for the academic year.</p>
            <Link href="/Home/hr/studentAttendance" className="card-link">
              Manage Attendance <ChevronRight size={14} />
            </Link>
          </div>

          {/* Profile Settings Card */}
          <div className="card">
            <div className="card-icon">
              <Settings size={24} />
            </div>
            <h3>My Profile</h3>
            <p>Update your profile information, change password, and manage account settings securely.</p>
            <Link href={teacherProfileHref} className="card-link">
              Edit Profile <ChevronRight size={14} />
            </Link>
          </div>
        </div>

        <div style={{ display: "flex", justifyContent: "center", gap: "16px" }}>
          <Link href="/Home/logout/" className="logout-btn">
            <LogOut size={16} />
            Logout
          </Link>
        </div>
      </div>
    </div>
  );
}
