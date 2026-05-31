"use client";

import { useState, useEffect, useRef } from "react";
import {
  LayoutDashboard, Users, GraduationCap, School, Calendar,
  Settings, LogOut, Landmark, BookOpen, Clock, UserCheck,
  ChevronRight, Menu, X, ClipboardList, DollarSign,
  FileText, CreditCard, Briefcase,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";

// ─── Types ───────────────────────────────────────────────────────────────────

interface NavItem {
  icon: React.ReactNode;
  label: string;
  href?: string;
  children?: { icon: React.ReactNode; label: string; href: string }[];
  allowTeacher?: boolean;
  adminOnly?: boolean;
}

// ─── Nav config ──────────────────────────────────────────────────────────────

const NAV: NavItem[] = [
  {
    icon: <LayoutDashboard size={18} />,
    label: "Dashboard",
    href: "/Home/",
    allowTeacher: true,
  },
  {
    icon: <BookOpen size={18} />,
    label: "Academic",
    children: [
      { icon: <UserCheck size={15} />,   label: "Enrollments",  href: "/Home/Academics/enrollment" },
      { icon: <FileText size={15} />,    label: "Subjects",     href: "/Home/Academics/subject" },
      { icon: <School size={15} />,      label: "Classes",      href: "/Home/Academics/classes" },
      { icon: <ClipboardList size={15} />,label: "Grades",      href: "/Home/Academics/grades/class" },
      { icon: <FileText size={15} />,    label: "Transcripts",  href: "/Home/Academics/transcripts" },
    ],
    allowTeacher: true,
  },
  {
    icon: <Clock size={18} />,
    label: "Timetable & Syllabus",
    children: [
      { icon: <Calendar size={15} />,  label: "Timetable", href: "/Home/Academics/timetable" },
      { icon: <FileText size={15} />,  label: "Syllabi",   href: "/Home/Academics/syllabi" },
    ],
    allowTeacher: true,
  },
  {
    icon: <Users size={18} />,
    label: "Profiles",
    children: [
      { icon: <GraduationCap size={15} />, label: "Students", href: "/Home/profiles/students" },
      { icon: <Briefcase size={15} />,     label: "Staff",    href: "/Home/profiles/teachers&staff" },
      { icon: <UserCheck size={15} />,     label: "Teachers", href: "/Home/profiles/teachers" },
      { icon: <Users size={15} />,         label: "Parents",  href: "/Home/profiles/parents" },
    ],
    allowTeacher: true,
  },
  {
    icon: <Briefcase size={18} />,
    label: "Human Resources",
    children: [
      { icon: <UserCheck size={15} />,    label: "Staff Attendance",   href: "/Home/hr/staffAttendance" },
      { icon: <Calendar size={15} />,     label: "Student Attendance", href: "/Home/hr/studentAttendance" },
      { icon: <ClipboardList size={15} />,label: "Student Manager",    href: "/Home/management/studentManager" },
    ],
    allowTeacher: true,
  },
  {
    icon: <Landmark size={18} />,
    label: "Finance",
    adminOnly: true,
    children: [
      { icon: <DollarSign size={15} />, label: "Fees",              href: "/Home/finance/fees" },
      { icon: <CreditCard size={15} />, label: "Expenditure",       href: "/Home/finance/expenditure" },
      { icon: <FileText size={15} />,   label: "Invoices",          href: "/Home/finance/invoices/list" },
      { icon: <DollarSign size={15} />, label: "Payments",          href: "/Home/finance/payments" },
      { icon: <DollarSign size={15} />, label: "Payroll",           href: "/Home/finance/payroll" },
      { icon: <Briefcase size={15} />,  label: "Salary Structures", href: "/Home/finance/salarystructure" },
    ],
  },
];

const SYSTEM: NavItem[] = [
  { icon: <Users size={18} />,    label: "User Accounts",  href: "/Home/userAccount",  adminOnly: true },
  { icon: <Settings size={18} />, label: "Configurations", href: "/Home/config",        adminOnly: true },
  { icon: <UserCheck size={18} />,label: "App Access",     href: "/Home/appaccess",     adminOnly: true },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

function useRole() {
  const [role, setRole] = useState("");
  useEffect(() => {
    setRole((localStorage.getItem("userRole") ?? "").toLowerCase());
  }, []);
  return role;
}

function canSee(item: NavItem, role: string) {
  if (item.adminOnly) return role === "admin" || role === "headmaster";
  if (item.allowTeacher) return true;
  return role === "admin" || role === "headmaster";
}

// ─── Sidebar ─────────────────────────────────────────────────────────────────

export default function Sidebar() {
  const [open, setOpen]         = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);
  const pathname                = usePathname();
  const role                    = useRole();
  const overlayRef              = useRef<HTMLDivElement>(null);

  // Auto-expand group matching current path
  useEffect(() => {
    for (const item of NAV) {
      if (item.children?.some((c) => pathname.startsWith(c.href))) {
        setExpanded(item.label);
        break;
      }
    }
  }, [pathname]);

  // Close on route change
  useEffect(() => { setOpen(false); }, [pathname]);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (overlayRef.current && e.target === overlayRef.current) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Prevent body scroll when open
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  const toggle = (label: string) =>
    setExpanded((p) => (p === label ? null : label));

  const isActive = (href: string) =>
    href === "/Home/"
      ? pathname === "/Home/" || pathname === "/Home"
      : pathname.startsWith(href);

  const groupActive = (item: NavItem) =>
    item.children?.some((c) => isActive(c.href)) ?? false;

  return (
    <>
      {/* Hamburger toggle button — always visible */}
      <button
        onClick={() => setOpen(true)}
        aria-label="Open menu"
        className="fixed top-4 left-4 z-40 flex items-center justify-center w-9 h-9 rounded-xl bg-white border border-slate-200 shadow-sm text-slate-600 hover:bg-slate-50 transition-all"
      >
        <Menu size={18} />
      </button>

      {/* Backdrop */}
      {open && (
        <div
          ref={overlayRef}
          className="fixed inset-0 z-50 bg-black/30 backdrop-blur-[2px]"
        />
      )}

      {/* Drawer */}
      <aside
        className={`fixed top-0 left-0 h-full z-50 w-64 bg-white border-r border-slate-100 flex flex-col
          transition-transform duration-300 ease-in-out shadow-2xl
          ${open ? "translate-x-0" : "-translate-x-full"}`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl overflow-hidden bg-slate-900 flex items-center justify-center flex-shrink-0">
              <Image
                src="/resources/logo.jpg"
                width={36}
                height={36}
                alt="Theohans"
                className="object-cover w-full h-full"
                onError={(e) => {
                  // fallback to icon if image missing
                  (e.target as HTMLImageElement).style.display = "none";
                }}
              />
            </div>
            <div>
              <p className="font-bold text-slate-900 text-sm leading-tight">Theohans</p>
              <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">
                Management
              </p>
            </div>
          </div>
          <button
            onClick={() => setOpen(false)}
            aria-label="Close menu"
            className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-all"
          >
            <X size={16} />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-0.5">

          {NAV.filter((item) => canSee(item, role)).map((item) => {
            if (item.href) {
              // Flat link
              const active = isActive(item.href);
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all
                    ${active
                      ? "bg-cyan-50 text-cyan-700 shadow-sm"
                      : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"
                    }`}
                >
                  <span className={active ? "text-cyan-600" : "text-slate-400"}>
                    {item.icon}
                  </span>
                  {item.label}
                </Link>
              );
            }

            // Group with children
            const gActive   = groupActive(item);
            const isExpanded = expanded === item.label;

            return (
              <div key={item.label}>
                <button
                  onClick={() => toggle(item.label)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all
                    ${gActive
                      ? "text-slate-900 bg-slate-100"
                      : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"
                    }`}
                >
                  <span className={gActive ? "text-slate-700" : "text-slate-400"}>
                    {item.icon}
                  </span>
                  <span className="flex-1 text-left">{item.label}</span>
                  <ChevronRight
                    size={14}
                    className={`text-slate-400 transition-transform duration-200
                      ${isExpanded ? "rotate-90" : ""}`}
                  />
                </button>

                {isExpanded && (
                  <div className="mt-0.5 ml-4 pl-3 border-l-2 border-slate-100 space-y-0.5 py-0.5">
                    {item.children
                      ?.filter((c) => {
                        // teacher-only filter for sub-items of teacher-visible groups
                        if (role === "teacher" && !item.allowTeacher) return false;
                        return true;
                      })
                      .map((child) => {
                        const cActive = isActive(child.href);
                        return (
                          <Link
                            key={child.href}
                            href={child.href}
                            className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] transition-all
                              ${cActive
                                ? "text-cyan-700 bg-cyan-50 font-medium"
                                : "text-slate-500 hover:text-slate-800 hover:bg-slate-50"
                              }`}
                          >
                            <span className={cActive ? "text-cyan-500" : "text-slate-400"}>
                              {child.icon}
                            </span>
                            {child.label}
                          </Link>
                        );
                      })}
                  </div>
                )}
              </div>
            );
          })}

          {/* System section */}
          {(role === "admin" || role === "headmaster") && (
            <>
              <div className="pt-3 pb-1 px-2">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  System
                </p>
              </div>
              {SYSTEM.map((item) => {
                const active = isActive(item.href!);
                return (
                  <Link
                    key={item.label}
                    href={item.href!}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all
                      ${active
                        ? "bg-cyan-50 text-cyan-700"
                        : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"
                      }`}
                  >
                    <span className={active ? "text-cyan-600" : "text-slate-400"}>
                      {item.icon}
                    </span>
                    {item.label}
                  </Link>
                );
              })}
            </>
          )}
        </nav>

        {/* Logout */}
        <div className="px-3 py-3 border-t border-slate-100">
          <Link
            href="/Home/logout/"
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-500 hover:text-red-600 hover:bg-red-50 transition-all"
          >
            <LogOut size={18} />
            Log Out
          </Link>
        </div>
      </aside>
    </>
  );
}