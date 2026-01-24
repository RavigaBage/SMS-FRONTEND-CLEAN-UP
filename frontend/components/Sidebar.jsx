"use client";

import { useState } from "react";
import Link from "next/link";
import "@/styles/global.css";
import styles from "@/styles/sidebar.module.css";
export default function Sidebar() {
  const [openMenu, setOpenMenu] = useState(null);

  const toggleSubmenu = (menu) => {
    setOpenMenu((prev) => (prev === menu ? null : menu));
  };

  return (
    <div className={styles.sidebar}>
      <div className={styles.logoSection}>
        <div className={styles.logo}>
          <div className={styles.logoIcon}>🎓</div>
          <div className={styles.logoText}>EduManager</div>
        </div>
      </div>

      <div className={styles.navSection}>
        <div className={styles.navHeader}>Main Menu</div>

        <Link href="/Home/" className={`${styles.navItem} ${styles.active}`}>
          <div className={styles.navItemContent}>
            <div className={styles.navIcon}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
            </div>
            <span>Dashboard</span>
          </div>
        </Link>

        <div className={styles.navGroup}>
          <div
            className={`${styles.navItem} ${openMenu === "academic" ? styles.expanded : ""}`}
            onClick={() => toggleSubmenu("academic")}
          >
            <div className={styles.navItemContent}>
              <div className={styles.navIcon}>
                <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c0 2 2 3 6 3s6-1 6-3v-5"/></svg>
              </div>
              <span>Academic</span>
            </div>
            <span className={styles.navArrow}>
              <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px"><path d="M504-480 320-664l56-56 240 240-240 240-56-56 184-184Z"/></svg></span>
          </div>

          {openMenu === "academic" && (
            <div className={`submenu ${openMenu === "academic" ? "open" : ""}`}>

              <Link href="/Home/Academics/enrollment/" className={styles.submenuItem}>
                <div className="sideIcons">
                  <svg viewBox="0 0 24 24" height="24" fill="none" stroke="currentColor"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><line x1="20" y1="8" x2="20" y2="14"/><line x1="17" y1="11" x2="23" y2="11"/></svg>
                </div>
                Enrollments
              </Link>
              <Link href="/Home/Academics/subject" className={styles.submenuItem}>
                <div className="sideIcons">
                  <svg viewBox="0 0 24 24" height="24"  fill="none" stroke="currentColor"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>
                </div>
                Subjects
              </Link>
              <Link href="/Home/Academics/classes/" className={styles.submenuItem}>
                <div><svg viewBox="0 0 24 24" height="24" fill="none" stroke="currentColor"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="21" x2="9" y2="9"/></svg></div>
                Classes
              </Link>
              <Link href="/Home/Academics/grades" className={styles.submenuItem}>
                <div className="sideIcons">
                  <svg viewBox="0 0 24 24" height="24" fill="none" stroke="currentColor"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><path d="M9 15l2 2 4-4"/></svg>
                </div>
                Grades
              </Link>

               <Link href="/Home/Academics/exam" className={styles.submenuItem}>
                <div className="sideIcons">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/><path d="M8 14l-4 4"/><path d="M16 4l4 4"/></svg>
                </div>
                Exam setup
              </Link>
               <Link href="/Home/Academics/transcripts" className={styles.submenuItem}>
                <div className="sideIcons">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                </div>
                Transcripts
              </Link>
               <Link href="/Home/Academics/evaluations/profile/" className={styles.submenuItem}>
                <div className="sideIcons">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                </div>
                Evaluations
              </Link>
            </div>
          )}
        </div>

        <div className={styles.navGroup}>
          <div
            className={`${styles.navItem} ${openMenu === "profiles" ? styles.expanded : ""}`}
            onClick={() => toggleSubmenu("profiles")}
          >
            <div className={styles.navItemContent}>
              <div className={styles.navIcon}>
                <svg viewBox="0 0 24 24"  height="24" fill="none" stroke="currentColor"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
              </div>
              <span>Profiles</span>
            </div>
            <div className={styles.navBadge}>3</div>
            <span className={styles.navArrow}><svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px"><path d="M504-480 320-664l56-56 240 240-240 240-56-56 184-184Z"/></svg></span>
          </div>

          {openMenu === "profiles" && (
            <div className={`submenu ${openMenu === "profiles" ? "open" : ""}`}>
              <Link href="/Home/profiles/students" className={styles.submenuItem}>
                <div className="sideIcons">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><circle cx="12" cy="8" r="5"/><path d="M3 21v-2a7 7 0 0 1 7-7h4a7 7 0 0 1 7 7v2"/></svg>
                </div>
                Students
              </Link>
              <Link href="/Home/profiles/teachers" className={styles.submenuItem}>
                <div className="sideIcons">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                </div>
                Teachers
              </Link>
              <Link href="/Home/profiles/staff/profile" className={styles.submenuItem}>
                <div className="sideIcons">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                </div>
                Staff
              </Link>
              <Link href="/Home/profiles/parents" className={styles.submenuItem}>
              <div>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M18 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="11" cy="7" r="4"/><circle cx="16" cy="11" r="2"/></svg>
              </div>
                Parents
              </Link>
            </div>
          )}
        </div>

        <div className={styles.navGroup}>
          <div
            className={`${styles.navItem} ${openMenu === "hr" ? styles.expanded : ""}`}
            onClick={() => toggleSubmenu("hr")}
          >
            <div className={styles.navItemContent}>
              <div className={styles.navIcon}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><polyline points="17 11 19 13 23 9"/></svg>
              </div>
              <span>Human Resources</span>
            </div>
            <span className={styles.navArrow}><svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px"><path d="M504-480 320-664l56-56 240 240-240 240-56-56 184-184Z"/></svg></span>
          </div>

          {openMenu === "hr" && (
            <div className={`submenu ${openMenu === "hr" ? "open" : ""}`}>
              <Link href="/Home/hr/staff" className={styles.submenuItem}>
              <div>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><rect x="3" y="4" width="18" height="16" rx="2"/><path d="M7 8h10M7 12h10M7 16h6"/></svg>
              </div>
                Staff Details
              </Link>
              <Link href="/Home/hr/staffAttendance/" className={styles.submenuItem}>
              <div>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M12 2v20M2 12h20"/><path d="M12 7l5 5-5 5"/></svg>
              </div>
                Staff Attendance
              </Link>
              <Link href="/Home/hr/salaries" className={styles.submenuItem}>
              <div>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M12 2v20M2 12h20"/><path d="M12 7l5 5-5 5"/></svg>
              </div>
                Salaries
              </Link>
            </div>
          )}
        </div>

        <div className={styles.navGroup}>
          <div
            className={`${styles.navItem} ${openMenu === "attendance" ? styles.expanded : ""}`}
            onClick={() => toggleSubmenu("attendance")}
          >
            <div className={styles.navItemContent}>
              <div className={styles.navIcon}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M12 2v20M2 12h20"/><path d="M12 7l5 5-5 5"/></svg></div>
              <span>Attendance</span>
            </div>
            <span className={styles.navArrow}><svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px"><path d="M504-480 320-664l56-56 240 240-240 240-56-56 184-184Z"/></svg></span>
          </div>

          {openMenu === "attendance" && (
            <div className={`submenu ${openMenu === "attendance" ? "open" : ""}`}>
              <Link
                href="/Home/Attendance"
                className={styles.submenuItem}
              >
                Student Attendance
              </Link>
            </div>
          )}
        </div>

        <div className={styles.navGroup}>
          <div
            className={`${styles.navItem} ${openMenu === "finance" ? styles.expanded : ""}`}
            onClick={() => toggleSubmenu("finance")}
          >
            <div className={styles.navItemContent}>
              <div className={styles.navIcon}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><path d="M8 10h4.5a1.5 1.5 0 0 1 0 3H8"/><path d="M16 14h-4.5a1.5 1.5 0 0 0 0 3H16"/></svg>
              </div>
              <span>Finance</span>
            </div>
            <span className={styles.navArrow}><svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px"><path d="M504-480 320-664l56-56 240 240-240 240-56-56 184-184Z"/></svg></span>
          </div>

          {openMenu === "finance" && (
            <div className={`submenu ${openMenu === "finance" ? "open" : ""}`}>
              <Link href="/Home/finance/invoice" className={styles.submenuItem}>
              <div>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><path d="M9 9h1"/></svg>
              </div>
                Invoices
              </Link>
              <Link href="/Home/finance/expenditure" className={styles.submenuItem}>
              <div>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M12 1v22"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/><polyline points="18 19 22 19 22 15"/></svg>
              </div>
                Expenditure
              </Link>
              <Link href="/Home/finance/fees/" className={styles.submenuItem}>
              <div>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M12 1v22"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/><polyline points="18 19 22 19 22 15"/></svg>
              </div>
                fee
              </Link>
            </div>
          )}
        </div>

        {/* Timetable */}
        <div className={styles.navGroup}>
          <div
            className={`${styles.navItem} ${openMenu === "timetable" ? styles.expanded : ""}`}
            onClick={() => toggleSubmenu("timetable")}
          >
            <div className={styles.navItemContent}>
              <div className={styles.navIcon}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/><path d="M9 14h.01"/><path d="M15 14h.01"/><path d="M9 18h.01"/><path d="M15 18h.01"/></svg>
              </div>
              <span>Timetable</span>
            </div>
            <span className={styles.navArrow}><svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px"><path d="M504-480 320-664l56-56 240 240-240 240-56-56 184-184Z"/></svg></span>
          </div>

          {openMenu === "timetable" && (
            <div className={`${styles.submenu} ${openMenu === "timetable" ? styles.open : ""}`}>
              <Link href="/Home/timetable/" className={styles.submenuItem}>
                <div className="sideIcons">
                  <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px"><path d="M504-480 320-664l56-56 240 240-240 240-56-56 184-184Z"/></svg>
                </div>
                Timetables
              </Link>
              <Link href="/Home/Academics/syllabi" className={styles.submenuItem}>
                <div className="sideIcons">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/><path d="M9 8h7"/><path d="M9 12h7"/></svg>
                </div>
                Syllabi
              </Link>
            </div>
          )}
        </div>

        <div className={styles.navHeader}>System</div>

        <Link href="/Home/userAccount/" className={styles.navItem}>
          <div className={styles.navItemContent}>
            <div className={styles.navIcon}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><rect x="18" y="8" width="3" height="3" rx="1"/></svg>
            </div>
            <span>User Accounts</span>
          </div>
        </Link>

        <Link href="/Home/permission" className={styles.navItem}>
          <div className={styles.navItemContent}>
            <div className={styles.navIcon}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
            </div>
            <span>Permissions</span>
          </div>
        </Link>

        <Link href="/Home/TokenList" className={styles.navItem}>
          <div className={styles.navItemContent}>
            <div className={styles.navIcon}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/></svg>
            </div>
            <span>Token Blacklist</span>
          </div>
        </Link>

        <div className={styles.navHeader}>Actions</div>

        <Link href="/Home/settings" className={styles.navItem}>
          <div className={styles.navItemContent}>
            <div className={styles.navIcon}>⚙️</div>
            <span>Settings</span>
          </div>
        </Link>

        <Link href="/Home/logout"  className={styles.navItem}>
          <div className={styles.navItemContent}>
            <div className={styles.navIcon}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
            </div>
            <span>Log Out</span>
          </div>
        </Link>
      </div>
    </div>
  );
}
