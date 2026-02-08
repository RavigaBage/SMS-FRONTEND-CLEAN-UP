"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import "@/styles/global.css";
import styles from "@/styles/sidebar.module.css";

export default function Sidebar() {
  const [openMenu, setOpenMenu] = useState(null);
  const [userRole, setRole] = useState("");

  const toggleSubmenu = (menu) => {
    setOpenMenu((prev) => (prev === menu ? null : menu));
  };

  useEffect(() => {
    const role = localStorage.getItem('userRole');
    if (role) {
      setRole(role.toLowerCase());
    }
  }, []);

  const isAdmin = userRole === "admin";

  const ProtectedLink = ({ href, children, className }) => {
    if (isAdmin) {
      return <Link href={href} className={className}>{children}</Link>;
    }
    return (
      <div className={`${className} ${styles.disabled}`} title="Admin Access Required">
        {children}
      </div>
    );
  };

  const handleLogout = async () => {
    try {
      const refreshToken = localStorage.getItem("refreshToken");
      if (refreshToken) {
        await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/logout/`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
          body: JSON.stringify({ refresh: refreshToken }),
        });
      }
    } catch (err) {
      console.warn("Backend logout failed, continuing client cleanup");
    } finally {
      localStorage.clear();
      sessionStorage.clear();
      window.location.href = "/auth/login";
    }
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

        <ProtectedLink href="/Home/" className={`${styles.navItem} ${styles.active}`}>
          <div className={styles.navItemContent}>
            <div className={styles.navIcon}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
            </div>
            <span>Dashboard</span>
          </div>
        </ProtectedLink>

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
              <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px"><path d="M504-480 320-664l56-56 240 240-240 240-56-56 184-184Z"/></svg>
            </span>
          </div>
          {openMenu === "academic" && (
            <div className={`submenu open`}>
              <ProtectedLink href="/Home/Academics/enrollment/" className={styles.submenuItem}>
                <div className={styles.navItemContent}>
                  <div className={styles.navIcon}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><line x1="20" y1="8" x2="20" y2="14"/><line x1="17" y1="11" x2="23" y2="11"/></svg>
                  </div>
                  <span>Enrollments</span>
                </div>
              </ProtectedLink>
              <ProtectedLink href="/Home/Academics/subject" className={styles.submenuItem}>
                <div className={styles.navItemContent}>
                  <div className={styles.navIcon}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>
                  </div>
                  <span>Subjects</span>
                </div>
              </ProtectedLink>
              <ProtectedLink href="/Home/Academics/classes/" className={styles.submenuItem}>
                <div className={styles.navItemContent}>
                  <div className={styles.navIcon}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                  </div>
                  <span>Classes</span>
                </div>
              </ProtectedLink>
              <ProtectedLink href="/Home/Academics/grades/class" className={styles.submenuItem}>
                <div className={styles.navItemContent}>
                  <div className={styles.navIcon}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><circle cx="12" cy="8" r="7"/><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"/></svg>
                  </div>
                  <span>Grades</span>
                </div>
              </ProtectedLink>
              <ProtectedLink href="/Home/Academics/transcripts" className={styles.submenuItem}>
                <div className={styles.navItemContent}>
                  <div className={styles.navIcon}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
                  </div>
                  <span>Transcripts</span>
                </div>
              </ProtectedLink>
              
            </div>
          )}
        </div>

        <div className={styles.navGroup}>
          <div className={`${styles.navItem} ${openMenu === "profiles" ? styles.expanded : ""}`} onClick={() => toggleSubmenu("profiles")}>
            <div className={styles.navItemContent}>
              <div className={styles.navIcon}>
                <svg viewBox="0 0 24 24" height="24" fill="none" stroke="currentColor"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
              </div>
              <span>Profiles</span>
            </div>
            <span className={styles.navArrow}><svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px"><path d="M504-480 320-664l56-56 240 240-240 240-56-56 184-184Z"/></svg></span>
          </div>
          {openMenu === "profiles" && (
            <div className={`submenu open`}>
              <ProtectedLink href="/Home/profiles/students" className={styles.submenuItem}>
                <div className={styles.navItemContent}>
                  <div className={styles.navIcon}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                  </div>
                  <span>Students</span>
                </div>
              </ProtectedLink>
              <ProtectedLink href="/Home/profiles/teachers&staff" className={styles.submenuItem}>
                <div className={styles.navItemContent}>
                  <div className={styles.navIcon}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>
                  </div>
                  <span>Teachers & Staff</span>
                </div>
              </ProtectedLink>
              <ProtectedLink href="/Home/profiles/parents" className={styles.submenuItem}>
                <div className={styles.navItemContent}>
                  <div className={styles.navIcon}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                  </div>
                  <span>Parents</span>
                </div>
              </ProtectedLink>
            </div>
          )}
        </div>

        <div className={styles.navGroup}>
          <div className={`${styles.navItem} ${openMenu === "hr" ? styles.expanded : ""}`} onClick={() => toggleSubmenu("hr")}>
            <div className={styles.navItemContent}>
              <div className={styles.navIcon}>
                <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" >
                  <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <circle cx="19" cy="11" r="3" />
                  <path d="M19 8v1" />
                  <path d="M19 13v1" />
                  <path d="M21.6 9.5l-.87.5" />
                  <path d="M17.27 12l-.87.5" />
                  <path d="M21.6 12.5l-.87-.5" />
                  <path d="M17.27 10l-.87-.5" />
                </svg>
              </div>
              <span>Human Resources</span>
            </div>
            <span className={styles.navArrow}><svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px"><path d="M504-480 320-664l56-56 240 240-240 240-56-56 184-184Z"/></svg></span>
          </div>
          {openMenu === "hr" && (
            <div className={`submenu open`}>
              <ProtectedLink href="/Home/hr/staffAttendance" className={styles.submenuItem}>
                <div className={styles.navItemContent}>
                  <div className={styles.navIcon}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/><path d="M8 14l2 2 4-4"/></svg>
                  </div>
                  <span>Staff Attendance</span>
                </div>
              </ProtectedLink>
              
            </div>
          )}
        </div>

        <div className={styles.navGroup}>
          <div className={`${styles.navItem} ${openMenu === "finance" ? styles.expanded : ""}`} onClick={() => toggleSubmenu("finance")}>
            <div className={styles.navItemContent}>
              <div className={styles.navIcon}>
                <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" >
                  <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <circle cx="19" cy="11" r="3" />
                  <path d="M19 8v1" />
                  <path d="M19 13v1" />
                  <path d="M21.6 9.5l-.87.5" />
                  <path d="M17.27 12l-.87.5" />
                  <path d="M21.6 12.5l-.87-.5" />
                  <path d="M17.27 10l-.87-.5" />
                </svg>
              </div>
              <span>Finance</span>
            </div>
            <span className={styles.navArrow}><svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px"><path d="M504-480 320-664l56-56 240 240-240 240-56-56 184-184Z"/></svg></span>
          </div>
          {openMenu === "finance" && (
            <div className={`submenu open`}>
              <ProtectedLink href="/Home/finance/fees" className={styles.submenuItem}>
                <div className={styles.navItemContent}>
                  <div className={styles.navIcon}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
                  </div>
                  <span>fees</span>
                </div>
              </ProtectedLink>
              <ProtectedLink href="/Home/finance/expenditure" className={styles.submenuItem}>
                <div className={styles.navItemContent}>
                  <div className={styles.navIcon}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                  </div>
                  <span>Expenditure</span>
                </div>
              </ProtectedLink>
              <ProtectedLink href="/Home/finance/invoices" className={styles.submenuItem}>
                <div className={styles.navItemContent}>
                  <div className={styles.navIcon}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/><polyline points="13 2 13 9 20 9"/></svg>
                  </div>
                  <span>Invoices</span>
                </div>
              </ProtectedLink>
              <ProtectedLink href="/Home/finance/payments" className={styles.submenuItem}>
                <div className={styles.navItemContent}>
                  <div className={styles.navIcon}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>
                  </div>
                  <span>payments</span>
                </div>
              </ProtectedLink>
              <ProtectedLink href="/Home/finance/payroll" className={styles.submenuItem}>
                <div className={styles.navItemContent}>
                  <div className={styles.navIcon}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M20 12V8H6a2 2 0 0 1-2-2c0-1.1.9-2 2-2h12v4"/><path d="M4 18V6a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v10c0 1.1-.9 2-2 2H8a2 2 0 0 0-2 2c0 1.1.9 2 2 2h12"/><circle cx="16" cy="16" r="2"/></svg>
                  </div>
                  <span>payroll</span>
                </div>
              </ProtectedLink>
            </div>
          )}
        </div>

        

        <div className={styles.navHeader}>System</div>
        
        <ProtectedLink href="/Home/userAccount/" className={styles.navItem}>
          <div className={styles.navItemContent}>
            <div className={styles.navIcon}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><rect x="18" y="8" width="3" height="3" rx="1"/></svg>
            </div>
            <span>User Accounts</span>
          </div>
        </ProtectedLink>

        <div className={styles.navGroup}>
          <div className={`${styles.navItem} ${styles.logout}`} onClick={handleLogout}>
            <div className={styles.navItemContent}>
              <div className={styles.navIcon}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
                </svg>
              </div>
              <span>Logout</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}