'use client';

import { useEffect, useState } from "react";
import Link from "next/link";
import "@/styles/global.css";
import styles from "@/styles/sidebar.module.css";

/**
 * Colored SVG icons for sidebar — tweak colors here
 * Each icon returns an svg with a soft gradient and a simple shape.
 */

const IconBase = ({ id, gradientFrom, gradientTo, children, size = 20 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
    role="img"
  >
    <defs>
      <linearGradient id={id} x1="0" x2="1" y1="0" y2="1">
        <stop offset="0%" stopColor={gradientFrom} />
        <stop offset="100%" stopColor={gradientTo} />
      </linearGradient>
    </defs>

    {/* subtle circular backdrop */}
    <rect x="0" y="0" width="24" height="24" rx="6" fill={`url(#${id})`} opacity="0.12" />
    <g transform="translate(2 2)" stroke={gradientTo} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
      {children}
    </g>
  </svg>
);

/* Icons */
const DashboardIcon = (props) => (
  <IconBase id="grad-dashboard" gradientFrom="#6C8CF5" gradientTo="#8B5CF6" {...props}>
    <rect x="0.5" y="0.5" width="7" height="7" rx="1" fill="none" />
    <rect x="9.5" y="0.5" width="7" height="7" rx="1" fill="none" />
    <rect x="9.5" y="9.5" width="7" height="7" rx="1" fill="none" />
    <rect x="0.5" y="9.5" width="7" height="7" rx="1" fill="none" />
  </IconBase>
);
const ConfigurationIcon = (props) => (
  <IconBase
    id="grad-configuration"
    gradientFrom="#0EA5E9"
    gradientTo="#22D3EE"
    {...props}
  >
    {/* Horizontal slider lines */}
    <line x1="2" y1="4" x2="18" y2="4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    <circle cx="8" cy="4" r="2" fill="none" stroke="currentColor" strokeWidth="1.5" />

    <line x1="2" y1="10" x2="18" y2="10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    <circle cx="14" cy="10" r="2" fill="none" stroke="currentColor" strokeWidth="1.5" />

    <line x1="2" y1="16" x2="18" y2="16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    <circle cx="6" cy="16" r="2" fill="none" stroke="currentColor" strokeWidth="1.5" />
  </IconBase>
);


const AcademicIcon = (props) => (
  <IconBase id="grad-academic" gradientFrom="#4EC5A6" gradientTo="#3BB7A1" {...props}>
    <path d="M10 2l9 5-9 5-9-5 9-5z" fill="none" />
    <path d="M7 11v6a3 3 0 0 0 3 3h4" fill="none" />
  </IconBase>
);

const EnrollmentIcon = (props) => (
  <IconBase id="grad-enroll" gradientFrom="#FF9AA2" gradientTo="#FF6B81" {...props}>
    <circle cx="6" cy="5" r="3.2" fill="none" />
    <path d="M0.5 16c0-2 2-3 5-3h6c3 0 5 1 5 3" fill="none" />
    <path d="M16 4.5l4 0" strokeWidth="1.2" />
  </IconBase>
);

const SubjectsIcon = (props) => (
  <IconBase id="grad-subject" gradientFrom="#F7C948" gradientTo="#F59E0B" {...props}>
    <rect x="0.8" y="1" width="12" height="18" rx="1.6" fill="none" />
    <path d="M3 5h8" strokeWidth="1.2" />
  </IconBase>
);

const ClassesIcon = (props) => (
  <IconBase id="grad-classes" gradientFrom="#9F7AEA" gradientTo="#6C5CE7" {...props}>
    <circle cx="5" cy="5" r="3.2" fill="none" />
    <path d="M0.5 17c0-2 2-3 6-3s6 1 6 3" fill="none" />
    <path d="M14 13v-3" strokeWidth="1.2" />
  </IconBase>
);

const GradesIcon = (props) => (
  <IconBase id="grad-grades" gradientFrom="#60A5FA" gradientTo="#3B82F6" {...props}>
    <circle cx="10" cy="6" r="5" fill="none" />
    <polyline points="5 12 8 18 15 14 19 18" fill="none" strokeWidth="1.2" />
  </IconBase>
);

const TranscriptIcon = (props) => (
  <IconBase id="grad-transcript" gradientFrom="#34D399" gradientTo="#10B981" {...props}>
    <path d="M9 0H2a2 2 0 0 0-2 2v20a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V7l-7-7z" fill="none" />
    <polyline points="9 0 9 7 16 7" fill="none" />
    <line x1="7" y1="11" x2="15" y2="11" strokeWidth="1.2" />
    <line x1="7" y1="15" x2="13" y2="15" strokeWidth="1.2" />
  </IconBase>
);

const TimetableIcon = (props) => (
  <IconBase id="grad-time" gradientFrom="#FDBA74" gradientTo="#FB923C" {...props}>
    <rect x="0.6" y="1" width="15" height="14" rx="2" fill="none" />
    <line x1="4" y1="0" x2="4" y2="4" strokeWidth="1.2" />
    <line x1="12" y1="0" x2="12" y2="4" strokeWidth="1.2" />
    <line x1="1" y1="6" x2="16" y2="6" strokeWidth="1.2" />
  </IconBase>
);

const SyllabiIcon = (props) => (
  <IconBase id="grad-syll" gradientFrom="#60A5FA" gradientTo="#7DD3FC" {...props}>
    <path d="M2 2h12v18H2z" fill="none" />
    <path d="M6 6h6" strokeWidth="1.2" />
    <path d="M6 10h6" strokeWidth="1.2" />
  </IconBase>
);

const ProfilesIcon = (props) => (
  <IconBase id="grad-profiles" gradientFrom="#F472B6" gradientTo="#FB7185" {...props}>
    <circle cx="6" cy="6" r="3.2" fill="none" />
    <path d="M0.5 18c0-2 2-3 6-3s6 1 6 3" fill="none" />
  </IconBase>
);

const StaffIcon = (props) => (
  <IconBase id="grad-staff" gradientFrom="#A78BFA" gradientTo="#7C3AED" {...props}>
    <rect x="0.5" y="1.2" width="14" height="12" rx="1.4" fill="none" />
    <path d="M4 14l2 3 4-3" fill="none" strokeWidth="1.2" />
  </IconBase>
);

const FinanceIcon = (props) => (
  <IconBase id="grad-finance" gradientFrom="#60A5FA" gradientTo="#06B6D4" {...props}>
    <path d="M12 1v22" strokeWidth="1.2" />
    <path d="M4 5h8a4 4 0 010 8H4" fill="none" />
    <circle cx="16" cy="15" r="3.2" fill="none" />
  </IconBase>
);
const AppAccessIcon = (props) => (
  <IconBase
    id="grad-appaccess"
    gradientFrom="#10B981"
    gradientTo="#059669"
    {...props}
  >
    {/* Shield outline */}
    <path
      d="M10 2 L18 5 V10 C18 14 14.5 17.5 10 19 C5.5 17.5 2 14 2 10 V5 L10 2 Z"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinejoin="round"
    />

    {/* Check mark */}
    <path
      d="M6.5 10.5 L9 13 L14 8"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </IconBase>
);


const LogoutIcon = (props) => (
  <IconBase id="grad-logout" gradientFrom="#F87171" gradientTo="#FB7185" {...props}>
    <path d="M6 3H2a2 2 0 00-2 2v14a2 2 0 002 2h4" fill="none" />
    <polyline points="16 8 21 12 16 16" fill="none" />
    <line x1="21" y1="12" x2="9" y2="12" strokeWidth="1.2" />
  </IconBase>
);

/* End icons */

/* ProtectedLink (keeps your original behavior) */
const ProtectedLink = ({ isAdmin, href, children, className }) => {
  if (isAdmin) {
    return <Link href={href} className={className}>{children}</Link>;
  }
  return (
    <div className={`${className} ${styles.disabled}`} title="Admin Access Required">
      {children}
    </div>
  );
};

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
          <div className={styles.logoIcon} aria-hidden>
            {/* custom colorful logo mark */}
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
              <defs>
                <linearGradient id="logoGrad" x1="0" x2="1">
                  <stop offset="0" stopColor="#667eea" />
                  <stop offset="1" stopColor="#7c3aed" />
                </linearGradient>
              </defs>
              <rect width="24" height="24" rx="6" fill="url(#logoGrad)" />
              <path d="M6 9l6-3 6 3-6 3-6-3z" fill="white" opacity="0.95" />
            </svg>
          </div>
          <div className={styles.logoText}>EduManager</div>
        </div>
      </div>

      <div className={styles.navSection}>
        <div className={styles.navHeader}>Main Menu</div>

        <ProtectedLink isAdmin={isAdmin} href="/Home/" className={`${styles.navItem} ${styles.active}`}>
          <div className={styles.navItemContent}>
            <div className={styles.navIcon}><DashboardIcon /></div>
            <span>Dashboard</span>
          </div>
        </ProtectedLink>

        {/* ACADEMIC */}
        <div className={styles.navGroup}>
          <div
            className={`${styles.navItem} ${openMenu === "academic" ? styles.expanded : ""}`}
            onClick={() => toggleSubmenu("academic")}
          >
            <div className={styles.navItemContent}>
              <div className={styles.navIcon}><AcademicIcon /></div>
              <span>Academic</span>
            </div>
            <span className={styles.navArrow}>
              <svg width="18" height="18" viewBox="0 0 24 24"><path d="M8 5l8 7-8 7" fill="none" stroke="#64748b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </span>
          </div>

          {openMenu === "academic" && (
            <div className={`submenu open`}>
              <ProtectedLink isAdmin={isAdmin} href="/Home/Academics/enrollment/" className={styles.submenuItem}>
                <div className={styles.navItemContent}>
                  <div className={styles.navIcon}><EnrollmentIcon /></div>
                  <span>Enrollments</span>
                </div>
              </ProtectedLink>

              <ProtectedLink isAdmin={isAdmin} href="/Home/Academics/subject" className={styles.submenuItem}>
                <div className={styles.navItemContent}>
                  <div className={styles.navIcon}><SubjectsIcon /></div>
                  <span>Subjects</span>
                </div>
              </ProtectedLink>

              <ProtectedLink isAdmin={isAdmin} href="/Home/Academics/classes/" className={styles.submenuItem}>
                <div className={styles.navItemContent}>
                  <div className={styles.navIcon}><ClassesIcon /></div>
                  <span>Classes</span>
                </div>
              </ProtectedLink>

              <ProtectedLink isAdmin={isAdmin} href="/Home/Academics/grades/class" className={styles.submenuItem}>
                <div className={styles.navItemContent}>
                  <div className={styles.navIcon}><GradesIcon /></div>
                  <span>Grades</span>
                </div>
              </ProtectedLink>

              <ProtectedLink isAdmin={isAdmin} href="/Home/Academics/transcripts" className={styles.submenuItem}>
                <div className={styles.navItemContent}>
                  <div className={styles.navIcon}><TranscriptIcon /></div>
                  <span>Transcripts</span>
                </div>
              </ProtectedLink>
            </div>
          )}
        </div>

        {/* TIMETABLE */}
        <div className={styles.navGroup}>
          <div className={`${styles.navItem} ${openMenu === "timetable" ? styles.expanded : ""}`} onClick={() => toggleSubmenu("timetable")}>
            <div className={styles.navItemContent}>
              <div className={styles.navIcon}><TimetableIcon /></div>
              <span>Timetable & Syllabus</span>
            </div>
            <span className={styles.navArrow}><svg width="18" height="18" viewBox="0 0 24 24"><path d="M8 5l8 7-8 7" fill="none" stroke="#64748b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg></span>
          </div>

          {openMenu === "timetable" && (
            <div className={`submenu open`}>
              <ProtectedLink isAdmin={isAdmin} href="/Home/timetable/" className={styles.submenuItem}>
                <div className={styles.navItemContent}>
                  <div className={styles.navIcon}><TimetableIcon /></div>
                  <span>Timetable</span>
                </div>
              </ProtectedLink>

              <ProtectedLink isAdmin={isAdmin} href="/Home/Academics/syllabi/" className={styles.submenuItem}>
                <div className={styles.navItemContent}>
                  <div className={styles.navIcon}><SyllabiIcon /></div>
                  <span>Syllabi</span>
                </div>
              </ProtectedLink>
            </div>
          )}
        </div>

        {/* PROFILES */}
        <div className={styles.navGroup}>
          <div className={`${styles.navItem} ${openMenu === "profiles" ? styles.expanded : ""}`} onClick={() => toggleSubmenu("profiles")}>
            <div className={styles.navItemContent}>
              <div className={styles.navIcon}><ProfilesIcon /></div>
              <span>Profiles</span>
            </div>
            <span className={styles.navArrow}><svg width="18" height="18" viewBox="0 0 24 24"><path d="M8 5l8 7-8 7" fill="none" stroke="#64748b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg></span>
          </div>

          {openMenu === "profiles" && (
            <div className={`submenu open`}>
              <ProtectedLink isAdmin={isAdmin} href="/Home/profiles/students" className={styles.submenuItem}>
                <div className={styles.navItemContent}>
                  <div className={styles.navIcon}><ProfilesIcon /></div>
                  <span>Students</span>
                </div>
              </ProtectedLink>

              <ProtectedLink isAdmin={isAdmin} href="/Home/profiles/teachers&staff" className={styles.submenuItem}>
                <div className={styles.navItemContent}>
                  <div className={styles.navIcon}><StaffIcon /></div>
                  <span>Staff</span>
                </div>
              </ProtectedLink>

              <ProtectedLink isAdmin={isAdmin} href="/Home/profiles/teachers" className={styles.submenuItem}>
                <div className={styles.navItemContent}>
                  <div className={styles.navIcon}><StaffIcon /></div>
                  <span>Teachers</span>
                </div>
              </ProtectedLink>

              <ProtectedLink isAdmin={isAdmin} href="/Home/profiles/parents" className={styles.submenuItem}>
                <div className={styles.navItemContent}>
                  <div className={styles.navIcon}><ProfilesIcon /></div>
                  <span>Parents</span>
                </div>
              </ProtectedLink>
            </div>
          )}
        </div>

        {/* HR */}
        <div className={styles.navGroup}>
          <div className={`${styles.navItem} ${openMenu === "hr" ? styles.expanded : ""}`} onClick={() => toggleSubmenu("hr")}>
            <div className={styles.navItemContent}>
              <div className={styles.navIcon}><StaffIcon /></div>
              <span>Human Resources</span>
            </div>
            <span className={styles.navArrow}><svg width="18" height="18" viewBox="0 0 24 24"><path d="M8 5l8 7-8 7" fill="none" stroke="#64748b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg></span>
          </div>

          {openMenu === "hr" && (
            <div className={`submenu open`}>
              <ProtectedLink isAdmin={isAdmin} href="/Home/hr/staffAttendance" className={styles.submenuItem}>
                <div className={styles.navItemContent}>
                  <div className={styles.navIcon}><StaffIcon /></div>
                  <span>Staff Attendance</span>
                </div>
              </ProtectedLink>

              <ProtectedLink isAdmin={isAdmin} href="/Home/hr/studentAttendance" className={styles.submenuItem}>
                <div className={styles.navItemContent}>
                  <div className={styles.navIcon}><ProfilesIcon /></div>
                  <span>Student Attendance</span>
                </div>
              </ProtectedLink>
            </div>
          )}
        </div>

        {/* FINANCE */}
        <div className={styles.navGroup}>
          <div className={`${styles.navItem} ${openMenu === "finance" ? styles.expanded : ""}`} onClick={() => toggleSubmenu("finance")}>
            <div className={styles.navItemContent}>
              <div className={styles.navIcon}><FinanceIcon /></div>
              <span>Finance</span>
            </div>
            <span className={styles.navArrow}><svg width="18" height="18" viewBox="0 0 24 24"><path d="M8 5l8 7-8 7" fill="none" stroke="#64748b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg></span>
          </div>

          {openMenu === "finance" && (
            <div className={`submenu open`}>
              <ProtectedLink isAdmin={isAdmin} href="/Home/finance/fees" className={styles.submenuItem}>
                <div className={styles.navItemContent}>
                  <div className={styles.navIcon}><FinanceIcon /></div>
                  <span>Fees</span>
                </div>
              </ProtectedLink>

              <ProtectedLink isAdmin={isAdmin} href="/Home/finance/expenditure" className={styles.submenuItem}>
                <div className={styles.navItemContent}>
                  <div className={styles.navIcon}><FinanceIcon /></div>
                  <span>Expenditure</span>
                </div>
              </ProtectedLink>

              <ProtectedLink isAdmin={isAdmin} href="/Home/finance/invoices/list/" className={styles.submenuItem}>
                <div className={styles.navItemContent}>
                  <div className={styles.navIcon}><TranscriptIcon /></div>
                  <span>Invoices</span>
                </div>
              </ProtectedLink>

              <ProtectedLink isAdmin={isAdmin} href="/Home/finance/payments" className={styles.submenuItem}>
                <div className={styles.navItemContent}>
                  <div className={styles.navIcon}><FinanceIcon /></div>
                  <span>Payments</span>
                </div>
              </ProtectedLink>

              <ProtectedLink isAdmin={isAdmin} href="/Home/finance/payroll" className={styles.submenuItem}>
                <div className={styles.navItemContent}>
                  <div className={styles.navIcon}><FinanceIcon /></div>
                  <span>Payroll</span>
                </div>
              </ProtectedLink>
            </div>
          )}
        </div>

        <div className={styles.navHeader}>System</div>

        <ProtectedLink isAdmin={isAdmin} href="/Home/userAccount/" className={styles.navItem}>
          <div className={styles.navItemContent}>
            <div className={styles.navIcon}><ProfilesIcon /></div>
            <span>User Accounts</span>
          </div>
        </ProtectedLink>
        <ProtectedLink isAdmin={isAdmin} href="/Home/config/" className={styles.navItem}>
          <div className={styles.navItemContent}>
            <div className={styles.navIcon}><ConfigurationIcon /></div>
            <span>Configurations</span>
          </div>
        </ProtectedLink>
        <ProtectedLink isAdmin={isAdmin} href="/Home/appaccess/" className={styles.navItem}>
          <div className={styles.navItemContent}>
            <div className={styles.navIcon}><AppAccessIcon /></div>
            <span>App Access</span>
          </div>
        </ProtectedLink>

        <div className={styles.navGroup}>
          <div className={`${styles.navItem} ${styles.logout}`} onClick={handleLogout}>
            <div className={styles.navItemContent}>
              <div className={styles.navIcon}><LogoutIcon /></div>
              <span>Logout</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
